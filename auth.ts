import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const { handlers, signIn, signOut, auth, unstable_update: update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      from: "Online Marketplace <noreply@mail.onlinemarketplace.app>",
      apiKey: process.env.AUTH_RESEND_KEY,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // so we can show the error message on UI
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role ?? UserRole.USER;
      }
      
      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as UserRole) ?? UserRole.USER;
      }

      return session;
    },
  },
});
