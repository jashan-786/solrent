import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  // Check if it's an API route (excluding auth routes)
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin') || isApiRoute;

  // 1. If no token and trying to access protected paths
  if (!token && isProtectedRoute) {
    if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    // 2. Verify token validity
    const payload = await verifyJWT(token)
    
    if (!payload && isProtectedRoute) {
      if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Optional: Role-based access
    if (payload && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/landlord')) && payload.role !== 'LANDLORD') {
      if (isApiRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    if (payload && request.nextUrl.pathname.startsWith('/api/tenant') && payload.role !== 'TENANT') {
      if (isApiRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes run through middleware
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
}
