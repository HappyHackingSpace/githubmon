import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )

    // Clear auth cookie
    response.cookies.set('githubmon-auth', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false, // We need client-side access for this cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    // Clear any other auth-related cookies if they exist
    response.cookies.set('auth-token', '', {
      expires: new Date(0),
      path: '/'
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
