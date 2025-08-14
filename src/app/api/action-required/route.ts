import { NextRequest, NextResponse } from 'next/server'
import { githubGraphQLClient } from '@/lib/api/github-graphql-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    if (!username) {
      return NextResponse.json( 
        { error: 'Username required' },
        { status: 400 }
      )
    }

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