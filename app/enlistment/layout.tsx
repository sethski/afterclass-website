import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import { openSauceTwo } from '@/app/fonts'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#ffffff',
}

export default function EnlistmentLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${openSauceTwo.variable} test-run h-[100dvh] min-h-[100dvh] overflow-hidden font-open-sauce`}
      style={{ background: 'var(--q-bg)', color: 'var(--q-text)' }}
    >
      {children}
    </div>
  )
}
