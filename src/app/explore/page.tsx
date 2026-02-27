"use client";

import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { GitFork, Star, Eye, Activity, GitCommit, Users, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

interface ExploreData {
    repository: {
        stargazerCount: number;
        forkCount: number;
        watchers: { totalCount: number };
        issues: { totalCount: number };
        pullRequests: { totalCount: number };
        commitComments: { totalCount: number };
    };
    score: number;
    languages: Array<{ name: string; value: number }>;
    commitHistory: Array<{ date: string; commits: number }>;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export default function ExplorePage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "facebook/react";
    const [data, setData] = useState<ExploreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Since this can be a user/repo format, we extract owner/name
                const parts = query.split('/');
                if (parts.length !== 2) throw new Error("Please search in 'owner/repo' format");
                const [owner, name] = parts;

                const graphqlQuery = `
            query ($owner: String!, $name: String!) {
              repository(owner: $owner, name: $name) {
                stargazerCount
                forkCount
                watchers { totalCount }
                issues(states: OPEN) { totalCount }
                pullRequests(states: MERGED) { totalCount }
                commitComments { totalCount }
                languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                  edges {
                    size
                    node { name }
                  }
                  totalSize
                }
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(first: 30) {
                        nodes {
                          committedDate
                        }
                      }
                    }
                  }
                }
              }
            }
          `;

                // Call our internal proxy route to avoid CORS and inject server-side GITHUB_TOKEN
                const response = await fetch(`/api/explore?q=${encodeURIComponent(query)}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Repository not found or rate limited");
                }

                const { repoData, langsData, commitsData } = result;

                // Process Languages
                const totalSize = Object.values(langsData).reduce((a: any, b: any) => a + b, 0) as number || 1;
                const languages = Object.entries(langsData).map(([name, size]: [string, any]) => ({
                    name,
                    value: Math.round((size / totalSize) * 100)
                })).slice(0, 5);

                // Process Commits & History Timeline (mocking daily bins from recent 30 commits)
                const historyMap: Record<string, number> = {};
                commitsData.forEach((c: any) => {
                    const date = new Date(c.commit.author.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    historyMap[date] = (historyMap[date] || 0) + 1;
                });
                const commitHistory = Object.entries(historyMap).map(([date, commits]) => ({ date, commits })).reverse();

                // Calculate "OSS Score" based on userScores.ts logic (commits * 2 + prs * 5 + stars)
                // We'll adapt it for a repo: (forks * 5) + (open_issues * 2) + stars
                const score = (repoData.forks_count * 5) + (repoData.open_issues_count * 2) + repoData.stargazers_count;

                setData({
                    repository: {
                        stargazerCount: repoData.stargazers_count,
                        forkCount: repoData.forks_count,
                        watchers: { totalCount: repoData.subscribers_count || repoData.watchers_count },
                        issues: { totalCount: repoData.open_issues_count },
                        pullRequests: { totalCount: Math.floor(repoData.forks_count * 0.4) }, // Approximation for rest API
                        commitComments: { totalCount: 0 }
                    },
                    score,
                    languages,
                    commitHistory
                });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (query) fetchData();
    }, [query]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <AnimatedBackground />
                <Header />
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Analyzing open source data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <AnimatedBackground />
                <Header />
                <div className="p-6 rounded-3xl glass-card border border-destructive/50 text-center">
                    <h2 className="text-xl font-bold text-destructive mb-2">Analysis Failed</h2>
                    <p className="text-muted-foreground">{error || "Unable to fetch data"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30 overflow-hidden text-foreground">
            <AnimatedBackground />
            <Header />

            <main className="pt-36 pb-20 px-6 max-w-6xl mx-auto relative z-10 space-y-12">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 backdrop-blur-md">
                            <Activity className="w-4 h-4" />
                            Live Insights
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            Analytics for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">{query}</span>
                        </h1>
                    </div>

                    {/* OSS Score Badge */}
                    <div className="p-4 rounded-2xl glass-card border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.15)] flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">OSS Impact Score</span>
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{data.score.toLocaleString()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Stars", value: data.repository.stargazerCount.toLocaleString(), icon: <Star className="w-5 h-5 text-yellow-500" /> },
                        { label: "Forks", value: data.repository.forkCount.toLocaleString(), icon: <GitFork className="w-5 h-5 text-blue-500" /> },
                        { label: "Watchers", value: data.repository.watchers.totalCount.toLocaleString(), icon: <Eye className="w-5 h-5 text-purple-500" /> },
                        { label: "Open Issues", value: data.repository.issues.totalCount.toLocaleString(), icon: <Activity className="w-5 h-5 text-emerald-500" /> },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-3xl glass-card backdrop-blur-md border border-border/50 hover:border-primary/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-muted/50 rounded-2xl group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-3xl font-black">{stat.value}</div>
                            <div className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Commit History Line Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 p-8 rounded-3xl glass-card backdrop-blur-md border border-border/50 min-h-[400px] flex flex-col relative overflow-hidden group"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><GitCommit className="w-5 h-5 text-primary" /> Recent Commit Activity</h3>
                        <div className="flex-1 w-full h-full min-h-[300px]">
                            {data.commitHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.commitHistory}>
                                        <defs>
                                            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                        <Area type="monotone" dataKey="commits" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCommits)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">No recent commit data available.</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Language Distribution Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="p-8 rounded-3xl glass-card backdrop-blur-md border border-border/50 min-h-[400px] flex flex-col relative group"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Language Distribution</h3>
                        <div className="flex-1 w-full flex items-center justify-center">
                            {data.languages.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={data.languages}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.languages.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => `${value}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-muted-foreground">No language data</div>
                            )}
                        </div>
                        <div className="mt-4 space-y-2">
                            {data.languages.map((lang, idx) => (
                                <div key={lang.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="font-medium">{lang.name}</span>
                                    </div>
                                    <span className="text-muted-foreground">{lang.value}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </main>
        </div>
    );
}
