import { describe, it, expect } from 'vitest'
import { contactSchema } from '@/lib/validations/contact'

describe('contactSchema', () => {
  it('rejects short messages', () => {
    const result = contactSchema.safeParse({
      name: 'Alex',
      email: 'alex@test.com',
      subject: 'Hello',
      message: 'Hi',
    })
    expect(result.success).toBe(false)
  })
})
