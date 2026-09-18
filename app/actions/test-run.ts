'use server'

import { createHmac, randomUUID } from 'crypto'
import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  isAllowedTestRunFile,
  looksLikePersonalInbox,
  testRunPayloadSchema,
  TEST_RUN_MAX_FILE_BYTES,
} from '@/lib/validations/test-run'

const BUCKET = 'test-run-private'

export type TestRunActionResult = {
  ok: boolean
  message: string
  code?: 'under18' | 'declined' | 'invalid' | 'upload' | 'config'
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function readBool(formData: FormData, key: string): boolean {
  const value = formData.get(key)
  return value === 'true' || value === 'on' || value === 'yes'
}

function asFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null
}

function fileExtension(file: File): string {
  const type = file.type.toLowerCase()
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/heic') return 'heic'
  if (type === 'image/heif') return 'heif'
  const name = file.name.toLowerCase()
  if (name.endsWith('.png')) return 'png'
  if (name.endsWith('.webp')) return 'webp'
  if (name.endsWith('.heic')) return 'heic'
  if (name.endsWith('.heif')) return 'heif'
  return 'jpg'
}

function ipHash(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(`testrun:${ip}`).digest('hex')
}

export async function submitTestRun(
  formData: FormData
): Promise<TestRunActionResult> {
  // Founders: store in this private table (export to a sheet if needed).
  // Never put the raw sheet or storage URL in emails.
  // After each date, ask both privately: showed up? felt safe? would use the app again?

  if (readString(formData, 'wantIn') === 'no') {
    return {
      ok: false,
      code: 'declined',
      message: 'No signup stored.',
    }
  }

  const ageRaw = Number(readString(formData, 'age'))
  if (Number.isFinite(ageRaw) && ageRaw < 18) {
    return {
      ok: false,
      code: 'under18',
      message: 'Early testing is 18+ only.',
    }
  }

  const meetGenders = formData
    .getAll('meetGenders')
    .filter((value): value is string => typeof value === 'string')

  const parsed = testRunPayloadSchema.safeParse({
    consent: readBool(formData, 'consent') || undefined,
    wantIn: readString(formData, 'wantIn') || undefined,
    campus: readString(formData, 'campus'),
    cityCorridor: readString(formData, 'cityCorridor'),
    cityCorridorOther: readString(formData, 'cityCorridorOther'),
    fullName: readString(formData, 'fullName'),
    age: readString(formData, 'age'),
    email: readString(formData, 'email').trim().toLowerCase(),
    phone: readString(formData, 'phone'),
    socials: readString(formData, 'socials'),
    contactPreference: readString(formData, 'contactPreference') || undefined,
    isMe: readBool(formData, 'isMe') || undefined,
    gender: readString(formData, 'gender') || undefined,
    genderOther: readString(formData, 'genderOther'),
    meetGenders,
    school: readString(formData, 'school'),
    yearLevel: readString(formData, 'yearLevel') || undefined,
    departureArea: readString(formData, 'departureArea'),
    maxTravel: readString(formData, 'maxTravel') || undefined,
    nearbySchoolOk: readString(formData, 'nearbySchoolOk') || undefined,
    dealbreakers: readString(formData, 'dealbreakers'),
    aboutYou: readString(formData, 'aboutYou'),
    preferredCafes: readString(formData, 'preferredCafes'),
    refuseAreas: readString(formData, 'refuseAreas'),
    coverOwnOrder: readString(formData, 'coverOwnOrder') || undefined,
    accessibility: readString(formData, 'accessibility'),
    schedule: readString(formData, 'schedule'),
    hardNos: readString(formData, 'hardNos'),
    understandEarly: readBool(formData, 'understandEarly') || undefined,
    publicCafe: readBool(formData, 'publicCafe') || undefined,
    cancelEarly: readBool(formData, 'cancelEarly') || undefined,
    canReport: readBool(formData, 'canReport') || undefined,
    interviewOk: readBool(formData, 'interviewOk'),
    emergencyName: readString(formData, 'emergencyName'),
    emergencyPhone: readString(formData, 'emergencyPhone'),
    understandData: readBool(formData, 'understandData') || undefined,
    everythingTrue: readBool(formData, 'everythingTrue') || undefined,
    howHeard: readString(formData, 'howHeard'),
    prefillEmail: readString(formData, 'prefillEmail'),
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    if (first?.message.includes('18+')) {
      return { ok: false, code: 'under18', message: first.message }
    }
    return {
      ok: false,
      code: 'invalid',
      message: first?.message ?? 'Check the form and try again.',
    }
  }

  const face = asFile(formData.get('facePhoto'))
  const schoolId = asFile(formData.get('schoolIdPhoto')) ?? face
  if (!isAllowedTestRunFile(face) || !isAllowedTestRunFile(schoolId)) {
    return {
      ok: false,
      code: 'invalid',
      message: 'Add a selfie with your school ID (JPG, PNG, or WEBP, 5 MB max).',
    }
  }

  const data = parsed.data
  const id = randomUUID()
  const facePath = `${id}/face.${fileExtension(face)}`
  const schoolIdPath = `${id}/school-id.${fileExtension(schoolId)}`

  try {
    const supabase = createSupabaseServerClient()
    const rateSecret = process.env.RATE_LIMIT_HMAC_SECRET
    if (rateSecret) {
      const headerStore = await headers()
      const forwarded = headerStore.get('x-forwarded-for')
      const ip = forwarded?.split(',')[0]?.trim() || headerStore.get('x-real-ip') || 'unknown'
      const { data: allowed } = await supabase.rpc('consume_test_run_rate_limit', {
        p_ip_hash: ipHash(ip, rateSecret),
        p_limit: 8,
        p_window_seconds: 3600,
      })
      if (allowed === false) {
        return {
          ok: false,
          code: 'invalid',
          message: 'Too many tries from this network. Wait a bit and try again.',
        }
      }
    }

    const faceBuffer = Buffer.from(await face.arrayBuffer())
    const idBuffer = Buffer.from(await schoolId.arrayBuffer())
    if (faceBuffer.byteLength > TEST_RUN_MAX_FILE_BYTES || idBuffer.byteLength > TEST_RUN_MAX_FILE_BYTES) {
      return { ok: false, code: 'invalid', message: 'Keep each photo under 5 MB.' }
    }

    const faceUpload = await supabase.storage.from(BUCKET).upload(facePath, faceBuffer, {
      contentType: face.type,
      upsert: false,
    })
    if (faceUpload.error) {
      return {
        ok: false,
        code: 'upload',
        message: 'Could not save your photos. Try again.',
      }
    }

    const idUpload = await supabase.storage.from(BUCKET).upload(schoolIdPath, idBuffer, {
      contentType: schoolId.type,
      upsert: false,
    })
    if (idUpload.error) {
      await supabase.storage.from(BUCKET).remove([facePath])
      return {
        ok: false,
        code: 'upload',
        message: 'Could not save your photos. Try again.',
      }
    }

    const { error } = await supabase.from('test_run_signups').insert({
      campus: data.campus,
      city_corridor: data.cityCorridor,
      city_corridor_other: data.cityCorridorOther || null,
      full_name: data.fullName,
      age: data.age,
      email: data.email,
      phone: data.phone,
      socials: data.socials || null,
      contact_preference: data.contactPreference || 'Instagram',
      is_me: data.isMe ?? true,
      gender: data.gender,
      gender_other: data.genderOther || null,
      meet_genders: data.meetGenders,
      school: data.school,
      year_level: data.yearLevel,
      departure_area: data.departureArea || data.school,
      max_travel: data.maxTravel,
      nearby_school_ok: (data.nearbySchoolOk || 'yes') === 'yes',
      dealbreakers: data.dealbreakers,
      about_you: data.aboutYou,
      preferred_cafes: data.preferredCafes || null,
      refuse_areas: data.refuseAreas || null,
      cover_own_order: data.coverOwnOrder === 'yes',
      accessibility: data.accessibility || null,
      schedule: data.schedule,
      hard_nos: data.hardNos || null,
      understand_early: data.understandEarly,
      public_cafe: data.publicCafe,
      cancel_early: data.cancelEarly,
      can_report: data.canReport,
      interview_ok: data.interviewOk,
      emergency_name: data.emergencyName || null,
      emergency_phone: data.emergencyPhone || null,
      understand_data: data.understandData,
      everything_true: data.everythingTrue,
      how_heard: data.howHeard || null,
      prefill_email: data.prefillEmail || null,
      personal_email_warned: looksLikePersonalInbox(data.email),
      face_photo_path: facePath,
      school_id_photo_path: schoolIdPath,
    })

    if (error) {
      await supabase.storage.from(BUCKET).remove([facePath, schoolIdPath])
      return { ok: false, code: 'upload', message: 'Could not save your signup. Try again.' }
    }

    return { ok: true, message: 'You’re on the list.' }
  } catch {
    return {
      ok: false,
      code: 'config',
      message: 'Signup isn’t connected yet. Email info@afterclassapp.com.',
    }
  }
}
