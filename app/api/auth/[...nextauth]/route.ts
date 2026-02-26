/**
 * @file api/auth/[...nextauth]/route.ts
 * @description NextAuth.js configuration for authentication (Controller Layer)
 *
 * Controller ini hanya menangani request/response.
 * Logika bisnis didelegasikan ke Service layer.
 */

import { SignIn } from "@/app/service/auth/method";
import { compareSync } from "bcrypt";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

// ==========================================
// NEXTAUTH CONFIGURATION
// ==========================================

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password wajib diisi");
        }

        try {
          // Find user in database
          const admin = await SignIn(credentials.username);

          if (!admin) {
            return null;
          }

          // Verify password
          const isPasswordValid = compareSync(credentials.password, admin.password);

          if (!isPasswordValid) {
            return null;
          }

          // Return user object for JWT
          return {
            id: admin.id,
            name: admin.username,
            role: "owner",
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback - called whenever a JWT is created or updated
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "owner";
      }
      return token;
    },
    /**
     * Session callback - called whenever session is checked
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
};

// ==========================================
// ROUTE HANDLERS
// ==========================================

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
