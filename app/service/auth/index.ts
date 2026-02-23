/**
 * @file service/auth/index.ts
 * @description Auth service - Unified exports
 *
 * Server-side: Business logic functions (untuk API routes / NextAuth)
 * Client-side: Axios instance methods (untuk frontend components)
 */

import instance from "@/app/lib/axios/instance";
import type { LoginType, RegisterType } from "@/app/types/auth.type";

// ==========================================
// SERVER-SIDE EXPORTS (untuk API Routes / NextAuth)
// ==========================================

export { SignUp, SignIn, checkUsernameExists } from "./method";

// ==========================================
// CLIENT-SIDE API (untuk Frontend Components)
// ==========================================

export const AuthAPI = {
  /**
   * Register new admin account
   */
  signUp: (data: RegisterType) => instance.post("/api/user/register", data),

  /**
   * Login with credentials (uses NextAuth)
   */
  signIn: (data: LoginType) => instance.post("/api/auth/login", data),
};

// Backward compatibility
export const AuthService = AuthAPI;

export default AuthAPI;
