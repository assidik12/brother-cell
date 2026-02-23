/**
 * @file api/vouchers/route.ts
 * @description API routes for vouchers (Controller Layer)
 *
 * GET  /api/vouchers - List vouchers with pagination & filters
 * POST /api/vouchers - Create single voucher
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createVoucher, getVouchers } from "@/app/service/voucher";

// ==========================================
// GET /api/vouchers - List Vouchers
// ==========================================

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
      search: searchParams.get("search") || undefined,
      productId: searchParams.get("productId") || undefined,
      status: (searchParams.get("status") as "available" | "sold" | "reserved") || undefined,
    };

    const result = await getVouchers(filters);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data?.items,
      pagination: result.data?.pagination,
    });
  } catch (error) {
    console.error("GET /api/vouchers error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// POST /api/vouchers - Create Single Voucher
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = await createVoucher(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/vouchers error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
