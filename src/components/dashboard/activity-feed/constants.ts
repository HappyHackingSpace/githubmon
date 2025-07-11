// src/components/dashboard/activity-feed/constants.ts
import type { TechContext } from './types'

export const TECH_CONTEXTS: Record<string, TechContext> = {
    'ai-ml': {
        technology: ['Python', 'Jupyter Notebook', 'TensorFlow', 'PyTorch'],
        domain: 'AI/ML',
        iconColor: 'text-purple-600',
        keywords: ['machine-learning', 'ai', 'neural', 'deep-learning', 'model', 'dataset', 'tensorflow', 'pytorch']
    },
    'web-frontend': {
        technology: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'HTML', 'CSS'],
        domain: 'Web Frontend',
        iconColor: 'text-blue-600',
        keywords: ['frontend', 'react', 'vue', 'angular', 'component', 'ui', 'interface']
    },
    'web-backend': {
        technology: ['Node.js', 'Python', 'Java', 'Go', 'PHP', 'Ruby'],
        domain: 'Web Backend',
        iconColor: 'text-green-600',
        keywords: ['backend', 'api', 'server', 'database', 'microservice', 'express', 'fastapi']
    },
    'devops': {
        technology: ['Docker', 'Kubernetes', 'Shell', 'YAML', 'Terraform'],
        domain: 'DevOps',
        iconColor: 'text-orange-600',
        keywords: ['docker', 'kubernetes', 'ci-cd', 'deployment', 'infrastructure', 'cloud']
    },
    'mobile': {
        technology: ['Swift', 'Kotlin', 'Flutter', 'React Native'],
        domain: 'Mobile',
        iconColor: 'text-indigo-600',
        keywords: ['mobile', 'ios', 'android', 'flutter', 'react-native', 'app']
    },
    'blockchain': {
        technology: ['Solidity', 'Web3', 'Rust'],
        domain: 'Blockchain',
        iconColor: 'text-yellow-600',
        keywords: ['blockchain', 'crypto', 'web3', 'solidity', 'ethereum', 'smart-contract']
    }
}
