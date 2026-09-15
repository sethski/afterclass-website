'use client'

import { useActionState } from 'react'
import {
  submitContact,
  type ContactActionState,
} from '@/app/actions/contact'
import { FormField } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { siteContent } from '@/lib/content'

const initialState: ContactActionState = { ok: false, message: '' }

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState)

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
      <FormField label="Name" htmlFor="name">
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
        />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
        />
      </FormField>
      <FormField label="Subject" htmlFor="subject">
        <Input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="How can we help?"
        />
      </FormField>
      <FormField label="Message" htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-xl border border-transparent bg-[var(--color-white)] px-4 py-3 font-open-sauce text-base text-[var(--color-charcoal)] placeholder:text-[var(--color-grey)] outline-none focus:ring-2 focus:ring-[var(--color-primary-salmon)]"
          placeholder="Write your message"
        />
      </FormField>
      {!state.ok && state.message ? (
        <p role="alert" className="text-sm text-[var(--color-primary-salmon)]">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Sending…' : siteContent.contact.submit}
      </Button>
    </form>
  )
}
