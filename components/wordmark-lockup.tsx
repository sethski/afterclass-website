import { siteContent } from '@/lib/content'

type WordmarkLockupVariant = 'hero' | 'header' | 'compact'

interface WordmarkLockupProps {
  variant?: WordmarkLockupVariant
  showTagline?: boolean
  className?: string
}

const variantStyles: Record<
  WordmarkLockupVariant,
  { pad: string; brand: string; tagline: string }
> = {
  hero: {
    pad: 'px-7 py-5 md:px-9 md:py-6',
    brand: 'text-[1.75rem] md:text-[2rem] leading-none tracking-tight',
    tagline: 'mt-2 text-base md:text-[1.05rem] leading-snug',
  },
  header: {
    pad: 'px-4 py-2.5',
    brand: 'text-base leading-none tracking-tight',
    tagline: 'mt-1 text-xs leading-snug',
  },
  compact: {
    pad: 'px-3 py-2',
    brand: 'text-sm leading-none tracking-tight',
    tagline: 'mt-0.5 text-[0.7rem] leading-snug',
  },
}

export function WordmarkLockup({
  variant = 'hero',
  showTagline = true,
  className = '',
}: WordmarkLockupProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={[
        'inline-flex max-w-full flex-col items-center rounded-2xl bg-[var(--color-primary-salmon)] text-center text-[var(--color-cream)]',
        styles.pad,
        className,
      ].join(' ')}
    >
      <span
        className={[
          'font-sn-pro font-bold text-[var(--color-cream)]',
          styles.brand,
        ].join(' ')}
      >
        {siteContent.brand}
      </span>
      {showTagline ? (
        <span
          className={[
            'font-open-sauce font-normal text-[var(--color-cream)] text-balance',
            styles.tagline,
          ].join(' ')}
        >
          {siteContent.tagline}
        </span>
      ) : null}
    </div>
  )
}
