import type { Metadata } from 'next'
import { HeroField } from '@/components/hero-field'
import { ContactForm } from '@/components/forms/contact-form'
import { siteContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Contact',
  description: siteContent.contact.description,
}

export default function ContactPage() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-y-auto px-6 pb-14 pt-24 md:px-12">
      <HeroField />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-sn-pro text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight text-[var(--color-cream)]">
            {siteContent.contact.title}
          </h1>
          <p className="font-open-sauce mt-4 text-[1.1rem] leading-relaxed text-[var(--color-cream)]/65">
            {siteContent.contact.description}
          </p>
          <a
            href={`mailto:${siteContent.privacyEmail}`}
            className="font-open-sauce mt-5 inline-block text-base font-bold text-[var(--color-cream)] underline decoration-[var(--color-cream)]/35 underline-offset-4"
          >
            {siteContent.privacyEmail}
          </a>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
