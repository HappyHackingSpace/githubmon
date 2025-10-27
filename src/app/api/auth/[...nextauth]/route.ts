import NextAuth from "next-auth/next";
import GitHubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login?: string;
    };
  }

  interface User {
    login?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
  }
}

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

const authOptions = {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, user }: any) {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      if (user && user.login) {
        token.login = user.login;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token.login && session.user) {
        session.user.login = token.login;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      return session
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
