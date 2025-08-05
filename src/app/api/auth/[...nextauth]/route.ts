import NextAuth from "next-auth/next"
import GitHubProvider from "next-auth/providers/github"

const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email public_repo'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }: { 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any; 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account: any; 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile?: any 
    }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.login = profile?.login
      }
      return token
    },
    async session({ session, token }: { 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any; 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any 
    }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      if (token.login && session.user) {
        session.user.login = token.login
      }
      return session
    },
    async redirect({ url, baseUrl }: { 
      url: string; 
      baseUrl: string 
    }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/auth/callback`
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
