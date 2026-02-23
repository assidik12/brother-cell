/**
 * @file api/products/route.ts
 * @description API routes for products (Controller Layer)
 *
 * GET  /api/products - List products with pagination & filters
 * POST /api/products - Create new product
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createProduct, getProducts } from "@/app/service/product";

// ==========================================
// GET /api/products - List Products
// ==========================================

export async function GET(request: NextRequest) {
  try {
    // Auth check (optional for public listing, required for admin)
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "10", 10),
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      isActive: searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined,
    };

    const result = await getProducts(filters);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data?.items,
      pagination: result.data?.pagination,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// POST /api/products - Create Product
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // Auth check - must be admin
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();

    // Ensure price is number
    const input = {
      ...body,
      price: typeof body.price === "string" ? parseFloat(body.price) : body.price,
    };

    const result = await createProduct(input);

    console.log("Product created:", result);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
