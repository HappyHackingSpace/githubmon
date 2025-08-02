import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const authCookie = request.cookies.get('githubmon-auth')?.value

  let isAuthenticated = false

  if (authCookie) {
    try {
      const authData = JSON.parse(authCookie)

      const hasValidData = authData.isConnected &&
        authData.orgData &&
        authData.orgData.token &&
        authData.orgData.orgName

      if (hasValidData) {
        if (authData.tokenExpiry) {
          const expiryDate = new Date(authData.tokenExpiry)
          const now = new Date()

          const bufferTime = 24 * 60 * 60 * 1000 // 1 day in milliseconds
          const effectiveExpiry = new Date(expiryDate.getTime() - bufferTime)

          isAuthenticated = now <= effectiveExpiry
        } else {
          isAuthenticated = false
        }
      }
    } catch (error) {
      const response = NextResponse.next()
      response.cookies.set('githubmon-auth', '', {
        expires: new Date(0),
        path: '/'
      })
      isAuthenticated = false
    }
  }


  const publicRoutes = ['/login', '/register', '/about', '/search'] 

  const protectedRoutes = ['/dashboard', '/settings']
  
  const authRoutes = ['/auth/callback', '/api/auth']

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isAuthenticated && pathname === '/') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    redirectResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    redirectResponse.headers.set('Pragma', 'no-cache')
    redirectResponse.headers.set('Expires', '0')
    return redirectResponse
  }

  if (isAuthenticated && pathname === '/login') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    redirectResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    redirectResponse.headers.set('Pragma', 'no-cache')
    redirectResponse.headers.set('Expires', '0')
    return redirectResponse
  }

  if (!isAuthenticated && isProtectedRoute) {
    const rootUrl = new URL('/', request.url)

    const response = NextResponse.redirect(rootUrl)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    if (authCookie) {
      response.cookies.set('githubmon-auth', '', {
        expires: new Date(0),
        path: '/'
      })
    }
    return response
  }

  if (isAuthRoute) {
    return NextResponse.next()
  }

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
