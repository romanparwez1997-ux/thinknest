import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        await connectMongo();

        // 1. Find the user
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        // 2. Check the password
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        // 3. Return the user object to save in the session
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role, // We need this to route them to the right dashboard!
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isPremium = (user as any).isPremium;
        token.premiumExpiresAt = (user as any).premiumExpiresAt; // NEW
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isPremium = token.isPremium;
        (session.user as any).premiumExpiresAt = token.premiumExpiresAt; // NEW
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Tell NextAuth to use our custom login page
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };