import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const signedIn = await verifyAdminSession(token, secret)
  const onLogin = request.nextUrl.pathname === '/login'

  if (!signedIn && !onLogin) {
    const login = request.nextUrl.clone()
    login.pathname = '/login'
    return NextResponse.redirect(login)
  }

  if (signedIn && onLogin) {
    const home = request.nextUrl.clone()
    home.pathname = '/'
    return NextResponse.redirect(home)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
