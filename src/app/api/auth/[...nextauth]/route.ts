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
      token: any; 
      account: any; 
      profile?: any 
    }) {
      if (account) {
        token.accessToken = account.access_token
        token.login = profile?.login
      }
      return token
    },
    async session({ session, token }: { 
      session: any; 
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
