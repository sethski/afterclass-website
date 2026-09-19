'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminPasswordMatches } from '@/lib/password'
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  signAdminSession,
} from '@/lib/session'

export async function signIn(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  if (!process.env.ADMIN_DASHBOARD_PASSWORD || !secret) {
    redirect('/login?error=config')
  }
  if (!adminPasswordMatches(password)) {
    redirect('/login?error=invalid')
  }

  const token = await signAdminSession(secret)
  ;(await cookies()).set(ADMIN_COOKIE, token, adminCookieOptions())
  redirect('/')
}

export async function signOut() {
  ;(await cookies()).delete(ADMIN_COOKIE)
  redirect('/login')
}
