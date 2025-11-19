import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    githubGraphQLClient.setToken(session.accessToken);

    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get("language");

    const recommendations = await githubGraphQLClient.getTrendingRepositories(language, 10);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
