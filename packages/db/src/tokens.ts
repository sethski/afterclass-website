import { createHash, randomBytes } from 'node:crypto'

export const FEEDBACK_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function hashFeedbackToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function createFeedbackToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashFeedbackToken(token) }
}

export function feedbackExpiry(from = new Date()): Date {
  return new Date(from.getTime() + FEEDBACK_TOKEN_TTL_MS)
}
