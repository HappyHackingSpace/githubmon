import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { SearchHeader } from "@/components/layout/Header";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");

  useEffect(() => {
    if (userParam) {
      // Implement user search logic here
      console.log("Search for user:", userParam);
    }
  }, [userParam]);

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />
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