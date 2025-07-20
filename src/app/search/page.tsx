"use client"

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Header } from "@/components/layout/Header";
import { useRequireAuth } from "@/hooks/useAuth";
import { SidebarSearch, SidebarToggle } from "@/components/layout/SidebarSearch";
import { useSearchStore, useSidebarState } from "@/stores";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const repoParam = searchParams.get("repo");
  const { isLoading } = useRequireAuth();
  const { setCurrentQuery, setCurrentSearchType } = useSearchStore();
  const { setOpen } = useSidebarState();

  useEffect(() => {
    if (userParam) {
      setCurrentQuery(userParam);
      setCurrentSearchType("users");
      console.log("Search for user:", userParam);
    } else if (repoParam) {
      setCurrentQuery(repoParam);
      setCurrentSearchType("repos");
      console.log("Search for repo:", repoParam);
    }
  }, [userParam, repoParam, setCurrentQuery, setCurrentSearchType]);

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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header - Full Width */}
        <Header />

        {/* Content Area */}
        <div className="flex flex-1">
          {/* Mobile Sidebar Toggle */}
          <SidebarToggle onClick={() => setOpen(true)} />

          {/* Sidebar */}
          <SidebarSearch />

          {/* Main Content */}
          <main className="flex-1 lg:ml-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Full Width */}
      <Header />

      {/* Content Area */}
      <div className="flex flex-1">
        {/* Mobile Sidebar Toggle */}
        <SidebarToggle onClick={() => setOpen(true)} />

        {/* Sidebar */}
        <SidebarSearch />

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 p-6">
          <div className="max-w-5xl mx-auto">
            {userParam || repoParam ? (
              <div>
                <h1 className="text-2xl font-bold mb-4">
                  Search Results for {userParam ? `User: ${userParam}` : `Repository: ${repoParam}`}
                </h1>
                <div className="mt-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      {userParam ? (
                        <>
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">U</span>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">{userParam}</h2>
                            <p className="text-sm text-muted-foreground">GitHub User Profile</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">R</span>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">{repoParam}</h2>
                            <p className="text-sm text-muted-foreground">GitHub Repository</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => window.open(`https://github.com/${userParam || repoParam}`, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        View on GitHub
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(`https://github.com/${userParam || repoParam}`)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}