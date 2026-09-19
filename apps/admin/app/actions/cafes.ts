'use server'

import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { service } from '@/lib/supabase/service'

function readOptionalNumber(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export async function createCafe(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const area = String(formData.get('area') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  if (!name || !area || !city) {
    redirect(`/cafes?error=${encodeURIComponent('Name, area, and city are required.')}`)
  }

  const supabase = service()
  const { error } = await supabase.from('cafes').insert({
    name,
    area,
    city,
    address: String(formData.get('address') ?? '').trim() || null,
    lat: readOptionalNumber(formData.get('lat')),
    lng: readOptionalNumber(formData.get('lng')),
    notes: String(formData.get('notes') ?? '').trim() || null,
    active: true,
  })

  if (error) {
    redirect(`/cafes?error=${encodeURIComponent('Could not add that cafe.')}`)
  }
  redirect(`/cafes?ok=${encodeURIComponent('Cafe added.')}`)
}

export async function updateCafe(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const area = String(formData.get('area') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  if (!id || !name || !area || !city) {
    redirect(`/cafes/${id}?error=${encodeURIComponent('Name, area, and city are required.')}`)
  }

  const supabase = service()
  const { error } = await supabase
    .from('cafes')
    .update({
      name,
      area,
      city,
      address: String(formData.get('address') ?? '').trim() || null,
      lat: readOptionalNumber(formData.get('lat')),
      lng: readOptionalNumber(formData.get('lng')),
      notes: String(formData.get('notes') ?? '').trim() || null,
      active: String(formData.get('active') ?? '') === 'true',
    })
    .eq('id', id)

  if (error) {
    redirect(`/cafes/${id}?error=${encodeURIComponent('Could not save the cafe.')}`)
  }
  redirect(`/cafes/${id}?ok=${encodeURIComponent('Saved.')}`)
}
