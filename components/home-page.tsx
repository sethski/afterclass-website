import Link from 'next/link'
import { HeroField } from '@/components/hero-field'
import { HeroFlight } from '@/components/hero-flight'
import { LogoMark } from '@/components/logo-mark'
import { siteContent } from '@/lib/content'
import { getJoinWaitlistHref } from '@/lib/utils/get-site-url'

export function HomePage() {
  const waitlistHref = getJoinWaitlistHref()

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden">
      <HeroField />
      <HeroFlight />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-6 pb-10 pt-16 md:px-12 md:pt-20 lg:px-16">
        {/* Copy stays left, vertically centered in the upper/mid band */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-2.5 md:mb-7">
              <LogoMark size="md" priority />
              <span className="font-open-sauce text-[length:var(--type-header)] font-bold leading-none tracking-tight text-[var(--color-cream)]">
                {siteContent.brand}
              </span>
            </div>

            <h1 className="font-sn-pro text-[clamp(2rem,4.5vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--color-cream)]">
              {siteContent.tagline}
            </h1>

            <p className="font-sn-pro mt-6 max-w-[34rem] text-[length:var(--type-subtext)] font-normal leading-normal text-[var(--color-cream)]/80">
              {siteContent.subline}
            </p>
          </div>
        </div>

        {/* CTAs sit low */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pb-4 md:pb-8">
          <a
            href={waitlistHref}
            className="group inline-flex items-center gap-3 rounded-2xl bg-[var(--color-cream)] px-4 py-3 transition-[filter,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-[0.97] active:scale-[0.98] md:gap-3.5 md:px-5 md:py-3.5"
          >
            <LogoMark size="sm" className="shrink-0" />
            <span className="font-open-sauce text-[1.05rem] font-bold text-[var(--color-charcoal)] md:text-[1.1rem]">
              {siteContent.nav.joinWaitlist}
            </span>
          </a>

          <Link
            href="/partners"
            className="font-open-sauce text-[1.05rem] font-bold text-[var(--color-cream)]/75 transition-colors hover:text-[var(--color-cream)] md:text-[1.1rem]"
          >
            {siteContent.nav.partners}
          </Link>
        </div>
      </div>
    </section>
  )
}
