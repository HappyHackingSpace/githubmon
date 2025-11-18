"use client";

import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { useSidebarState, usePreferencesStore } from "@/stores";
import { SidebarToggle } from "./SidebarToggle";

export function Layout({ children }: { children: React.ReactNode }) {
  const { setOpen } = useSidebarState();
  const { sidebarCollapsed } = usePreferencesStore();

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute left-0 top-0 h-full z-10">
        <Suspense
          fallback={
            <div className="w-64 h-full bg-gray-100 dark:bg-gray-900 animate-pulse" />
          }
        >
          <Sidebar />
        </Suspense>
        <SidebarToggle onClick={() => setOpen(true)} />
      </div>
      <main className={`ml-0 h-full overflow-auto transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <AppHeader />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
