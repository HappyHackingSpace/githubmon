"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import {
  FileText,
  Folder,
  File,
  Star,
  GitFork,
  ExternalLink,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronDown,
  Code2,
  Copy,
  Check,
} from "lucide-react"
import type { TrendingRepo } from "@/types/oss-insight"
import { usePreferencesStore } from "@/stores"

interface RepoDeepDiveProps {
  repo: TrendingRepo
  onClose?: () => void
}

interface FileTreeItem {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
}

interface Issue {
  id: number
  number: number
  title: string
  state: string
  user: {
    login: string
    avatar_url: string
  }
  created_at: string
  comments: number
  labels: Array<{
    name: string
    color: string
  }>
}

export function RepoDeepDive({ repo }: RepoDeepDiveProps) {
  const [activeTab, setActiveTab] = useState("readme")
  const [readme, setReadme] = useState<string | null>(null)
  const [readmeLoading, setReadmeLoading] = useState(false)
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([])
  const [fileTreeLoading, setFileTreeLoading] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const { pinnedRepos, togglePinnedRepo } = usePreferencesStore()
  const isPinned = pinnedRepos.includes(repo.full_name)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (activeTab === "readme" && !readme) {
      loadReadme()
    } else if (activeTab === "files" && fileTree.length === 0) {
      loadFileTree()
    } else if (activeTab === "issues" && issues.length === 0) {
      loadIssues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const loadReadme = async () => {
    setReadmeLoading(true)
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/readme`,
        {
          headers: {
            Accept: "application/vnd.github.raw",
          },
        }
      )
      if (response.ok) {
        const content = await response.text()
        setReadme(content)
      } else {
        setReadme("No README found for this repository.")
      }
    } catch (error) {
      setReadme("Failed to load README.")
    } finally {
      setReadmeLoading(false)
    }
  }

  const loadFileTree = async () => {
    setFileTreeLoading(true)
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents`,
        {
          headers: {
            Accept: "application/vnd.github+json",
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setFileTree(data.slice(0, 20))
      }
    } catch (error) {
      console.error("Failed to load file tree:", error)
    } finally {
      setFileTreeLoading(false)
    }
  }

  const loadIssues = async () => {
    setIssuesLoading(true)
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/issues?state=open&per_page=10`,
        {
          headers: {
            Accept: "application/vnd.github+json",
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setIssues(data)
      }
    } catch (error) {
      console.error("Failed to load issues:", error)
    } finally {
      setIssuesLoading(false)
    }
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const copyCloneUrl = async () => {
    const cloneUrl = `https://github.com/${repo.full_name}.git`
    try {
      await navigator.clipboard.writeText(cloneUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openInGitHubDev = () => {
    window.open(`https://github.dev/${repo.full_name}`, "_blank")
  }

  const openInGitHub = () => {
    window.open(repo.html_url, "_blank")
  }

  const forkRepo = () => {
    window.open(`${repo.html_url}/fork`, "_blank")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {repo.full_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {repo.description || "No description available"}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                {repo.stargazers_count.toLocaleString()} stars
              </span>
              <span className="flex items-center">
                <GitFork className="w-4 h-4 mr-2" />
                {repo.forks_count.toLocaleString()} forks
              </span>
              {repo.language && (
                <Badge variant="outline">{repo.language}</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isPinned ? "default" : "outline"}
              size="sm"
              onClick={() => togglePinnedRepo(repo.full_name)}
            >
              <Star className={`w-4 h-4 mr-2 ${isPinned ? "fill-current" : ""}`} />
              {isPinned ? "Pinned" : "Pin"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={forkRepo}
            >
              <GitFork className="w-4 h-4 mr-2" />
              Fork
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyCloneUrl}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied!" : "Clone"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInGitHubDev}
            >
              <Code2 className="w-4 h-4 mr-2" />
              Open in Dev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInGitHub}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4">
          <TabsTrigger value="readme" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            README
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readme" className="flex-1 overflow-y-auto p-6">
          {readmeLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: {
                      inline?: boolean
                      className?: string
                      children?: React.ReactNode
                    }) {
                      const match = /language-(\w+)/.exec(className || "")
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {readme || "Loading README..."}
                </ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="files" className="flex-1 overflow-y-auto p-6">
          {fileTreeLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  {fileTree.map((item) => (
                    <div
                      key={item.path}
                      className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                      onClick={() => item.type === "dir" && toggleFolder(item.path)}
                    >
                      {item.type === "dir" ? (
                        <>
                          {expandedFolders.has(item.path) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <Folder className="w-4 h-4 text-blue-500" />
                        </>
                      ) : (
                        <>
                          <div className="w-4" />
                          <File className="w-4 h-4 text-gray-400" />
                        </>
                      )}
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.size && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {(item.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {fileTree.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Folder className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No files to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issues" className="flex-1 overflow-y-auto p-6">
          {issuesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <a
                          href={`https://github.com/${repo.full_name}/issues/${issue.number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                          {issue.title}
                        </a>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            #{issue.number} opened by {issue.user.login}
                          </span>
                          {issue.labels.map((label) => (
                            <Badge
                              key={label.name}
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: `#${label.color}`,
                                color: `#${label.color}`,
                              }}
                            >
                              {label.name}
                            </Badge>
                          ))}
                          {issue.comments > 0 && (
                            <span className="text-xs text-gray-400">
                              {issue.comments} comments
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {issues.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No open issues</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
