import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const parts = q.split('/');
    if (parts.length !== 2) {
        return NextResponse.json({ error: "Invalid format. Use owner/repo" }, { status: 400 });
    }

    const [owner, name] = parts;
    const token = process.env.GITHUB_TOKEN;

    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
    };

    if (token) {
        headers.Authorization = `token ${token}`;
    }

    try {
        const [repoRes, langsRes, commitsRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${name}`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${name}/languages`, { headers }),
            fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=30`, { headers })
        ]);

        if (!repoRes.ok) {
            const errorText = await repoRes.text();
            return NextResponse.json(
                { error: `Repository fetch failed: ${repoRes.status} ${errorText}` },
                { status: repoRes.status }
            );
        }

        const repoData = await repoRes.json();
        const langsData = langsRes.ok ? await langsRes.json() : {};
        const commitsData = commitsRes.ok ? await commitsRes.json() : [];

        return NextResponse.json({
            repoData,
            langsData,
            commitsData
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
