import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (process.env.NODE_ENV === "production" && !NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is required in production.");
}
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
if (
  process.env.NODE_ENV === "production" &&
  (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET)
) {
  throw new Error(
    "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required in production."
  );
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email read:org repo",
        },
      },
      profile(profile: {
        id: number;
        login: string;
        name?: string | null;
        email?: string | null;
        avatar_url?: string | null;
      }) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          login: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      if (user && user.login) {
        token.login = user.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.login && session.user) {
        session.user.login = token.login;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {}
      return baseUrl;
    },
  },
};
