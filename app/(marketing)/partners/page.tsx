import type { Metadata } from 'next'
import { HeroField } from '@/components/hero-field'
import { PartnerForm } from '@/components/forms/partner-form'
import { siteContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'For Partners',
  description: siteContent.partners.description,
}

export default function PartnersPage() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-y-auto px-6 pb-14 pt-24 md:px-12">
      <HeroField />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-sn-pro text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight text-[var(--color-cream)]">
            {siteContent.partners.title}
          </h1>
          <p className="font-open-sauce mt-4 text-[1.1rem] leading-relaxed text-[var(--color-cream)]/65">
            {siteContent.partners.description}
          </p>
          <ul className="mt-8 space-y-4">
            {siteContent.partners.benefits.map((benefit) => (
              <li
                key={benefit}
                className="font-open-sauce text-base text-[var(--color-cream)]/55"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <PartnerForm />
        </div>
      </div>
    </section>
  )
}
