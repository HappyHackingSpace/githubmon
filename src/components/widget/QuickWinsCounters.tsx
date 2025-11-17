"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuickWinsStore } from "@/stores/quickWins";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Wrench } from "lucide-react";

export function QuickWinsCounters() {
  const { goodIssues, easyFixes, loading, error, fetchGoodIssues, fetchEasyFixes } =
    useQuickWinsStore();

  useEffect(() => {
    fetchGoodIssues();
    fetchEasyFixes();
  }, [fetchGoodIssues, fetchEasyFixes]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link href="/quick-wins" className="block">
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Good First Issues</CardTitle>
              <Sparkles className="h-5 w-5 text-green-500" />
            </div>
            <CardDescription>
              Perfect for new contributors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error.goodIssues ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400">
                  Failed to load
                </span>
              </div>
            ) : loading.goodIssues ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {goodIssues.length}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      <Link href="/quick-wins" className="block">
        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Easy Fixes</CardTitle>
              <Wrench className="h-5 w-5 text-blue-500" />
            </div>
            <CardDescription>
              Quick contributions to make
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error.easyFixes ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400">
                  Failed to load
                </span>
              </div>
            ) : loading.easyFixes ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {easyFixes.length}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
