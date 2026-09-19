const MANILA = 'Asia/Manila'

export function formatManila(iso: string | null | undefined): string {
  if (!iso) return 'Not set'
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: MANILA,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function yesNo(value: boolean | null | undefined): string {
  if (value == null) return 'Not answered'
  return value ? 'Yes' : 'No'
}

export function labelFor(map: Record<string, string>, value: string): string {
  return map[value] ?? value
}
