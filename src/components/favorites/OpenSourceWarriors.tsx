"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, GitCommit, Star, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { TopContributor } from "@/types/oss-insight";

export function OpenSourceWarriors() {
  const [warriors, setWarriors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarriors = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/favorites/warriors");
        if (!response.ok) {
          throw new Error("Failed to fetch top contributors");
        }
        const data = await response.json();
        setWarriors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchWarriors();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Open Source Warriors
        </CardTitle>
        <CardDescription>Top contributors in the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <span className="text-sm text-muted-foreground">Loading warriors...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
        ) : warriors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No warriors found.</p>
        ) : (
          <div className="space-y-3">
            {warriors.map((warrior, index) => (
              <div
                key={warrior.login}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={warrior.avatar_url}
                      alt={warrior.login}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    {index < 3 && (
                      <Badge
                        variant="default"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-yellow-500"
                      >
                        {index + 1}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={warrior.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {warrior.login}
                    </a>
                    {warrior.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {warrior.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <GitCommit className="h-3 w-3" />
                    <span>{warrior.contributions} commits</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-3 w-3" />
                    <span>{warrior.stars_earned}</span>
                  </div>
                  {warrior.followers_count > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>{warrior.followers_count} followers</span>
                    </div>
                  )}
                </div>

                {warrior.languages.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {warrior.languages.slice(0, 3).map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => window.open(warrior.html_url, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
