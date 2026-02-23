/**
 * @file api/products/[id]/route.ts
 * @description API routes for single product operations (Controller Layer)
 *
 * GET    /api/products/[id] - Get product by ID
 * PUT    /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getProductById, updateProduct, deleteProduct } from "@/app/service/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ==========================================
// GET /api/products/[id] - Get Single Product
// ==========================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await getProductById(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// PUT /api/products/[id] - Update Product
// ==========================================

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();

    // Ensure price is number if provided
    const input = {
      ...body,
      ...(body.price !== undefined && {
        price: typeof body.price === "string" ? parseFloat(body.price) : body.price,
      }),
    };

    const result = await updateProduct(id, input);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: result.error === "Produk tidak ditemukan" ? 404 : 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// DELETE /api/products/[id] - Delete Product
// ==========================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Auth check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteProduct(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.error === "Produk tidak ditemukan" ? 404 : 400 });
    }

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
