"use client";

import { useRouter } from "next/navigation";
import { RateLimitWarning } from "@/components/common/RateLimitWarning";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useSearchStore } from "@/stores";
import { Button } from "../ui/button";
import { Search, User } from "lucide-react";
import { AnimatedLogo } from "../ui/animated-logo";

export function Header() {
  const { setSearchModalOpen } = useSearchStore();

  const router = useRouter();
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <AnimatedLogo />
          </div>
          <div className="flex-1 max-w-2xl mx-8">
            <Button
              variant="outline"
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex justify-start backdrop-blur-sm"
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="text-muted-foreground">Search GitHub repositories, users, and organizations...</span>
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <RateLimitWarning />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
              className="flex items-center space-x-1 backdrop-blur-sm"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
