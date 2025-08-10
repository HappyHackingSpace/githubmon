import NextAuth from "next-auth/next"
import GitHubProvider from "next-auth/providers/github"

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
if (process.env.NODE_ENV === 'production' && !NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required in production.')
}
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
if (
  process.env.NODE_ENV === 'production' &&
  (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET)
) {
  throw new Error('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required in production.')
}

const authOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
