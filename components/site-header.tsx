'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/logo-mark'
import { siteContent } from '@/lib/content'

export function SiteHeader() {
  const pathname = usePathname()
  if (pathname === '/') return null

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center px-6 md:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark size="sm" />
        <span className="font-open-sauce text-[0.95rem] font-bold tracking-tight text-[var(--color-cream)]">
          {siteContent.brand}
        </span>
      </Link>
    </header>
  )
}
