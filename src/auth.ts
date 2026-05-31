import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const DUMMY_HASH = "$2b$12$LKqGRinMwhY2ADRyR7hAJuRQCHKsLBRf7HVW.Q7BEYXy1FkCMnboe"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  logger: {
    error(err) {
      if (err.name === "CredentialsSignin") {
        console.warn("[auth] login failed")
        return
      }
      console.error(err)
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email do ET", type: "email" },
        password: { label: "Senha estelar", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) {
          await bcrypt.compare(password, DUMMY_HASH)
          return null
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.callsign,
          image: user.image,
        };
      },
    }),
  ],
});
