/**
 * @file middleware.ts
 * @description Next.js middleware for route protection
 *
 * Protects admin routes and redirects unauthenticated users to login.
 * Uses NextAuth.js JWT token for authentication check.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ==========================================
// PROTECTED ROUTES CONFIGURATION
// ==========================================

const protectedRoutes = ["/admin"];
const authRoutes = ["/auth/login", "/auth/register"];

// ==========================================
// MIDDLEWARE FUNCTION
// ==========================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the JWT token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Check if accessing protected route without auth
  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isAccessingProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if authenticated user trying to access auth pages
  const isAccessingAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAccessingAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

// ==========================================
// MATCHER CONFIGURATION
// ==========================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (api/*)
     * - static files (_next/static/*)
     * - image optimization (_next/image/*)
     * - favicon.ico
     * - public files (public/*)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
