import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ className = '', invalid, ...props }: InputProps) {
  return (
    <input
      className={[
        'w-full rounded-xl border bg-[var(--color-white)] px-4 py-3 font-open-sauce text-base text-[var(--color-charcoal)] placeholder:text-[var(--color-grey)] outline-none transition-shadow duration-200',
        invalid
          ? 'border-red-500 focus:ring-2 focus:ring-red-400'
          : 'border-transparent focus:ring-2 focus:ring-[var(--color-primary-salmon)]',
        className,
      ].join(' ')}
      {...props}
    />
  )
}
