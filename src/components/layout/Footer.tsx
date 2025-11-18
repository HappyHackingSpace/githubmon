"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import Image from "next/image";
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="w-full py-12 mt-auto bg-background/50 backdrop-blur-sm border-t border-border/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                <Image
                  src={theme === "dark" ? "/hhs-white.avif" : "/hhs-black.avif"}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-semibold">GitHubMon</span>
            </div>
            <p className="text-sm text-muted-foreground">
              GitHub analytics and monitoring made simple for modern teams.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/action-required" className="hover:text-foreground transition-colors">Action Items</Link></li>
              <li><Link href="/quick-wins" className="hover:text-foreground transition-colors">Quick Wins</Link></li>
              <li><Link href="/search" className="hover:text-foreground transition-colors">Search</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="/api" className="hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link></li>
              <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Happy Hacking Space. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
