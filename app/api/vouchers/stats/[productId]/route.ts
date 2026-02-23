/**
 * @file api/vouchers/stats/[productId]/route.ts
 * @description API route for voucher statistics by product
 *
 * GET /api/vouchers/stats/[productId] - Get voucher stats
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getVoucherStats } from "@/app/service/voucher";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

// ==========================================
// GET /api/vouchers/stats/[productId]
// ==========================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { productId } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await getVoucherStats(productId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("GET /api/vouchers/stats/[productId] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
