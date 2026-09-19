'use client'

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
import { testRunContent } from '@/lib/test-run-content'

export function StepBadge({ page }: { page: number }) {
  return (
    <span
      aria-hidden
      className="inline-grid h-[var(--q-badge)] w-[var(--q-badge)] shrink-0 place-items-center rounded-[var(--q-badge-radius)] bg-[var(--q-text)] text-[0.95rem] font-semibold leading-none text-[var(--q-bg)]"
    >
      {page}
    </span>
  )
}

/** Centers the badge on the first text line (matches leading-snug). */
function StepBadgeSlot({ page }: { page: number }) {
  return (
    <span className="inline-flex h-[1.375em] shrink-0 items-center self-start">
      <StepBadge page={page} />
    </span>
  )
}

/** Prefer a single title line; wrap only when the copy is long. */
const TITLE_WRAP_CHARS = 56

function titleLineClass(title: string) {
  return title.length >= TITLE_WRAP_CHARS
    ? 'min-w-0'
    : 'max-sm:whitespace-normal sm:whitespace-nowrap'
}

export function Question({
  title,
  htmlFor,
  helper,
  error,
  optional,
  number,
  children,
}: {
  title: string
  htmlFor?: string
  helper?: string
  error?: string
  optional?: boolean
  number?: number
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={htmlFor}
          className="flex items-start gap-3 font-open-sauce text-[length:var(--q-title)] font-medium leading-snug tracking-tight text-[var(--q-text)]"
        >
          {number != null ? <StepBadgeSlot page={number} /> : null}
          <span className={titleLineClass(title)}>
            {title}
            {optional ? (
              <span className="ml-2 align-middle text-base font-normal text-[var(--q-muted)]">
                Optional
              </span>
            ) : null}
          </span>
        </label>
        {helper ? (
          <p className="max-w-[40rem] text-[length:var(--q-body)] font-normal leading-relaxed text-[var(--q-muted)]">
            {helper}
          </p>
        ) : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-base font-medium text-[var(--q-error)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Statement({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[40rem] text-[length:var(--q-body)] font-normal leading-relaxed text-[var(--q-muted)] md:text-[1.25rem]">
      {children}
    </p>
  )
}

export function PageTitle({ page, children }: { page: number; children: ReactNode }) {
  const text = typeof children === 'string' ? children : null
  return (
    <h1 className="flex items-start gap-3 font-open-sauce text-[length:var(--q-title)] font-medium leading-snug tracking-tight text-[var(--q-text)]">
      <StepBadgeSlot page={page} />
      <span className={text ? titleLineClass(text) : 'min-w-0'}>{children}</span>
    </h1>
  )
}

const underlineBase =
  'w-full border-0 border-b-2 border-[var(--q-track)] bg-transparent px-0 py-3 font-open-sauce text-[length:var(--q-body)] text-[var(--q-text)] caret-[var(--q-text)] outline-none transition-[border-color] duration-200 placeholder:text-[var(--q-muted)] rounded-none focus:border-[var(--q-track)]'

export function TextInput({
  invalid,
  multiline,
  className = '',
  placeholder = 'Type your answer here...',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
  multiline?: false
}) {
  return (
    <input
      {...props}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      className={[
        underlineBase,
        invalid ? 'border-[var(--q-error)] focus:border-[var(--q-error)]' : '',
        className,
      ].join(' ')}
    />
  )
}

export function TextArea({
  invalid,
  className = '',
  placeholder = 'Type your answer here...',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        {...props}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={[
          'min-h-32 resize-y',
          underlineBase,
          invalid ? 'border-[var(--q-error)] focus:border-[var(--q-error)]' : '',
          className,
        ].join(' ')}
      />
      <p className="text-sm text-[var(--q-muted)]">
        Shift ⇧ + Enter ↵ to make a line break
      </p>
    </div>
  )
}

export function SelectInput({
  invalid,
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  const filled = props.value != null && String(props.value) !== ''
  return (
    <div className="relative w-full">
      <select
        {...props}
        aria-invalid={invalid || undefined}
        className={[
          'w-full appearance-none border-0 border-b-2 bg-transparent py-3 pr-10 font-open-sauce text-[length:var(--q-body)] leading-normal outline-none transition-[border-color,color] duration-200 rounded-none',
          '[-webkit-appearance:none] [-moz-appearance:none]',
          filled
            ? 'border-[var(--q-accent)] text-[var(--q-accent)] focus:border-[var(--q-accent)]'
            : 'border-[var(--q-track)] text-[var(--q-ink)] focus:border-[var(--q-track)]',
          invalid ? 'border-[var(--q-error)] text-[var(--q-error)] focus:border-[var(--q-error)]' : '',
          className,
        ].join(' ')}
      >
        {children}
      </select>
      <span
        aria-hidden
        className={[
          'pointer-events-none absolute right-0 top-1/2 -translate-y-1/2',
          filled ? 'text-[var(--q-accent)]' : 'text-[var(--q-ink)]',
        ].join(' ')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
}

export function SchoolSelect({
  id,
  value,
  invalid,
  options = testRunContent.schoolOptions,
  onChange,
}: {
  id?: string
  value: string
  invalid?: boolean
  options?: readonly string[]
  onChange: (next: string) => void
}) {
  const list = options.length > 0 ? [...options] : [...testRunContent.schoolOptions]
  const known = list.filter((school) => school !== 'Other')
  const isListed = known.includes(value)
  const selectValue = !value ? '' : isListed ? value : 'Other'
  const showOther = selectValue === 'Other'

  return (
    <div className="flex w-full flex-col gap-4">
      <SelectInput
        id={id}
        value={selectValue}
        invalid={invalid}
        onChange={(event) => {
          const next = event.target.value
          onChange(next === 'Other' ? 'Other' : next)
        }}
      >
        <option value="">Choose one</option>
        {list.map((school) => (
          <option key={school} value={school}>
            {school}
          </option>
        ))}
      </SelectInput>
      {showOther ? (
        <TextInput
          id={id ? `${id}-other` : undefined}
          value={value === 'Other' ? '' : value}
          invalid={invalid}
          placeholder="Type your school…"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  )
}

export function ChoiceRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-max min-w-[16rem] max-w-full flex-col gap-3">
      {children}
    </div>
  )
}

export function ChoiceButton({
  selected,
  shape = 'circle',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean
  shape?: 'circle' | 'square'
}) {
  return (
    <button
      type="button"
      {...props}
      className={[
        'flex min-h-12 w-full items-center gap-3.5 rounded-[8px] bg-transparent px-0 py-2.5 text-left font-open-sauce text-[length:var(--q-body)] font-medium transition-[color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]',
        selected ? 'text-[var(--q-accent)]' : 'text-[var(--q-ink)]',
        props.className ?? '',
      ].join(' ')}
      aria-pressed={selected}
    >
      <ChoiceMark selected={selected} shape={shape} />
      <span className="pr-2">{children}</span>
    </button>
  )
}

function ChoiceMark({
  selected,
  shape,
}: {
  selected: boolean
  shape: 'circle' | 'square'
}) {
  return (
    <span
      aria-hidden
      className={[
        'grid h-[var(--q-key)] w-[var(--q-key)] shrink-0 place-items-center border-2 transition-colors duration-200',
        shape === 'circle' ? 'rounded-full' : 'rounded-[4px]',
        selected
          ? 'border-[var(--q-accent)] bg-[var(--q-accent)]'
          : 'border-[var(--q-ink)] bg-transparent',
      ].join(' ')}
    >
      {selected ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.2 6.2 4.6 8.6 9.8 3.4"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  )
}

/** Other option: click → input replaces the word; empty → deselect. */
export function OtherChoiceInput({
  active,
  value,
  label = 'Other',
  shape = 'circle',
  invalid,
  onActivate,
  onChange,
  onClear,
}: {
  active: boolean
  value: string
  label?: string
  shape?: 'circle' | 'square'
  invalid?: boolean
  onActivate: () => void
  onChange: (next: string) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (active) inputRef.current?.focus()
  }, [active])

  if (!active) {
    return (
      <ChoiceButton shape={shape} selected={false} onClick={onActivate}>
        {label}
      </ChoiceButton>
    )
  }

  return (
    <div className="flex min-h-12 w-full items-center gap-3.5 py-2.5">
      <ChoiceMark selected shape={shape} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Type here…"
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          if (!value.trim()) onClear()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClear()
          }
        }}
        className={[
          'min-w-0 flex-1 border-0 border-b-2 bg-transparent px-0 py-1 font-open-sauce text-[length:var(--q-body)] font-medium text-[var(--q-accent)] caret-[var(--q-accent)] outline-none placeholder:font-medium placeholder:text-[var(--q-muted)] rounded-none',
          invalid
            ? 'border-[var(--q-error)]'
            : 'border-[var(--q-accent)] focus:border-[var(--q-accent)]',
        ].join(' ')}
      />
    </div>
  )
}

export function CheckRow({
  checked,
  onChange,
  children,
  error,
  number,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  children: ReactNode
  error?: string
  number?: number
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {number != null ? (
          <span className="mt-1 inline-flex h-[1.625em] shrink-0 items-center self-start text-[length:var(--q-body)]">
            <StepBadge page={number} />
          </span>
        ) : null}
        <label className="flex flex-1 cursor-pointer items-start gap-3.5 rounded-[8px] py-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--q-accent)]">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span
            aria-hidden
            className={[
              'mt-0.5 grid h-[var(--q-key)] w-[var(--q-key)] shrink-0 place-items-center rounded-[4px] border-2 transition-colors duration-200',
              checked
                ? 'border-[var(--q-accent)] bg-[var(--q-accent)]'
                : 'border-[var(--q-ink)] bg-transparent',
            ].join(' ')}
          >
            {checked ? (
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.2 6.2 4.6 8.6 9.8 3.4"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
          <span
            className={[
              'font-open-sauce text-[length:var(--q-body)] font-normal leading-relaxed transition-colors duration-200',
              checked ? 'text-[var(--q-accent)]' : 'text-[var(--q-ink)]',
            ].join(' ')}
          >
            {children}
          </span>
        </label>
      </div>
      {error ? (
        <p role="alert" className="text-base font-medium text-[var(--q-error)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function DealbreakerList({
  id,
  values,
  invalid,
  onChange,
  onComplete,
}: {
  id?: string
  values: string[]
  invalid?: boolean
  onChange: (next: string[]) => void
  onComplete?: () => void
}) {
  const items = values.length > 0 ? values : ['']
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const focusIndex = useRef<number | null>(null)

  useEffect(() => {
    if (focusIndex.current == null) return
    const el = inputRefs.current[focusIndex.current]
    el?.focus()
    focusIndex.current = null
  }, [items.length])

  function setItem(index: number, value: string) {
    const next = items.map((item, i) => (i === index ? value : item))
    onChange(next)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      if (!items[index]?.trim()) return

      const filled = items.map((item) => item.trim()).filter(Boolean).length
      if (filled >= 3 && index === items.length - 1) {
        onComplete?.()
        return
      }
      if (items.length >= 3) return
      if (index < items.length - 1) {
        focusIndex.current = index + 1
        inputRefs.current[index + 1]?.focus()
        return
      }
      focusIndex.current = items.length
      onChange([...items, ''])
      return
    }

    if (
      event.key === 'Backspace' &&
      !items[index] &&
      items.length > 1 &&
      index > 0
    ) {
      event.preventDefault()
      const next = items.filter((_, i) => i !== index)
      focusIndex.current = index - 1
      onChange(next)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {items.map((item, index) => {
        const showBullet =
          Boolean(item.trim()) &&
          (index < items.length - 1 || items.length === 3)
        return (
          <div key={`dealbreaker-${index}`} className="flex items-center">
            <span
              aria-hidden
              className={[
                'shrink-0 overflow-hidden text-[length:var(--q-body)] leading-none transition-[width,margin,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                showBullet
                  ? 'mr-2 w-4 opacity-100 text-[var(--q-text)]'
                  : 'mr-0 w-0 opacity-0 text-transparent',
              ].join(' ')}
            >
              •
            </span>
            <input
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              id={index === 0 ? id : undefined}
              type="text"
              value={item}
              placeholder={
                index === 0 || !showBullet
                  ? 'Type a dealbreaker…'
                  : undefined
              }
              onChange={(event) => setItem(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className={[
                'min-w-0 flex-1 transition-[padding] duration-200',
                underlineBase,
                invalid
                  ? 'border-[var(--q-error)] focus:border-[var(--q-error)]'
                  : '',
              ].join(' ')}
              aria-invalid={invalid || undefined}
            />
          </div>
        )
      })}
      <p className="text-sm text-[var(--q-muted)]">
        {items.filter((item) => item.trim()).length < 3
          ? 'Press Enter for the next one.'
          : 'Press Enter to continue.'}
      </p>
    </div>
  )
}

export function FilePick({
  id,
  label,
  file,
  error,
  onChange,
}: {
  id: string
  label: string
  file: File | null
  error?: string
  onChange: (file: File | null) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function takeFile(next: File | null) {
    onChange(next)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    takeFile(event.target.files?.[0] ?? null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const next = event.dataTransfer.files?.[0] ?? null
    if (next) takeFile(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
        onDrop={handleDrop}
        className={[
          'flex min-h-[14rem] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-[8px] border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging
            ? 'border-[var(--q-text)] bg-[var(--q-choice-bg)]'
            : 'border-[var(--q-track)] bg-transparent hover:border-[var(--q-muted)]',
          error ? 'border-[var(--q-error)]' : '',
        ].join(' ')}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-28 w-28 rounded-lg object-cover"
          />
        ) : (
          <span className="relative grid h-16 w-16 place-items-center text-[var(--q-muted)]" aria-hidden>
            <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-current" />
            <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-current" />
            <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-current" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-current" />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
              <path
                d="m7 16 3.2-3.5 2.3 2.4L16 11l4 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}

        <div className="flex flex-col items-center gap-3">
          <p className="font-open-sauce text-[length:var(--q-body)] font-normal text-[var(--q-text)]">
            {file ? file.name : 'Drop to upload your photo or'}
          </p>
          <span
            className="inline-flex items-center justify-center rounded-[4px] border border-[var(--q-track)] bg-[var(--q-choice-bg)] px-4 py-2 font-open-sauce text-sm font-medium text-[var(--q-text)]"
            onClick={(event) => {
              event.stopPropagation()
              inputRef.current?.click()
            }}
          >
            {file ? 'Replace photo' : label || 'Choose file'}
          </span>
          {!file ? (
            <p className="text-sm text-[var(--q-muted)]">
              JPG, PNG, WEBP, or HEIC. 5 MB max.
            </p>
          ) : null}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          className="sr-only"
          onChange={handleChange}
        />
      </div>
      {error ? (
        <p role="alert" className="text-base font-medium text-[var(--q-error)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
