'use server'

import { redirect } from 'next/navigation'
import { isMatchStatus, signupBusy } from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { service } from '@/lib/supabase/service'

export async function createMatch(formData: FormData) {
  await requireAdmin()
  const personA = String(formData.get('person_a') ?? '')
  const personB = String(formData.get('person_b') ?? '')
  const reason = String(formData.get('match_reason') ?? '').trim()
  if (!personA || !personB || personA === personB) {
    redirect(
      `/matches/new?a=${personA}&b=${personB}&error=${encodeURIComponent('Pick two different people.')}`
    )
  }

  const supabase = service()
  const { data: rows, error: loadError } = await supabase
    .from('test_run_signups')
    .select('id, status')
    .in('id', [personA, personB])

  if (loadError || !rows || rows.length !== 2) {
    redirect(
      `/matches/new?a=${personA}&b=${personB}&error=${encodeURIComponent('Could not load those signups.')}`
    )
  }

  if (rows.some((row) => signupBusy(row.status))) {
    redirect(
      `/matches/new?a=${personA}&b=${personB}&error=${encodeURIComponent('Someone here is already in an active match.')}`
    )
  }

  const { data: inserted, error } = await supabase
    .from('matches')
    .insert({
      person_a: personA,
      person_b: personB,
      match_reason: reason || null,
      created_by: null,
      status: 'proposed',
    })
    .select('id')
    .single()

  if (error || !inserted) {
    redirect(
      `/matches/new?a=${personA}&b=${personB}&error=${encodeURIComponent('Could not create the match.')}`
    )
  }

  const { error: statusError } = await supabase
    .from('test_run_signups')
    .update({ status: 'matched' })
    .in('id', [personA, personB])

  if (statusError) {
    await supabase.from('matches').delete().eq('id', inserted.id)
    redirect(
      `/matches/new?a=${personA}&b=${personB}&error=${encodeURIComponent('Could not update signup status.')}`
    )
  }

  redirect(`/matches/${inserted.id}?ok=${encodeURIComponent('Match created.')}`)
}

export async function updateMatch(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const reason = String(formData.get('match_reason') ?? '').trim()
  if (!id || !isMatchStatus(status)) {
    redirect(`/matches/${id}?error=${encodeURIComponent('Pick a valid status.')}`)
  }

  const supabase = service()
  const { data: match, error: loadError } = await supabase
    .from('matches')
    .select('id, person_a, person_b, status')
    .eq('id', id)
    .maybeSingle()

  if (loadError || !match) {
    redirect('/matches?error=' + encodeURIComponent('Match not found.'))
  }

  const { error } = await supabase
    .from('matches')
    .update({ status, match_reason: reason || null })
    .eq('id', id)

  if (error) {
    redirect(`/matches/${id}?error=${encodeURIComponent('Could not save the match.')}`)
  }

  if (status === 'cancelled' && match.status !== 'cancelled') {
    await supabase
      .from('test_run_signups')
      .update({ status: 'reviewed' })
      .in('id', [match.person_a, match.person_b])
  }

  if (status === 'completed') {
    await supabase
      .from('test_run_signups')
      .update({ status: 'completed' })
      .in('id', [match.person_a, match.person_b])
  }

  redirect(`/matches/${id}?ok=${encodeURIComponent('Saved.')}`)
}
