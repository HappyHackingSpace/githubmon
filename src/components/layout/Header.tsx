"use client";

import { useRouter } from "next/navigation";
import { ThemeToggleMinimal } from "@/components/theme/ThemeToggle";
import { Button } from "../ui/button";
import { Search, Github, Loader2 } from "lucide-react";
import { AnimatedLogo } from "../ui/animated-logo";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";

export function Header() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; type: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedSearch) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error("Failed to fetch search suggestions", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (name: string, type: string) => {
    setSearchQuery(name);
    setShowDropdown(false);
    if (type === "User") {
      router.push(`/user/${encodeURIComponent(name)}`);
    } else {
      router.push(`/explore?q=${encodeURIComponent(name)}`);
    }
  };

  return (
    <>
      <div className="h-24 w-full" aria-hidden="true" /> {/* Spacer */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "py-3 mx-4 mt-3 max-w-7xl lg:mx-auto lg:w-[96%] rounded-full bg-background/70 backdrop-blur-2xl border border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
          : "py-6 px-6 lg:px-12 bg-transparent border-transparent"
          }`}
      >
        <div className={`mx-auto ${isScrolled ? "px-4" : "max-w-7xl"}`}>
          <div className="flex justify-between items-center">

            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/">
                <AnimatedLogo />
              </Link>
            </div>

            {/* Middle Section: Search Input */}
            <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-8 relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="w-full max-w-md relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search users, repos, or organizations..."
                  className="block w-full pl-11 pr-10 py-2.5 border border-border/50 rounded-full leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all duration-300 hover:bg-muted/80 shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  {isSearching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
              </form>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showDropdown && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-md bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50 py-2 origin-top"
                  >
                    <ul>
                      {suggestions.map((suggestion: any, idx) => (
                        <li key={idx}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion.name, suggestion.type)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-primary"
                          >
                            {suggestion.avatar ? (
                              <img src={suggestion.avatar} alt={suggestion.name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Search className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-foreground">{suggestion.name}</span>
                              <span className="text-xs text-muted-foreground">{suggestion.type}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center space-x-4 md:space-x-6">

              <div className="flex items-center">
                <ThemeToggleMinimal />
              </div>

              <div className="h-6 w-px bg-border/50 hidden sm:block"></div>

              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/login")}
                className="rounded-full px-5 hidden sm:flex font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border border-primary/10"
              >
                <Github className="w-4 h-4 mr-2" />
                <span>Sign In</span>
              </Button>
            </div>

          </div>
        </div>
      </motion.header>
    </>
  );
}
