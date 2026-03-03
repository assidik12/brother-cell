/**
 * @file lib/midtrans/index.ts
 * @description Midtrans Snap server-side client (singleton)
 *
 * Used ONLY in server-side code (API routes / service layer).
 * Never import this in "use client" components.
 *
 * Required env vars:
 *   MIDTRANS_SERVER_KEY   — from Midtrans dashboard → Settings → Access Keys
 *   MIDTRANS_CLIENT_KEY   — from Midtrans dashboard → Settings → Access Keys
 *   MIDTRANS_IS_PRODUCTION — set to "true" for production, omit / "false" for sandbox
 */

import Midtrans from "midtrans-client";

if (!process.env.MIDTRANS_SERVER_KEY) {
  throw new Error("MIDTRANS_SERVER_KEY env var is not set");
}
if (!process.env.MIDTRANS_CLIENT_KEY) {
  throw new Error("MIDTRANS_CLIENT_KEY env var is not set");
}

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

const midtransClient = new Midtrans.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export default midtransClient;

/** Client key exposed for embedding Snap.js in the browser */
export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
export const MIDTRANS_IS_PRODUCTION = isProduction;
