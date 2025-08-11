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
      authorization: {
        params: {
          scope: "read:user user:email read:org repo"
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          login: profile.login, 
          email: profile.email,
          image: profile.avatar_url,
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, account, user }: { token: any; account: any; user?: any }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.login = user.login // GitHub username'i token'a ekle
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      (session as any).accessToken = token.accessToken
      if (token.login) {
        session.user.login = token.login // GitHub username'i session'a ekle
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Always redirect to auth callback after authentication
      if (url.startsWith('/')) return `${baseUrl}/auth/callback`
      if (new URL(url).origin === baseUrl) return `${baseUrl}/auth/callback`
      return `${baseUrl}/auth/callback`
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
