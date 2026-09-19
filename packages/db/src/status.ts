export const SIGNUP_STATUSES = [
  'pending',
  'reviewed',
  'matched',
  'scheduled',
  'completed',
  'withdrawn',
] as const

export type SignupStatus = (typeof SIGNUP_STATUSES)[number]

export const SIGNUP_STATUS_LABEL = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  matched: 'Matched',
  scheduled: 'Scheduled',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
} as const satisfies Record<SignupStatus, string>

export const MATCH_STATUSES = [
  'proposed',
  'confirmed',
  'scheduled',
  'completed',
  'cancelled',
] as const

export type MatchStatus = (typeof MATCH_STATUSES)[number]

export const MATCH_STATUS_LABEL = {
  proposed: 'Proposed',
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const satisfies Record<MatchStatus, string>

export const DATE_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'no_show_a',
  'no_show_b',
  'cancelled',
] as const

export type DateStatus = (typeof DATE_STATUSES)[number]

export const DATE_STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  no_show_a: 'No-show (A)',
  no_show_b: 'No-show (B)',
  cancelled: 'Cancelled',
} as const satisfies Record<DateStatus, string>

export const ACTIVE_MATCH_SIGNUP_STATUSES = ['matched', 'scheduled'] as const

export function isSignupStatus(value: string): value is SignupStatus {
  return (SIGNUP_STATUSES as readonly string[]).includes(value)
}

export function isMatchStatus(value: string): value is MatchStatus {
  return (MATCH_STATUSES as readonly string[]).includes(value)
}

export function isDateStatus(value: string): value is DateStatus {
  return (DATE_STATUSES as readonly string[]).includes(value)
}

export function signupBusy(status: string): boolean {
  return (ACTIVE_MATCH_SIGNUP_STATUSES as readonly string[]).includes(status)
}
