declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      login?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    login?: string;
  }

  interface Profile {
    login?: string;
    id?: number;
    avatar_url?: string;
    name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
  }
}
