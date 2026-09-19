'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

const LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/signups', label: 'Signups' },
  { href: '/matches', label: 'Matches' },
  { href: '/dates', label: 'Dates' },
  { href: '/cafes', label: 'Cafes' },
  { href: '/feedback', label: 'Feedback' },
]

export function Nav() {
  const path = usePathname()
  return (
    <header className="border-b border-line bg-bg-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <p className="font-display text-lg font-semibold tracking-tight">
          After Class ops
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem]">
          {LINKS.map((link) => {
            const active =
              link.href === '/'
                ? path === '/'
                : path === link.href || path.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? 'text-accent underline decoration-2 underline-offset-4'
                    : 'text-muted hover:text-fg'
                }
              >
                {link.label}
              </Link>
            )
          })}
          <form action={signOut}>
            <button type="submit" className="text-muted hover:text-fg">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
