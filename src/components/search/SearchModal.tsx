import { useEffect, useCallback } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ossInsightClient } from '@/lib/api/oss-insight-client'
import { useSearchStore, usePreferencesStore, useNotifications } from '@/stores/appStore'
import type { TrendingRepo, TopContributor } from '@/types/oss-insight'


type SearchResults = {
  repos: TrendingRepo[]
  users: TopContributor[]
  loading: boolean
  error: string | null
}

export function SearchModal() {
  const {
    isSearchModalOpen,
    currentQuery,
    currentSearchType,
    currentResults,
    searchHistory,
    recentSearches,
    setSearchModalOpen,
    setCurrentQuery,
    setCurrentSearchType,
    setSearchResults,
    addToHistory
  } = useSearchStore()
  
  const { defaultSearchType } = usePreferencesStore()
  const { add: addNotification } = useNotifications()


  useEffect(() => {
    if (isSearchModalOpen && !currentQuery) {
      setCurrentSearchType(defaultSearchType)
    }
  }, [isSearchModalOpen, defaultSearchType, currentQuery, setCurrentSearchType])


  const debounceSearch = useCallback(
    debounce(async (searchQuery: string, type: 'all' | 'repos' | 'users') => {
      if (!searchQuery.trim()) {
        setSearchResults({ repos: [], users: [], loading: false, error: null })
        return
      }


      setSearchResults({
        repos: currentResults.repos,
        users: currentResults.users,
        loading: true,
        error: null
      })

      try {
    
        const promises: [Promise<TrendingRepo[]>, Promise<TopContributor[]>] = [
          type === 'all' || type === 'repos' 
            ? ossInsightClient.searchRepositories(searchQuery, 'stars', 10)
            : Promise.resolve([]),
          type === 'all' || type === 'users' 
            ? ossInsightClient.searchUsers(searchQuery, 'all', 10)
            : Promise.resolve([])
        ]

        const [repos, users] = await Promise.all(promises)
        
        setSearchResults({
          repos: repos || [], 
          users: users || [],  
          loading: false,
          error: null
        })

    
        if ((repos && repos.length > 0) || (users && users.length > 0)) {
          addToHistory(searchQuery, type)
        }
      } catch (error) {
        const errorMessage = 'Arama sırasında bir hata oluştu'
       
        setSearchResults({
          repos: currentResults.repos,
          users: currentResults.users,
          loading: false,
          error: errorMessage
        })
        
        addNotification({
          type: 'error',
          title: 'Arama Hatası',
          message: errorMessage
        })
      }
    }, 500),
    [setSearchResults, addToHistory, addNotification]
  )

  useEffect(() => {
    debounceSearch(currentQuery, currentSearchType)
  }, [currentQuery, currentSearchType, debounceSearch])


  useEffect(() => {
    if (!isSearchModalOpen) {
      setCurrentQuery('')
      setSearchResults({ repos: [], users: [], loading: false, error: null })
    }
  }, [isSearchModalOpen, setCurrentQuery, setSearchResults])


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
 
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchModalOpen(true)
      }
      
  
      if (e.key === 'Escape' && isSearchModalOpen) {
        setSearchModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchModalOpen, setSearchModalOpen])

  const handleRecentSearchClick = (query: string) => {
    setCurrentQuery(query)
  }

  const hasResults = currentResults.repos.length > 0 || currentResults.users.length > 0

  return (
    <Dialog open={isSearchModalOpen} onOpenChange={setSearchModalOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center space-x-2">
            <span>🔍</span>
            <span>GitHub'da Ara</span>
          </DialogTitle>
        </DialogHeader>

        {/* Search Input & Filters */}
        <div className="p-6 pb-4 space-y-4">
          <Input
            placeholder="Repository, kullanıcı veya organizasyon ara..."
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            className="text-lg h-12"
            autoFocus
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filtrele:</span>
              {(['all', 'repos', 'users'] as const).map((type) => (
                <Button
                  key={type}
                  variant={currentSearchType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSearchType(type)}
                >
                  {type === 'all' ? 'Tümü' : type === 'repos' ? 'Repolar' : 'Kullanıcılar'}
                </Button>
              ))}
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && !currentQuery && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Son aramalar:</span>
                {recentSearches.slice(0, 3).map((query, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 text-xs"
                    onClick={() => handleRecentSearchClick(query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {currentResults.loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Aranıyor...</span>
            </div>
          )}

          {currentResults.error && (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">❌ {currentResults.error}</div>
              <Button variant="outline" onClick={() => debounceSearch(currentQuery, currentSearchType)}>
                Tekrar Dene
              </Button>
            </div>
          )}

          {!currentResults.loading && !currentResults.error && currentQuery && !hasResults && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div>"{currentQuery}" için sonuç bulunamadı</div>
              <div className="text-sm mt-2">Farklı anahtar kelimeler deneyin</div>
            </div>
          )}

          {/* Repositories */}
          {currentResults.repos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">📦</span>
                Repositories ({currentResults.repos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentResults.repos.map((repo) => (
                  <Card key={repo.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={repo.owner.avatar_url} />
                          <AvatarFallback>{repo.owner.login[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                            onClick={() => setSearchModalOpen(false)}
                          >
                            <h4 className="font-medium text-indigo-600 group-hover:text-indigo-800 truncate">
                              {repo.full_name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {repo.description || 'Açıklama bulunmuyor'}
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-sm text-gray-500">
                                ⭐ {repo.stargazers_count.toLocaleString()}
                              </span>
                              {repo.language && (
                                <Badge variant="outline" className="text-xs">
                                  {repo.language}
                                </Badge>
                              )}
                            </div>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {currentResults.users.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Kullanıcılar ({currentResults.users.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentResults.users.map((user) => (
                  <Card key={user.login} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                        onClick={() => setSearchModalOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{user.login[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-indigo-600 group-hover:text-indigo-800">
                              {user.login}
                            </h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {user.type}
                            </Badge>
                            {user.bio && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State with Search History */}
          {!currentQuery && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">GitHub'da Arayın</h3>
              <p className="text-sm mb-6">
                Repository, kullanıcı veya organizasyon arayabilirsiniz
              </p>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="text-left max-w-md mx-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">📋 Son Aramalar</h4>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => setCurrentQuery(item.query)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">
                            {item.type === 'all' ? '🔍' : item.type === 'repos' ? '📦' : '👤'}
                          </span>
                          <span className="text-sm">{item.query}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-2 text-xs text-gray-400">
                <div>💡 <strong>İpucu:</strong> "react router" gibi anahtar kelimeler kullanın</div>
                <div>⚡ <strong>Hızlı:</strong> Sonuçlar otomatik olarak yüklenir</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div className="border-t px-6 py-3 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl</kbd> + 
              <kbd className="px-1 py-0.5 bg-white border rounded ml-1">K</kbd> 
              <span className="ml-2">Arama</span>
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-white border rounded">Esc</kbd>
              <span className="ml-2">Kapat</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}