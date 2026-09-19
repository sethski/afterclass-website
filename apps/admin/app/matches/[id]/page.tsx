import Link from 'next/link'
import {
  MATCH_STATUS_LABEL,
  MATCH_STATUSES,
  type CafeRow,
  type DateRow,
  type MatchRow,
  type SignupRow,
} from '@afterclass/db'
import { createDate } from '@/app/actions/dates'
import { updateMatch } from '@/app/actions/matches'
import { requireAdmin } from '@/lib/auth'
import { formatManila } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import {
  AreaField,
  Banner,
  Empty,
  PrimaryButton,
  SelectField,
  Shell,
  TextField,
} from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function MatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const { id } = await params
  const flash = await searchParams
  const supabase = service()
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!match) {
    return (
      <Shell title="Match">
        <p className="text-danger">That match is not in the table.</p>
      </Shell>
    )
  }

  const row = match as MatchRow
  const { data: people } = await supabase
    .from('test_run_signups')
    .select('id, full_name, school, email')
    .in('id', [row.person_a, row.person_b])
    

  const { data: cafes } = await supabase
    .from('cafes')
    .select('id, name, area, city, active')
    .eq('active', true)
    .order('name')
    

  const { data: dates } = await supabase
    .from('dates')
    .select('id, scheduled_at, status')
    .eq('match_id', id)
    .order('scheduled_at', { ascending: true })
    

  return (
    <Shell title="Match">
      <Banner ok={firstString(flash.ok)} error={firstString(flash.error)} />
      <ul className="flex flex-col gap-2">
        {(people ?? []).map((person) => (
          <li key={person.id}>
            <Link href={`/signups/${person.id}`} className="underline-offset-4 hover:underline">
              {person.full_name}
            </Link>
            <span className="text-muted"> · {person.school}</span>
          </li>
        ))}
      </ul>

      <form action={updateMatch} className="flex max-w-lg flex-col gap-4">
        <input type="hidden" name="id" value={row.id} />
        <SelectField
          label="Status"
          name="status"
          defaultValue={row.status}
          options={MATCH_STATUSES.map((value) => ({
            value,
            label: MATCH_STATUS_LABEL[value],
          }))}
        />
        <AreaField
          label="Why these two"
          name="match_reason"
          defaultValue={row.match_reason ?? ''}
        />
        <PrimaryButton>Save match</PrimaryButton>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Dates</h2>
        {(dates ?? []).length === 0 ? (
          <Empty>No cafe date on this match yet.</Empty>
        ) : (
          <ul>
            {(dates ?? []).map((item) => (
              <li key={item.id} className="border-b border-line py-2">
                <Link href={`/dates/${item.id}`} className="underline-offset-4 hover:underline">
                  {formatManila(item.scheduled_at)}
                </Link>
                <span className="text-muted"> · {item.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={createDate} className="flex max-w-lg flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">Schedule a date</h2>
        <input type="hidden" name="match_id" value={row.id} />
        <label className="flex flex-col gap-1">
          <span className="text-muted">Cafe</span>
          <select
            className="rounded-xl border border-line bg-bg px-3 py-2"
            name="cafe_id"
            defaultValue=""
          >
            <option value="">Not in the list</option>
            {(cafes ?? []).map((cafe) => (
              <option key={cafe.id} value={cafe.id}>
                {cafe.name} · {cafe.area}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Or type a cafe" name="cafe_name_override" />
        <TextField
          label="When (Manila time)"
          name="scheduled_at"
          type="datetime-local"
          required
        />
        <AreaField label="Notes" name="founder_notes" />
        <PrimaryButton>Schedule</PrimaryButton>
      </form>
    </Shell>
  )
}
