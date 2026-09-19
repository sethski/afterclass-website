'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  formatHour,
  isDateSelectable,
  monthGrid,
  monthLabel,
  monthsInWindow,
  scheduleWindow,
  SCHEDULE_SLOT_DURATION,
  toDateKey,
  validStartHoursForDate,
  type MonthCursor,
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
  const slots = value ?? []
  const now = useMemo(() => new Date(), [])
  const schedule = useMemo(() => scheduleWindow(now), [now])
  const months = useMemo(() => monthsInWindow(schedule), [schedule])
  const [monthIndex, setMonthIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const monthIndexRef = useRef(0)
  const swipeLockRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  type Draft = {
    date: string
    startHour?: number
  }

  const [draft, setDraft] = useState<Draft | null>(() => {
    const first = slots[0]
    if (!first) return null
    return {
      date: first.date,
      startHour: first.startHour,
    }
  })

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleSlot>()
    for (const slot of slots) map.set(slot.date, slot)
    return map
  }, [slots])

  const activeDate = draft?.date ?? null
  const starts = draft?.date
    ? validStartHoursForDate(draft.date, SCHEDULE_SLOT_DURATION, now)
    : []

  const canPrev = monthIndex > 0
  const canNext = monthIndex < months.length - 1
  const currentMonth = months[monthIndex] ?? months[0]!

  monthIndexRef.current = monthIndex

  function commitSlot(next: ScheduleSlot) {
    const rest = slots.filter((slot) => slot.date !== next.date)
    onChange([...rest, next])
  }

  function goMonth(nextIndex: number) {
    const clamped = Math.max(0, Math.min(months.length - 1, nextIndex))
    if (clamped === monthIndexRef.current) return
    setMonthIndex(clamped)
    monthIndexRef.current = clamped
    const scroller = scrollerRef.current
    if (!scroller) return
    const panel = scroller.children[clamped] as HTMLElement | undefined
    panel?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  function stepMonth(delta: number) {
    if (months.length < 2 || swipeLockRef.current) return
    const next = monthIndexRef.current + delta
    if (next < 0 || next >= months.length) return
    swipeLockRef.current = true
    goMonth(next)
    window.setTimeout(() => {
      swipeLockRef.current = false
    }, 320)
  }

  useEffect(() => {
    const el = calendarRef.current
    if (!el || months.length < 2) return

    function onWheel(event: WheelEvent) {
      const absX = Math.abs(event.deltaX)
      const absY = Math.abs(event.deltaY)
      if (absX < 6 || absX < absY) return
      event.preventDefault()
      stepMonth(event.deltaX > 0 ? 1 : -1)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [months.length])

  function onTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || months.length < 2) return
    const touch = event.changedTouches[0]
    if (!touch) return
    const dx = touch.clientX - start.x
    const absX = Math.abs(dx)
    const absY = Math.abs(touch.clientY - start.y)
    if (Math.max(absX, absY) < 40) return
    if (absX > absY) {
      stepMonth(dx < 0 ? 1 : -1)
    }
  }

  function toggleDay(date: Date) {
    const key = toDateKey(date)
    if (!isDateSelectable(key, schedule)) return

    if (draft?.date === key || byDate.has(key)) {
      // Second tap on the active/selected day removes it.
      if (draft?.date === key) {
        onChange(slots.filter((slot) => slot.date !== key))
        setDraft(null)
      } else {
        const existing = byDate.get(key)!
        setDraft({
          date: key,
          startHour: existing.startHour,
        })
      }
      return
    }

    setDraft({ date: key })
  }

  function pickStart(hour: number) {
    if (!draft) return
    const next: ScheduleSlot = {
      date: draft.date,
      duration: SCHEDULE_SLOT_DURATION,
      startHour: hour,
    }
    setDraft({ date: next.date, startHour: next.startHour })
    commitSlot(next)
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div
        ref={calendarRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={[
          'rounded-[8px] border-2 px-2 py-3 sm:px-3 sm:py-4',
          months.length > 1 ? 'touch-pan-y' : '',
          invalid ? 'border-[var(--q-error)]' : 'border-[var(--q-track)]',
        ].join(' ')}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-open-sauce text-sm font-medium text-[var(--q-muted)]">
            {monthLabel(currentMonth)}
          </p>
          {months.length > 1 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canPrev}
                onClick={() => goMonth(monthIndex - 1)}
                className={[
                  'grid h-11 w-11 place-items-center rounded-[6px] text-sm font-medium transition-colors',
                  canPrev
                    ? 'text-[var(--q-text)] hover:bg-[var(--q-choice-bg)]'
                    : 'cursor-not-allowed text-[var(--q-track)]',
                ].join(' ')}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next month"
                disabled={!canNext}
                onClick={() => goMonth(monthIndex + 1)}
                className={[
                  'grid h-11 w-11 place-items-center rounded-[6px] text-sm font-medium transition-colors',
                  canNext
                    ? 'text-[var(--q-text)] hover:bg-[var(--q-choice-bg)]'
                    : 'cursor-not-allowed text-[var(--q-track)]',
                ].join(' ')}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>

        <div className="mb-2 grid grid-cols-7 gap-0 text-center text-xs font-medium text-[var(--q-muted)] sm:gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const el = event.currentTarget
            const index = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1))
            if (index !== monthIndexRef.current && index >= 0 && index < months.length) {
              monthIndexRef.current = index
              setMonthIndex(index)
            }
          }}
        >
          {months.map((month) => (
            <MonthPanel
              key={`${month.year}-${month.month}`}
              month={month}
              window={schedule}
              byDate={byDate}
              draftDate={draft?.date ?? null}
              activeDate={activeDate}
              onToggle={toggleDay}
            />
          ))}
        </div>
      </div>

      {draft ? (
        <div className="flex flex-col gap-4">
          <p className="font-open-sauce text-base font-medium text-[var(--q-text)]">
            {new Date(`${draft.date}T12:00:00`).toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
            {draft.startHour != null
              ? ` · ${formatHour(draft.startHour)} to ${formatHour(draft.startHour + SCHEDULE_SLOT_DURATION)}`
              : ''}
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--q-muted)]">Starts at</p>
            <div className="grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2">
              {starts.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => pickStart(hour)}
                  className={[
                    'min-h-11 w-full rounded-[6px] border-2 px-3 text-sm font-medium transition-colors',
                    draft.startHour === hour
                      ? 'border-[var(--q-text)] bg-[var(--q-text)] text-[var(--q-bg)]'
                      : 'border-[var(--q-track)] text-[var(--q-text)]',
                  ].join(' ')}
                >
                  {`${formatHour(hour)} to ${formatHour(hour + SCHEDULE_SLOT_DURATION)}`}
                </button>
              ))}
            </div>
            {starts.length === 0 ? (
              <p className="text-sm text-[var(--q-muted)]">
                No daytime windows left today. Pick another day.
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--q-muted)]">
          Tap a day, then a start time.
        </p>
      )}
    </div>
  )
}

function MonthPanel({
  month,
  window,
  byDate,
  draftDate,
  activeDate,
  onToggle,
}: {
  month: MonthCursor
  window: ReturnType<typeof scheduleWindow>
  byDate: Map<string, ScheduleSlot>
  draftDate: string | null
  activeDate: string | null
  onToggle: (date: Date) => void
}) {
  const weeks = useMemo(() => monthGrid(month), [month])

  return (
    <div className="min-w-full shrink-0 snap-start">
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0 sm:gap-1">
            {week.map((day, di) => {
              if (!day) {
                return <span key={`e-${wi}-${di}`} className="min-h-11" />
              }
              const key = toDateKey(day)
              const selectable = isDateSelectable(key, window)
              const selected = byDate.has(key) || draftDate === key
              const isActive = activeDate === key
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!selectable}
                  onClick={() => onToggle(day)}
                  className={[
                    'grid min-h-11 w-full place-items-center rounded-[6px] text-sm font-medium transition-colors',
                    !selectable
                      ? 'cursor-not-allowed text-[var(--q-track)]'
                      : selected
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
  )
}
