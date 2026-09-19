export type ScheduleSlot = {
  date: string // YYYY-MM-DD
  startHour: number // 9, 11, 14, or 16
  duration: 2 | 3
}

export const SCHEDULE_SLOT_DURATION = 2 as const
export const SCHEDULE_START_HOURS = [9, 11, 14, 16] as const
export const SCHEDULE_DAYTIME_END = 18
export const SCHEDULE_TZ = 'Asia/Manila'
export const SCHEDULE_WINDOW_DAYS = 28

export type ManilaParts = {
  year: number
  month: number // 1–12
  day: number
  hour: number
}

export function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:00 ${suffix}`
}

export function formatSlotWindow(slot: ScheduleSlot): string {
  const end = slot.startHour + slot.duration
  return `${formatHour(slot.startHour)}–${formatHour(end)}`
}

export function serializeScheduleSlots(
  slots: ScheduleSlot[] | undefined | null
): string {
  if (!slots?.length) return ''
  return [...slots]
    .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)
    .map((slot) => {
      const label = new Date(`${slot.date}T12:00:00`).toLocaleDateString('en-PH', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: SCHEDULE_TZ,
      })
      return `${label}: ${formatSlotWindow(slot)} (${slot.duration}h)`
    })
    .join('\n')
}

export function validStartHours(duration: 2 | 3): number[] {
  return SCHEDULE_START_HOURS.filter(
    (hour) => hour + duration <= SCHEDULE_DAYTIME_END
  )
}

/** Start hours still open for a date, given Manila "now". */
export function validStartHoursForDate(
  dateKey: string,
  duration: 2 | 3,
  from = new Date()
): number[] {
  const parts = manilaParts(from)
  const todayKey = toDateKeyFromParts(parts)
  const hours = validStartHours(duration)
  if (dateKey !== todayKey) return hours
  // Need the window to still be in the future in Manila.
  return hours.filter((hour) => hour > parts.hour)
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toDateKeyFromParts(parts: Pick<ManilaParts, 'year' | 'month' | 'day'>): string {
  const m = String(parts.month).padStart(2, '0')
  const d = String(parts.day).padStart(2, '0')
  return `${parts.year}-${m}-${d}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function manilaParts(from = new Date()): ManilaParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHEDULE_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    hourCycle: 'h23',
  })
  const bag: Record<string, string> = {}
  for (const part of fmt.formatToParts(from)) {
    if (part.type !== 'literal') bag[part.type] = part.value
  }
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
  }
}

/** Local Date for Manila's calendar day (for month-grid math). */
export function manilaCalendarDate(from = new Date()): Date {
  const p = manilaParts(from)
  return new Date(p.year, p.month - 1, p.day)
}

export function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + days)
  return next
}

export type ScheduleWindow = {
  minKey: string
  maxKey: string
  todayKey: string
  /** First selectable day (today, or tomorrow if Manila daytime is over). */
  minDate: Date
  maxDate: Date
}

/** Selectable cafe dates: from Manila "now" through 28 days, no past days. */
export function scheduleWindow(from = new Date()): ScheduleWindow {
  const parts = manilaParts(from)
  const today = new Date(parts.year, parts.month - 1, parts.day)
  const todayKey = toDateKey(today)

  let minDate = today
  // After daytime ends in Manila, today is no longer bookable.
  if (parts.hour >= SCHEDULE_DAYTIME_END) {
    minDate = addCalendarDays(today, 1)
  } else if (validStartHoursForDate(todayKey, SCHEDULE_SLOT_DURATION, from).length === 0) {
    minDate = addCalendarDays(today, 1)
  }

  const maxDate = addCalendarDays(minDate, SCHEDULE_WINDOW_DAYS - 1)
  return {
    todayKey,
    minKey: toDateKey(minDate),
    maxKey: toDateKey(maxDate),
    minDate,
    maxDate,
  }
}

export function isDateSelectable(dateKey: string, window: ScheduleWindow): boolean {
  return dateKey >= window.minKey && dateKey <= window.maxKey
}

export type MonthCursor = { year: number; month: number } // month 1–12

export function monthCursorFromDate(date: Date): MonthCursor {
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export function monthsInWindow(window: ScheduleWindow): MonthCursor[] {
  const months: MonthCursor[] = []
  let cursor = monthCursorFromDate(window.minDate)
  const end = monthCursorFromDate(window.maxDate)
  while (
    cursor.year < end.year ||
    (cursor.year === end.year && cursor.month <= end.month)
  ) {
    months.push(cursor)
    cursor =
      cursor.month === 12
        ? { year: cursor.year + 1, month: 1 }
        : { year: cursor.year, month: cursor.month + 1 }
  }
  return months
}

export function monthLabel(cursor: MonthCursor): string {
  return new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
  })
}

/** Monday-first month grid; null = empty pad cell. */
export function monthGrid(cursor: MonthCursor): Array<Array<Date | null>> {
  const first = new Date(cursor.year, cursor.month - 1, 1)
  const pad = (first.getDay() + 6) % 7
  const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate()
  const cells: Array<Date | null> = [
    ...Array.from({ length: pad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      new Date(cursor.year, cursor.month - 1, i + 1)
    ),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: Array<Array<Date | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
}

/** @deprecated Prefer scheduleWindow + monthGrid. Kept for tests/compat. */
export function scheduleDayRange(from = new Date()): Date[] {
  const window = scheduleWindow(from)
  const days: Date[] = []
  for (let i = 0; i < SCHEDULE_WINDOW_DAYS; i += 1) {
    days.push(addCalendarDays(window.minDate, i))
  }
  return days
}

export function isCompleteSlot(slot: ScheduleSlot | undefined): boolean {
  if (!slot) return false
  if (slot.duration !== SCHEDULE_SLOT_DURATION) return false
  return validStartHours(slot.duration).includes(slot.startHour)
}

export function scheduleSlotsValid(
  slots: ScheduleSlot[] | undefined | null
): boolean {
  if (!slots || slots.length === 0) return false
  return slots.every(isCompleteSlot)
}
