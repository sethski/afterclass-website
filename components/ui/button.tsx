import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

const variants = {
  primary:
    'bg-[var(--color-primary-salmon)] text-[var(--color-charcoal)] hover:brightness-105',
  secondary:
    'bg-[var(--color-white)] text-[var(--color-charcoal)] hover:bg-[var(--color-cream)]',
  ghost:
    'bg-transparent text-[var(--color-cream)] underline underline-offset-4 hover:text-[var(--color-primary-salmon)]',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-xl px-6 py-3 font-open-sauce text-base font-bold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:opacity-50',
        variants[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
