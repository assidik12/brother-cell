/**
 * @file api/vouchers/[id]/route.ts
 * @description API routes for single voucher operations
 *
 * GET    /api/vouchers/[id] - Get voucher by ID
 * PUT    /api/vouchers/[id] - Update voucher
 * DELETE /api/vouchers/[id] - Delete voucher
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getVoucherById, updateVoucher, deleteVoucher } from "@/app/service/voucher";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ==========================================
// GET /api/vouchers/[id] - Get Single Voucher
// ==========================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await getVoucherById(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("GET /api/vouchers/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// PUT /api/vouchers/[id] - Update Voucher
// ==========================================

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = await updateVoucher(id, body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: result.error === "Voucher tidak ditemukan" ? 404 : 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("PUT /api/vouchers/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE /api/vouchers/[id] - Delete Voucher
// ==========================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteVoucher(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.error === "Voucher tidak ditemukan" ? 404 : 400 });
    }

    return NextResponse.json({ success: true, message: "Voucher berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/vouchers/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
