import Link from 'next/link'
import {
  mutualInterest,
  sameCity,
  suggestCafes,
  type CafeRow,
  type SignupRow,
} from '@afterclass/db'
import { createMatch } from '@/app/actions/matches'
import { requireAdmin } from '@/lib/auth'
import { yesNo } from '@/lib/format'
import { service } from '@/lib/supabase/service'
import { firstString } from '@/lib/urls'
import {
  AreaField,
  Banner,
  Empty,
  Pair,
  PrimaryButton,
  Shell,
} from '@/components/ui'

export const dynamic = 'force-dynamic'

function asPerson(row: SignupRow) {
  return {
    gender: row.gender,
    meet_genders: row.meet_genders,
    city_corridor: row.city_corridor,
    city_corridor_other: row.city_corridor_other,
    school: row.school,
    departure_area: row.departure_area,
    nearby_school_ok: row.nearby_school_ok,
  }
}

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const params = await searchParams
  const aId = firstString(params.a)
  const bId = firstString(params.b)
  const supabase = service()

  const { data: pool } = await supabase
    .from('test_run_signups')
    .select('id, full_name, school, status, gender, city_corridor')
    .in('status', ['pending', 'reviewed'])
    .order('created_at', { ascending: false })
    

  const ids = [aId, bId].filter(Boolean) as string[]
  const { data: selected } = ids.length
    ? await supabase
        .from('test_run_signups')
        .select('*')
        .in('id', ids)
        
    : { data: [] as SignupRow[] }

  const personA = selected?.find((row) => row.id === aId)
  const personB = selected?.find((row) => row.id === bId)

  const { data: cafes } = await supabase
    .from('cafes')
    .select('id, name, area, city, active')
    .eq('active', true)
    

  const suggestions =
    personA && personB
      ? suggestCafes(cafes ?? [], asPerson(personA), asPerson(personB))
      : []

  const compatible =
    personA && personB
      ? {
          interest: mutualInterest(asPerson(personA), asPerson(personB)),
          city: sameCity(asPerson(personA), asPerson(personB)),
        }
      : null

  return (
    <Shell title="New match">
      <Banner error={firstString(params.error)} />
      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="flex flex-col gap-1">
          <span className="text-muted">Person A</span>
          <select
            className="min-w-56 rounded-xl border border-line bg-bg px-3 py-2"
            name="a"
            defaultValue={aId ?? ''}
          >
            <option value="">Select</option>
            {(pool ?? []).map((row) => (
              <option key={row.id} value={row.id}>
                {row.full_name} · {row.school}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted">Person B</span>
          <select
            className="min-w-56 rounded-xl border border-line bg-bg px-3 py-2"
            name="b"
            defaultValue={bId ?? ''}
          >
            <option value="">Select</option>
            {(pool ?? []).map((row) => (
              <option key={`b-${row.id}`} value={row.id}>
                {row.full_name} · {row.school}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg" type="submit">
          Compare
        </button>
      </form>

      {!personA || !personB ? (
        <Empty>Pick two pending or reviewed signups, then compare.</Empty>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="font-display text-xl font-semibold">Overlap</h2>
            <p>
              Mutual interest: {yesNo(compatible?.interest ?? false)}. Same city:{' '}
              {yesNo(compatible?.city ?? false)}. Nearby school ok:{' '}
              {yesNo(personA.nearby_school_ok)} / {yesNo(personB.nearby_school_ok)}.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            {[personA, personB].map((person) => (
              <article key={person.id} className="flex flex-col">
                <h2 className="font-display text-xl font-semibold">
                  <Link href={`/signups/${person.id}`} className="underline-offset-4 hover:underline">
                    {person.full_name}
                  </Link>
                </h2>
                <dl>
                  <Pair label="Gender" value={person.gender} />
                  <Pair label="Meet" value={person.meet_genders.join(', ')} />
                  <Pair label="School" value={person.school} />
                  <Pair label="City" value={person.city_corridor} />
                  <Pair label="Travel" value={person.max_travel} />
                  <Pair label="Dealbreakers" value={person.dealbreakers} />
                  <Pair label="About" value={person.about_you} />
                  <Pair label="Schedule" value={person.schedule} />
                </dl>
              </article>
            ))}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-display text-xl font-semibold">Cafe suggestions</h2>
            {suggestions.length === 0 ? (
              <Empty>
                No cafes in the list yet. Add a few on the Cafes page, then come back.
              </Empty>
            ) : (
              <ul>
                {suggestions.slice(0, 8).map((cafe) => (
                  <li key={cafe.id} className="border-b border-line py-2">
                    {cafe.name} · {cafe.area}, {cafe.city}
                    {cafe.score > 0 ? (
                      <span className="text-muted"> · overlap {cafe.score}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <form action={createMatch} className="flex max-w-lg flex-col gap-4">
            <input type="hidden" name="person_a" value={personA.id} />
            <input type="hidden" name="person_b" value={personB.id} />
            <AreaField label="Why these two" name="match_reason" />
            <PrimaryButton>Create match</PrimaryButton>
          </form>
        </>
      )}
    </Shell>
  )
}
