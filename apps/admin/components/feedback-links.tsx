'use client'

import { useActionState } from 'react'
import {
  createFeedbackLinks,
  type FeedbackLinkState,
} from '@/app/actions/feedback'
import { CopyButton } from '@/components/copy-button'
import { PrimaryButton } from '@/components/ui'

export function FeedbackLinkGenerator({ dateId }: { dateId: string }) {
  const [state, action, pending] = useActionState(
    createFeedbackLinks,
    null as FeedbackLinkState | null
  )

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="dateId" value={dateId} />
      <PrimaryButton>
        {pending
          ? 'Creating…'
          : state?.links
            ? 'Regenerate unused links'
            : 'Create feedback links'}
      </PrimaryButton>
      {state?.message ? (
        <p className={state.ok ? 'text-ok' : 'text-danger'}>{state.message}</p>
      ) : null}
      {state?.links?.length ? (
        <ul className="flex flex-col gap-2">
          {state.links.map((link) => (
            <li key={link.url} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span>{link.name}</span>
              <code className="break-all text-[0.875rem] text-muted">{link.url}</code>
              <CopyButton value={link.url} />
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  )
}
