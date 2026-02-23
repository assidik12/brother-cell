/**
 * @file api/auth/[...nextauth]/route.ts
 * @description NextAuth.js configuration for authentication (Controller Layer)
 *
 * Controller ini hanya menangani request/response.
 * Logika bisnis didelegasikan ke Service layer.
 */

import AuthService from "@/app/service/auth";
import { SignIn } from "@/app/service/auth/method";
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

        // Delegate ke Service layer
        const result = await SignIn(credentials.username);
        console.log("AuthService.signIn result:", result);

        // Return user object for JWT (or null on failure)
        if (!result) {
          return null;
        }
        return {
          id: result.id,
          name: result.username,
          role: "owner",
        };
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
