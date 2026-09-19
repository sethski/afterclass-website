import Link from 'next/link'
import {
  SIGNUP_STATUS_LABEL,
  SIGNUP_STATUSES,
  TEST_RUN_BUCKET,
  type SignupRow,
} from '@afterclass/db'
import { updateSignup } from '@/app/actions/signups'
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
} from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function SignupDetailPage({
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
  const { data, error } = await supabase
    .from('test_run_signups')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    return (
      <Shell title="Signup">
        <p className="text-danger">That signup is not in the table.</p>
      </Shell>
    )
  }

  const signup = data as SignupRow
  const paths = [signup.face_photo_path, signup.school_id_photo_path].filter(
    (path, index, all) => path && all.indexOf(path) === index
  )
  const signed =
    paths.length > 0
      ? await supabase.storage.from(TEST_RUN_BUCKET).createSignedUrls(paths, 180)
      : { data: [] }

  return (
    <Shell title={signup.full_name}>
      <Banner ok={firstString(flash.ok)} error={firstString(flash.error)} />
      <p className="text-muted">
        {signup.school} · {signup.city_corridor} · received {formatManila(signup.created_at)}
      </p>

      <div className="flex flex-wrap gap-4">
        {(signed.data ?? []).map((item) =>
          item.signedUrl ? (
            <img
              key={item.path}
              src={item.signedUrl}
              alt="Signup photo"
              width={240}
              height={240}
              className="h-56 w-56 rounded-xl object-cover"
            />
          ) : null
        )}
      </div>

      <dl>
        <Pair label="Email" value={signup.email} />
        <Pair label="Phone" value={signup.phone} />
        <Pair label="Instagram" value={signup.socials} />
        <Pair label="Contact" value={signup.contact_preference} />
        <Pair label="Age" value={String(signup.age)} />
        <Pair
          label="Gender"
          value={
            signup.gender_other
              ? `${signup.gender}: ${signup.gender_other}`
              : signup.gender
          }
        />
        <Pair label="Wants to meet" value={signup.meet_genders.join(', ')} />
        <Pair label="Year" value={signup.year_level} />
        <Pair label="Leaves from" value={signup.departure_area} />
        <Pair label="Max travel" value={signup.max_travel} />
        <Pair label="Nearby school" value={yesNo(signup.nearby_school_ok)} />
        <Pair label="Dealbreakers" value={signup.dealbreakers} />
        <Pair label="About" value={signup.about_you} />
        <Pair label="Cafes" value={signup.preferred_cafes} />
        <Pair label="Refuse areas" value={signup.refuse_areas} />
        <Pair label="Covers own order" value={yesNo(signup.cover_own_order)} />
        <Pair label="Access" value={signup.accessibility} />
        <Pair label="Schedule" value={signup.schedule} />
        <Pair label="Hard nos" value={signup.hard_nos} />
        <Pair label="Heard via" value={signup.how_heard} />
      </dl>

      <form action={updateSignup} className="flex max-w-lg flex-col gap-4">
        <input type="hidden" name="id" value={signup.id} />
        <SelectField
          label="Status"
          name="status"
          defaultValue={signup.status}
          options={SIGNUP_STATUSES.map((value) => ({
            value,
            label: SIGNUP_STATUS_LABEL[value],
          }))}
        />
        <AreaField
          label="Reviewer notes"
          name="reviewer_notes"
          defaultValue={signup.reviewer_notes ?? ''}
        />
        <PrimaryButton>Save review</PrimaryButton>
      </form>

      <p>
        <Link
          href={`/matches/new?a=${signup.id}`}
          className="text-accent underline decoration-2 underline-offset-4"
        >
          Start a match with this person
        </Link>
      </p>
    </Shell>
  )
}
