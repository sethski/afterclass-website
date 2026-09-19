import Link from 'next/link'
import {
  DATE_STATUS_LABEL,
  DATE_STATUSES,
  type CafeRow,
  type DateRow,
  type FeedbackRow,
  type MatchRow,
  type SignupRow,
} from '@afterclass/db'
import { updateDate } from '@/app/actions/dates'
import { saveFounderFeedback } from '@/app/actions/feedback'
import { FeedbackLinkGenerator } from '@/components/feedback-links'
import { requireAdmin } from '@/lib/auth'
import { formatManila, yesNo } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import {
  AreaField,
  Banner,
  Pair,
  PrimaryButton,
  SelectField,
  Shell,
  TextField,
} from '@/components/ui'

export const dynamic = 'force-dynamic'

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const bag: Record<string, string> = {}
  for (const part of parts) {
    if (part.type !== 'literal') bag[part.type] = part.value
  }
  return `${bag.year}-${bag.month}-${bag.day}T${bag.hour}:${bag.minute}`
}

export default async function DateDetailPage({
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
  const { data } = await supabase.from('dates').select('*').eq('id', id).maybeSingle()
  if (!data) {
    return (
      <Shell title="Date">
        <p className="text-danger">That date is not in the table.</p>
      </Shell>
    )
  }
  const dateRow = data as DateRow

  const { data: match } = await supabase
    .from('matches')
    .select('id, person_a, person_b')
    .eq('id', dateRow.match_id)
    .maybeSingle()
  const pair = match as Pick<MatchRow, 'id' | 'person_a' | 'person_b'> | null

  const { data: people } = pair
    ? await supabase
        .from('test_run_signups')
        .select('id, full_name')
        .in('id', [pair.person_a, pair.person_b])
        
    : { data: [] as Pick<SignupRow, 'id' | 'full_name'>[] }

  const { data: cafes } = await supabase
    .from('cafes')
    .select('id, name, area, city, active')
    .order('name')
    

  const { data: feedback } = await supabase
    .from('feedback')
    .select('*')
    .eq('date_id', id)
    

  const { data: invites } = await supabase
    .from('feedback_invites')
    .select('signup_id, used_at, expires_at')
    .eq('date_id', id)

  return (
    <Shell title="Date">
      <Banner ok={firstString(flash.ok)} error={firstString(flash.error)} />
      <p>
        <Link href={`/matches/${dateRow.match_id}`} className="text-accent underline decoration-2 underline-offset-4">
          Open match
        </Link>
      </p>

      <form action={updateDate} className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={dateRow.id} />
        <SelectField
          label="Status"
          name="status"
          defaultValue={dateRow.status}
          options={DATE_STATUSES.map((value) => ({
            value,
            label: DATE_STATUS_LABEL[value],
          }))}
        />
        <label className="flex flex-col gap-1">
          <span className="text-muted">Cafe</span>
          <select
            className="rounded-xl border border-line bg-bg px-3 py-2"
            name="cafe_id"
            defaultValue={dateRow.cafe_id ?? ''}
          >
            <option value="">Not in the list</option>
            {(cafes ?? []).map((cafe) => (
              <option key={cafe.id} value={cafe.id}>
                {cafe.name} · {cafe.area}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="Or type a cafe"
          name="cafe_name_override"
          defaultValue={dateRow.cafe_name_override ?? ''}
        />
        <TextField
          label="When (Manila time)"
          name="scheduled_at"
          type="datetime-local"
          defaultValue={toLocalInput(dateRow.scheduled_at)}
        />
        <div className="sm:col-span-2">
          <AreaField
            label="Founder notes"
            name="founder_notes"
            defaultValue={dateRow.founder_notes ?? ''}
          />
        </div>
        <PrimaryButton>Save date</PrimaryButton>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Feedback links</h2>
        <p className="text-muted">
          {(invites ?? []).filter((row) => row.used_at).length} of {(people ?? []).length} people
          have sent the private form.
        </p>
        <FeedbackLinkGenerator dateId={dateRow.id} />
      </section>

      {(people ?? []).map((person) => {
        const user = (feedback ?? []).find(
          (row) => row.signup_id === person.id && row.source === 'user'
        )
        const founder = (feedback ?? []).find(
          (row) => row.signup_id === person.id && row.source === 'founder'
        )
        return (
          <section key={person.id} className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold">{person.full_name}</h2>
            <dl>
              <Pair label="Showed up (them)" value={yesNo(user?.showed_up ?? null)} />
              <Pair label="Felt safe (them)" value={yesNo(user?.felt_safe ?? null)} />
              <Pair label="Use again (them)" value={yesNo(user?.would_use_again ?? null)} />
              <Pair label="Rating" value={user?.rating != null ? String(user.rating) : 'None'} />
              <Pair label="Their notes" value={user?.comments} />
            </dl>
            <form action={saveFounderFeedback} className="grid max-w-xl gap-3 sm:grid-cols-3">
              <input type="hidden" name="date_id" value={dateRow.id} />
              <input type="hidden" name="signup_id" value={person.id} />
              <SelectField
                label="Showed up"
                name="showed_up"
                defaultValue={
                  founder?.showed_up == null ? '' : founder.showed_up ? 'yes' : 'no'
                }
                options={[
                  { value: '', label: 'Skip' },
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
              <SelectField
                label="Felt safe"
                name="felt_safe"
                defaultValue={
                  founder?.felt_safe == null ? '' : founder.felt_safe ? 'yes' : 'no'
                }
                options={[
                  { value: '', label: 'Skip' },
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
              <SelectField
                label="Use again"
                name="would_use_again"
                defaultValue={
                  founder?.would_use_again == null
                    ? ''
                    : founder.would_use_again
                      ? 'yes'
                      : 'no'
                }
                options={[
                  { value: '', label: 'Skip' },
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
              <div className="sm:col-span-3">
                <AreaField
                  label="Founder notes"
                  name="founder_notes"
                  defaultValue={founder?.founder_notes ?? ''}
                />
              </div>
              <PrimaryButton>Save founder notes</PrimaryButton>
            </form>
          </section>
        )
      })}
    </Shell>
  )
}
