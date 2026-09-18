import { describe, expect, it } from 'vitest'
import {
  scheduleSlotsValid,
  serializeScheduleSlots,
  validStartHours,
} from '@/lib/test-run-schedule'

describe('test-run-schedule', () => {
  it('limits start hours so windows end by 6pm', () => {
    expect(validStartHours(2)).toEqual([9, 10, 11, 12, 13, 14, 15, 16])
    expect(validStartHours(3)).toEqual([9, 10, 11, 12, 13, 14, 15])
  })

  it('requires at least one complete slot', () => {
    expect(scheduleSlotsValid([])).toBe(false)
    expect(
      scheduleSlotsValid([{ date: '2026-09-22', startHour: 13, duration: 2 }])
    ).toBe(true)
    expect(
      scheduleSlotsValid([{ date: '2026-09-22', startHour: 17, duration: 2 }])
    ).toBe(false)
  })

  it('serializes slots into a readable schedule string', () => {
    const text = serializeScheduleSlots([
      { date: '2026-09-24', startHour: 14, duration: 3 },
      { date: '2026-09-22', startHour: 13, duration: 2 },
    ])
    expect(text).toContain('1:00 PM–3:00 PM (2h)')
    expect(text).toContain('2:00 PM–5:00 PM (3h)')
    expect(text.indexOf('Sep 22')).toBeLessThan(text.indexOf('Sep 24'))
  })
})
