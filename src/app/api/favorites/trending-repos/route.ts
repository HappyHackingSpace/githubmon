import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    githubGraphQLClient.setToken(session.accessToken);

    const trendingRepos = await githubGraphQLClient.getTrendingRepositories(null, 10);

    return NextResponse.json(trendingRepos);
  } catch (error) {
    console.error("Failed to fetch trending repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending repositories" },
      { status: 500 }
    );
  }
}
