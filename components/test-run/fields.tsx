'use client'

import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'

export function Question({
  title,
  htmlFor,
  helper,
  error,
  optional,
  children,
}: {
  title: string
  htmlFor?: string
  helper?: string
  error?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={htmlFor}
          className="font-open-sauce text-[1.35rem] font-bold leading-snug tracking-tight text-maroon md:text-[1.5rem]"
        >
          {title}
          {optional ? (
            <span className="ml-2 align-middle text-sm font-medium text-grey">
              Optional
            </span>
          ) : null}
        </label>
        {helper ? (
          <p className="max-w-[40rem] text-[0.95rem] font-normal leading-relaxed text-grey">
            {helper}
          </p>
        ) : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-sm font-medium text-maroon">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Statement({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[40rem] text-[1.05rem] font-medium leading-relaxed text-charcoal md:text-[1.125rem]">
      {children}
    </p>
  )
}

export function TextInput({
  invalid,
  multiline,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
  multiline?: false
}) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border bg-white px-4 py-3.5 font-open-sauce text-base text-charcoal caret-maroon outline-none transition-[box-shadow,border-color] duration-200 placeholder:text-grey',
        invalid
          ? 'border-maroon focus:ring-2 focus:ring-maroon/30'
          : 'border-dusty/25 focus:border-salmon focus:ring-2 focus:ring-salmon/40',
        className,
      ].join(' ')}
    />
  )
}

export function TextArea({
  invalid,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      className={[
        'min-h-28 w-full resize-y rounded-xl border bg-white px-4 py-3.5 font-open-sauce text-base text-charcoal caret-maroon outline-none transition-[box-shadow,border-color] duration-200 placeholder:text-grey',
        invalid
          ? 'border-maroon focus:ring-2 focus:ring-maroon/30'
          : 'border-dusty/25 focus:border-salmon focus:ring-2 focus:ring-salmon/40',
        className,
      ].join(' ')}
    />
  )
}

export function SelectInput({
  invalid,
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...props}
      className={[
        'w-full appearance-none rounded-xl border bg-white bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat px-4 py-3.5 font-open-sauce text-base text-charcoal outline-none transition-[box-shadow,border-color] duration-200',
        invalid
          ? 'border-maroon focus:ring-2 focus:ring-maroon/30'
          : 'border-dusty/25 focus:border-salmon focus:ring-2 focus:ring-salmon/40',
        className,
      ].join(' ')}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%234A1525' stroke-width='2' viewBox='0 0 24 24'><path d='m6 9 6 6 6-6'/></svg>\")",
      }}
    >
      {children}
    </select>
  )
}

export function ChoiceRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{children}</div>
}

export function ChoiceButton({
  selected,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={[
        'min-h-12 flex-1 rounded-xl px-4 py-3 text-left font-open-sauce text-base font-medium transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] sm:min-w-[9.5rem]',
        selected
          ? 'bg-salmon text-maroon'
          : 'bg-white text-charcoal ring-1 ring-dusty/25 hover:ring-salmon/60',
        props.className ?? '',
      ].join(' ')}
      aria-pressed={selected}
    >
      {children}
    </button>
  )
}

export function CheckRow({
  checked,
  onChange,
  children,
  error,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  children: ReactNode
  error?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-dusty/25 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-salmon">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span
          aria-hidden
          className={[
            'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2',
            checked
              ? 'border-salmon bg-salmon'
              : 'border-dusty bg-white',
          ].join(' ')}
        >
          {checked ? (
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
        <span className="font-open-sauce text-[0.98rem] font-medium leading-snug text-charcoal">
          {children}
        </span>
      </label>
      {error ? (
        <p role="alert" className="text-sm font-medium text-maroon">
          {error}
        </p>
      ) : null}
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

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={[
          'flex cursor-pointer items-center gap-4 rounded-xl bg-white px-4 py-4 ring-1 transition-shadow',
          error ? 'ring-maroon' : 'ring-dusty/25 hover:ring-salmon/70',
        ].join(' ')}
      >
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="#4A1525"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-open-sauce text-base font-medium text-charcoal">
            {file ? file.name : label}
          </span>
          <span className="text-sm text-grey">
            {file ? 'Replace photo' : 'JPG, PNG, or WEBP. 5 MB max.'}
          </span>
        </span>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm font-medium text-maroon">
          {error}
        </p>
      ) : null}
    </div>
  )
}
