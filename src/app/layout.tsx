import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { OAuthSessionSync } from "@/components/providers/OAuthSessionSync";

import { NotificationProvider } from "@/components/common/NotificationProvider";
import { DataInitializer } from "@/components/providers/DataInitializer";
import { CommandPalette } from "@/components/command/CommandPalette";
import { PageTracker } from "@/components/providers/PageTracker";
import { ToasterProvider } from "@/components/providers/ToasterProvider";

export const metadata: Metadata = {
  title: {
    default: "GitHubMon",
    template: "%s | GitHubMon",
  },
  description:
    "Analyze GitHub organizations, trending repositories and top contributors with advanced analytics.",
  applicationName: "GitHubMon",
  keywords: ["GitHub", "analytics", "open source", "monitoring", "trending"],
  openGraph: {
    title: "GitHubMon",
    description:
      "Analyze GitHub organizations, trending repositories and top contributors with advanced analytics.",
    siteName: "GitHubMon",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="githubmon-theme">
            <OAuthSessionSync />
            <DataInitializer />
            <PageTracker />
            <CommandPalette />
            <ToasterProvider />
            {children}
            <NotificationProvider />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
