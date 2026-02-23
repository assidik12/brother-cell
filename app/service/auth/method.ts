/**
 * @file service/auth/method.ts
 * @description Authentication service methods
 *
 * Handles database operations for admin authentication.
 */

import { hashSync } from "bcrypt";
import { prisma } from "@/app/lib/prisma";

// ==========================================
// TYPES
// ==========================================

interface RegisterData {
  username: string;
  password: string;
}

interface AdminRecord {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
}

// ==========================================
// SERVICE METHODS
// ==========================================

/**
 * Register a new admin account
 * @param userData - Username and password for new admin
 * @returns Created admin record (without password) or null on failure
 */
export async function SignUp(userData: RegisterData): Promise<Omit<AdminRecord, "password"> | null> {
  try {
    const hashedPassword = hashSync(userData.password, 12);

    const admin = await prisma.admin.create({
      data: {
        username: userData.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    return admin as Omit<AdminRecord, "password">;
  } catch (error) {
    console.error("SignUp error:", error);
    return null;
  }
}

/**
 * Find admin by username for authentication
 * @param username - Admin username to search
 * @returns Admin record with password for verification
 */
export async function SignIn(username: string): Promise<AdminRecord | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        createdAt: true,
      },
    });

    return admin as AdminRecord | null;
  } catch (error) {
    console.error("SignIn error:", error);
    return null;
  }
}

/**
 * Check if username already exists
 * @param username - Username to check
 * @returns true if username exists
 */
export async function checkUsernameExists(username: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
      select: { id: true },
    });
    return !!admin;
  } catch (error) {
    console.error("checkUsernameExists error:", error);
    return false;
  }
}
