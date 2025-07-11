// Test script for trending repositories API
import { ossInsightClient } from '../src/lib/api/oss-insight-client'

async function testTrendingRepos() {
    console.log('Testing trending repositories API...')

    try {
        const repos = await ossInsightClient.getTrendingRepos('7d', 5)
        console.log(`Successfully fetched ${repos.length} repositories:`)

        repos.forEach((repo, index) => {
            console.log(`${index + 1}. ${repo.full_name} (${repo.stargazers_count} stars)`)
            console.log(`   Description: ${repo.description}`)
            console.log(`   Language: ${repo.language}`)
            console.log(`   URL: ${repo.html_url}`)
            console.log('')
        })

        if (repos.length === 0) {
            console.log('⚠️  No repositories were returned')
        } else {
            console.log('✅ API is working correctly!')
        }

    } catch (error) {
        console.error('❌ Error testing API:', error)
    }
}

testTrendingRepos()
