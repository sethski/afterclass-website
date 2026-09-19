'use server'

import { redirect } from 'next/navigation'
import { isDateStatus } from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { service } from '@/lib/supabase/service'

function manilaDateTime(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withOffset = trimmed.length === 16 ? `${trimmed}:00+08:00` : trimmed
  const date = new Date(withOffset)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export async function createDate(formData: FormData) {
  await requireAdmin()
  const matchId = String(formData.get('match_id') ?? '')
  const cafeId = String(formData.get('cafe_id') ?? '').trim()
  const cafeOverride = String(formData.get('cafe_name_override') ?? '').trim()
  const scheduled = manilaDateTime(String(formData.get('scheduled_at') ?? ''))
  const notes = String(formData.get('founder_notes') ?? '').trim()

  if (!matchId || (!cafeId && !cafeOverride) || !scheduled) {
    redirect(
      `/matches/${matchId}?error=${encodeURIComponent('Pick a cafe and a date time.')}`
    )
  }

  const supabase = service()
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, person_a, person_b, status')
    .eq('id', matchId)
    .maybeSingle()

  if (matchError || !match) {
    redirect('/matches?error=' + encodeURIComponent('Match not found.'))
  }

  const { data: inserted, error } = await supabase
    .from('dates')
    .insert({
      match_id: matchId,
      cafe_id: cafeId || null,
      cafe_name_override: cafeOverride || null,
      scheduled_at: scheduled,
      founder_notes: notes || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !inserted) {
    redirect(
      `/matches/${matchId}?error=${encodeURIComponent('Could not schedule that date.')}`
    )
  }

  await supabase
    .from('matches')
    .update({ status: 'scheduled' })
    .eq('id', matchId)
  await supabase
    .from('test_run_signups')
    .update({ status: 'scheduled' })
    .in('id', [match.person_a, match.person_b])

  redirect(`/dates/${inserted.id}?ok=${encodeURIComponent('Date scheduled.')}`)
}

export async function updateDate(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const cafeId = String(formData.get('cafe_id') ?? '').trim()
  const cafeOverride = String(formData.get('cafe_name_override') ?? '').trim()
  const scheduledRaw = String(formData.get('scheduled_at') ?? '')
  const scheduled = scheduledRaw.includes('T')
    ? manilaDateTime(scheduledRaw)
    : scheduledRaw || null
  const notes = String(formData.get('founder_notes') ?? '').trim()

  if (!id || !isDateStatus(status)) {
    redirect(`/dates/${id}?error=${encodeURIComponent('Pick a valid status.')}`)
  }

  const supabase = service()
  const { data: current, error: loadError } = await supabase
    .from('dates')
    .select('id, match_id, matches(person_a, person_b)')
    .eq('id', id)
    .maybeSingle()

  if (loadError || !current) {
    redirect('/dates?error=' + encodeURIComponent('Date not found.'))
  }

  const { error } = await supabase
    .from('dates')
    .update({
      status,
      cafe_id: cafeId || null,
      cafe_name_override: cafeOverride || null,
      scheduled_at: scheduled,
      founder_notes: notes || null,
    })
    .eq('id', id)

  if (error) {
    redirect(`/dates/${id}?error=${encodeURIComponent('Could not save the date.')}`)
  }

  const match = current.matches as
    | { person_a: string; person_b: string }
    | { person_a: string; person_b: string }[]
    | null
  const people = Array.isArray(match) ? match[0] : match

  if (status === 'completed' && people) {
    await supabase.from('matches').update({ status: 'completed' }).eq('id', current.match_id)
    await supabase
      .from('test_run_signups')
      .update({ status: 'completed' })
      .in('id', [people.person_a, people.person_b])
  }

  if (status === 'cancelled' && people) {
    await supabase.from('matches').update({ status: 'cancelled' }).eq('id', current.match_id)
    await supabase
      .from('test_run_signups')
      .update({ status: 'reviewed' })
      .in('id', [people.person_a, people.person_b])
  }

  redirect(`/dates/${id}?ok=${encodeURIComponent('Saved.')}`)
}
