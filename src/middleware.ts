import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user has auth token from the auth cookie
  const authCookie = request.cookies.get('githubmon-auth')?.value
  
  let isAuthenticated = false
  
  if (authCookie) {
    try {
      const authData = JSON.parse(authCookie)
      // Check if user is connected and has valid token data
      const hasValidData = authData.isConnected && 
                          authData.orgData && 
                          authData.orgData.token &&
                          authData.orgData.orgName
      
      if (hasValidData) {
        // Check if token is not expired based on our local expiry
        if (authData.tokenExpiry) {
          const expiryDate = new Date(authData.tokenExpiry)
          const now = new Date()
          
          // Add a buffer of 1 day before actual expiry for safety
          const bufferTime = 24 * 60 * 60 * 1000 // 1 day in milliseconds
          const effectiveExpiry = new Date(expiryDate.getTime() - bufferTime)
          
          isAuthenticated = now <= effectiveExpiry
        } else {
          // If no expiry date, consider it expired for security
          isAuthenticated = false
        }
      }
    } catch (error) {
      // Invalid cookie format - clear it
      const response = NextResponse.next()
      response.cookies.set('githubmon-auth', '', {
        expires: new Date(0),
        path: '/'
      })
      isAuthenticated = false
    }
  }
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/about'] // Ana sayfa authenticated kullanıcılar için kapalı
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/search', '/settings']
  
  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // If user is authenticated and tries to access login page, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    // Prevent caching to ensure proper redirect behavior
    redirectResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    redirectResponse.headers.set('Pragma', 'no-cache')
    redirectResponse.headers.set('Expires', '0')
    return redirectResponse
  }
  
  // If user is authenticated and tries to access root page, redirect to dashboard
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If user is not authenticated and tries to access protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    // Optionally, add the intended destination as a query parameter
    loginUrl.searchParams.set('from', pathname)
    
    const response = NextResponse.redirect(loginUrl)
    // Prevent caching to ensure proper redirect behavior
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Clear any invalid/expired auth cookies
    if (authCookie) {
      response.cookies.set('githubmon-auth', '', {
        expires: new Date(0),
        path: '/'
      })
    }
    return response
  }
  
  // Allow access to public routes and static assets
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
