import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Get SSL configuration for database connection
 * - Local: Uses ./ca.pem file directly
 * - Vercel: Decodes DATABASE_CA_BASE64 env var and writes to temp file
 */
function getConnectionString(): string {
  const baseUrl = process.env.DATABASE_URL || "";

  // If running on Vercel (or any env with DATABASE_CA_BASE64)
  if (process.env.DATABASE_CA_BASE64) {
    try {
      // Decode base64 certificate
      const certContent = Buffer.from(process.env.DATABASE_CA_BASE64, "base64").toString("utf-8");

      // Write to temp directory
      const tempCertPath = path.join(os.tmpdir(), "aiven-ca.pem");
      fs.writeFileSync(tempCertPath, certContent);

      // Replace the sslrootcert path in the URL
      const url = new URL(baseUrl);
      url.searchParams.set("sslmode", "verify-ca");
      url.searchParams.set("sslrootcert", tempCertPath);

      return url.toString();
    } catch (error) {
      console.error("Failed to setup SSL certificate:", error);
      // Fallback to require mode without cert verification
      const url = new URL(baseUrl);
      url.searchParams.set("sslmode", "require");
      url.searchParams.delete("sslrootcert");
      return url.toString();
    }
  }

  // Local development - use the URL as-is (with ./ca.pem)
  return baseUrl;
}

const connectionString = getConnectionString();

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
