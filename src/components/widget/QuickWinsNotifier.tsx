"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useQuickWinsStore } from "@/stores/quickWins";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, X, ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuickWinsNotifier() {
  const { goodIssues, easyFixes, loading, error, fetchGoodIssues, fetchEasyFixes } =
    useQuickWinsStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewItems, setHasNewItems] = useState(false);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  const totalCount = goodIssues.length + easyFixes.length;
  const hasItems = totalCount > 0;

  useEffect(() => {
    fetchGoodIssues();
    fetchEasyFixes();
  }, [fetchGoodIssues, fetchEasyFixes]);

  useEffect(() => {
    if (totalCount > previousTotal && previousTotal > 0) {
      setHasNewItems(true);
      setShowPulse(true);

      const newCount = totalCount - previousTotal;
      toast.success("🎉 New opportunities ready!", {
        description: `${newCount} fresh ${newCount === 1 ? 'item' : 'items'} just arrived`,
        duration: 5000,
      });

      setTimeout(() => {
        setIsExpanded(true);
      }, 500);

      setTimeout(() => setShowPulse(false), 3000);
    }
    setPreviousTotal(totalCount);
  }, [totalCount, previousTotal]);

  const handleDismissNew = useCallback(() => {
    setHasNewItems(false);
  }, []);

  if (!hasItems && !loading.goodIssues && !loading.easyFixes) {
    return null;
  }

  return (
    <>
      <div className="fixed top-20 right-6 z-40">
        <div
          className={cn(
            "relative transition-all duration-300",
            showPulse && "animate-bounce"
          )}
        >
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "group relative shadow-lg transition-all duration-300",
              hasNewItems && "ring-2 ring-green-500 ring-offset-2",
              isExpanded && "rounded-b-none"
            )}
            variant={hasNewItems ? "default" : "secondary"}
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className={cn(
                "h-4 w-4 transition-transform",
                showPulse && "animate-spin"
              )} />
              <span className="font-medium">Quick Wins</span>
              {totalCount > 0 && (
                <Badge variant="outline" className="ml-1 bg-background">
                  {totalCount}
                </Badge>
              )}
              {hasNewItems && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
          </Button>
        </div>

        <div
          className={cn(
            "absolute top-full right-0 mt-0 w-80 bg-background border rounded-b-lg shadow-xl transition-all duration-300 origin-top",
            isExpanded ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="p-4 space-y-3">
            {hasNewItems && (
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Fresh opportunities!
                  </span>
                </div>
                <button
                  onClick={handleDismissNew}
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <Link
              href="/quick-wins"
              onClick={() => setIsExpanded(false)}
              className="block group"
            >
              <div className="p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-sm text-green-900 dark:text-green-100">
                      Good First Issues
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
                </div>
                {loading.goodIssues ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                ) : error.goodIssues ? (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    Failed to load
                  </span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {goodIssues.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      perfect for new contributors
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <Link
              href="/quick-wins"
              onClick={() => setIsExpanded(false)}
              className="block group"
            >
              <div className="p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                      Easy Fixes
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                {loading.easyFixes ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                ) : error.easyFixes ? (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    Failed to load
                  </span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {easyFixes.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      quick contributions to make
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <Link
              href="/quick-wins"
              onClick={() => setIsExpanded(false)}
              className="block"
            >
              <Button variant="outline" className="w-full" size="sm">
                <span>View All Quick Wins</span>
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
