import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  // @ts-ignore - PrismaAdapter types mismatch slightly with NextAuthOptions sometimes
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // @ts-ignore - Add custom fields to session
        session.user.role = user.role
        // @ts-ignore
        session.user.status = user.status
      }
      return session
    },
  },
  events: {
    async createUser(message) {
      // If this is the admin email, automatically approve and make admin
      if (message.user.email === process.env.ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: message.user.id },
          data: {
            role: "ADMIN",
            status: "APPROVED",
          },
        })
      }
    },
  },
  pages: {
    signIn: "/login",
  },
}
