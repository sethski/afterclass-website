import Link from 'next/link'
import {
  SIGNUP_STATUS_LABEL,
  SIGNUP_STATUSES,
  isSignupStatus,
  type SignupRow,
} from '@afterclass/db'
import { requireAdmin } from '@/lib/auth'
import { formatManila, labelFor } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import { Banner, DataTable, Empty, Shell } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function SignupsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const params = await searchParams
  const status = firstString(params.status)
  const q = firstString(params.q)?.trim() ?? ''
  const error = firstString(params.error)
  const ok = firstString(params.ok)

  let query = service()
    .from('test_run_signups')
    .select(
      'id, full_name, email, school, city_corridor, gender, age, status, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && isSignupStatus(status)) {
    query = query.eq('status', status)
  }

  const { data, error: loadError } = await query

  const rows = (data ?? []).filter((row) => {
    if (!q) return true
    const hay = `${row.full_name} ${row.email} ${row.school}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <Shell title="Signups">
      <Banner ok={ok} error={error ?? loadError?.message} />
      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="flex flex-col gap-1">
          <span className="text-muted">Search</span>
          <input
            className="rounded-xl border border-line bg-bg px-3 py-2"
            name="q"
            defaultValue={q}
            placeholder="Name, email, school"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted">Status</span>
          <select
            className="rounded-xl border border-line bg-bg px-3 py-2"
            name="status"
            defaultValue={status && isSignupStatus(status) ? status : ''}
          >
            <option value="">All</option>
            {SIGNUP_STATUSES.map((value) => (
              <option key={value} value={value}>
                {SIGNUP_STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg" type="submit">
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <Empty>
          No signups match that filter. The public form at /enlistment writes new rows here.
        </Empty>
      ) : (
        <DataTable
          headers={['Name', 'School', 'City', 'Status', 'Received', 'Match']}
        >
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line">
              <td className="py-3 pr-4">
                <Link href={`/signups/${row.id}`} className="underline-offset-4 hover:underline">
                  {row.full_name}
                </Link>
                <div className="text-muted">{row.email}</div>
              </td>
              <td className="py-3 pr-4">{row.school}</td>
              <td className="py-3 pr-4">{row.city_corridor}</td>
              <td className="py-3 pr-4">{labelFor(SIGNUP_STATUS_LABEL, row.status)}</td>
              <td className="tabular py-3 pr-4">{formatManila(row.created_at)}</td>
              <td className="py-3 pr-4">
                <Link
                  href={`/matches/new?a=${row.id}`}
                  className="text-accent underline decoration-2 underline-offset-4"
                >
                  Pair
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </Shell>
  )
}
