import { describe, expect, it } from 'vitest'
import {
  emptyTestRunState,
  isEduPhEmail,
  looksLikePersonalInbox,
  toTestRunPayload,
  testRunPayloadSchema,
  validateTestRunPage,
} from '@/lib/validations/test-run'
import {
  getActiveSteps,
  stepBadgeNumber,
  validateTestRunStep,
} from '@/lib/test-run-steps'

describe('looksLikePersonalInbox', () => {
  it('flags gmail and outlook', () => {
    expect(looksLikePersonalInbox('ada@gmail.com')).toBe(true)
    expect(looksLikePersonalInbox('ada@outlook.com')).toBe(true)
  })

  it('allows school domains', () => {
    expect(looksLikePersonalInbox('ada@ateneo.edu')).toBe(false)
    expect(looksLikePersonalInbox('ada@upd.edu.ph')).toBe(false)
  })
})

describe('isEduPhEmail', () => {
  it('accepts .edu.ph domains', () => {
    expect(isEduPhEmail('ada@upd.edu.ph')).toBe(true)
    expect(isEduPhEmail('ADA@DLSU.EDU.PH')).toBe(true)
    expect(isEduPhEmail('ada@student.ust.edu.ph')).toBe(true)
  })

  it('rejects personal and non-.edu.ph school domains', () => {
    expect(isEduPhEmail('ada@gmail.com')).toBe(false)
    expect(isEduPhEmail('ada@ateneo.edu')).toBe(false)
    expect(isEduPhEmail('')).toBe(false)
  })
})

describe('email step', () => {
  it('is badge 7 on the default path', () => {
    expect(stepBadgeNumber('email', emptyTestRunState())).toBe(7)
  })

  it('blocks non-.edu.ph addresses', () => {
    const state = emptyTestRunState()
    state.email = 'ada@gmail.com'
    expect(validateTestRunStep('email', state).email).toMatch(/school email/i)
    expect(validateTestRunPage(3, state).email).toMatch(/school email/i)
    state.email = 'ada@upd.edu.ph'
    expect(validateTestRunStep('email', state)).toEqual({})
  })

  it('rejects non-.edu.ph payloads', () => {
    const state = completeState()
    state.email = 'ada@gmail.com'
    expect(testRunPayloadSchema.safeParse(toTestRunPayload(state)).success).toBe(
      false
    )
  })
})

describe('validateTestRunPage', () => {
  it('sends no on page 1 to the decline path without other errors besides choice', () => {
    const state = emptyTestRunState()
    state.consent = true
    state.wantIn = 'no'
    expect(validateTestRunPage(1, state)).toEqual({})
  })

  it('blocks under-18 on page 3', () => {
    const state = emptyTestRunState()
    state.fullName = 'Ada Reyes'
    state.age = '17'
    state.email = 'ada@upd.edu.ph'
    state.socials = '@ada.reyes'
    state.contactPreference = 'Instagram'
    expect(validateTestRunPage(3, state).age).toMatch(/18/)
  })
})

describe('testRunPayloadSchema', () => {
  it('rejects under-18 payloads', () => {
    const state = completeState()
    state.age = '17'
    const parsed = testRunPayloadSchema.safeParse(toTestRunPayload(state))
    expect(parsed.success).toBe(false)
  })

  it('accepts a complete 18+ payload', () => {
    const parsed = testRunPayloadSchema.safeParse(toTestRunPayload(completeState()))
    expect(parsed.success).toBe(true)
  })

  it('treats page-1 consent as understandData without a later privacy step', () => {
    const state = completeState()
    state.understandData = false
    expect(getActiveSteps(state)).not.toContain('dataNotice')
    expect(getActiveSteps(state)).not.toContain('dataUse')
    expect(validateTestRunPage(8, state)).toEqual({})
    expect(testRunPayloadSchema.safeParse(toTestRunPayload(state)).success).toBe(
      true
    )
  })

  it('rejects interviewOk unless yes', () => {
    const state = completeState()
    state.interviewOk = false
    expect(testRunPayloadSchema.safeParse(toTestRunPayload(state)).success).toBe(
      false
    )
    state.interviewOk = null
    expect(testRunPayloadSchema.safeParse(toTestRunPayload(state)).success).toBe(
      false
    )
  })

  it('rejects cancelEarly unless yes', () => {
    const state = completeState()
    state.cancelEarly = 'no'
    expect(testRunPayloadSchema.safeParse(toTestRunPayload(state)).success).toBe(
      false
    )
    state.cancelEarly = ''
    expect(testRunPayloadSchema.safeParse(toTestRunPayload(state)).success).toBe(
      false
    )
  })
})

describe('cancelEarly step', () => {
  it('is badge 19 on the default path', () => {
    const state = emptyTestRunState()
    expect(getActiveSteps(state)).toContain('cancelEarly')
    expect(stepBadgeNumber('cancelEarly', state)).toBe(19)
  })

  it('blocks empty and no, allows yes', () => {
    const empty = emptyTestRunState()
    expect(validateTestRunStep('cancelEarly', empty).cancelEarly).toBeTruthy()
    empty.cancelEarly = 'no'
    expect(validateTestRunStep('cancelEarly', empty).cancelEarly).toBeTruthy()
    empty.cancelEarly = 'yes'
    expect(validateTestRunStep('cancelEarly', empty)).toEqual({})
  })
})

describe('emergency contact', () => {
  it('is not in the live path', () => {
    const state = emptyTestRunState()
    const steps = getActiveSteps(state)
    expect(steps).not.toContain('emergencyName')
    expect(steps).not.toContain('emergencyPhone')
    expect(new Set(steps).size).toBe(steps.length)
  })
})

describe('interviewOk step', () => {
  it('is badge 20 after cancelEarly', () => {
    expect(stepBadgeNumber('interviewOk', emptyTestRunState())).toBe(20)
  })

  it('blocks empty and no, allows yes', () => {
    const empty = emptyTestRunState()
    expect(validateTestRunStep('interviewOk', empty).interviewOk).toBeTruthy()
    empty.interviewOk = false
    expect(validateTestRunStep('interviewOk', empty).interviewOk).toBeTruthy()
    empty.interviewOk = true
    expect(validateTestRunStep('interviewOk', empty)).toEqual({})
    expect(validateTestRunPage(7, empty).interviewOk).toBeUndefined()
  })
})

describe('everythingTrue step', () => {
  it('is not in the live path', () => {
    expect(getActiveSteps(emptyTestRunState())).not.toContain('everythingTrue')
  })
})

function completeState() {
  const state = emptyTestRunState({
    email: 'ada@upd.edu.ph',
    howHeard: 'friend',
  })
  state.consent = true
  state.wantIn = 'yes'
  state.cityCorridor = 'Quezon City'
  state.fullName = 'Ada Reyes'
  state.age = '20'
  state.email = 'ada@upd.edu.ph'
  state.socials = '@ada.reyes'
  state.contactPreference = 'Instagram'
  state.isMe = true
  state.gender = 'Woman'
  state.meetGenders = ['Men']
  state.school = 'Ateneo de Manila University'
  state.yearLevel = '2nd year'
  state.maxTravel = '30 minutes'
  state.nearbySchoolOk = 'yes'
  state.dealbreakers = ['Smoking', 'Late by a lot', 'No plan']
  state.aboutYou = 'Walk first, then coffee. I show up on time.'
  state.coverOwnOrder = 'yes'
  state.scheduleSlots = [
    { date: '2026-09-22', startHour: 14, duration: 2 },
    { date: '2026-09-24', startHour: 16, duration: 2 },
  ]
  state.understandEarly = true
  state.publicCafe = true
  state.canReport = true
  state.cancelEarly = 'yes'
  state.interviewOk = true
  state.everythingTrue = true
  return state
}
