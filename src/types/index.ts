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
  CacheConfig,
} from "./oss-insight";

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
  RetryConfig,
} from "./api";

export type { OrgData } from "./auth";

export type {
  GitHubRepo,
  GitHubUser as GitHubUserLegacy,
  GitHubCommit,
  ContributorWithRepos,
  GitHubIssue,
  UserContributions,
  UserScore,
  UserScoreCacheEntry,
} from "./github";

export type {
  SearchResultType,
  BaseSearchResult,
  RepositorySearchResult,
  UserSearchResult,
  OrganizationSearchResult,
  UnifiedSearchResult,
} from "./search";

export {
  isRepositoryResult,
  isUserResult,
  isOrganizationResult,
  convertRepoToUnified,
  convertUserToUnified,
  detectSearchResultType,
} from "./search";

export type ValueOf<T> = T[keyof T];
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventHandler<T = void> = (data: T) => void | Promise<void>;
export type AsyncEventHandler<T = void> = (data: T) => Promise<void>;

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface DataState<T> extends LoadingState {
  data: T | null;
}

export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export type Theme = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: "light" | "dark";
}

export interface FeatureFlags {
  enableAdvancedSearch: boolean;
  enableRealTimeUpdates: boolean;
  enableExperimentalFeatures: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  page: (name: string, properties?: Record<string, unknown>) => void;
}

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export * from "./oss-insight";
export * from "./api";
