/**
 * @file api/dashboard/route.ts
 * @description Dashboard summary API (admin only)
 *
 * GET /api/dashboard
 *  Returns in a single round-trip:
 *  - stats: total products, total available vouchers, today's trx count, today's revenue
 *  - recentTransactions: 5 most recent transactions
 *  - lowStockProducts: active products whose available-voucher count < 5, sorted asc by stock
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Run all queries in parallel
    const [totalProducts, totalAvailableVouchers, todayTrxCount, todayRevenue, recentTransactions, productsWithVoucherCount] = await Promise.all([
      // 1. Total active products
      prisma.product.count({ where: { isActive: true } }),

      // 2. Total available vouchers across all products
      prisma.voucher.count({ where: { status: "available" } }),

      // 3. Today's transaction count (SUCCESS only)
      prisma.transaction.count({
        where: {
          status: "SUCCESS",
          paidAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      // 4. Today's revenue
      prisma.transaction.aggregate({
        where: {
          status: "SUCCESS",
          paidAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),

      // 5. 5 most recent transactions
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true } },
        },
      }),

      // 6. All active products with their available-voucher count
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              vouchers: { where: { status: "available" } },
            },
          },
        },
      }),
    ]);

    // Filter products where available vouchers < 5, sort by stock ascending
    const lowStockProducts = productsWithVoucherCount
      .filter((p) => p._count.vouchers < 5)
      .sort((a, b) => a._count.vouchers - b._count.vouchers)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p._count.vouchers,
      }));

    // Shape recent transactions for the dashboard view
    const formattedTransactions = recentTransactions.map((trx) => ({
      id: trx.orderId,
      product: trx.product?.name ?? "—",
      phone: maskPhone(trx.phoneNumber),
      amount: Number(trx.amount),
      status: trx.status,
      time: timeAgo(trx.createdAt),
    }));

    const revenue = Number(todayRevenue._sum.amount ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalAvailableVouchers,
          todayTrxCount,
          todayRevenue: revenue,
        },
        recentTransactions: formattedTransactions,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ==========================================
// HELPERS
// ==========================================

/** Mask phone number: 0812****5678 */
function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  const visible = 4;
  return phone.slice(0, visible) + "****" + phone.slice(-4);
}

/** Human-readable relative time (Indonesian) */
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds} detik lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}
