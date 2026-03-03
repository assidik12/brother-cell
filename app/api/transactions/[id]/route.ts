/**
 * @file api/transactions/[id]/route.ts
 * @description Single transaction operations
 *
 * GET  /api/transactions/[id]         → Get transaction by ID (admin only)
 * POST /api/transactions/[id]/confirm → Confirm payment success (dummy)
 * POST /api/transactions/[id]/cancel  → Cancel / payment failed
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getTransactionById } from "@/app/service/transaction";

type RouteParams = { params: Promise<{ id: string }> };

// ==========================================
// GET /api/transactions/[id]
// ==========================================

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await getTransactionById(id);

    if (!result.success) {
      const isNotFound = result.error === "Transaksi tidak ditemukan";
      return NextResponse.json({ success: false, error: result.error }, { status: isNotFound ? 404 : 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
