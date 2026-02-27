import { NextRequest, NextResponse } from "next/server";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";

export async function GET(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const { username } = params;

        if (!username) {
            return NextResponse.json(
                { error: "Username parameter is required" },
                { status: 400 }
            );
        }

        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            return NextResponse.json(
                { error: "GitHub token not configured on server" },
                { status: 500 }
            );
        }

        githubGraphQLClient.setToken(token);

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
        console.error("User Insights API error:", error);

        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
