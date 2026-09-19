import { z } from 'zod'
import { testRunContent } from '@/lib/test-run-content'
import {
  scheduleSlotsValid,
  serializeScheduleSlots,
  type ScheduleSlot,
} from '@/lib/test-run-schedule'

const PERSONAL_INBOX_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.com.ph',
  'ymail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
])

export const TEST_RUN_MAX_FILE_BYTES = 5 * 1024 * 1024
export const TEST_RUN_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export function looksLikePersonalInbox(email: string): boolean {
  const domain = email.split('@')[1]?.trim().toLowerCase()
  if (!domain) return false
  return PERSONAL_INBOX_DOMAINS.has(domain)
}

export function isEduPhEmail(email: string): boolean {
  const domain = email.split('@')[1]?.trim().toLowerCase()
  if (!domain) return false
  return domain.endsWith('.edu.ph')
}

const nonEmpty = (message: string) => z.string().trim().min(1, message)

export const testRunPayloadSchema = z
  .object({
    consent: z.literal(true, { error: 'Consent is required to continue.' }),
    wantIn: z.literal('yes', { error: 'Only continue if yes.' }),
    campus: nonEmpty('Enter your school.'),
    cityCorridor: nonEmpty('Choose a city.'),
    cityCorridorOther: z.string().trim().optional().default(''),
    fullName: nonEmpty('Enter your full name.'),
    age: z.coerce
      .number({ error: 'Enter your age.' })
      .int('Enter your age as a whole number.')
      .min(18, 'Early testing is 18+ only.')
      .max(99, 'Enter a real age.'),
    email: z
      .email('Enter a valid email address')
      .refine((value) => isEduPhEmail(value), {
        error: testRunContent.pages[3].emailSchoolError,
      }),
    phone: z.string().trim().optional().default(''),
    socials: nonEmpty('Enter your Instagram handle.'),
    contactPreference: z
      .enum(testRunContent.contactOptions)
      .optional()
      .default('Instagram'),
    isMe: z.literal(true).optional().default(true),
    gender: z.enum(testRunContent.genderOptions, {
      error: 'Choose a gender option.',
    }),
    genderOther: z.string().trim().optional().default(''),
    meetGenders: z.array(z.string().trim().min(1)).min(1, 'Choose who you want to meet.'),
    meetOther: z.string().trim().optional().default(''),
    school: nonEmpty('Enter your school.'),
    yearLevel: z.string().trim().min(1, 'Choose your year level.').optional(),
    departureArea: z.string().trim().optional().default(''),
    maxTravel: z.enum(testRunContent.travelOptions, {
      error: 'Choose a max travel time.',
    }),
    nearbySchoolOk: z.enum(['yes', 'no']).optional().default('yes'),
    dealbreakers: z
      .string()
      .trim()
      .min(1, 'Add 3 short dealbreakers.')
      .refine(
        (value) => {
          const count = value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean).length
          return count === 3
        },
        { error: 'Add 3 short dealbreakers.' }
      ),
    aboutYou: nonEmpty('Add one line about you or a good first date.'),
    preferredCafes: z.string().trim().optional().default(''),
    refuseAreas: z.string().trim().optional().default(''),
    coverOwnOrder: z.enum(['yes', 'no'], {
      error: 'Pick I agree or I disagree.',
    }),
    accessibility: z.string().trim().optional().default(''),
    schedule: nonEmpty('Pick at least one day and time window.'),
    hardNos: z.string().trim().optional().default(''),
    understandEarly: z.boolean().optional().default(true),
    publicCafe: z.boolean().optional().default(true),
    cancelEarly: z.literal(true, {
      error: testRunContent.pages[7].cancelEarlyError,
    }),
    canReport: z.boolean().optional().default(true),
    interviewOk: z.literal(true, {
      error: testRunContent.pages[7].interviewError,
    }),
    emergencyName: z.string().trim().optional().default(''),
    emergencyPhone: z.string().trim().optional().default(''),
    understandData: z.literal(true, {
      error: 'Confirm you understand how your data will be used.',
    }),
    everythingTrue: z.boolean().optional().default(true),
    howHeard: z.string().trim().optional().default(''),
    prefillEmail: z.string().trim().optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.cityCorridor === 'Other' && !value.cityCorridorOther) {
      ctx.addIssue({
        code: 'custom',
        path: ['cityCorridorOther'],
        message: 'Enter your city.',
      })
    }
    if (value.gender === 'Other' && !value.genderOther) {
      ctx.addIssue({
        code: 'custom',
        path: ['genderOther'],
        message: 'Tell us how you identify.',
      })
    }
    if (value.meetGenders.includes('Other') && !value.meetOther) {
      ctx.addIssue({
        code: 'custom',
        path: ['meetOther'],
        message: 'Tell us who else you want to meet.',
      })
    }
  })

export type TestRunPayload = z.infer<typeof testRunPayloadSchema>

export type TestRunFormState = {
  consent: boolean
  wantIn: '' | 'yes' | 'no'
  campus: string
  cityCorridor: string
  cityCorridorOther: string
  fullName: string
  age: string
  email: string
  phone: string
  socials: string
  contactPreference: '' | (typeof testRunContent.contactOptions)[number]
  facePhoto: File | null
  schoolIdPhoto: File | null
  isMe: boolean
  gender: '' | (typeof testRunContent.genderOptions)[number]
  genderOther: string
  meetGenders: Array<(typeof testRunContent.meetOptions)[number]>
  meetOther: string
  school: string
  yearLevel: string
  yearLevelOther: string
  departureArea: string
  maxTravel: string
  nearbySchoolOk: '' | 'yes' | 'no'
  dealbreakers: string[]
  aboutYou: string
  preferredCafes: string
  refuseAreas: string
  coverOwnOrder: '' | 'yes' | 'no'
  accessibility: string
  scheduleSlots: ScheduleSlot[]
  hardNos: string
  understandEarly: boolean
  publicCafe: boolean
  cancelEarly: '' | 'yes' | 'no'
  canReport: boolean
  interviewOk: boolean | null
  emergencyName: string
  emergencyPhone: string
  understandData: boolean
  everythingTrue: boolean
  howHeard: string
  prefillEmail: string
}

export function emptyTestRunState(
  prefill?: { email?: string; howHeard?: string }
): TestRunFormState {
  const email = prefill?.email?.trim() ?? ''
  return {
    consent: false,
    wantIn: '',
    campus: '',
    cityCorridor: '',
    cityCorridorOther: '',
    fullName: '',
    age: '',
    email,
    phone: '',
    socials: '',
    contactPreference: 'Instagram',
    facePhoto: null,
    schoolIdPhoto: null,
    isMe: true,
    gender: '',
    genderOther: '',
    meetGenders: [],
    meetOther: '',
    school: '',
    yearLevel: '',
    yearLevelOther: '',
    departureArea: '',
    maxTravel: '',
    nearbySchoolOk: 'yes',
    dealbreakers: [''],
    aboutYou: '',
    preferredCafes: '',
    refuseAreas: '',
    coverOwnOrder: '',
    accessibility: '',
    scheduleSlots: [],
    hardNos: '',
    understandEarly: true,
    publicCafe: true,
    cancelEarly: '',
    canReport: true,
    interviewOk: null,
    emergencyName: '',
    emergencyPhone: '',
    understandData: false,
    everythingTrue: true,
    howHeard: prefill?.howHeard?.trim() ?? '',
    prefillEmail: email,
  }
}

function isAllowedImageType(file: File): boolean {
  const type = file.type.toLowerCase()
  if ((TEST_RUN_ALLOWED_MIME as readonly string[]).includes(type)) return true
  // iPhone photos often arrive with an empty MIME type
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp')
  )
}

export function isAllowedTestRunFile(file: File | null): file is File {
  if (!file || file.size === 0) return false
  if (file.size > TEST_RUN_MAX_FILE_BYTES) return false
  return isAllowedImageType(file)
}

export function filledDealbreakers(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean)
}

export function serializeDealbreakers(items: string[]): string {
  return filledDealbreakers(items).join('\n')
}

export function fileError(file: File | null): string | undefined {
  if (!file || file.size === 0) return 'Add a photo.'
  if (file.size > TEST_RUN_MAX_FILE_BYTES) return 'Keep it under 5 MB.'
  if (!isAllowedImageType(file)) {
    return 'Use JPG, PNG, WEBP, or HEIC.'
  }
  return undefined
}

type PageErrors = Partial<Record<keyof TestRunFormState, string>>

function requireChecked(
  on: boolean,
  key: keyof TestRunFormState,
  message: string,
  errors: PageErrors
) {
  if (!on) errors[key] = message
}

export function validateTestRunPage(
  page: number,
  state: TestRunFormState
): PageErrors {
  const errors: PageErrors = {}
  const p = testRunContent.pages

  if (page === 1) {
    requireChecked(state.consent, 'consent', p[1].consentError, errors)
    if (state.wantIn !== 'yes' && state.wantIn !== 'no') {
      errors.wantIn = p[1].wantInError
    }
  }

  if (page === 2) {
    if (!state.cityCorridor) errors.cityCorridor = 'Choose a city.'
    if (state.cityCorridor === 'Other' && !state.cityCorridorOther.trim()) {
      errors.cityCorridorOther = 'Enter your city.'
    }
  }

  if (page === 3) {
    if (!state.fullName.trim()) errors.fullName = 'Enter your full name.'
    const age = Number(state.age)
    if (!state.age.trim() || Number.isNaN(age) || !Number.isInteger(age)) {
      errors.age = 'Enter your age.'
    } else if (age < 18) {
      errors.age = p[3].ageHelper
    } else if (age > 99) {
      errors.age = 'Enter a real age.'
    }
    if (!state.email.trim()) errors.email = 'Enter your school email.'
    else {
      const parsed = z.email().safeParse(state.email.trim())
      if (!parsed.success) errors.email = 'Enter a valid email address.'
      else if (!isEduPhEmail(state.email)) {
        errors.email = p[3].emailSchoolError
      }
    }
    if (!state.socials.trim()) errors.socials = 'Enter your Instagram handle.'
  }

  if (page === 4) {
    const face = fileError(state.facePhoto)
    if (face) errors.facePhoto = face
  }

  if (page === 5) {
    if (!state.gender) errors.gender = 'Choose a gender option.'
    if (state.gender === 'Other' && !state.genderOther.trim()) {
      errors.genderOther = 'Tell us how you identify.'
    }
    if (state.meetGenders.length === 0) {
      errors.meetGenders = 'Choose who you want to meet.'
    }
    if (state.meetGenders.includes('Other') && !state.meetOther.trim()) {
      errors.meetOther = 'Tell us who else you want to meet.'
    }
    if (!state.school.trim() || state.school === 'Other') {
      errors.school = 'Choose your school.'
    }
    if (!state.yearLevel) errors.yearLevel = 'Choose your year level.'
    if (state.yearLevel === 'Others' && !state.yearLevelOther.trim()) {
      errors.yearLevelOther = 'Tell us your year level.'
    }
    if (!state.maxTravel) errors.maxTravel = 'Choose a max travel time.'
    const dealCount = filledDealbreakers(state.dealbreakers).length
    if (dealCount !== 3) {
      errors.dealbreakers = 'Add 3 short dealbreakers.'
    }
    if (!state.aboutYou.trim()) {
      errors.aboutYou = 'Add one line about you or a good first date.'
    }
    if (state.coverOwnOrder !== 'yes' && state.coverOwnOrder !== 'no') {
      errors.coverOwnOrder = p[5].coverError
    }
  }

  if (page === 6) {
    if (!scheduleSlotsValid(state.scheduleSlots)) {
      errors.scheduleSlots = 'Pick at least one day and a 2–3 hour window.'
    }
  }

  if (page === 7) {
    if (state.cancelEarly !== 'yes') {
      errors.cancelEarly = p[7].cancelEarlyError
    }
    requireChecked(
      state.interviewOk === true,
      'interviewOk',
      p[7].interviewError,
      errors
    )
  }

  if (page === 8) {
    // Privacy agree moved into consent (page 1 / step 2).
  }

  return errors
}

export function toTestRunPayload(state: TestRunFormState): unknown {
  return {
    consent: state.consent || undefined,
    wantIn: state.wantIn === 'yes' ? 'yes' : undefined,
    campus: state.campus.trim() || state.school,
    cityCorridor: state.cityCorridor,
    cityCorridorOther: state.cityCorridorOther,
    fullName: state.fullName,
    age: state.age,
    email: state.email,
    phone: state.phone,
    socials: state.socials,
    contactPreference: state.contactPreference || 'Instagram',
    isMe: true,
    gender: state.gender || undefined,
    genderOther: state.genderOther,
    meetGenders: state.meetGenders.includes('Other')
      ? [
          ...state.meetGenders.filter((item) => item !== 'Other'),
          ...(state.meetOther.trim()
            ? [`Other: ${state.meetOther.trim()}`]
            : ['Other']),
        ]
      : state.meetGenders,
    school: state.school.trim() || state.campus,
    yearLevel:
      state.yearLevel === 'Others'
        ? state.yearLevelOther.trim() || 'Others'
        : state.yearLevel || undefined,
    departureArea: state.departureArea.trim() || state.school.trim() || state.campus,
    maxTravel: state.maxTravel || undefined,
    nearbySchoolOk: state.nearbySchoolOk || 'yes',
    dealbreakers: serializeDealbreakers(state.dealbreakers),
    aboutYou: state.aboutYou,
    preferredCafes: state.preferredCafes,
    refuseAreas: state.refuseAreas,
    coverOwnOrder: state.coverOwnOrder === 'yes' ? 'yes' : undefined,
    accessibility: state.accessibility,
    schedule: serializeScheduleSlots(state.scheduleSlots),
    hardNos: state.hardNos,
    understandEarly: state.understandEarly || undefined,
    publicCafe: state.publicCafe || undefined,
    cancelEarly: state.cancelEarly === 'yes' ? true : undefined,
    canReport: state.canReport || undefined,
    interviewOk: state.interviewOk === true ? true : undefined,
    emergencyName: state.emergencyName,
    emergencyPhone: state.emergencyPhone,
    understandData: state.consent || state.understandData || undefined,
    everythingTrue: state.everythingTrue || undefined,
    howHeard: state.howHeard,
    prefillEmail: state.prefillEmail,
  }
}
