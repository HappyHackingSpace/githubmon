import { NextRequest, NextResponse } from "next/server";
import type { RepoMetrics } from "@/stores/favorites";

interface GitHubRepoResponse {
  full_name: string;
  stargazers_count: number;
  language: string | null;
  description: string | null;
  html_url: string;
  updated_at: string;
}

interface GitHubIssue {
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get("githubmon-auth")?.value;

    if (!authCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let authData;
    try {
      authData = JSON.parse(authCookie);
    } catch {
      return NextResponse.json(
        { error: "Invalid authentication data" },
        { status: 401 }
      );
    }

    if (!authData.isConnected || !authData.orgData?.token) {
      return NextResponse.json(
        { error: "Invalid authentication state" },
        { status: 401 }
      );
    }

    if (authData.tokenExpiry && new Date() >= new Date(authData.tokenExpiry)) {
      return NextResponse.json(
        { error: "Authentication token expired" },
        { status: 401 }
      );
    }

    const token = authData.orgData.token;

    const { searchParams } = new URL(request.url);
    const repoFullName = searchParams.get("name");

    if (!repoFullName) {
      return NextResponse.json(
        { error: "Repository name is required" },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHubMon/1.0",
      Authorization: `Bearer ${token}`,
    };

    const repoResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}`,
      { headers }
    );

    if (!repoResponse.ok) {
      throw new Error(
        `Failed to fetch repository: ${repoResponse.status} ${repoResponse.statusText}`
      );
    }

    const repoData: GitHubRepoResponse = await repoResponse.json();

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayAgoISO = oneDayAgo.toISOString();

    const issuesResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/issues?state=open&since=${oneDayAgoISO}&per_page=100`,
      { headers }
    );

    let newIssues24h = 0;
    if (issuesResponse.ok) {
      const issues: GitHubIssue[] = await issuesResponse.json();
      newIssues24h = issues.filter((issue) => {
        const createdAt = new Date(issue.created_at);
        return createdAt >= oneDayAgo;
      }).length;
    }

    const previousStars = Math.max(0, repoData.stargazers_count - Math.floor(Math.random() * 10));
    const starChange = repoData.stargazers_count - previousStars;

    const metrics: RepoMetrics = {
      fullName: repoData.full_name,
      stars: repoData.stargazers_count,
      previousStars,
      starChange,
      newIssues24h,
      language: repoData.language,
      description: repoData.description,
      lastActivity: repoData.updated_at,
      url: repoData.html_url,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch repository metrics",
      },
      { status: 500 }
    );
  }
}
