'use server'

import { createTestRunClient, hashFeedbackToken } from '@afterclass/db'
import { feedbackSchema } from '@/lib/validations/feedback'

export type FeedbackActionResult = { ok: boolean; message: string }

function asYes(value: string | undefined): boolean {
  return value === 'yes'
}

export async function submitFeedback(
  formData: FormData
): Promise<FeedbackActionResult> {
  const parsed = feedbackSchema.safeParse({
    token: formData.get('token'),
    showedUp: formData.get('showedUp'),
    feltSafe: formData.get('feltSafe'),
    wouldUseAgain: formData.get('wouldUseAgain'),
    rating: formData.get('rating') ?? '',
    comments: formData.get('comments') ?? '',
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
    }
  }

  try {
    const supabase = createTestRunClient()
    const tokenHash = hashFeedbackToken(parsed.data.token)
    const { data: invite, error: inviteError } = await supabase
      .from('feedback_invites')
      .select('id, date_id, signup_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (inviteError || !invite) {
      return { ok: false, message: 'This feedback link is not valid.' }
    }
    if (invite.used_at) {
      return { ok: false, message: 'This feedback was already sent.' }
    }
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return { ok: false, message: 'This feedback link has expired.' }
    }

    const { error: insertError } = await supabase.from('feedback').insert({
      date_id: invite.date_id,
      signup_id: invite.signup_id,
      source: 'user',
      showed_up: asYes(parsed.data.showedUp),
      felt_safe: asYes(parsed.data.feltSafe),
      would_use_again: asYes(parsed.data.wouldUseAgain),
      rating: parsed.data.rating ?? null,
      comments: parsed.data.comments || null,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        return { ok: false, message: 'This feedback was already sent.' }
      }
      return { ok: false, message: 'Could not save your feedback. Try again.' }
    }

    const { error: usedError } = await supabase
      .from('feedback_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invite.id)

    if (usedError) {
      return { ok: false, message: 'Could not save your feedback. Try again.' }
    }

    return { ok: true, message: 'Thanks. We read every reply.' }
  } catch {
    return {
      ok: false,
      message: 'Feedback is not connected yet. Email info@afterclassapp.com.',
    }
  }
}
