export type ScheduleSlot = {
  date: string // YYYY-MM-DD
  startHour: number // 9–16
  duration: 2 | 3
}

export const SCHEDULE_DAYTIME_END = 18

export function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:00 ${suffix}`
}

export function formatSlotWindow(slot: ScheduleSlot): string {
  const end = slot.startHour + slot.duration
  return `${formatHour(slot.startHour)}–${formatHour(end)}`
}

export function serializeScheduleSlots(slots: ScheduleSlot[]): string {
  return [...slots]
    .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)
    .map((slot) => {
      const label = new Date(`${slot.date}T12:00:00`).toLocaleDateString('en-PH', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      return `${label}: ${formatSlotWindow(slot)} (${slot.duration}h)`
    })
    .join('\n')
}

export function validStartHours(duration: 2 | 3): number[] {
  return [9, 10, 11, 12, 13, 14, 15, 16].filter(
    (hour) => hour + duration <= SCHEDULE_DAYTIME_END
  )
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Next 28 days starting tomorrow (daytime cafe window). */
export function scheduleDayRange(from = new Date()): Date[] {
  const start = startOfDay(from)
  start.setDate(start.getDate() + 1)
  const days: Date[] = []
  for (let i = 0; i < 28; i += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  return days
}

export function isCompleteSlot(slot: ScheduleSlot | undefined): boolean {
  if (!slot) return false
  if (slot.duration !== 2 && slot.duration !== 3) return false
  return validStartHours(slot.duration).includes(slot.startHour)
}

export function scheduleSlotsValid(slots: ScheduleSlot[]): boolean {
  if (slots.length === 0) return false
  return slots.every(isCompleteSlot)
}
