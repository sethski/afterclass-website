import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroField } from '@/components/hero-field'
import { siteContent } from '@/lib/content'
import { getJoinWaitlistHref } from '@/lib/utils/get-site-url'

export const metadata: Metadata = {
  title: 'How it works',
  description: siteContent.howItWorks.intro,
}

export default function HowItWorksPage() {
  const waitlistHref = getJoinWaitlistHref()

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-6 pb-14 pt-24 md:px-12">
      <HeroField />
      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <h1 className="font-sn-pro text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-[var(--color-cream)]">
          {siteContent.howItWorks.title}
        </h1>
        <p className="font-open-sauce mt-3 text-[1.1rem] text-[var(--color-cream)]/65">
          {siteContent.howItWorks.intro}
        </p>

        <ul className="mt-10 space-y-8">
          {siteContent.howItWorks.steps.map((step) => (
            <li key={step.title}>
              <h2 className="font-sn-pro text-xl font-semibold text-[var(--color-cream)]">
                {step.title}
              </h2>
              <p className="font-open-sauce mt-2 max-w-lg text-base text-[var(--color-cream)]/60">
                {step.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          <a
            href={waitlistHref}
            className="group inline-flex items-center gap-3 font-open-sauce text-[0.95rem] font-bold text-[var(--color-cream)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-cream)]/35 text-sm">
              ↵
            </span>
            <span className="underline underline-offset-[6px]">
              {siteContent.nav.joinWaitlist}
            </span>
          </a>
          <Link
            href="/partners"
            className="font-open-sauce text-[0.95rem] font-bold text-[var(--color-cream)]/55 hover:text-[var(--color-cream)]"
          >
            {siteContent.nav.partners}
          </Link>
        </div>
      </div>
    </section>
  )
}
