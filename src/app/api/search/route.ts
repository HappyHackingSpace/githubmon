import { NextRequest, NextResponse } from "next/server";
import { githubAPIClient } from "@/lib/api/github-api-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "repos";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    let results;
    if (type === "users") {
      results = await githubAPIClient.searchUsers(query, "all", limit);
    } else {
      results = await githubAPIClient.searchRepositories(query, "stars", limit);
    }

    return NextResponse.json({
      query,
      type,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type = "repos", limit = 20 } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required in request body" },
        { status: 400 }
      );
    }

    let results;
    if (type === "users") {
      results = await githubAPIClient.searchUsers(query, "all", limit);
    } else {
      results = await githubAPIClient.searchRepositories(query, "stars", limit);
    }

    return NextResponse.json({
      query,
      type,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
