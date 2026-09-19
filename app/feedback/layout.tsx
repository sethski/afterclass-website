import type { ReactNode } from 'react'
import { openSauceTwo, snPro } from '@/app/fonts'

export const metadata = {
  robots: { index: false, follow: false },
}

export default function FeedbackLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${snPro.variable} ${openSauceTwo.variable} min-h-[100dvh]`}>
      {children}
    </div>
  )
}
