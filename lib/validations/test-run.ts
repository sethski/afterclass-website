import { z } from 'zod'
import { testRunContent } from '@/lib/test-run-content'

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

const nonEmpty = (message: string) => z.string().trim().min(1, message)

export const testRunPayloadSchema = z
  .object({
    consent: z.literal(true, { error: 'Consent is required to continue.' }),
    wantIn: z.literal('yes', { error: 'Only continue if yes.' }),
    campus: nonEmpty('Enter your campus or school.'),
    cityCorridor: nonEmpty('Choose a city corridor.'),
    cityCorridorOther: z.string().trim().optional().default(''),
    fullName: nonEmpty('Enter your full name.'),
    age: z.coerce
      .number({ error: 'Enter your age.' })
      .int('Enter your age as a whole number.')
      .min(18, 'Early testing is 18+ only.')
      .max(99, 'Enter a real age.'),
    email: z.email('Enter a valid email address'),
    phone: nonEmpty('Enter a phone or WhatsApp number.'),
    socials: z.string().trim().optional().default(''),
    contactPreference: z.enum(testRunContent.contactOptions, {
      error: 'Choose a contact preference.',
    }),
    isMe: z.literal(true, { error: 'Confirm you’ll show up as yourself.' }),
    gender: z.enum(testRunContent.genderOptions, {
      error: 'Choose a gender option.',
    }),
    genderOther: z.string().trim().optional().default(''),
    meetGenders: z
      .array(z.enum(testRunContent.meetOptions))
      .min(1, 'Choose who you want to meet.'),
    school: nonEmpty('Enter your school.'),
    yearLevel: z.enum(testRunContent.yearOptions, {
      error: 'Choose your year level.',
    }),
    departureArea: nonEmpty('Enter an area, campus, or landmark.'),
    maxTravel: z.enum(testRunContent.travelOptions, {
      error: 'Choose a max travel time.',
    }),
    nearbySchoolOk: z.enum(['yes', 'no'], {
      error: 'Tell us if a nearby school is okay.',
    }),
    dealbreakers: nonEmpty('Add 3–5 short dealbreakers.'),
    aboutYou: nonEmpty('Add one line about you or a good first date.'),
    preferredCafes: z.string().trim().optional().default(''),
    refuseAreas: z.string().trim().optional().default(''),
    coverOwnOrder: z.enum(['yes', 'no'], {
      error: 'Tell us if you can cover your own order.',
    }),
    accessibility: z.string().trim().optional().default(''),
    schedule: nonEmpty('Tell us days and times you can do a daytime cafe date.'),
    hardNos: z.string().trim().optional().default(''),
    understandEarly: z.literal(true, {
      error: 'Confirm you understand this is early testing.',
    }),
    publicCafe: z.literal(true, {
      error: 'Confirm public daytime cafe only.',
    }),
    cancelEarly: z.literal(true, {
      error: 'Confirm you’ll cancel early if you can’t make it.',
    }),
    canReport: z.literal(true, {
      error: 'Confirm you can report or leave anytime.',
    }),
    interviewOk: z.boolean(),
    emergencyName: z.string().trim().optional().default(''),
    emergencyPhone: z.string().trim().optional().default(''),
    understandData: z.literal(true, {
      error: 'Confirm you understand how your data will be used.',
    }),
    everythingTrue: z.literal(true, {
      error: 'Confirm everything here is true.',
    }),
    howHeard: z.string().trim().optional().default(''),
    prefillEmail: z.string().trim().optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.cityCorridor === 'Other' && !value.cityCorridorOther) {
      ctx.addIssue({
        code: 'custom',
        path: ['cityCorridorOther'],
        message: 'Enter your city or corridor.',
      })
    }
    if (value.gender === 'Self-describe' && !value.genderOther) {
      ctx.addIssue({
        code: 'custom',
        path: ['genderOther'],
        message: 'Tell us how you describe it.',
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
  school: string
  yearLevel: string
  departureArea: string
  maxTravel: string
  nearbySchoolOk: '' | 'yes' | 'no'
  dealbreakers: string
  aboutYou: string
  preferredCafes: string
  refuseAreas: string
  coverOwnOrder: '' | 'yes' | 'no'
  accessibility: string
  schedule: string
  hardNos: string
  understandEarly: boolean
  publicCafe: boolean
  cancelEarly: boolean
  canReport: boolean
  interviewOk: boolean
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
    contactPreference: '',
    facePhoto: null,
    schoolIdPhoto: null,
    isMe: false,
    gender: '',
    genderOther: '',
    meetGenders: [],
    school: '',
    yearLevel: '',
    departureArea: '',
    maxTravel: '',
    nearbySchoolOk: '',
    dealbreakers: '',
    aboutYou: '',
    preferredCafes: '',
    refuseAreas: '',
    coverOwnOrder: '',
    accessibility: '',
    schedule: '',
    hardNos: '',
    understandEarly: false,
    publicCafe: false,
    cancelEarly: false,
    canReport: false,
    interviewOk: false,
    emergencyName: '',
    emergencyPhone: '',
    understandData: false,
    everythingTrue: false,
    howHeard: prefill?.howHeard?.trim() ?? '',
    prefillEmail: email,
  }
}

export function isAllowedTestRunFile(file: File | null): file is File {
  if (!file || file.size === 0) return false
  if (file.size > TEST_RUN_MAX_FILE_BYTES) return false
  const type = file.type.toLowerCase()
  return (TEST_RUN_ALLOWED_MIME as readonly string[]).includes(type)
}

export function fileError(file: File | null): string | undefined {
  if (!file || file.size === 0) return 'Add a photo.'
  if (file.size > TEST_RUN_MAX_FILE_BYTES) return 'Keep it under 5 MB.'
  if (!(TEST_RUN_ALLOWED_MIME as readonly string[]).includes(file.type.toLowerCase())) {
    return 'Use JPG, PNG, or WEBP.'
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
    requireChecked(state.consent, 'consent', p[1].consentHelper, errors)
    if (state.wantIn !== 'yes' && state.wantIn !== 'no') {
      errors.wantIn = p[1].wantInHelper
    }
  }

  if (page === 2) {
    if (!state.campus.trim()) errors.campus = 'Enter your campus or school.'
    if (!state.cityCorridor) errors.cityCorridor = 'Choose a city corridor.'
    if (state.cityCorridor === 'Other' && !state.cityCorridorOther.trim()) {
      errors.cityCorridorOther = 'Enter your city or corridor.'
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
    }
    if (!state.phone.trim()) errors.phone = 'Enter a phone or WhatsApp number.'
    if (!state.contactPreference) {
      errors.contactPreference = 'Choose a contact preference.'
    }
  }

  if (page === 4) {
    const face = fileError(state.facePhoto)
    const id = fileError(state.schoolIdPhoto)
    if (face) errors.facePhoto = face
    if (id) errors.schoolIdPhoto = id
    requireChecked(state.isMe, 'isMe', 'Confirm you’ll show up as yourself.', errors)
  }

  if (page === 5) {
    if (!state.gender) errors.gender = 'Choose a gender option.'
    if (state.gender === 'Self-describe' && !state.genderOther.trim()) {
      errors.genderOther = 'Tell us how you describe it.'
    }
    if (state.meetGenders.length === 0) {
      errors.meetGenders = 'Choose who you want to meet.'
    }
    if (!state.school.trim()) errors.school = 'Enter your school.'
    if (!state.yearLevel) errors.yearLevel = 'Choose your year level.'
    if (!state.departureArea.trim()) {
      errors.departureArea = 'Enter an area, campus, or landmark.'
    }
    if (!state.maxTravel) errors.maxTravel = 'Choose a max travel time.'
    if (state.nearbySchoolOk !== 'yes' && state.nearbySchoolOk !== 'no') {
      errors.nearbySchoolOk = 'Tell us if a nearby school is okay.'
    }
    if (!state.dealbreakers.trim()) {
      errors.dealbreakers = 'Add 3–5 short dealbreakers.'
    }
    if (!state.aboutYou.trim()) {
      errors.aboutYou = 'Add one line about you or a good first date.'
    }
    if (state.coverOwnOrder !== 'yes' && state.coverOwnOrder !== 'no') {
      errors.coverOwnOrder = p[5].coverHelper
    }
  }

  if (page === 6) {
    if (!state.schedule.trim()) {
      errors.schedule = 'Tell us days and times that work.'
    }
  }

  if (page === 7) {
    requireChecked(
      state.understandEarly,
      'understandEarly',
      'Confirm you understand this is early testing.',
      errors
    )
    requireChecked(
      state.publicCafe,
      'publicCafe',
      'Confirm public daytime cafe only.',
      errors
    )
    requireChecked(
      state.cancelEarly,
      'cancelEarly',
      'Confirm you’ll cancel early if you can’t make it.',
      errors
    )
    requireChecked(
      state.canReport,
      'canReport',
      'Confirm you can report or leave anytime.',
      errors
    )
  }

  if (page === 8) {
    requireChecked(
      state.understandData,
      'understandData',
      'Confirm you understand how your data will be used.',
      errors
    )
  }

  if (page === 9) {
    requireChecked(
      state.everythingTrue,
      'everythingTrue',
      'Confirm everything here is true.',
      errors
    )
  }

  return errors
}

export function toTestRunPayload(state: TestRunFormState): unknown {
  return {
    consent: state.consent || undefined,
    wantIn: state.wantIn === 'yes' ? 'yes' : undefined,
    campus: state.campus,
    cityCorridor: state.cityCorridor,
    cityCorridorOther: state.cityCorridorOther,
    fullName: state.fullName,
    age: state.age,
    email: state.email,
    phone: state.phone,
    socials: state.socials,
    contactPreference: state.contactPreference || undefined,
    isMe: state.isMe || undefined,
    gender: state.gender || undefined,
    genderOther: state.genderOther,
    meetGenders: state.meetGenders,
    school: state.school,
    yearLevel: state.yearLevel || undefined,
    departureArea: state.departureArea,
    maxTravel: state.maxTravel || undefined,
    nearbySchoolOk: state.nearbySchoolOk || undefined,
    dealbreakers: state.dealbreakers,
    aboutYou: state.aboutYou,
    preferredCafes: state.preferredCafes,
    refuseAreas: state.refuseAreas,
    coverOwnOrder: state.coverOwnOrder || undefined,
    accessibility: state.accessibility,
    schedule: state.schedule,
    hardNos: state.hardNos,
    understandEarly: state.understandEarly || undefined,
    publicCafe: state.publicCafe || undefined,
    cancelEarly: state.cancelEarly || undefined,
    canReport: state.canReport || undefined,
    interviewOk: state.interviewOk,
    emergencyName: state.emergencyName,
    emergencyPhone: state.emergencyPhone,
    understandData: state.understandData || undefined,
    everythingTrue: state.everythingTrue || undefined,
    howHeard: state.howHeard,
    prefillEmail: state.prefillEmail,
  }
}
