import type { DateStatus, MatchStatus, SignupStatus } from './status'

export type SignupRow = {
  id: string
  created_at: string
  campus: string
  city_corridor: string
  city_corridor_other: string | null
  full_name: string
  age: number
  email: string
  phone: string
  socials: string | null
  contact_preference: string
  is_me: boolean
  gender: string
  gender_other: string | null
  meet_genders: string[]
  school: string
  year_level: string
  departure_area: string
  max_travel: string
  nearby_school_ok: boolean
  dealbreakers: string
  about_you: string
  preferred_cafes: string | null
  refuse_areas: string | null
  cover_own_order: boolean
  accessibility: string | null
  schedule: string
  hard_nos: string | null
  interview_ok: boolean
  emergency_name: string | null
  emergency_phone: string | null
  how_heard: string | null
  face_photo_path: string
  school_id_photo_path: string
  status: SignupStatus
  reviewer_notes: string | null
  reviewed_at: string | null
  reviewed_by: string | null
}

export type CafeRow = {
  id: string
  name: string
  area: string
  city: string
  address: string | null
  lat: number | null
  lng: number | null
  notes: string | null
  active: boolean
  created_at: string
}

export type MatchRow = {
  id: string
  person_a: string
  person_b: string
  status: MatchStatus
  match_reason: string | null
  created_at: string
  created_by: string | null
}

export type DateRow = {
  id: string
  match_id: string
  cafe_id: string | null
  cafe_name_override: string | null
  scheduled_at: string | null
  status: DateStatus
  founder_notes: string | null
  created_at: string
}

export type FeedbackRow = {
  id: string
  date_id: string
  signup_id: string
  source: 'user' | 'founder'
  showed_up: boolean | null
  felt_safe: boolean | null
  would_use_again: boolean | null
  rating: number | null
  comments: string | null
  founder_notes: string | null
  submitted_at: string
}

export type FeedbackInviteRow = {
  id: string
  date_id: string
  signup_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
  created_at: string
}
