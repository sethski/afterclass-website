import { signIn } from '@/app/actions/auth'
import { firstString } from '@/lib/urls'

export const metadata = { title: 'Sign in' }

const ERRORS = {
  invalid: 'Password did not match.',
  config: 'The ops password is not set yet.',
} as const

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const code = firstString(params.error)
  const message =
    code && code in ERRORS ? ERRORS[code as keyof typeof ERRORS] : undefined

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center gap-8 px-4">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        After Class ops
      </h1>
      <form action={signIn} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-muted">Password</span>
          <input
            className="rounded-xl border border-line bg-bg px-3 py-2"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>
        {message ? <p className="text-danger">{message}</p> : null}
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}
