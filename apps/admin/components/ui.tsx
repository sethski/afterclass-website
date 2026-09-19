import { Nav } from '@/components/nav'

export function Shell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh]">
      <Nav />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {children}
      </main>
    </div>
  )
}

export function Banner({
  ok,
  error,
}: {
  ok?: string
  error?: string
}) {
  if (!ok && !error) return null
  return (
    <p
      role={error ? 'alert' : 'status'}
      className={error ? 'text-danger' : 'text-ok'}
    >
      {error ?? ok}
    </p>
  )
}

export function Field({
  label,
  name,
  children,
}: {
  label: string
  name?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1 text-[0.9375rem]">
      <span className="text-muted">{label}</span>
      {children}
      {name ? <span className="sr-only">{name}</span> : null}
    </label>
  )
}

const control =
  'rounded-xl border border-line bg-bg px-3 py-2 text-fg placeholder:text-muted'

export function TextField(props: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  type?: string
}) {
  return (
    <Field label={props.label}>
      <input
        className={control}
        name={props.name}
        type={props.type ?? 'text'}
        defaultValue={props.defaultValue}
        required={props.required}
      />
    </Field>
  )
}

export function AreaField(props: {
  label: string
  name: string
  defaultValue?: string
  rows?: number
}) {
  return (
    <Field label={props.label}>
      <textarea
        className={control}
        name={props.name}
        rows={props.rows ?? 4}
        defaultValue={props.defaultValue}
      />
    </Field>
  )
}

export function SelectField(props: {
  label: string
  name: string
  defaultValue?: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <Field label={props.label}>
      <select
        className={control}
        name={props.name}
        defaultValue={props.defaultValue}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function PrimaryButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode
  pendingLabel?: string
}) {
  return (
    <button
      type="submit"
      className="w-fit rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg hover:opacity-90"
    >
      {children}
      {pendingLabel ? <span className="sr-only">{pendingLabel}</span> : null}
    </button>
  )
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left text-[0.9375rem]">
        <thead>
          <tr className="border-b border-line text-muted">
            {headers.map((header) => (
              <th key={header} className="py-2 pr-4 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="max-w-prose text-muted">{children}</p>
}

export function Pair({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-b border-line py-2 text-[0.9375rem] sm:grid-cols-[10rem_1fr]">
      <dt className="text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap text-fg">{value || 'None'}</dd>
    </div>
  )
}
