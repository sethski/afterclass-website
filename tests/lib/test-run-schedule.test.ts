import { describe, expect, it } from 'vitest'
import {
  isDateSelectable,
  monthsInWindow,
  scheduleWindow,
  scheduleSlotsValid,
  serializeScheduleSlots,
  validStartHours,
  validStartHoursForDate,
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

  it('builds a Manila window that blocks past days and spans months when needed', () => {
    // 2026-09-18 20:00 UTC = 2026-09-19 04:00 Asia/Manila
    const from = new Date('2026-09-18T20:00:00.000Z')
    const window = scheduleWindow(from)
    expect(window.todayKey).toBe('2026-09-19')
    expect(window.minKey).toBe('2026-09-19')
    expect(window.maxKey).toBe('2026-10-16')
    expect(isDateSelectable('2026-09-18', window)).toBe(false)
    expect(isDateSelectable('2026-09-19', window)).toBe(true)
    expect(isDateSelectable('2026-10-16', window)).toBe(true)
    expect(isDateSelectable('2026-10-17', window)).toBe(false)
    expect(monthsInWindow(window)).toEqual([
      { year: 2026, month: 9 },
      { year: 2026, month: 10 },
    ])
  })

  it('skips today after Manila daytime ends', () => {
    // 2026-09-19 11:00 UTC = 2026-09-19 19:00 Asia/Manila (past 6pm)
    const from = new Date('2026-09-19T11:00:00.000Z')
    const window = scheduleWindow(from)
    expect(window.todayKey).toBe('2026-09-19')
    expect(window.minKey).toBe('2026-09-20')
  })

  it('filters today start hours that already passed in Manila', () => {
    // 2026-09-19 04:30 UTC = 2026-09-19 12:30 Asia/Manila
    const from = new Date('2026-09-19T04:30:00.000Z')
    expect(validStartHoursForDate('2026-09-19', 2, from)).toEqual([
      13, 14, 15, 16,
    ])
    expect(validStartHoursForDate('2026-09-20', 2, from)).toEqual([
      9, 10, 11, 12, 13, 14, 15, 16,
    ])
  })
})
