import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: string
      status: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    image?: string | null
    role: string
    status: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    status?: string
    image?: string | null
  }
}
