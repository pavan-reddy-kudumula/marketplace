import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback triggered', { user, account, profile });
      
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
          const newUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              image: user.image,
            }
          });
          console.log('New user created:', newUser);
        } else {
          console.log('Existing user found:', existingUser);
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    }
  }
})