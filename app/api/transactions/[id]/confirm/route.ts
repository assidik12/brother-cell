/**
 * @file api/transactions/[id]/confirm/route.ts
 * @description Confirm payment success for a PENDING transaction
 *
 * POST /api/transactions/[id]/confirm
 *  - Marks transaction as SUCCESS
 *  - Claims the reserved voucher (status → sold, linked to transaction)
 *  - Sets paidAt timestamp
 */

import { NextRequest, NextResponse } from "next/server";
import { confirmTransaction } from "@/app/service/transaction";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await confirmTransaction(id);

    if (!result.success) {
      const status = result.error === "Transaksi tidak ditemukan" ? 404 : result.error?.startsWith("Transaksi sudah berstatus") ? 409 : 500;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil dikonfirmasi",
      data: result.data,
    });
  } catch (error) {
    console.error("POST /api/transactions/[id]/confirm error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
