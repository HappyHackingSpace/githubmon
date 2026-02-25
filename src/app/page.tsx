"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useStoreHydration } from "@/stores";
import { SearchModal } from "@/components/search/SearchModal";
import { CallToActionSection } from "@/components/CallToActionSection";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { CodeDemo } from "@/components/landing/CodeDemo";

export default function HomePage() {
  const router = useRouter();
  const hasHydrated = useStoreHydration();
  const { isConnected, orgData, isTokenValid, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hasHydrated && isConnected && orgData && isTokenValid()) {
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
      return;
    }
  }, [hasHydrated, isConnected, orgData, isTokenValid, router]);

  if (hasHydrated && isConnected && orgData && isTokenValid()) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="relative max-w-7xl mx-auto p-6 space-y-6">
        <DotPattern
          className="opacity-50"
          dotColor="rgba(139, 92, 246, 0.15)"
          gap={30}
        />

        <div className="text-center space-y-8 py-20 relative">
          <div className="space-y-6">
            <div className="relative inline-block">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 dark:from-white dark:via-gray-100 dark:to-gray-300">
                GitHub Analytics
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  Made Simple
                </span>
              </h1>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mt-8">
              Monitor your GitHub repositories, track trends, and analyze
              performance with powerful insights and beautiful visualizations.
            </p>
          </div>
        </div>

      </main>

      <BentoGrid />
      <CodeDemo />
      <CallToActionSection />
      <SearchModal />
      <Footer />
    </>
  );
}
