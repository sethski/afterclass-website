'use client'

import { useMemo, useState } from 'react'
import {
  formatHour,
  formatSlotWindow,
  scheduleDayRange,
  toDateKey,
  validStartHours,
  type ScheduleSlot,
} from '@/lib/test-run-schedule'

export function ScheduleCalendar({
  value,
  onChange,
  invalid,
}: {
  value: ScheduleSlot[]
  onChange: (next: ScheduleSlot[]) => void
  invalid?: boolean
}) {
  const days = useMemo(() => scheduleDayRange(), [])
  const [activeDate, setActiveDate] = useState<string | null>(
    value[0]?.date ?? null
  )

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleSlot>()
    for (const slot of value) map.set(slot.date, slot)
    return map
  }, [value])

  const weeks = useMemo(() => {
    const first = days[0]!
    const pad = (first.getDay() + 6) % 7 // Monday-first
    const cells: Array<Date | null> = [
      ...Array.from({ length: pad }, () => null),
      ...days,
    ]
    while (cells.length % 7 !== 0) cells.push(null)
    const rows: Array<Array<Date | null>> = []
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7))
    }
    return rows
  }, [days])

  const activeSlot = activeDate ? byDate.get(activeDate) : undefined
  const duration = activeSlot?.duration ?? 2
  const starts = validStartHours(duration)

  function toggleDay(date: Date) {
    const key = toDateKey(date)
    if (byDate.has(key)) {
      // Second tap on the active day removes it; otherwise just focus to edit.
      if (activeDate === key) {
        onChange(value.filter((slot) => slot.date !== key))
        setActiveDate(null)
      } else {
        setActiveDate(key)
      }
      return
    }
    const starts2 = validStartHours(2)
    const next: ScheduleSlot = {
      date: key,
      startHour: starts2.includes(13) ? 13 : (starts2[0] ?? 10),
      duration: 2,
    }
    onChange([...value, next])
    setActiveDate(key)
  }

  function updateActive(patch: Partial<ScheduleSlot>) {
    if (!activeDate) return
    onChange(
      value.map((slot) => {
        if (slot.date !== activeDate) return slot
        const next = { ...slot, ...patch }
        const allowed = validStartHours(next.duration)
        if (!allowed.includes(next.startHour)) {
          next.startHour = allowed[0] ?? next.startHour
        }
        return next
      })
    )
  }

  const monthLabel = days[0]
    ? days[0].toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="flex w-full flex-col gap-5">
      <div
        className={[
          'rounded-[8px] border-2 px-3 py-4',
          invalid ? 'border-[var(--q-error)]' : 'border-[var(--q-track)]',
        ].join(' ')}
      >
        <p className="mb-3 font-open-sauce text-sm font-medium text-[var(--q-muted)]">
          {monthLabel} · next 4 weeks
        </p>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--q-muted)]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                if (!day) {
                  return <span key={`e-${wi}-${di}`} className="h-10" />
                }
                const key = toDateKey(day)
                const selected = byDate.has(key)
                const isActive = activeDate === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={[
                      'grid h-10 place-items-center rounded-[6px] text-sm font-medium transition-colors',
                      selected
                        ? 'bg-[var(--q-text)] text-[var(--q-bg)]'
                        : 'text-[var(--q-text)] hover:bg-[var(--q-choice-bg)]',
                      isActive ? 'outline outline-2 outline-offset-1 outline-[var(--q-text)]' : '',
                    ].join(' ')}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {activeDate && activeSlot ? (
        <div className="flex flex-col gap-4">
          <p className="font-open-sauce text-base font-medium text-[var(--q-text)]">
            {new Date(`${activeDate}T12:00:00`).toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--q-muted)]">How long?</p>
            <div className="flex gap-2">
              {([2, 3] as const).map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => updateActive({ duration: hours })}
                  className={[
                    'min-h-10 flex-1 rounded-[6px] border-2 px-3 text-sm font-medium transition-colors',
                    duration === hours
                      ? 'border-[var(--q-text)] bg-[var(--q-text)] text-[var(--q-bg)]'
                      : 'border-[var(--q-track)] text-[var(--q-text)]',
                  ].join(' ')}
                >
                  {hours} hours
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--q-muted)]">Starts at</p>
            <div className="flex flex-wrap gap-2">
              {starts.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => updateActive({ startHour: hour })}
                  className={[
                    'min-h-10 rounded-[6px] border-2 px-3 text-sm font-medium transition-colors',
                    activeSlot.startHour === hour
                      ? 'border-[var(--q-text)] bg-[var(--q-text)] text-[var(--q-bg)]'
                      : 'border-[var(--q-track)] text-[var(--q-text)]',
                  ].join(' ')}
                >
                  {formatHour(hour)}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-[var(--q-muted)]">
            Window: {formatSlotWindow(activeSlot)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--q-muted)]">
          Tap a day to add it. Tap again to remove. Pick a 2 or 3 hour window.
        </p>
      )}

      {value.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm text-[var(--q-text)]">
          {[...value]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((slot) => (
              <li key={slot.date}>
                <button
                  type="button"
                  onClick={() => setActiveDate(slot.date)}
                  className="flex gap-2 text-left hover:underline"
                >
                  <span aria-hidden>•</span>
                  <span>
                    {new Date(`${slot.date}T12:00:00`).toLocaleDateString('en-PH', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {': '}
                    {formatSlotWindow(slot)}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  )
}
