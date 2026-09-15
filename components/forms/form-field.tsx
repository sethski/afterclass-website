import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-open-sauce text-[0.9375rem] font-bold text-[var(--color-cream)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-[var(--color-primary-salmon)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
