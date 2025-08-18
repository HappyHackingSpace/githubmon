import { NextRequest, NextResponse } from 'next/server'
import { githubGraphQLClient } from '@/lib/api/github-graphql-client'

export async function GET(request: NextRequest) {
  try {
    // Get authentication data from cookie
    const authCookie = request.cookies.get('githubmon-auth')?.value
    
    if (!authCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let authData
    try {
      authData = JSON.parse(authCookie)
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 401 }
      )
    }

    if (!authData.isConnected || !authData.orgData?.username || !authData.orgData?.token) {
      return NextResponse.json(
        { error: 'Invalid authentication state' },
        { status: 401 }
      )
    }

    // Check if token is expired
    if (authData.tokenExpiry && new Date() >= new Date(authData.tokenExpiry)) {
      return NextResponse.json(
        { error: 'Authentication token expired' },
        { status: 401 }
      )
    }

    const username = authData.orgData.username
    const actionItems = await githubGraphQLClient.getActionRequiredItems(username)
    
    return NextResponse.json(actionItems)
  } catch (error) {
    console.error('Action Required API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}