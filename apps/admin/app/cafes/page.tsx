import Link from 'next/link'
import type { CafeRow } from '@afterclass/db'
import { createCafe } from '@/app/actions/cafes'
import { requireAdmin } from '@/lib/auth'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import {
  AreaField,
  Banner,
  DataTable,
  Empty,
  PrimaryButton,
  Shell,
  TextField,
} from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const flash = await searchParams
  const { data, error } = await service()
    .from('cafes')
    .select('*')
    .order('city', { ascending: true })
    .order('name', { ascending: true })
    

  return (
    <Shell title="Cafes">
      <Banner ok={firstString(flash.ok)} error={error?.message ?? firstString(flash.error)} />
      <form action={createCafe} className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <TextField label="Name" name="name" required />
        <TextField label="Area" name="area" required />
        <TextField label="City" name="city" required />
        <TextField label="Address" name="address" />
        <TextField label="Latitude" name="lat" />
        <TextField label="Longitude" name="lng" />
        <div className="sm:col-span-2">
          <AreaField label="Notes" name="notes" rows={3} />
        </div>
        <PrimaryButton>Add cafe</PrimaryButton>
      </form>

      {(data ?? []).length === 0 ? (
        <Empty>
          Add the cafes you actually send people to. Matches will suggest ones in overlapping cities.
        </Empty>
      ) : (
        <DataTable headers={['Name', 'Area', 'City', 'Active']}>
          {(data ?? []).map((cafe) => (
            <tr key={cafe.id} className="border-b border-line">
              <td className="py-3 pr-4">
                <Link href={`/cafes/${cafe.id}`} className="underline-offset-4 hover:underline">
                  {cafe.name}
                </Link>
              </td>
              <td className="py-3 pr-4">{cafe.area}</td>
              <td className="py-3 pr-4">{cafe.city}</td>
              <td className="py-3 pr-4">{cafe.active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </Shell>
  )
}
