import { NextRequest, NextResponse } from "next/server";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
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

    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    const userAnalytics = await githubGraphQLClient.getUserAnalytics(username);

    if (!userAnalytics) {
      return NextResponse.json(
        { error: "User not found or data could not be retrieved" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      username,
      data: userAnalytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("User API error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
