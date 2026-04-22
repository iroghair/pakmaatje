import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { verifyPassword } from "./password"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password

        if (!email || !password) {
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user?.passwordHash) {
          return null
        }

        const isValidPassword = verifyPassword(password, user.passwordHash)

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        return token
      }

      if (!token.sub) {
        return token
      }

      const dbUser = await prisma.user.findUnique({ where: { id: token.sub } })

      if (!dbUser) {
        return token
      }

      token.role = dbUser.role
      token.status = dbUser.status
      token.name = dbUser.name
      token.email = dbUser.email

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ""
        session.user.role = typeof token.role === "string" ? token.role : "USER"
        session.user.status = typeof token.status === "string" ? token.status : "PENDING"
        session.user.name = typeof token.name === "string" ? token.name : null
        session.user.email = typeof token.email === "string" ? token.email : null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
