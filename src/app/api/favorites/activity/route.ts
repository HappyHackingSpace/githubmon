import { NextRequest, NextResponse } from "next/server";
import { githubGraphQLClient } from "@/lib/api/github-graphql-client";

export async function POST(request: NextRequest) {
    try {
        const { repos, users, limit } = await request.json();

        const authCookie = request.cookies.get("githubmon-auth")?.value;
        if (authCookie) {
            try {
                const authData = JSON.parse(authCookie);
                if (authData.orgData?.token) {
                    githubGraphQLClient.setToken(authData.orgData.token);
                }
            } catch (e) {
                console.error("Failed to parse auth cookie in favorites activity:", e);
            }
        }

        const activity = await githubGraphQLClient.getFavoriteActivity(
            repos || [],
            users || [],
            limit || 10
        );

        return NextResponse.json(activity);
    } catch (error) {
        console.error("Favorites activity API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
