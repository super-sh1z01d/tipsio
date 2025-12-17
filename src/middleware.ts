import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  // Admin routes - only ADMIN role
  '/admin': ['ADMIN'],
  '/api/admin': ['ADMIN'],
  
  // Venue routes - MANAGER and ADMIN
  '/venue/dashboard': ['MANAGER', 'ADMIN'],
  '/venue/staff': ['MANAGER', 'ADMIN'],
  '/venue/qr-codes': ['MANAGER', 'ADMIN'],
  '/venue/payouts': ['MANAGER', 'ADMIN'],
  '/venue/settings': ['MANAGER', 'ADMIN'],
  '/venue/menu': ['MANAGER', 'ADMIN'],
  '/api/venues': ['MANAGER', 'ADMIN'],
  '/api/venue': ['MANAGER', 'ADMIN'],
  '/api/staff': ['MANAGER', 'ADMIN'],
  '/api/qr': ['MANAGER', 'ADMIN'],
  '/api/payouts': ['MANAGER', 'ADMIN'],
  
  // Staff routes - STAFF, MANAGER, and ADMIN
  '/staff/dashboard': ['STAFF', 'MANAGER', 'ADMIN'],
  '/staff/history': ['STAFF', 'MANAGER', 'ADMIN'],
  '/api/staff/dashboard': ['STAFF', 'MANAGER', 'ADMIN'],
  '/api/staff/history': ['STAFF', 'MANAGER', 'ADMIN'],
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/venue/login',
  '/venue/register',
  '/venue/onboarding',
  '/staff/login',
  '/tip',
  '/api/auth',
  '/api/otp',
  '/api/tip',
  '/api/tips',
  '/api/webhook',
  '/api/dev',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Check if route is protected
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  )
  
  if (!matchedRoute) {
    return NextResponse.next()
  }
  
  // Get JWT token (works in Edge runtime)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  // No token - redirect to login
  if (!token) {
    const loginUrl = pathname.startsWith('/admin') || pathname.startsWith('/venue')
      ? '/venue/login'
      : '/staff/login'
    
    const url = new URL(loginUrl, request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  // Check role
  const userRole = token.role as string | undefined
  const allowedRoles = protectedRoutes[matchedRoute]
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Unauthorized - redirect to appropriate page
    if (userRole === 'STAFF') {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url))
    } else if (userRole === 'MANAGER') {
      return NextResponse.redirect(new URL('/venue/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
