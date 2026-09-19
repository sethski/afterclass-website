import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/testrun' || pathname === '/test-run' || pathname === '/TestRun') {
    const url = request.nextUrl.clone()
    url.pathname = '/enlistment'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/testrun', '/test-run', '/TestRun'],
}
