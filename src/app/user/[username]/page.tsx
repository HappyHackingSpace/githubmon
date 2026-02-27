"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import {
    Activity,
    Star,
    Users,
    GitCommit,
    GitPullRequest,
    Code,
    MessageSquare,
    ArrowUpRight,
    Loader2,
    Calendar,
    MapPin,
    Building,
    Link as LinkIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from "recharts";

interface UserData {
    profile: {
        login: string;
        name?: string;
        avatar_url: string;
        bio?: string;
        location?: string;
        company?: string;
        blog?: string;
        followers: number;
        following: number;
        public_repos: number;
        created_at: string;
    };
    score: number;
    languages: Array<{ name: string; value: number }>;
    behavior: Array<{ day: string; commits: number; prs: number; issues: number }>;
    overview: Array<{ name: string; commits: number; stars: number }>;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [data, setData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!username) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/user-insights/${encodeURIComponent(username)}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "User not found or rate limited");
                }

                const userData = result.data;

                // Calculate User OSS Score
                // (total_stars * 1) + (total_commits * 2) + (total_prs * 5)
                const totalCommits = userData.overview.reduce((sum: number, repo: any) => sum + repo.commits, 0);
                const totalStars = userData.overview.reduce((sum: number, repo: any) => sum + repo.stars, 0);
                const totalPRs = userData.behavior.reduce((sum: number, day: any) => sum + day.prs, 0);

                const score = (totalStars * 1) + (totalCommits * 2) + (totalPRs * 5);

                setData({
                    ...userData,
                    score
                });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <AnimatedBackground />
                <Header />
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Gathering user insights...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <AnimatedBackground />
                <Header />
                <div className="p-6 rounded-3xl glass-card border border-destructive/50 text-center max-w-md mx-6">
                    <h2 className="text-xl font-bold text-destructive mb-2">Profile Not Found</h2>
                    <p className="text-muted-foreground">{error || "Unable to fetch user data. They might not exist or the API rate limit was hit."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30 overflow-hidden text-foreground">
            <AnimatedBackground />
            <Header />

            <main className="pt-36 pb-20 px-6 max-w-6xl mx-auto relative z-10 space-y-12">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-8 items-start md:items-center p-8 rounded-[2.5rem] glass-card backdrop-blur-xl border border-border/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <GitCommit className="w-48 h-48 rotate-12" />
                    </div>

                    <div className="relative">
                        <img
                            src={data.profile.avatar_url}
                            alt={data.profile.login}
                            className="w-32 h-32 rounded-full border-4 border-background shadow-2xl relative z-10"
                        />
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                                {data.profile.name || data.profile.login}
                                <span className="text-lg font-medium text-muted-foreground">@{data.profile.login}</span>
                            </h1>
                            {data.profile.bio && <p className="text-lg text-muted-foreground max-w-2xl">{data.profile.bio}</p>}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
                            {data.profile.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {data.profile.location}</div>}
                            {data.profile.company && <div className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {data.profile.company}</div>}
                            {data.profile.blog && (
                                <a href={data.profile.blog.startsWith('http') ? data.profile.blog : `https://${data.profile.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                    <LinkIcon className="w-4 h-4" /> {data.profile.blog.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(data.profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 backdrop-blur-md flex flex-col items-center justify-center min-w-[160px] shadow-lg shadow-primary/5">
                        <span className="text-[0.65rem] text-primary font-bold uppercase tracking-[0.2em] mb-1">Impact Score</span>
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-500 to-purple-600">{data.score.toLocaleString()}</span>
                        <div className="mt-2 h-1 w-12 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-full" />
                    </div>
                </motion.div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Followers", value: data.profile.followers.toLocaleString(), icon: <Users className="w-5 h-5 text-blue-500" /> },
                        { label: "Repositories", value: data.profile.public_repos.toLocaleString(), icon: <Code className="w-5 h-5 text-purple-500" /> },
                        { label: "Recent Commits", value: data.behavior.reduce((s, d) => s + d.commits, 0).toLocaleString(), icon: <GitCommit className="w-5 h-5 text-emerald-500" /> },
                        { label: "Recent PRs", value: data.behavior.reduce((s, d) => s + d.prs, 0).toLocaleString(), icon: <GitPullRequest className="w-5 h-5 text-orange-500" /> },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="p-6 rounded-3xl glass-card border border-border/50 flex flex-col hover:border-primary/30 transition-all group cursor-default"
                        >
                            <div className="p-3 bg-muted/50 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <div className="text-3xl font-black">{stat.value}</div>
                            <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Area Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 p-8 rounded-[2.5rem] glass-card border border-border/50 min-h-[400px] flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8 text-center sm:text-left">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Contribution Activity</h3>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted rounded-full px-3 py-1">Last 7 Days</div>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.behavior}>
                                    <defs>
                                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="day"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    />
                                    <Area type="monotone" dataKey="commits" name="Commits" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorActivity)" />
                                    <Area type="monotone" dataKey="prs" name="Pull Requests" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Language distribution Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="p-8 rounded-[2.5rem] glass-card border border-border/50 flex flex-col"
                    >
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><Code className="w-5 h-5 text-blue-500" /> Top Languages</h3>
                        <div className="flex-1 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={data.languages}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {data.languages.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-3">
                            {data.languages.slice(0, 5).map((lang, idx) => (
                                <div key={lang.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="font-semibold">{lang.name}</span>
                                    </div>
                                    <span className="text-muted-foreground font-medium">{Math.round(lang.value / data.languages.reduce((a, b) => a + b.value, 0) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Popular Repositories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <h3 className="text-2xl font-bold italic tracking-tight uppercase">Top Repositories</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.overview.slice(0, 4).map((repo, i) => (
                            <div key={repo.name} className="p-6 rounded-[2rem] glass-card border border-border/50 hover:border-primary/40 transition-all group flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{repo.name}</h4>
                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                                        <span className="flex items-center gap-1 leading-none"><Star className="w-3.5 h-3.5 fill-yellow-500/20 text-yellow-500" /> {repo.stars.toLocaleString()}</span>
                                        <span className="flex items-center gap-1 leading-none"><GitCommit className="w-3.5 h-3.5 text-primary" /> {repo.commits} commits</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </main>
        </div>
    );
}
