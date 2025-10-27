"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/stores/app";

interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: "page" | "section" | "inline" | "overlay";
  message?: string;
}

export function LoadingBoundary({
  children,
  fallback,
  type = "section",
  message,
}: LoadingBoundaryProps) {
  const { isLoading, loadingMessage } = useAppStore();

  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <LoadingSpinner type={type} message={message || loadingMessage} />;
  }

  return <>{children}</>;
}

// Individual loading components
export function LoadingSpinner({
  type = "section",
  message = "Loading...",
  className = "",
}: {
  type?: "page" | "section" | "inline" | "overlay";
  message?: string;
  className?: string;
}) {
  const baseClasses = "flex items-center justify-center";

  const typeClasses = {
    page: "min-h-screen bg-background",
    section: "py-12",
    inline: "py-4",
    overlay: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
  };

  const spinnerSize = {
    page: "h-12 w-12",
    section: "h-8 w-8",
    inline: "h-6 w-6",
    overlay: "h-12 w-12",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-4 ${spinnerSize[type]}`}
        ></div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

// Loading skeletons for different content types
export function RepositoryCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-12 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LanguageCardSkeleton() {
  return (
    <Card className="text-center">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-6 w-6" />
        </div>
        <Skeleton className="h-6 w-24 mx-auto mb-2" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
        <Skeleton className="h-5 w-16 mx-auto mt-2 rounded" />
      </CardContent>
    </Card>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-3 p-4 border rounded-lg"
        >
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading states for specific sections
export function TrendingReposLoading() {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <RepositoryCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function TopLanguagesLoading() {
  return (
    <section>
      <Skeleton className="h-8 w-80 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <LanguageCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// Combined loading states
export function HomePageLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <div className="flex items-center space-x-2 flex-1 max-w-md mx-8">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 flex-1" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        <div className="space-y-12">
          <TrendingReposLoading />
          <TopLanguagesLoading />

          {/* CTA skeleton */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600">
            <CardContent className="p-8 text-center">
              <Skeleton className="h-8 w-48 mx-auto mb-4 bg-white/20" />
              <Skeleton className="h-6 w-80 mx-auto mb-6 bg-white/20" />
              <Skeleton className="h-10 w-32 mx-auto bg-white/20" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Hook for managing loading states
export function useLoading() {
  const { isLoading, loadingMessage, setLoading } = useAppStore();

  const startLoading = (message?: string) => {
    setLoading(true, message);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    startLoading(message);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
  };
}
