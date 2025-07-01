export const ROUTES = {
  DASHBOARD: '/dashboard',
  REPOSITORIES: '/repositories',
  CONTRIBUTORS: '/contributors',
  COMMITS: '/commits',
  ISSUES: '/issues',
  SETTINGS: '/settings'
} as const

export const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, icon: 'chart-bar', label: 'Genel Bakış' },
  { href: ROUTES.REPOSITORIES, icon: 'code-branch', label: 'Repolar' },
  { href: ROUTES.CONTRIBUTORS, icon: 'users', label: 'Katkıda Bulunanlar' },
  { href: ROUTES.COMMITS, icon: 'history', label: 'Commit Geçmişi' },
  { href: ROUTES.ISSUES, icon: 'exclamation-circle', label: 'Issues & PR\'lar' }
] as const