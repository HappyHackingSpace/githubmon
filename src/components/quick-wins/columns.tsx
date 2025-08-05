// src/components/quick-wins/columns.ts
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExternalLink, Star, MessageSquare, Calendar } from 'lucide-react'
import type { GitHubIssue } from '@/types/quickWins'




export const createColumns = (): ColumnDef<GitHubIssue>[] => [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-auto p-0 font-semibold"
            >
                Title
            </Button>
        ),
        cell: ({ row }) => {
            const issue = row.original
            return (
                <div className="min-w-0 flex-1" >
                    <div className="flex items-center gap-2" >
                        <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 truncate max-w-xs"
                            title={issue.title}
                        >
                            {issue.title}
                        </a>
                        < ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>
                    < div className="flex items-center gap-2 mt-1" >
                        <a
                            href={issue.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-700 truncate"
                        >
                            {issue.repository}
                        </a>
                    </ div>
                </div>
            )
        }
    },
    {
        accessorKey: 'labels',
        header: 'Labels',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1 max-w-48" >
                {
                    row.original.labels.slice(0, 3).map((label, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="text-xs px-1 py-0"
                            style={{
                                borderColor: `#${label.color}20`,
                                backgroundColor: `#${label.color}10`,
                                color: `#${label.color}`
                            }}
                        >
                            {label.name}
                        </Badge>
                    ))
                }
                {
                    row.original.labels.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0" >
                            +{row.original.labels.length - 3}
                        </Badge>
                    )
                }
            </div>
        ),
        enableSorting: false
    },
    {
        accessorKey: 'language',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')
                }
                className="h-auto p-0 font-semibold"
            >
                Language
            </Button>
        ),
        cell: ({ row }) => {
            const language = row.original.language
            return language ? (
                <Badge variant="secondary" className="text-xs" >
                    {language}
                </Badge>
            ) : (
                <span className="text-gray-400 text-sm" > -</span>
            )
        }
    },
    {
        accessorKey: 'stars',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')
                }
                className="h-auto p-0 font-semibold"
            >
                <Star className="w-4 h-4 mr-1" />
                Stars
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-1" >
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-sm font-medium" >
                    {row.original.stars.toLocaleString()}
                </span>
            </div>
        )
    },
    {
        accessorKey: 'comments',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')
                }
                className="h-auto p-0 font-semibold"
            >
                <MessageSquare className="w-4 h-4 mr-1" />
                Comments
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-1" >
                <MessageSquare className="w-3 h-3 text-gray-500" />
                <span className="text-sm" > {row.original.comments} </span>
            </div>
        )
    },
    {
        accessorKey: 'difficulty',
        header: 'Difficulty',
        cell: ({ row }) => {
            const difficulty = row.original.difficulty
            return (
                <Badge
                    variant={difficulty === 'easy' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                >
                    {difficulty === 'easy' ? '✨ Easy' : '⚡ Medium'
                    }
                </Badge>
            )
        }
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')
                }
                className="h-auto p-0 font-semibold"
            >
                <Calendar className="w-4 h-4 mr-1" />
                Created
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.created_at)
            const now = new Date()
            const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

            return (
                <div className="text-sm text-gray-600" >
                    {diffInDays === 0 ? 'Today' :
                        diffInDays === 1 ? 'Yesterday' :
                            diffInDays < 7 ? `${diffInDays}d ago` :
                                diffInDays < 30 ? `${Math.floor(diffInDays / 7)}w ago` :
                                    `${Math.floor(diffInDays / 30)}mo ago`
                    }
                </div>
            )
        },
        sortingFn: (rowA, rowB) => {
            const dateA = new Date(rowA.original.created_at).getTime()
            const dateB = new Date(rowB.original.created_at).getTime()
            return dateA - dateB
        }
    },
    {
        accessorKey: 'author',
        header: 'Author',
        cell: ({ row }) => {
            const author = row.original.author
            return (
                <div className="flex items-center gap-2" >
                    <Avatar className="size-6" >
                        <AvatarImage src={author.avatar_url} alt={author.login} />
                        <AvatarFallback className="text-xs" >
                            {author.login.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    < span className="text-sm text-gray-600 truncate max-w-20" >
                        {author.login}
                    </span>
                </div>
            )
        },
        enableSorting: false
    }
]