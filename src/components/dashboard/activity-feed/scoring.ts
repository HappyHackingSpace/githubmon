// src/components/dashboard/activity-feed/scoring.ts
import type { GitHubEvent } from '@/types/oss-insight'

// High importance event detection rules
export const calculateEventImportance = (event: GitHubEvent): { importance: 'high' | 'medium' | 'low', score: number } => {
    let score = 0
    let importance: 'high' | 'medium' | 'low' = 'low'

    // HIGH IMPORTANCE RULES

    // Major releases (version patterns)
    if (event.type === 'CreateEvent' && event.payload.ref_type === 'tag') {
        const tag = event.payload.ref || ''
        if (/v?\d+\.\d+\.0$/.test(tag) || /v?\d+\.0\.0$/.test(tag)) {
            score += 100 // Major version release
            importance = 'high'
        }
    }

    // Release events are always important
    if (event.type === 'ReleaseEvent') {
        score += 90
        importance = 'high'
    }

    // Viral repos detection (heuristic based on repo name patterns)
    if (event.type === 'WatchEvent' || event.type === 'ForkEvent') {
        const repoName = event.repo.name.toLowerCase()
        const viralKeywords = ['ai', 'gpt', 'llm', 'react', 'next', 'vue', 'svelte', 'rust', 'go']
        const hasViralKeyword = viralKeywords.some(keyword => repoName.includes(keyword))

        if (hasViralKeyword) {
            score += 70
            importance = 'high'
        }
    }

    // MEDIUM IMPORTANCE RULES

    // Merged pull requests
    if (event.type === 'PullRequestEvent' && event.payload.action === 'closed') {
        const pr = event.payload.pull_request
        if (pr && pr.merged_at) {
            score += 60
            importance = 'medium'
        }
    }

    // New repositories from known organizations
    if (event.type === 'CreateEvent' && event.payload.ref_type === 'repository') {
        const knownOrgs = ['microsoft', 'google', 'facebook', 'vercel', 'github', 'openai', 'huggingface']
        const orgName = event.repo.name.split('/')[0].toLowerCase()

        if (knownOrgs.includes(orgName)) {
            score += 50
            importance = 'medium'
        }
    }

    // Issues with security/breaking labels (heuristic)
    if (event.type === 'IssuesEvent' && event.payload.action === 'opened') {
        const issue = event.payload.issue
        if (issue) {
            const title = issue.title.toLowerCase()
            const body = (issue.body || '').toLowerCase()
            const securityKeywords = ['security', 'vulnerability', 'cve', 'breaking', 'deprecated']

            if (securityKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
                score += 80
                importance = 'high'
            }
        }
    }

    // Fork events (community interest indicator)
    if (event.type === 'ForkEvent') {
        score += 30
        if (importance === 'low') importance = 'medium'
    }

    // LOW IMPORTANCE (default)
    // Regular push events, watch events without viral indicators
    if (event.type === 'PushEvent') {
        const commitCount = event.payload.size || 0
        if (commitCount > 5) {
            score += 20 // Large commit batch
        } else {
            score += 5 // Regular commits
        }
    }

    return { importance, score }
}
