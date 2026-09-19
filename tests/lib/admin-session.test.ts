import { describe, expect, it } from 'vitest'
import {
  signAdminSession,
  verifyAdminSession,
} from '../../apps/admin/lib/session'

describe('admin session cookie', () => {
  const secret = 'test-session-secret-value'

  it('accepts a token it just signed', async () => {
    const token = await signAdminSession(secret, 1_000)
    expect(await verifyAdminSession(token, secret, 1_000)).toBe(true)
  })

  it('rejects a truncated token and a wrong secret', async () => {
    const token = await signAdminSession(secret, 1_000)
    expect(await verifyAdminSession(token.slice(0, 8), secret, 1_000)).toBe(false)
    expect(await verifyAdminSession(token, 'other-secret', 1_000)).toBe(false)
  })

  it('rejects an expired token', async () => {
    const token = await signAdminSession(secret, 1_000)
    expect(await verifyAdminSession(token, secret, 1_000 + 8 * 24 * 60 * 60 * 1000)).toBe(
      false
    )
  })
})
