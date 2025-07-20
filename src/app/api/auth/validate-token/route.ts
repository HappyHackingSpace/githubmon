import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Validate token with GitHub API
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHubMon-App'
      }
    })

    if (response.ok) {
      const userData = await response.json()
      return NextResponse.json({
        valid: true,
        user: {
          login: userData.login,
          id: userData.id,
          avatar_url: userData.avatar_url
        }
      })
    } else {
      let errorMessage = 'Invalid token'
      
      if (response.status === 401) {
        errorMessage = 'Token has expired or is invalid'
      } else if (response.status === 403) {
        errorMessage = 'Token does not have required permissions'
      }

      return NextResponse.json(
        { valid: false, error: errorMessage },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}
