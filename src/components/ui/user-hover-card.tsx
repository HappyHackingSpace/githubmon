"use client";

import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Building2, Link as LinkIcon, Calendar, Award } from "lucide-react";
import { githubAPIClient } from "@/lib/api/github-api-client";
import type { GitHubUserDetailed } from "@/types/github";

interface UserHoverCardProps {
  username: string;
  children: React.ReactNode;
  showScore?: boolean;
}

function calculateOpenSourceScore(profile: GitHubUserDetailed, contributions?: { commits: number; prs: number; stars: number }): number {
  const commitsScore = (contributions?.commits || 0) * 2;
  const prsScore = (contributions?.prs || 0) * 5;
  const starsScore = contributions?.stars || 0;

  return commitsScore + prsScore + starsScore;
}

export function UserHoverCard({ username, children, showScore = false }: UserHoverCardProps) {
  const [profile, setProfile] = useState<GitHubUserDetailed | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      setLoading(true);
      try {
        const userProfile = await githubAPIClient.getUserProfile(username);
        setProfile(userProfile);

        if (showScore) {
          const contributions = await githubAPIClient.getUserContributions(username);
          const calculatedScore = calculateOpenSourceScore(userProfile, contributions);
          setScore(calculatedScore);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, showScore]);

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start" side="top">
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}

        {!loading && profile && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url} alt={profile.login} />
                <AvatarFallback>{profile.login.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base truncate">{profile.name || profile.login}</h4>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground truncate block"
                >
                  @{profile.login}
                </a>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}

            <div className="space-y-2 text-sm">
              {profile.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{profile.company}</span>
                </div>
              )}

              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>
              )}

              {profile.blog && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground truncate"
                  >
                    {profile.blog}
                  </a>
                </div>
              )}

              {profile.created_at && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{profile.public_repos}</span>
                <span className="text-muted-foreground ml-1">repos</span>
              </div>
              <div>
                <span className="font-semibold">{profile.followers}</span>
                <span className="text-muted-foreground ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold">{profile.following}</span>
                <span className="text-muted-foreground ml-1">following</span>
              </div>
            </div>

            {showScore && score !== null && (
              <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">OS Score</span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((score / 1000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1" title="This score is calculated based on user's open source contributions in the last 3 months">
                      Based on recent contributions
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {!loading && !profile && (
          <div className="text-center py-4 text-muted-foreground">
            Failed to load user profile
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
