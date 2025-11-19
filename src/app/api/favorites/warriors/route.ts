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

    const warriors = await githubGraphQLClient.getTopContributors(10);

    return NextResponse.json(warriors);
  } catch (error) {
    console.error("Failed to fetch top contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch top contributors" },
      { status: 500 }
    );
  }
}
