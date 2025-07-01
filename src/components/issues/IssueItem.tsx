import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/date'
import { GitHubIssue } from '@/types/issue'

interface IssueItemProps {
  issue: GitHubIssue
}

export function IssueItem({ issue }: IssueItemProps) {
  const isPR = !!issue.pull_request
  const stateColor = issue.state === 'open' ? 'default' : 'secondary'

  return (
    <div className="p-5 border-b last:border-b-0">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-1">
          <span className="text-lg">
            {isPR ? '🔀' : issue.state === 'open' ? '🔴' : '✅'}
          </span>
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium">
              <a href={issue.html_url} target="_blank" className="hover:text-indigo-600">
                {issue.title}
              </a>
            </h4>
            <Badge variant={stateColor}>
              {issue.state}
            </Badge>
          </div>
          
          <div className="mt-1 text-sm text-gray-500">
            #{issue.number} opened by{' '}
            <a href={issue.user.html_url} className="text-indigo-600 hover:text-indigo-900">
              {issue.user.login}
            </a>
            {' '}on {formatDate(issue.created_at)}
          </div>
          
          {issue.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {issue.labels.map(label => (
                <Badge 
                  key={label.name}
                  variant="outline"
                  style={{ 
                    backgroundColor: `#${label.color}33`,
                    borderColor: `#${label.color}`,
                    color: `#${label.color}`
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}