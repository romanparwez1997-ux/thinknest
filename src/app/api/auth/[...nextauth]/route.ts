import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" } 
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectMongo();

        // 1. Check if user exists
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        // 2. Check Password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        // 3. THE 2FA CHECK
        if (!credentials.otp) {
          throw new Error("2FA verification code is required");
        }

        const validToken = await VerificationToken.findOne({
          email: credentials.email,
          code: credentials.otp,
          purpose: "2fa" 
        });

        if (!validToken) {
          throw new Error("Invalid or expired 2FA code");
        }

        // 4. Clean up the used token so it can't be reused
        await VerificationToken.deleteOne({ _id: validToken._id });

        // 5. THE NEW TRIAL BOUNCER LOGIC
        let currentPremiumStatus = user.isPremium;

        // If they have premium AND an expiration date set
        if (user.isPremium && user.premiumExpiresAt) {
          const now = new Date();
          
          // Has the 30 days passed?
          if (now > user.premiumExpiresAt) {
            currentPremiumStatus = false; // Revoke access for this login session
            
            // Permanently update the database so they are a free user until they pay
            await User.updateOne(
              { _id: user._id },
              { $set: { isPremium: false, premiumExpiresAt: null } }
            );
          }
        }

        // 6. Success! Issue the secure session with the strictly verified premium status
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: currentPremiumStatus 
        };
      }
    })
  ],
  callbacks: {
    // Package up the custom user data into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isPremium = (user as any).isPremium;
      }
      return token;
    },
    // Pass the JWT token data to the frontend session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isPremium = token.isPremium;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };