export function publicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    ''
  )
}

export function feedbackUrl(token: string): string {
  return `${publicSiteUrl()}/feedback/${token}`
}

export function firstString(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}
