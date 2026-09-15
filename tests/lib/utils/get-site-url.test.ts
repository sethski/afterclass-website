import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getMarketingUrl, getWaitlistUrl } from '@/lib/utils/get-site-url'

describe('get-site-url', () => {
  const original = process.env

  beforeEach(() => {
    process.env = {
      ...original,
      NEXT_PUBLIC_SITE_URL: 'https://afterclassapp.com',
      NEXT_PUBLIC_WAITLIST_URL: 'https://join.afterclassapp.com',
    }
  })

  afterEach(() => {
    process.env = original
  })

  it('returns marketing URL', () => {
    expect(getMarketingUrl()).toBe('https://afterclassapp.com')
  })

  it('returns waitlist URL', () => {
    expect(getWaitlistUrl()).toBe('https://join.afterclassapp.com')
  })
})
