"use client";

import { motion } from "framer-motion";
import { GitPullRequest, Activity, LayoutDashboard, Search, Settings } from "lucide-react";
import { useState } from "react";

const features = [
    {
        title: "Unified Dashboard",
        description: "All your repository metrics in one place. Keep an eye on the pulse of your projects with customizable, intuitive widgets.",
        icon: <LayoutDashboard className="w-8 h-8 text-blue-500" />,
        color: "from-blue-500/20 to-cyan-500/20",
    },
    {
        title: "Activity Feed",
        description: "Never miss a beat. Real-time updates on merged PRs, new issues, and team discussions directly from your GitHub org.",
        icon: <Activity className="w-8 h-8 text-green-500" />,
        color: "from-green-500/20 to-emerald-500/20",
    },
    {
        title: "Advanced Search",
        description: "Find exactly what you are looking for across all repositories with our lightning-fast, unified command palette.",
        icon: <Search className="w-8 h-8 text-purple-500" />,
        color: "from-purple-500/20 to-pink-500/20",
    },
    {
        title: "PR Management",
        description: "Track pull requests efficiently. Manage reviews, approvals, and merges all within the dashboard interface.",
        icon: <GitPullRequest className="w-8 h-8 text-orange-500" />,
        color: "from-orange-500/20 to-yellow-500/20",
    },
];

export function FeaturesShowcase() {
    return (
        <section id="features" className="relative py-24 sm:py-32 overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6"
                    >
                        Everything you need for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                            effortless analysis
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg leading-8 text-muted-foreground"
                    >
                        Built for developers and teams who want to take full control of their GitHub workflow.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                            whileHover={{ scale: 1.02 }}
                            className="group relative p-8 rounded-[2rem] glass-card overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                        >
                            <div className={`absolute -inset-px bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem] -z-10`} />

                            <div className="bg-background/80 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
