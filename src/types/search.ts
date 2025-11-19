import type { TrendingRepo, TopContributor } from "./oss-insight";

export type SearchResultType = "repository" | "user" | "organization";

export interface BaseSearchResult {
  resultType: SearchResultType;
  id: string | number;
  name: string;
  avatarUrl: string;
  htmlUrl: string;
  description: string | null;
}

export interface RepositorySearchResult extends BaseSearchResult {
  resultType: "repository";
  fullName: string;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  topics: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  owner: {
    login: string;
    avatarUrl: string;
    type: string;
  };
  contributionScore?: number;
  goodFirstIssues?: number;
  stalePRs?: number;
  maintainerActivity?: number;
}

export interface UserSearchResult extends BaseSearchResult {
  resultType: "user";
  login: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  languages: string[];
  topRepositories?: Array<{
    name: string;
    stars: number;
    language: string | null;
  }>;
  contributionScore?: number;
  openSourceScore?: {
    total: number;
    commits: number;
    prs: number;
    issues: number;
  };
}

export interface OrganizationSearchResult extends BaseSearchResult {
  resultType: "organization";
  login: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  publicRepos: number;
  followers: number;
  topProjects?: Array<{
    name: string;
    stars: number;
    language: string | null;
    openIssues: number;
  }>;
  helpWantedIssues?: Array<{
    id: number;
    title: string;
    repo: string;
    url: string;
    labels: string[];
    createdAt: string;
  }>;
  totalHelpWantedCount?: number;
  projectClusters?: Array<{
    language: string;
    repoCount: number;
    totalStars: number;
  }>;
}

export type UnifiedSearchResult =
  | RepositorySearchResult
  | UserSearchResult
  | OrganizationSearchResult;

export function isRepositoryResult(
  result: UnifiedSearchResult
): result is RepositorySearchResult {
  return result.resultType === "repository";
}

export function isUserResult(
  result: UnifiedSearchResult
): result is UserSearchResult {
  return result.resultType === "user";
}

export function isOrganizationResult(
  result: UnifiedSearchResult
): result is OrganizationSearchResult {
  return result.resultType === "organization";
}

export function convertRepoToUnified(
  repo: TrendingRepo
): RepositorySearchResult {
  return {
    resultType: "repository",
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    avatarUrl: repo.owner.avatar_url,
    htmlUrl: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    watchers: repo.watchers_count,
    topics: repo.topics || [],
    archived: repo.archived,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    owner: {
      login: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
      type: repo.owner.type,
    },
  };
}

export function convertUserToUnified(
  user: TopContributor
): UserSearchResult | OrganizationSearchResult {
  const baseData = {
    id: user.login,
    name: user.name || user.login,
    login: user.login,
    avatarUrl: user.avatar_url,
    htmlUrl: user.html_url,
    description: user.bio || null,
    bio: user.bio || null,
    location: user.location || null,
    company: user.company || null,
    blog: user.blog || null,
    publicRepos: user.repos_count,
    followers: user.followers_count,
    languages: user.languages || [],
  };

  if (user.type === "Organization") {
    return {
      ...baseData,
      resultType: "organization",
    };
  }

  return {
    ...baseData,
    resultType: "user",
    following: 0,
  };
}

export function detectSearchResultType(
  query: string,
  results: {
    repos: TrendingRepo[];
    users: TopContributor[];
  }
): SearchResultType | null {
  if (results.repos.length > 0 && results.users.length === 0) {
    return "repository";
  }

  if (results.users.length > 0 && results.repos.length === 0) {
    const firstUser = results.users[0];
    return firstUser.type === "Organization" ? "organization" : "user";
  }

  if (results.users.length === 1 && results.users[0].login.toLowerCase() === query.toLowerCase()) {
    const user = results.users[0];
    return user.type === "Organization" ? "organization" : "user";
  }

  if (results.repos.length === 1 && results.repos[0].full_name.toLowerCase().includes(query.toLowerCase())) {
    return "repository";
  }

  return null;
}
