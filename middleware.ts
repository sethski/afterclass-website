import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/testrun' || pathname === '/test-run') {
    const url = request.nextUrl.clone()
    url.pathname = '/TestRun'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/testrun', '/test-run'],
}
