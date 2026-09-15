import type { Metadata } from 'next'
import { HeroField } from '@/components/hero-field'
import { privacyContent } from '@/lib/privacy-content'

export const metadata: Metadata = {
  title: 'Privacy',
  description: privacyContent.intro,
}

export default function PrivacyPage() {
  return (
    <section className="relative min-h-[100dvh] overflow-y-auto px-6 pb-16 pt-24 md:px-10">
      <HeroField />
      <article className="relative z-10 mx-auto max-w-2xl">
        <h1 className="font-sn-pro text-[2rem] font-bold tracking-tight text-[var(--color-cream)]">
          {privacyContent.title}
        </h1>
        <p className="font-open-sauce mt-2 text-sm text-[var(--color-cream)]/45">
          Last updated {privacyContent.lastUpdated}
        </p>
        <p className="font-open-sauce mt-5 text-base text-[var(--color-cream)]/75">
          {privacyContent.intro}
        </p>
        <div className="mt-8 space-y-6">
          {privacyContent.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-sn-pro text-lg font-semibold text-[var(--color-cream)]">
                {section.heading}
              </h2>
              <p className="font-open-sauce mt-2 text-base text-[var(--color-cream)]/65">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
