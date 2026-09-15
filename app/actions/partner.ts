'use server'

import { partnerSchema } from '@/lib/validations/partner'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { siteContent } from '@/lib/content'

export type PartnerActionState = { ok: boolean; message: string }

export async function submitPartnerInterest(
  _prev: PartnerActionState,
  formData: FormData
): Promise<PartnerActionState> {
  const messageRaw = formData.get('message')
  const parsed = partnerSchema.safeParse({
    businessName: formData.get('businessName'),
    location: formData.get('location'),
    email: formData.get('email'),
    message:
      typeof messageRaw === 'string' && messageRaw.trim()
        ? messageRaw
        : undefined,
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid input',
    }
  }

  try {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from('partner_interests').insert({
      business_name: parsed.data.businessName,
      location: parsed.data.location,
      email: parsed.data.email.toLowerCase().trim(),
      message: parsed.data.message ?? null,
    })

    if (error) {
      return { ok: false, message: 'Something went wrong. Try again.' }
    }

    return { ok: true, message: siteContent.partners.success }
  } catch {
    return {
      ok: false,
      message: 'Partner form is not configured yet. Email info@afterclassapp.com.',
    }
  }
}
