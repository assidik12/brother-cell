/**
 * @file api/transactions/webhook/route.ts
 * @description Midtrans payment notification webhook
 *
 * POST /api/transactions/webhook
 *  - Verifies Midtrans SHA-512 signature
 *  - Maps transaction_status → confirm (SUCCESS) or cancel (FAILED)
 *
 * Signature format (Midtrans docs):
 *   SHA512( order_id + status_code + gross_amount + server_key )
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { handleWebhook } from "@/app/service/transaction";

// ==========================================
// SIGNATURE VERIFICATION
// ==========================================

function verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const expected = createHash("sha512").update(raw).digest("hex");
  return expected === signatureKey;
}

// ==========================================
// POST /api/transactions/webhook
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify Midtrans signature to prevent spoofed notifications
    const { order_id, status_code, gross_amount, signature_key } = body;

    if (!verifySignature(order_id, status_code, gross_amount, signature_key)) {
      console.warn("Midtrans webhook: invalid signature for order", order_id);
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 });
    }

    const result = await handleWebhook(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: 400 });
    }

    // Midtrans expects HTTP 200 to acknowledge the notification
    return NextResponse.json({ success: true, message: "Notifikasi berhasil diproses" });
  } catch (error) {
    console.error("POST /api/transactions/webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
