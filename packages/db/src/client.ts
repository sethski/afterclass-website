import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const TEST_RUN_BUCKET = 'test-run-private'

function serviceClient(url: string | undefined, key: string | undefined, label: string): SupabaseClient {
  if (!url || !key) {
    throw new Error(`Missing ${label} Supabase env vars`)
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Marketing / partner / contact. Do not use for Test Run. */
export function createServiceClient(): SupabaseClient {
  return serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    'marketing'
  )
}

/** Test Run signups, photos, matching, dates, feedback. Separate project from waitlist. */
export function createTestRunClient(): SupabaseClient {
  return serviceClient(
    process.env.TEST_RUN_SUPABASE_URL,
    process.env.TEST_RUN_SUPABASE_SERVICE_ROLE_KEY,
    'Test Run'
  )
}
