interface TestRunMarkProps {
  className?: string
}

/**
 * Temporary placeholder mark for TestRun redesign.
 * Swap for final After Class brand art later.
 */
export function TestRunMark({ className = 'h-8 w-8' }: TestRunMarkProps) {
  return (
    <span
      role="img"
      aria-label="After Class"
      className={[
        'inline-grid place-items-center rounded-md bg-[var(--q-text)] font-open-sauce text-[0.65rem] font-bold tracking-tight text-[var(--q-bg)]',
        className,
      ].join(' ')}
    >
      AC
    </span>
  )
}
