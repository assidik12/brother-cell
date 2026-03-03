/**
 * @file api/config/payment/route.ts
 * @description Exposes public Midtrans client key to the frontend (safe — not the server key)
 *
 * GET /api/config/payment
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  });
}
