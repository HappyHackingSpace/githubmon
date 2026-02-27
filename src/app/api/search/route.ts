import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    // Determine if it's a specific user/repo search or a general search
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=5`;
    const userSearchUrl = `https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=3`;

    const [repoRes, userRes] = await Promise.all([
      fetch(searchUrl, { headers }),
      fetch(userSearchUrl, { headers })
    ]);

    if (!repoRes.ok && repoRes.status === 403) {
      throw new Error("GitHub API rate limit exceeded");
    }

    const repoData = repoRes.ok ? await repoRes.json() : { items: [] };
    const userData = userRes.ok ? await userRes.json() : { items: [] };

    // Combine results and format them
    const suggestions = [
      ...(userData.items || []).map((item: any) => ({
        name: item.login,
        type: "User",
        avatar: item.avatar_url
      })),
      ...(repoData.items || []).map((item: any) => ({
        name: item.full_name,
        type: "Repository"
      }))
    ];

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

