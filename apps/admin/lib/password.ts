import { timingSafeEqual } from 'node:crypto'

export function adminPasswordMatches(input: string): boolean {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD ?? ''
  if (!expected || !input) return false
  const left = Buffer.from(input)
  const right = Buffer.from(expected)
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}
