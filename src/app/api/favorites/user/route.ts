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
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const metrics = await githubGraphQLClient.getUserMetrics(username);

    if (!metrics) {
      return NextResponse.json(
        { error: "User not found or data could not be retrieved" },
        { status: 404 }
      );
    }

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
