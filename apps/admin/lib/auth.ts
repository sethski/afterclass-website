import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE,
  verifyAdminSession,
} from '@/lib/session'

export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  if (!(await verifyAdminSession(token, secret))) {
    redirect('/login')
  }
}
