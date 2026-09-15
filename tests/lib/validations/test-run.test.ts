import { describe, expect, it } from 'vitest'
import {
  emptyTestRunState,
  looksLikePersonalInbox,
  toTestRunPayload,
  testRunPayloadSchema,
  validateTestRunPage,
} from '@/lib/validations/test-run'

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
    state.email = 'ada@ateneo.edu'
    state.phone = '09171234567'
    state.contactPreference = 'WhatsApp'
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
})

function completeState() {
  const state = emptyTestRunState({
    email: 'ada@ateneo.edu',
    howHeard: 'friend',
  })
  state.consent = true
  state.wantIn = 'yes'
  state.campus = 'Ateneo de Manila'
  state.cityCorridor = 'Quezon City'
  state.fullName = 'Ada Reyes'
  state.age = '20'
  state.email = 'ada@ateneo.edu'
  state.phone = '09171234567'
  state.contactPreference = 'Either'
  state.isMe = true
  state.gender = 'Woman'
  state.meetGenders = ['Men']
  state.school = 'Ateneo de Manila'
  state.yearLevel = '2nd year'
  state.departureArea = 'Katipunan'
  state.maxTravel = '30 minutes'
  state.nearbySchoolOk = 'yes'
  state.dealbreakers = 'Smoking. Late by a lot. No plan.'
  state.aboutYou = 'Walk first, then coffee. I show up on time.'
  state.coverOwnOrder = 'yes'
  state.schedule = 'Tue/Thu after 1pm. Sat late morning.'
  state.understandEarly = true
  state.publicCafe = true
  state.cancelEarly = true
  state.canReport = true
  state.understandData = true
  state.everythingTrue = true
  return state
}
