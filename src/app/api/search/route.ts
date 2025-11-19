import { NextRequest, NextResponse } from "next/server";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";

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

    githubGraphQLClient.setToken(authData.orgData.token);

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
      results = await githubGraphQLClient.searchUsers(query, "all", limit);
    } else {
      results = await githubGraphQLClient.searchRepositories(query, "STARS", limit);
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

    githubGraphQLClient.setToken(authData.orgData.token);

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
      results = await githubGraphQLClient.searchUsers(query, "all", limit);
    } else {
      results = await githubGraphQLClient.searchRepositories(query, "STARS", limit);
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
