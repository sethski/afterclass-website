import { testRunContent as copy } from '@/lib/test-run-content'
import {
  fileError,
  type TestRunFormState,
} from '@/lib/validations/test-run'
import { scheduleSlotsValid } from '@/lib/test-run-schedule'

export type TestRunStepId =
  | 'intro'
  | 'consent'
  | 'wantIn'
  | 'campus'
  | 'cityCorridor'
  | 'cityCorridorOther'
  | 'fullName'
  | 'age'
  | 'email'
  | 'phone'
  | 'socials'
  | 'contactPreference'
  | 'facePhoto'
  | 'schoolIdPhoto'
  | 'isMe'
  | 'gender'
  | 'genderOther'
  | 'meetGenders'
  | 'meetOther'
  | 'school'
  | 'yearLevel'
  | 'departureArea'
  | 'maxTravel'
  | 'nearbySchoolOk'
  | 'dealbreakers'
  | 'aboutYou'
  | 'preferredCafes'
  | 'refuseAreas'
  | 'coverOwnOrder'
  | 'accessibility'
  | 'schedule'
  | 'hardNos'
  | 'understandEarly'
  | 'publicCafe'
  | 'cancelEarly'
  | 'canReport'
  | 'interviewOk'
  | 'emergencyName'
  | 'emergencyPhone'
  | 'dataNotice'
  | 'dataUse'
  | 'everythingTrue'
  | 'howHeard'

/** Ordered base path. Conditionals are inserted when active. */
const BASE_STEPS: TestRunStepId[] = [
  'intro',
  'consent',
  'wantIn',
  'cityCorridor',
  'fullName',
  'age',
  'email',
  'socials',
  'facePhoto',
  'gender',
  'meetGenders',
  'school',
  'yearLevel',
  'maxTravel',
  'dealbreakers',
  'aboutYou',
  'coverOwnOrder',
  'schedule',
  'hardNos',
  'understandEarly',
  'publicCafe',
  'cancelEarly',
  'canReport',
  'interviewOk',
  'emergencyName',
  'emergencyPhone',
  'dataNotice',
  'dataUse',
  'everythingTrue',
]

export function getActiveSteps(values: TestRunFormState): TestRunStepId[] {
  const steps: TestRunStepId[] = []
  for (const id of BASE_STEPS) {
    if (id === 'genderOther') continue
    if (id === 'meetOther') continue
    if (id === 'cityCorridorOther') continue
    steps.push(id)
    if (id === 'cityCorridor' && values.cityCorridor === 'Other') {
      steps.push('cityCorridorOther')
    }
  }
  return steps
}

export function stepIndex(id: TestRunStepId, values: TestRunFormState): number {
  return getActiveSteps(values).indexOf(id)
}

export function stepCount(values: TestRunFormState): number {
  return getActiveSteps(values).length
}

export function nextStep(
  id: TestRunStepId,
  values: TestRunFormState
): TestRunStepId | 'submit' {
  const steps = getActiveSteps(values)
  const i = steps.indexOf(id)
  if (i < 0 || i >= steps.length - 1) return 'submit'
  return steps[i + 1]!
}

export function prevStep(
  id: TestRunStepId,
  values: TestRunFormState
): TestRunStepId | 'welcome' {
  const steps = getActiveSteps(values)
  const i = steps.indexOf(id)
  if (i <= 0) return 'welcome'
  return steps[i - 1]!
}

type StepErrors = Partial<Record<keyof TestRunFormState, string>>

export function validateTestRunStep(
  id: TestRunStepId,
  state: TestRunFormState
): StepErrors {
  const errors: StepErrors = {}
  const p = copy.pages

  switch (id) {
    case 'intro':
    case 'dataNotice':
    case 'preferredCafes':
    case 'refuseAreas':
    case 'accessibility':
    case 'hardNos':
    case 'interviewOk':
    case 'emergencyName':
    case 'emergencyPhone':
      break
    case 'howHeard':
      break
    case 'coverOwnOrder':
      if (state.coverOwnOrder !== 'yes' && state.coverOwnOrder !== 'no') {
        errors.coverOwnOrder = p[5].coverError
      }
      break
    case 'consent':
      if (!state.consent) errors.consent = p[1].consentHelper
      break
    case 'wantIn':
      if (state.wantIn !== 'yes' && state.wantIn !== 'no') {
        errors.wantIn = p[1].wantInError
      }
      break
    case 'campus':
      break
    case 'cityCorridor':
      if (!state.cityCorridor) errors.cityCorridor = 'Choose a city.'
      break
    case 'cityCorridorOther':
      if (!state.cityCorridorOther.trim()) {
        errors.cityCorridorOther = 'Enter your city.'
      }
      break
    case 'socials':
      if (!state.socials.trim()) errors.socials = 'Enter your Instagram handle.'
      break
    case 'fullName':
      if (!state.fullName.trim()) errors.fullName = 'Enter your full name.'
      break
    case 'age': {
      const age = Number(state.age)
      if (!state.age.trim() || Number.isNaN(age) || !Number.isInteger(age)) {
        errors.age = 'Enter your age.'
      } else if (age < 18) {
        errors.age = p[3].ageHelper
      } else if (age > 99) {
        errors.age = 'Enter a real age.'
      }
      break
    }
    case 'email': {
      if (!state.email.trim()) errors.email = 'Enter your school email.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
        errors.email = 'Enter a valid email address.'
      }
      break
    }
    case 'phone':
      break
    case 'contactPreference':
      break
    case 'facePhoto': {
      const face = fileError(state.facePhoto)
      if (face) errors.facePhoto = face
      break
    }
    case 'schoolIdPhoto':
      break
    case 'isMe':
      break
    case 'gender':
      if (!state.gender) errors.gender = 'Choose a gender option.'
      if (state.gender === 'Other' && !state.genderOther.trim()) {
        errors.genderOther = 'Tell us how you identify.'
      }
      break
    case 'genderOther':
      break
    case 'meetGenders':
      if (state.meetGenders.length === 0) {
        errors.meetGenders = 'Choose who you want to meet.'
      }
      if (
        state.meetGenders.includes('Other') &&
        !state.meetOther.trim()
      ) {
        errors.meetOther = 'Tell us who else you want to meet.'
      }
      break
    case 'meetOther':
      break
    case 'school':
      if (!state.school.trim()) errors.school = 'Enter your school.'
      break
    case 'yearLevel':
      if (!state.yearLevel) errors.yearLevel = 'Choose your year level.'
      break
    case 'departureArea':
      break
    case 'maxTravel':
      if (!state.maxTravel) errors.maxTravel = 'Choose a max travel time.'
      break
    case 'nearbySchoolOk':
      break
    case 'dealbreakers': {
      const dealCount = state.dealbreakers.map((item) => item.trim()).filter(Boolean).length
      if (dealCount !== 3) {
        errors.dealbreakers = 'Add 3 short dealbreakers.'
      }
      break
    }
    case 'aboutYou':
      if (!state.aboutYou.trim()) {
        errors.aboutYou = 'Add one line about you or a good first date.'
      }
      break
    case 'schedule':
      if (!scheduleSlotsValid(state.scheduleSlots)) {
        errors.scheduleSlots = 'Pick at least one day and a 2–3 hour window.'
      }
      break
    case 'understandEarly':
      if (!state.understandEarly) {
        errors.understandEarly = 'Confirm you understand this is a dry run.'
      }
      break
    case 'publicCafe':
      if (!state.publicCafe) {
        errors.publicCafe = 'Confirm public daytime cafe only.'
      }
      break
    case 'cancelEarly':
      if (!state.cancelEarly) {
        errors.cancelEarly = 'Confirm you\'ll cancel early if you can\'t make it.'
      }
      break
    case 'canReport':
      if (!state.canReport) {
        errors.canReport = 'Confirm you can report or leave anytime.'
      }
      break
    case 'dataUse':
      if (!state.understandData) {
        errors.understandData = 'Confirm you understand how your data will be used.'
      }
      break
    case 'everythingTrue':
      if (!state.everythingTrue) {
        errors.everythingTrue = 'Confirm everything here is true.'
      }
      break
  }

  return errors
}

export function stepBadgeNumber(
  id: TestRunStepId,
  values: TestRunFormState
): number {
  return stepIndex(id, values) + 1
}
