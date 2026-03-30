import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {      
      if (!user.email) {
        console.error('No email provided by OAuth provider');
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          // Create new user
          await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              image: user.image,
            }
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as UserRole) ?? UserRole.USER;
      }

      return session;
    }
  }
})