import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
