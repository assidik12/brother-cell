/**
 * @file api/transactions/route.ts
 * @description Transaction API routes
 *
 * GET  /api/transactions       → List all transactions (admin only)
 * POST /api/transactions       → Initiate a new transaction (public - customer)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { initiateTransaction, getTransactions } from "@/app/service/transaction";

// ==========================================
// GET /api/transactions - List Transactions (Admin)
// ==========================================

export async function GET(request: NextRequest) {
  try {
    // Admin only
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const filters = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
      search: searchParams.get("search") || undefined,
      status: (searchParams.get("status") as "PENDING" | "SUCCESS" | "FAILED" | null) || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const result = await getTransactions(filters);

    if (!result.success) {
      const isServerError = result.error === "Gagal mengambil daftar transaksi";
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: isServerError ? 500 : 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data?.items,
      pagination: {
        page: result.data?.page,
        perPage: result.data?.perPage,
        total: result.data?.total,
        totalPages: Math.ceil((result.data?.total ?? 0) / (result.data?.perPage ?? 20)),
      },
    });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// POST /api/transactions - Initiate Transaction (Public)
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await initiateTransaction(body);

    if (!result.success) {
      const isServerError = result.error === "Gagal membuat transaksi";
      return NextResponse.json({ success: false, error: result.error, errors: result.errors }, { status: isServerError ? 500 : 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi berhasil dibuat, selesaikan pembayaran",
        data: {
          transaction: result.data?.transaction,
          payment: result.data?.payment,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
