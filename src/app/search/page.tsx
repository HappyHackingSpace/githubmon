"use client" 

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Header } from "@/components/layout/Header";
import { useRequireAuth } from "@/hooks/useAuth";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const { isLoading } = useRequireAuth();

  useEffect(() => {
    if (userParam) {
      // Implement user search logic here
      console.log("Search for user:", userParam);
    }
  }, [userParam]);

  // History management - geri gitmeyi önle  
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault()
        window.history.pushState(null, '', '/search')
      }

      window.history.pushState(null, '', '/search')
      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (userParam) {
      // Implement user search logic here
      console.log("Search for user:", userParam);
    }
  }, [userParam]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main content goes here */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userParam ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">
              Search Results for User: {userParam}
            </h1>
            {/* Implement user search results display */}
          </div>
        ) : (
          <div>{/* Default search page content */}</div>
        )}
      </main>
    </div>
  );
}