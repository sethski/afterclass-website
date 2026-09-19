'use server'

import { redirect } from 'next/navigation'
import {
  createFeedbackToken,
  feedbackExpiry,
  type SignupRow,
} from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { service } from '@/lib/supabase/service'
import { feedbackUrl } from '@/lib/urls'

export type FeedbackLinkState = {
  ok: boolean
  message: string
  links?: Array<{ name: string; url: string }>
}

export async function createFeedbackLinks(
  _prev: FeedbackLinkState | null,
  formData: FormData
): Promise<FeedbackLinkState> {
  await requireAdmin()
  const dateId = String(formData.get('dateId') ?? '')
  if (!dateId) {
    return { ok: false, message: 'Missing date.' }
  }

  const supabase = service()
  const { data: dateRow, error: dateError } = await supabase
    .from('dates')
    .select('id, match_id, matches(person_a, person_b)')
    .eq('id', dateId)
    .maybeSingle()

  if (dateError || !dateRow) {
    return { ok: false, message: 'Date not found.' }
  }

  const match = dateRow.matches as
    | { person_a: string; person_b: string }
    | { person_a: string; person_b: string }[]
    | null
  const people = Array.isArray(match) ? match[0] : match
  if (!people) {
    return { ok: false, message: 'Match not found.' }
  }

  const ids = [people.person_a, people.person_b]
  const { data: signups } = await supabase
    .from('test_run_signups')
    .select('id, full_name')
    .in('id', ids)

  const names = new Map(
    ((signups ?? []) as Pick<SignupRow, 'id' | 'full_name'>[]).map((row) => [
      row.id,
      row.full_name,
    ])
  )

  const { data: existing } = await supabase
    .from('feedback_invites')
    .select('id, signup_id, used_at')
    .eq('date_id', dateId)

  const used = new Set(
    (existing ?? [])
      .filter((row) => row.used_at)
      .map((row) => row.signup_id as string)
  )

  const staleIds = (existing ?? [])
    .filter((row) => !row.used_at)
    .map((row) => row.id as string)

  if (staleIds.length > 0) {
    await supabase.from('feedback_invites').delete().in('id', staleIds)
  }

  const links: Array<{ name: string; url: string }> = []
  const expiresAt = feedbackExpiry().toISOString()

  for (const signupId of ids) {
    if (used.has(signupId)) continue
    const { token, hash } = createFeedbackToken()
    const { error } = await supabase.from('feedback_invites').insert({
      date_id: dateId,
      signup_id: signupId,
      token_hash: hash,
      expires_at: expiresAt,
    })
    if (error) {
      return { ok: false, message: 'Could not create feedback links.' }
    }
    links.push({
      name: names.get(signupId) ?? 'Signup',
      url: feedbackUrl(token),
    })
  }

  if (links.length === 0) {
    return { ok: false, message: 'Both people already sent feedback.' }
  }

  return {
    ok: true,
    message: 'Copy these now. Regenerating replaces unused links.',
    links,
  }
}

export async function saveFounderFeedback(formData: FormData) {
  await requireAdmin()
  const dateId = String(formData.get('date_id') ?? '')
  const signupId = String(formData.get('signup_id') ?? '')
  if (!dateId || !signupId) {
    redirect(`/dates/${dateId}?error=${encodeURIComponent('Missing person.')}`)
  }

  const showed = String(formData.get('showed_up') ?? '')
  const safe = String(formData.get('felt_safe') ?? '')
  const again = String(formData.get('would_use_again') ?? '')
  const notes = String(formData.get('founder_notes') ?? '').trim()
  const comments = String(formData.get('comments') ?? '').trim()

  const supabase = service()
  const row = {
    date_id: dateId,
    signup_id: signupId,
    source: 'founder' as const,
    showed_up: showed === '' ? null : showed === 'yes',
    felt_safe: safe === '' ? null : safe === 'yes',
    would_use_again: again === '' ? null : again === 'yes',
    comments: comments || null,
    founder_notes: notes || null,
  }

  const { error } = await supabase.from('feedback').upsert(row, {
    onConflict: 'date_id,signup_id,source',
  })

  if (error) {
    redirect(`/dates/${dateId}?error=${encodeURIComponent('Could not save founder notes.')}`)
  }
  redirect(`/dates/${dateId}?ok=${encodeURIComponent('Founder notes saved.')}`)
}
