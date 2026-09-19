export const GENDER_TO_MEET = {
  Woman: 'Women',
  Man: 'Men',
  'Non-binary': 'Non-binary people',
  Other: 'Other',
} as const

export type MatchPerson = {
  gender: string
  meet_genders: string[]
  city_corridor: string
  city_corridor_other: string | null
  school: string
  departure_area: string
  nearby_school_ok: boolean
}

export type CafeCandidate = {
  id: string
  name: string
  area: string
  city: string
  active: boolean
}

export type ScoredCafe = CafeCandidate & { score: number }

export function cityOf(person: Pick<MatchPerson, 'city_corridor' | 'city_corridor_other'>): string {
  const raw =
    person.city_corridor === 'Other'
      ? (person.city_corridor_other ?? '')
      : person.city_corridor
  return raw.trim().toLowerCase()
}

export function meetLabelForGender(gender: string): string {
  return GENDER_TO_MEET[gender as keyof typeof GENDER_TO_MEET] ?? gender
}

export function wantsToMeet(meetGenders: string[], otherGender: string): boolean {
  const label = meetLabelForGender(otherGender)
  if (meetGenders.includes(label) || meetGenders.includes(otherGender)) return true
  if (otherGender === 'Other' || otherGender.startsWith('Other:')) {
    return meetGenders.some((item) => item === 'Other' || item.startsWith('Other:'))
  }
  return false
}

export function mutualInterest(a: MatchPerson, b: MatchPerson): boolean {
  return wantsToMeet(a.meet_genders, b.gender) && wantsToMeet(b.meet_genders, a.gender)
}

export function sameCity(a: MatchPerson, b: MatchPerson): boolean {
  const left = cityOf(a)
  const right = cityOf(b)
  return Boolean(left && right && left === right)
}

function placesOf(person: MatchPerson): string[] {
  return [person.school, person.departure_area]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export function scoreCafe(
  cafe: CafeCandidate,
  a: MatchPerson,
  b: MatchPerson
): number {
  if (!cafe.active) return -1
  const cafeCity = cafe.city.trim().toLowerCase()
  const cafeArea = cafe.area.trim().toLowerCase()
  let score = 0
  for (const city of [cityOf(a), cityOf(b)]) {
    if (city && cafeCity === city) score += 3
  }
  for (const place of [...placesOf(a), ...placesOf(b)]) {
    if (place && cafeArea && (cafeArea.includes(place) || place.includes(cafeArea))) {
      score += 2
    }
  }
  return score
}

export function suggestCafes(
  cafes: CafeCandidate[],
  a: MatchPerson,
  b: MatchPerson
): ScoredCafe[] {
  const scored = cafes
    .filter((cafe) => cafe.active)
    .map((cafe) => ({ ...cafe, score: Math.max(0, scoreCafe(cafe, a, b)) }))
  const hits = scored.filter((cafe) => cafe.score > 0)
  const pool = hits.length > 0 ? hits : scored
  return [...pool].sort(
    (left, right) => right.score - left.score || left.name.localeCompare(right.name)
  )
}
