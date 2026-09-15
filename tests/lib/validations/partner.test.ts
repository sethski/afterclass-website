import { describe, it, expect } from 'vitest'
import { partnerSchema } from '@/lib/validations/partner'

describe('partnerSchema', () => {
  it('accepts valid partner submission', () => {
    const result = partnerSchema.safeParse({
      businessName: 'Campus Coffee Co',
      location: 'Austin, TX',
      email: 'owner@coffee.com',
      message: 'Interested in partnering',
    })
    expect(result.success).toBe(true)
  })
})
