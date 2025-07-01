import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GitHubCommit } from '@/types/github'

interface CommitTableProps {
  commits: (GitHubCommit & { repoName?: string })[]
}

export function CommitTable({ commits }: CommitTableProps) {
  if (commits.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Henüz commit bulunamadı.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commit</TableHead>
            <TableHead>Repo</TableHead>
            <TableHead>Yazar</TableHead>
            <TableHead>Tarih</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commits.map((commit) => (
            <TableRow key={commit.sha}>
              <TableCell>
                <a href={commit.html_url} target="_blank" className="text-indigo-600 hover:underline">
                  {commit.commit.message.split('\n')[0].substring(0, 70)}
                </a>
              </TableCell>
              <TableCell>{commit.repoName || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {commit.author && (
                    <>
                      <img className="h-6 w-6 rounded-full mr-2" src={commit.author.avatar_url} alt="" />
                      {commit.commit.author.name}
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>{new Date(commit.commit.author.date).toLocaleDateString('tr-TR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}