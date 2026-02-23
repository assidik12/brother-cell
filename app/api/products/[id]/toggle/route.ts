/**
 * @file api/products/[id]/toggle/route.ts
 * @description API route to toggle product active status
 *
 * PATCH /api/products/[id]/toggle - Toggle isActive status
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { toggleProductStatus } from "@/app/service/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ==========================================
// PATCH /api/products/[id]/toggle - Toggle Status
// ==========================================

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await toggleProductStatus(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.error === "Produk tidak ditemukan" ? 404 : 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Produk berhasil ${result.data?.isActive ? "diaktifkan" : "dinonaktifkan"}`,
    });
  } catch (error) {
    console.error("PATCH /api/products/[id]/toggle error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
