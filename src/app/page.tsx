"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useStoreHydration } from "@/stores";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesShowcase } from "@/components/landing/FeaturesShowcase";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { CallToActionSection } from "@/components/CallToActionSection";

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
      <main className="relative min-h-screen">
        <AnimatedBackground />

        <HeroSection />

        <div className="relative z-10 bg-background/50 backdrop-blur-3xl border-t border-border/50">
          <FeaturesShowcase />

          <div className="relative isolate px-6 lg:px-8 max-w-7xl mx-auto py-10">
            <CallToActionSection />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
