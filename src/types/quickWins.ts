export interface GitHubIssue {
  id: number;
  title: string;
  repository: string;
  repositoryUrl: string;
  url: string;
  labels: GitHubLabel[];
  created_at: string;
  updated_at: string;
  difficulty: "easy" | "medium";
  language: string | null;
  stars: number;
  author: {
    login: string;
    avatar_url: string;
  };
  comments: number;
  state: "open" | "closed";
  assignee?: {
    login: string;
    avatar_url: string;
  } | null;
  priority: "low" | "medium" | "high";
}

export interface QuickWinsState {
  goodIssues: GitHubIssue[];
  easyFixes: GitHubIssue[];
  loading: {
    goodIssues: boolean;
    easyFixes: boolean;
  };
  errors: {
    goodIssues: string | null;
    easyFixes: string | null;
  };
  fetchGoodIssues: () => void;
  fetchEasyFixes: () => void;
}

interface GitHubLabel {
  name: string;
  color: string;
}
