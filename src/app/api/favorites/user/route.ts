import { NextRequest, NextResponse } from "next/server";
import type { UserMetrics } from "@/stores/favorites";

interface GitHubUserResponse {
  login: string;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
}

interface GitHubRepoResponse {
  language: string | null;
}

interface GitHubEventResponse {
  type: string;
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
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHubMon/1.0",
      Authorization: `Bearer ${token}`,
    };

    const userResponse = await fetch(
      `https://api.github.com/users/${username}`,
      { headers }
    );

    if (!userResponse.ok) {
      throw new Error(
        `Failed to fetch user: ${userResponse.status} ${userResponse.statusText}`
      );
    }

    const userData: GitHubUserResponse = await userResponse.json();

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events?per_page=100`,
      { headers }
    );

    let recentActivity = 0;
    if (eventsResponse.ok) {
      const events: GitHubEventResponse[] = await eventsResponse.json();
      recentActivity = events.filter((event) => {
        const eventDate = new Date(event.created_at);
        return eventDate >= oneDayAgo;
      }).length;
    }

    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=30&sort=updated`,
      { headers }
    );

    const topLanguages: string[] = [];
    if (reposResponse.ok) {
      const repos: GitHubRepoResponse[] = await reposResponse.json();
      const languageCounts: Record<string, number> = {};

      repos.forEach((repo) => {
        if (repo.language) {
          languageCounts[repo.language] =
            (languageCounts[repo.language] || 0) + 1;
        }
      });

      const sortedLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang]) => lang)
        .slice(0, 3);

      topLanguages.push(...sortedLanguages);
    }

    const metrics: UserMetrics = {
      username: userData.login,
      avatarUrl: userData.avatar_url,
      recentActivity,
      topLanguages,
      reposCount: userData.public_repos,
      followers: userData.followers,
      bio: userData.bio,
      url: userData.html_url,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user metrics",
      },
      { status: 500 }
    );
  }
}
