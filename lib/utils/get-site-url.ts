export function getMarketingUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export function getWaitlistUrl(): string {
  return process.env.NEXT_PUBLIC_WAITLIST_URL ?? 'http://join.localhost:3000'
}

export function getJoinWaitlistHref(): string {
  return getWaitlistUrl()
}
