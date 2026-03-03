/**
 * @file api/transactions/by-order/[orderId]/route.ts
 * @description Look up a transaction by orderId (public — used after Midtrans redirect)
 *
 * GET /api/transactions/by-order/:orderId
 */

import { NextRequest, NextResponse } from "next/server";
import { findTransactionByOrderIdRepository } from "@/app/repository/transaction.repository";

type RouteParams = { params: Promise<{ orderId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    const trx = await findTransactionByOrderIdRepository(orderId);
    if (!trx) {
      return NextResponse.json({ success: false, error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trx });
  } catch (error) {
    console.error("GET /api/transactions/by-order/[orderId] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
