import Link from 'next/link'
import {
  DATE_STATUS_LABEL,
  SIGNUP_STATUS_LABEL,
  type DateRow,
  type SignupRow,
} from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { formatManila, labelFor } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { Empty, Shell } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function OverviewPage() {
  await requireAdmin()
  const supabase = service()

  const [signups, dates, pending] = await Promise.all([
    supabase
      .from('test_run_signups')
      .select('id, status')
      ,
    supabase
      .from('dates')
      .select('id, scheduled_at, status, match_id')
      .order('scheduled_at', { ascending: true })
      ,
    supabase
      .from('test_run_signups')
      .select('id, full_name, school, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(8)
      ,
  ])

  const statusCounts = new Map<string, number>()
  for (const row of signups.data ?? []) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1)
  }

  const upcoming = (dates.data ?? []).filter((row) => {
    if (row.status === 'cancelled' || row.status === 'completed') return false
    if (!row.scheduled_at) return true
    return new Date(row.scheduled_at).getTime() >= Date.now() - 60 * 60 * 1000
  })

  return (
    <Shell title="What needs a hand">
      <p className="max-w-prose text-muted">
        {signups.data?.length ?? 0} signups in the book.
        {' '}
        {statusCounts.get('pending') ?? 0} still pending review.
        {' '}
        {upcoming.length} dates still open.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Signup status</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {Object.entries(SIGNUP_STATUS_LABEL).map(([status, label]) => (
            <li key={status} className="border-b border-line py-2">
              <Link href={`/signups?status=${status}`} className="flex justify-between">
                <span>{label}</span>
                <span className="tabular text-muted">{statusCounts.get(status) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Pending review</h2>
        {(pending.data ?? []).length === 0 ? (
          <Empty>
            No pending signups. New enlistment submissions land here automatically.
          </Empty>
        ) : (
          <ul className="flex flex-col">
            {(pending.data ?? []).map((row) => (
              <li key={row.id} className="border-b border-line py-3">
                <Link href={`/signups/${row.id}`} className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span>{row.full_name}</span>
                  <span className="text-muted">{row.school}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Open dates</h2>
        {upcoming.length === 0 ? (
          <Empty>No upcoming dates. Match two people, then schedule a cafe.</Empty>
        ) : (
          <ul className="flex flex-col">
            {upcoming.slice(0, 8).map((row) => (
              <li key={row.id} className="border-b border-line py-3">
                <Link href={`/dates/${row.id}`} className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span>{formatManila(row.scheduled_at)}</span>
                  <span className="text-muted">
                    {labelFor(DATE_STATUS_LABEL, row.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  )
}
