import { describe, expect, it } from 'vitest'
import {
  mutualInterest,
  sameCity,
  scoreCafe,
  suggestCafes,
  wantsToMeet,
  type CafeCandidate,
  type MatchPerson,
} from '@afterclass/db'

const ada: MatchPerson = {
  gender: 'Woman',
  meet_genders: ['Men'],
  city_corridor: 'Quezon City',
  city_corridor_other: null,
  school: 'Ateneo de Manila University',
  departure_area: 'Katipunan',
  nearby_school_ok: true,
}

const ben: MatchPerson = {
  gender: 'Man',
  meet_genders: ['Women'],
  city_corridor: 'Quezon City',
  city_corridor_other: null,
  school: 'University of the Philippines Diliman',
  departure_area: 'UP Diliman',
  nearby_school_ok: true,
}

const cam: MatchPerson = {
  gender: 'Man',
  meet_genders: ['Men'],
  city_corridor: 'Makati',
  city_corridor_other: null,
  school: 'De La Salle University',
  departure_area: 'Taft',
  nearby_school_ok: false,
}

const cafes: CafeCandidate[] = [
  {
    id: '1',
    name: 'Katipunan Coffee',
    area: 'Katipunan',
    city: 'Quezon City',
    active: true,
  },
  {
    id: '2',
    name: 'Makati Diner',
    area: 'Poblacion',
    city: 'Makati',
    active: true,
  },
  {
    id: '3',
    name: 'Closed Shop',
    area: 'Katipunan',
    city: 'Quezon City',
    active: false,
  },
]

describe('wantsToMeet', () => {
  it('maps Woman to Women', () => {
    expect(wantsToMeet(['Women'], 'Woman')).toBe(true)
    expect(wantsToMeet(['Men'], 'Woman')).toBe(false)
  })

  it('accepts Other: custom labels', () => {
    expect(wantsToMeet(['Other: anyone kind'], 'Other')).toBe(true)
  })
})

describe('mutualInterest', () => {
  it('is true when both listed each other', () => {
    expect(mutualInterest(ada, ben)).toBe(true)
  })

  it('is false when one side does not list the other', () => {
    expect(mutualInterest(ada, cam)).toBe(false)
  })
})

describe('sameCity', () => {
  it('matches corridor names', () => {
    expect(sameCity(ada, ben)).toBe(true)
    expect(sameCity(ada, cam)).toBe(false)
  })
})

describe('suggestCafes', () => {
  it('ranks overlapping city and area first', () => {
    const ranked = suggestCafes(cafes, ada, ben)
    expect(ranked[0]?.name).toBe('Katipunan Coffee')
    expect(ranked.some((cafe) => cafe.name === 'Closed Shop')).toBe(false)
  })

  it('falls back to every active cafe when nothing scores', () => {
    const far: CafeCandidate[] = [
      {
        id: '9',
        name: 'Somewhere Else',
        area: 'Alabang',
        city: 'Muntinlupa',
        active: true,
      },
    ]
    const ranked = suggestCafes(far, ada, ben)
    expect(ranked).toHaveLength(1)
    expect(ranked[0]?.score).toBe(0)
  })

  it('scores city overlap', () => {
    expect(scoreCafe(cafes[0]!, ada, ben)).toBeGreaterThan(
      scoreCafe(cafes[1]!, ada, ben)
    )
  })
})
