export async function fetchFromGitHub(endpoint: string, token?: string) {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  }
  
  if (token) {
    headers['Authorization'] = `token ${token}`
  }
  
  const response = await fetch(`https://api.github.com/${endpoint}`, { headers })
  
  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.status}`)
  }
  
  return response.json()
}