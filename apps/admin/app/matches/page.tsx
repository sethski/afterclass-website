import Link from 'next/link'
import {
  MATCH_STATUS_LABEL,
  type MatchRow,
  type SignupRow,
} from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { formatManila, labelFor } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import { Banner, DataTable, Empty, Shell } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const flash = await searchParams
  const supabase = service()
  const { data, error } = await supabase
    .from('matches')
    .select('id, person_a, person_b, status, match_reason, created_at')
    .order('created_at', { ascending: false })
    

  const ids = Array.from(
    new Set((data ?? []).flatMap((row) => [row.person_a, row.person_b]))
  )
  const { data: people } = ids.length
    ? await supabase
        .from('test_run_signups')
        .select('id, full_name')
        .in('id', ids)
        
    : { data: [] as Pick<SignupRow, 'id' | 'full_name'>[] }

  const names = new Map((people ?? []).map((row) => [row.id, row.full_name]))

  return (
    <Shell title="Matches">
      <Banner ok={firstString(flash.ok)} error={error?.message ?? firstString(flash.error)} />
      <p>
        <Link
          href="/matches/new"
          className="text-accent underline decoration-2 underline-offset-4"
        >
          New match
        </Link>
      </p>
      {(data ?? []).length === 0 ? (
        <Empty>
          No matches yet. Open two signups and use Pair, or pick people on the new match page.
        </Empty>
      ) : (
        <DataTable headers={['People', 'Status', 'Created', 'Why']}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-b border-line">
              <td className="py-3 pr-4">
                <Link href={`/matches/${row.id}`} className="underline-offset-4 hover:underline">
                  {names.get(row.person_a) ?? 'A'} + {names.get(row.person_b) ?? 'B'}
                </Link>
              </td>
              <td className="py-3 pr-4">{labelFor(MATCH_STATUS_LABEL, row.status)}</td>
              <td className="tabular py-3 pr-4">{formatManila(row.created_at)}</td>
              <td className="py-3 pr-4 text-muted">{row.match_reason}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </Shell>
  )
}
