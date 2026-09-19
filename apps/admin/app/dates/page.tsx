import Link from 'next/link'
import {
  DATE_STATUS_LABEL,
  type CafeRow,
  type DateRow,
  type MatchRow,
  type SignupRow,
} from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { formatManila, labelFor } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import { Banner, DataTable, Empty, Shell } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function DatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const flash = await searchParams
  const supabase = service()
  const { data, error } = await supabase
    .from('dates')
    .select('id, match_id, cafe_id, cafe_name_override, scheduled_at, status')
    .order('scheduled_at', { ascending: false })
    

  const cafeIds = Array.from(
    new Set((data ?? []).map((row) => row.cafe_id).filter(Boolean) as string[])
  )
  const matchIds = Array.from(new Set((data ?? []).map((row) => row.match_id)))

  const { data: cafes } = cafeIds.length
    ? await supabase
        .from('cafes')
        .select('id, name')
        .in('id', cafeIds)
        
    : { data: [] as Pick<CafeRow, 'id' | 'name'>[] }

  const { data: matches } = matchIds.length
    ? await supabase
        .from('matches')
        .select('id, person_a, person_b')
        .in('id', matchIds)
        
    : { data: [] as Pick<MatchRow, 'id' | 'person_a' | 'person_b'>[] }

  const personIds = Array.from(
    new Set((matches ?? []).flatMap((row) => [row.person_a, row.person_b]))
  )
  const { data: people } = personIds.length
    ? await supabase
        .from('test_run_signups')
        .select('id, full_name')
        .in('id', personIds)
        
    : { data: [] as Pick<SignupRow, 'id' | 'full_name'>[] }

  const cafeNames = new Map((cafes ?? []).map((row) => [row.id, row.name]))
  const matchPeople = new Map((matches ?? []).map((row) => [row.id, row]))
  const names = new Map((people ?? []).map((row) => [row.id, row.full_name]))

  return (
    <Shell title="Dates">
      <Banner ok={firstString(flash.ok)} error={error?.message ?? firstString(flash.error)} />
      {(data ?? []).length === 0 ? (
        <Empty>No dates yet. Open a match and schedule a cafe.</Empty>
      ) : (
        <DataTable headers={['When', 'People', 'Cafe', 'Status']}>
          {(data ?? []).map((row) => {
            const pair = matchPeople.get(row.match_id)
            const label = pair
              ? `${names.get(pair.person_a) ?? 'A'} + ${names.get(pair.person_b) ?? 'B'}`
              : 'Match'
            const cafe =
              row.cafe_name_override ||
              (row.cafe_id ? cafeNames.get(row.cafe_id) : null) ||
              'Cafe TBD'
            return (
              <tr key={row.id} className="border-b border-line">
                <td className="tabular py-3 pr-4">
                  <Link href={`/dates/${row.id}`} className="underline-offset-4 hover:underline">
                    {formatManila(row.scheduled_at)}
                  </Link>
                </td>
                <td className="py-3 pr-4">{label}</td>
                <td className="py-3 pr-4">{cafe}</td>
                <td className="py-3 pr-4">{labelFor(DATE_STATUS_LABEL, row.status)}</td>
              </tr>
            )
          })}
        </DataTable>
      )}
    </Shell>
  )
}
