// OSS Insight Types
export type {
  TrendingRepo,
  TopLanguage,
  GitHubEvent,
  TopContributor,
  HotCollection,
  RepoStats,
  FormattedTrendingRepo,
  FormattedLanguage,
  FormattedContributor,
  FormattedEvent,
  SearchFilters,
  SearchResult,
  APIResponse,
  OSSInsightSQLResponse,
  TrendingReposProps,
  TopLanguagesProps,
  PlatformStatsProps,
  SearchSectionProps,
  UseOSSInsightReturn,
  UseSearchReturn,
  TrendDirection,
  TimePeriod,
  SortOption,
  SearchType,
  APIError,
  CacheEntry,
  CacheConfig
} from './oss-insight'

// GitHub API Types
export type {
  GitHubUser,
  GitHubRepository,
  GitHubSearchResponse,
  GitHubRateLimit,
  GitHubRateLimitResponse,
  GitHubEventPayload,
  GitHubEvent as GitHubAPIEvent,
  GitHubAPIHeaders,
  GitHubResponseHeaders,
  GitHubClientConfig,
  OSSInsightClientConfig,
  APIClient,
  RequestConfig,
  APIResponse as GenericAPIResponse,
  APIError as GenericAPIError,
  PaginationParams,
  PaginatedResponse,
  CacheStrategy,
  MemoryCacheEntry,
  CacheStats,
  HTTPMethod,
  ResponseFormat,
  RetryConfig
} from './api'

// Auth Types (from existing)
export type {
  OrgData
} from './auth'

// GitHub Types (from existing) 
export type {
  GitHubRepo,
  GitHubUser as GitHubUserLegacy,
  GitHubCommit,
  ContributorWithRepos
} from './github'

// Issue Types (from existing)
export type {
  GitHubIssue
} from './github'

// Repository Types (from existing)
export type {
  // Add any existing repository types here
} from './repository'

// Contributor Types (from existing)
export type {
  // Add any existing contributor types here  
} from './contributor'

// Commit Types (from existing)
export type {
  // Add any existing commit types here
} from './commit'

// Common utility types
export type ValueOf<T> = T[keyof T]
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event handler types
export type EventHandler<T = void> = (data: T) => void | Promise<void>
export type AsyncEventHandler<T = void> = (data: T) => Promise<void>

// Component base types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface DataState<T> extends LoadingState {
  data: T | null
}

// Form types
export interface FormField<T = string> {
  value: T
  error?: string
  touched?: boolean
  required?: boolean
}

export interface FormState<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FormField<T[K]>
  }
  isValid: boolean
  isSubmitting: boolean
  errors: Partial<Record<keyof T, string>>
}

// Navigation types
export interface NavItem {
  href: string
  label: string
  icon?: string
  active?: boolean
  disabled?: boolean
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  systemTheme: 'light' | 'dark'
}

// Feature flags
export interface FeatureFlags {
  enableAdvancedSearch: boolean
  enableRealTimeUpdates: boolean
  enableExperimentalFeatures: boolean
  enableAnalytics: boolean
  enableNotifications: boolean
}

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: number
  userId?: string
  sessionId?: string
}

export interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => void
  identify: (userId: string, traits?: Record<string, any>) => void
  page: (name: string, properties?: Record<string, any>) => void
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Export everything for convenience
export * from './oss-insight'
export * from './api'