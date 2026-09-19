import { describe, expect, it } from 'vitest'
import { createFeedbackToken, hashFeedbackToken } from '@afterclass/db'

describe('feedback tokens', () => {
  it('hashes to 64 hex chars', () => {
    const { token, hash } = createFeedbackToken()
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hashFeedbackToken(token)).toBe(hash)
    expect(token).not.toBe(hash)
  })

  it('creates a new token each call', () => {
    const a = createFeedbackToken()
    const b = createFeedbackToken()
    expect(a.token).not.toBe(b.token)
    expect(a.hash).not.toBe(b.hash)
  })
})
