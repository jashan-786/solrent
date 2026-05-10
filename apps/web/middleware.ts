import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { isDevApiBypassAuthorized } from '@/lib/dev-api-auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const pathname = request.nextUrl.pathname

  const isApiRoute = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth');
  const isDevApiRoute = pathname.startsWith('/api/dev/')
  const devApiBypass = isDevApiRoute && isDevApiBypassAuthorized(request)

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || isApiRoute;

  if (!token && isApiRoute && isDevApiRoute && devApiBypass) {
    return NextResponse.next()
  }

  if (!token && isProtectedRoute) {
    if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    
    const payload = await verifyJWT(token)
    
    if (!payload && isProtectedRoute) {
      if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (payload && (pathname.startsWith('/admin') || pathname.startsWith('/api/landlord')) && payload.role !== 'LANDLORD') {
      if (isApiRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    if (payload && pathname.startsWith('/api/tenant') && payload.role !== 'TENANT') {
      if (isApiRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
}
