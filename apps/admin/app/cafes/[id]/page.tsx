import type { CafeRow } from '@afterclass/db'
import { updateCafe } from '@/app/actions/cafes'
import { requireAdmin } from '@/lib/auth'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import {
  AreaField,
  Banner,
  PrimaryButton,
  SelectField,
  Shell,
  TextField,
} from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function CafeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const { id } = await params
  const flash = await searchParams
  const { data } = await service().from('cafes').select('*').eq('id', id).maybeSingle()
  if (!data) {
    return (
      <Shell title="Cafe">
        <p className="text-danger">That cafe is not in the list.</p>
      </Shell>
    )
  }
  const cafe = data as CafeRow

  return (
    <Shell title={cafe.name}>
      <Banner ok={firstString(flash.ok)} error={firstString(flash.error)} />
      <form action={updateCafe} className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={cafe.id} />
        <TextField label="Name" name="name" required defaultValue={cafe.name} />
        <TextField label="Area" name="area" required defaultValue={cafe.area} />
        <TextField label="City" name="city" required defaultValue={cafe.city} />
        <TextField label="Address" name="address" defaultValue={cafe.address ?? ''} />
        <TextField label="Latitude" name="lat" defaultValue={cafe.lat?.toString() ?? ''} />
        <TextField label="Longitude" name="lng" defaultValue={cafe.lng?.toString() ?? ''} />
        <div className="sm:col-span-2">
          <AreaField label="Notes" name="notes" defaultValue={cafe.notes ?? ''} />
        </div>
        <SelectField
          label="Active"
          name="active"
          defaultValue={cafe.active ? 'true' : 'false'}
          options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
        />
        <div className="flex items-end">
          <PrimaryButton>Save cafe</PrimaryButton>
        </div>
      </form>
    </Shell>
  )
}
