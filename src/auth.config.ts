import type { NextAuthConfig } from "next-auth";

// Edge-safe config: NO database adapter, NO bcrypt, NO Prisma.
// Used by middleware and shared with the full server-side config in auth.ts.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
    jwt: ({ token, user }) => {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};
