import { NextRequest, NextResponse } from 'next/server'
import { githubAPIClient } from '@/lib/api/github-api-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // Next.js 15'te params bir Promise döndürüyor
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      )
    }

    const userAnalytics = await githubAPIClient.getUserAnalytics(username)

    if (!userAnalytics) {
      return NextResponse.json(
        { error: 'User not found or data could not be retrieved' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      username,
      data: userAnalytics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('User API error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}