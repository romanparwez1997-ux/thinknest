import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  // 1. Upgrade the Session object
  interface Session {
    user: {
      id: string
      role: string
      isPremium: boolean
    } & DefaultSession["user"]
  }

  // 2. Upgrade the User object
  interface User {
    id: string
    role: string
    isPremium: boolean
  }
}

declare module "next-auth/jwt" {
  // 3. Upgrade the JWT token
  interface JWT {
    id: string
    role: string
    isPremium: boolean
  }
}