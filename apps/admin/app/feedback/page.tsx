import Link from 'next/link'
import type { FeedbackRow, SignupRow } from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { formatManila, yesNo } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { DataTable, Empty, Shell } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  await requireAdmin()
  const supabase = service()
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(100)
    

  const ids = Array.from(new Set((data ?? []).map((row) => row.signup_id)))
  const { data: people } = ids.length
    ? await supabase
        .from('test_run_signups')
        .select('id, full_name')
        .in('id', ids)
        
    : { data: [] as Pick<SignupRow, 'id' | 'full_name'>[] }
  const names = new Map((people ?? []).map((row) => [row.id, row.full_name]))

  return (
    <Shell title="Feedback">
      {(data ?? []).length === 0 ? (
        <Empty>
          Nothing yet. After a date, generate private links or log what you heard.
        </Empty>
      ) : (
        <DataTable headers={['When', 'Who', 'From', 'Showed up', 'Safe', 'Again']}>
          {(data ?? []).map((row) => (
            <tr key={row.id} className="border-b border-line">
              <td className="tabular py-3 pr-4">{formatManila(row.submitted_at)}</td>
              <td className="py-3 pr-4">
                <Link href={`/dates/${row.date_id}`} className="underline-offset-4 hover:underline">
                  {names.get(row.signup_id) ?? 'Signup'}
                </Link>
              </td>
              <td className="py-3 pr-4">{row.source === 'user' ? 'Them' : 'Founder'}</td>
              <td className="py-3 pr-4">{yesNo(row.showed_up)}</td>
              <td className="py-3 pr-4">{yesNo(row.felt_safe)}</td>
              <td className="py-3 pr-4">{yesNo(row.would_use_again)}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </Shell>
  )
}
