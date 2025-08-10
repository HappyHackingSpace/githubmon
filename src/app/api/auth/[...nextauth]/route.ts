import NextAuth from "next-auth/next"
import GitHubProvider from "next-auth/providers/github"

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
if (process.env.NODE_ENV === 'production' && !NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required in production.')
}
const authOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
