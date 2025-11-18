"use client";

import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { useSidebarState } from "@/stores";
import { SidebarToggle } from "./SidebarToggle";
import { Breadcrumb } from "./Breadcrumb";

export function Layout({ children }: { children: React.ReactNode }) {
  const { setOpen } = useSidebarState();

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
      
      <main className="lg:ml-64 ml-0 h-full overflow-auto">
        <div className="p-6">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
