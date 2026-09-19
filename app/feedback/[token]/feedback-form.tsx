'use client'

import { useState } from 'react'
import { submitFeedback } from '@/app/actions/feedback'

export function FeedbackForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage('')
    const result = await submitFeedback(formData)
    setPending(false)
    setOk(result.ok)
    setMessage(result.message)
  }

  if (ok) {
    return (
      <p className="max-w-prose text-[1.125rem] leading-relaxed text-cream">
        {message}
      </p>
    )
  }

  return (
    <form action={handleSubmit} className="flex max-w-xl flex-col gap-8">
      <input type="hidden" name="token" value={token} />

      <fieldset className="flex flex-col gap-3">
        <legend className="font-sn-pro text-xl font-semibold text-cream">
          Did you show up?
        </legend>
        <label className="flex items-center gap-3 text-cream">
          <input type="radio" name="showedUp" value="yes" required />
          Yes
        </label>
        <label className="flex items-center gap-3 text-cream">
          <input type="radio" name="showedUp" value="no" />
          No
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-sn-pro text-xl font-semibold text-cream">
          Did you feel safe?
        </legend>
        <label className="flex items-center gap-3 text-cream">
          <input type="radio" name="feltSafe" value="yes" required />
          Yes
        </label>
        <label className="flex items-center gap-3 text-cream">
          <input type="radio" name="feltSafe" value="no" />
          No
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-sn-pro text-xl font-semibold text-cream">
          Would you use After Class again?
        </legend>
        <label className="flex items-center gap-3 text-cream">
          <input type="radio" name="wouldUseAgain" value="yes" required />
          Yes
        </label>
        <label className="flex items-center gap-3 text-cream">
          <input type="radio" name="wouldUseAgain" value="no" />
          No
        </label>
      </fieldset>

      <label className="flex flex-col gap-2 text-cream">
        <span className="font-sn-pro text-xl font-semibold">How was it? (optional, 1-5)</span>
        <select
          name="rating"
          className="rounded-xl border border-salmon/40 bg-maroon px-3 py-2 text-cream"
          defaultValue=""
        >
          <option value="">Skip</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-cream">
        <span className="font-sn-pro text-xl font-semibold">Anything else? (optional)</span>
        <textarea
          name="comments"
          rows={4}
          maxLength={2000}
          className="rounded-xl border border-salmon/40 bg-maroon px-3 py-2 text-cream"
        />
      </label>

      {message ? (
        <p className="text-[1rem] text-salmon" role="alert">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-xl bg-salmon px-5 py-3 font-open-sauce text-[1rem] font-bold text-maroon disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send feedback'}
      </button>
    </form>
  )
}
