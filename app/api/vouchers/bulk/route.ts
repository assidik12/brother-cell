/**
 * @file api/vouchers/bulk/route.ts
 * @description API route for bulk voucher creation
 *
 * POST /api/vouchers/bulk - Create multiple vouchers at once
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createBulkVouchers } from "@/app/service/voucher";

// ==========================================
// POST /api/vouchers/bulk - Bulk Create Vouchers
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = await createBulkVouchers(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `Berhasil membuat ${result.data?.created} dari ${result.data?.total} voucher`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/vouchers/bulk error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
