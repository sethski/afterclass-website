'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteContent } from '@/lib/content'

export function SiteFooter() {
  const pathname = usePathname()
  if (pathname === '/') return null

  return (
    <footer className="absolute inset-x-0 bottom-0 z-20 flex h-12 items-center justify-between px-6 md:px-10">
      <p className="font-open-sauce text-xs text-[var(--color-cream)]/40">
        © {new Date().getFullYear()} {siteContent.brand}
      </p>
      <Link
        href="/privacy"
        className="font-open-sauce text-xs text-[var(--color-cream)]/40 hover:text-[var(--color-cream)]/70"
      >
        Privacy
      </Link>
    </footer>
  )
}
