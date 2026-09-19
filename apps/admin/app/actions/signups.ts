'use server'

import { redirect } from 'next/navigation'
import {
  isSignupStatus,
  signupBusy,
  type SignupStatus,
} from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { service } from '@/lib/supabase/service'

export async function updateSignup(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const notes = String(formData.get('reviewer_notes') ?? '').trim()
  if (!id || !isSignupStatus(status)) {
    redirect(`/signups/${id || ''}?error=${encodeURIComponent('Pick a valid status.')}`)
  }

  const supabase = service()
  const { data: current, error: loadError } = await supabase
    .from('test_run_signups')
    .select('id, status')
    .eq('id', id)
    .maybeSingle()

  if (loadError || !current) {
    redirect('/signups?error=' + encodeURIComponent('Signup not found.'))
  }

  if (signupBusy(current.status) && status === 'pending') {
    redirect(
      `/signups/${id}?error=${encodeURIComponent('Cancel the match or date first.')}`
    )
  }

  const patch: {
    status: SignupStatus
    reviewer_notes: string | null
    reviewed_at: string
    reviewed_by: string | null
  } = {
    status,
    reviewer_notes: notes || null,
    reviewed_at: new Date().toISOString(),
    reviewed_by: null,
  }

  const { error } = await supabase.from('test_run_signups').update(patch).eq('id', id)
  if (error) {
    redirect(`/signups/${id}?error=${encodeURIComponent('Could not save status.')}`)
  }
  redirect(`/signups/${id}?ok=${encodeURIComponent('Saved.')}`)
}
