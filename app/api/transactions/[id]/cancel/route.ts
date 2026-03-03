/**
 * @file api/transactions/[id]/cancel/route.ts
 * @description Cancel a PENDING transaction (payment failed / user cancelled)
 *
 * POST /api/transactions/[id]/cancel
 *  - Releases the reserved voucher back to available
 *  - Marks transaction as FAILED
 */

import { NextRequest, NextResponse } from "next/server";
import { cancelTransaction } from "@/app/service/transaction";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await cancelTransaction(id);

    if (!result.success) {
      const status = result.error === "Transaksi tidak ditemukan" ? 404 : result.error?.startsWith("Transaksi sudah berstatus") ? 409 : 500;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dibatalkan",
      data: result.data,
    });
  } catch (error) {
    console.error("POST /api/transactions/[id]/cancel error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
