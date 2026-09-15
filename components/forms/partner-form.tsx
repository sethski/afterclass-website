'use client'

import { useActionState } from 'react'
import {
  submitPartnerInterest,
  type PartnerActionState,
} from '@/app/actions/partner'
import { FormField } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { siteContent } from '@/lib/content'

const initialState: PartnerActionState = { ok: false, message: '' }

export function PartnerForm() {
  const [state, action, pending] = useActionState(
    submitPartnerInterest,
    initialState
  )

  if (state.ok) {
    return (
      <div
        className="rounded-2xl bg-[var(--color-olive)]/20 px-6 py-5 text-[var(--color-cream)]"
        role="status"
      >
        <p className="font-open-sauce text-base font-bold">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} className="flex w-full max-w-lg flex-col gap-4">
      <FormField label="Business name" htmlFor="businessName">
        <Input
          id="businessName"
          name="businessName"
          type="text"
          required
          autoComplete="organization"
          placeholder="Campus Coffee Co"
        />
      </FormField>
      <FormField label="Location or campus area" htmlFor="location">
        <Input
          id="location"
          name="location"
          type="text"
          required
          placeholder="Near UT Austin"
        />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@venue.com"
        />
      </FormField>
      <FormField label="Message (optional)" htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-xl border border-transparent bg-[var(--color-white)] px-4 py-3 font-open-sauce text-base text-[var(--color-charcoal)] placeholder:text-[var(--color-grey)] outline-none focus:ring-2 focus:ring-[var(--color-primary-salmon)]"
          placeholder="Tell us about your spot"
        />
      </FormField>
      {!state.ok && state.message ? (
        <p role="alert" className="text-sm text-[var(--color-primary-salmon)]">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Submitting…' : siteContent.partners.submit}
      </Button>
    </form>
  )
}
