/**
 * @file app/lib/prisma.ts
 * @description Prisma Client singleton instance
 *
 * This module provides a singleton instance of PrismaClient
 * to prevent multiple instances during development hot-reload.
 * Also handles SSL certificate for Aiven PostgreSQL in production.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// ==========================================
// SSL CERTIFICATE SETUP FOR AIVEN
// ==========================================

function setupSSLCertificate(): string | null {
  // Check if we have base64 encoded certificate (for Vercel)
  const caBase64 = process.env.DATABASE_CA_BASE64;

  if (caBase64) {
    try {
      // Decode base64 certificate
      const caCert = Buffer.from(caBase64, "base64").toString("utf-8");

      // Write to temp file
      const tempCertPath = "/tmp/aiven-ca.pem";
      fs.writeFileSync(tempCertPath, caCert);

      console.log("SSL Certificate written to:", tempCertPath);
      return tempCertPath;
    } catch (error) {
      console.error("Failed to setup SSL certificate from base64:", error);
      return null;
    }
  }

  // For local development, check if ca.pem exists in certs folder
  const localCertPath = path.join(process.cwd(), "certs", "ca.pem");
  if (fs.existsSync(localCertPath)) {
    console.log("Using local SSL Certificate:", localCertPath);
    return localCertPath;
  }

  return null;
}

// ==========================================
// DATABASE URL CONFIGURATION
// ==========================================

function getDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // If running on Vercel (DATABASE_CA_BASE64 is set), modify the connection string
  if (process.env.DATABASE_CA_BASE64) {
    const certPath = setupSSLCertificate();

    if (certPath) {
      // Parse the URL and rebuild with correct SSL settings
      const url = new URL(dbUrl);

      // Remove existing SSL params
      url.searchParams.delete("sslmode");
      url.searchParams.delete("sslrootcert");
      url.searchParams.delete("sslaccept");

      // Add correct SSL params for Vercel
      url.searchParams.set("sslmode", "verify-full");
      url.searchParams.set("sslrootcert", certPath);

      dbUrl = url.toString();
      console.log("Prisma connecting with SSL certificate");
    }
  } else {
    // Local development - just log the connection
    console.log("Prisma connecting with local configuration");
  }

  return dbUrl;
}

// ==========================================
// PRISMA CLIENT SINGLETON
// ==========================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = getDatabaseUrl();

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
