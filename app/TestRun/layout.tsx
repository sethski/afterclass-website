import type { ReactNode } from 'react'
import { openSauceTwo } from '@/app/fonts'

export default function TestRunLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${openSauceTwo.variable} test-run min-h-[100dvh] bg-cream font-open-sauce`}>
      {children}
    </div>
  )
}
