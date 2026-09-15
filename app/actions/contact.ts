'use server'

import { contactSchema } from '@/lib/validations/contact'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { siteContent } from '@/lib/content'

export type ContactActionState = { ok: boolean; message: string }

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid input',
    }
  }

  try {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from('contact_messages').insert({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase().trim(),
      subject: parsed.data.subject,
      message: parsed.data.message,
    })

    if (error) {
      return { ok: false, message: 'Something went wrong. Try again.' }
    }

    return { ok: true, message: siteContent.contact.success }
  } catch {
    return {
      ok: false,
      message: 'Contact form is not configured yet. Email info@afterclassapp.com.',
    }
  }
}
