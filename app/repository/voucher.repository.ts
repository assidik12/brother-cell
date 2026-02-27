/**
 * @file repository/voucher.repository.ts
 * @description Voucher repository - Prisma queries
 *
 * Critical: Uses row locking for claim operations to prevent race conditions
 */

import { prisma } from "@/app/lib/prisma";
import type { Prisma, VoucherStatus } from "../generated/prisma/client";

// ==========================================
// TYPES
// ==========================================

export type CreateVoucherInput = {
  productId: string;
  code: string;
  status?: VoucherStatus;
};

export type FindVouchersOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  productId?: string;
  status?: VoucherStatus;
};

// ==========================================
// CREATE SINGLE VOUCHER
// ==========================================

export async function createVoucherRepository(data: CreateVoucherInput) {
  return prisma.voucher.create({
    data: {
      productId: data.productId,
      code: data.code,
      status: data.status ?? "available",
    },
  });
}

// ==========================================
// BULK CREATE VOUCHERS
// ==========================================

export async function createManyVouchersRepository(productId: string, codes: string[]) {
  // Use transaction for atomicity
  return prisma.$transaction(async (tx) => {
    const data = codes.map((code) => ({
      productId,
      code,
      status: "available" as VoucherStatus,
    }));

    // createMany for performance
    const result = await tx.voucher.createMany({
      data,
      skipDuplicates: true, // Skip if code already exists
    });

    return {
      created: result.count,
      total: codes.length,
      skipped: codes.length - result.count,
    };
  });
}

// ==========================================
// FIND VOUCHER BY ID
// ==========================================

export async function findVoucherByIdRepository(id: string) {
  return prisma.voucher.findUnique({
    where: { id },
    include: {
      product: {
        select: { id: true, name: true, price: true },
      },
    },
  });
}

// ==========================================
// FIND VOUCHERS (LIST WITH PAGINATION)
// ==========================================

export async function findVouchersRepository(opts: FindVouchersOptions = {}) {
  const { page = 1, perPage = 20, search, productId, status } = opts;

  const where: Prisma.VoucherWhereInput = {};
  if (status) where.status = status;
  if (productId) where.productId = productId;
  if (search) {
    where.code = { contains: search, mode: "insensitive" };
  }

  const [items, total] = await prisma.$transaction([
    prisma.voucher.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.voucher.count({ where }),
  ]);

  return { items, total, page, perPage };
}

// ==========================================
// UPDATE VOUCHER
// ==========================================

export async function updateVoucherRepository(id: string, data: Partial<Pick<CreateVoucherInput, "code" | "status">>) {
  return prisma.voucher.update({
    where: { id },
    data: {
      ...(data.code ? { code: data.code } : {}),
      ...(data.status ? { status: data.status } : {}),
    },
  });
}

// ==========================================
// DELETE VOUCHER
// ==========================================

export async function deleteVoucherRepository(id: string) {
  return prisma.voucher.delete({ where: { id } });
}

// ==========================================
// COUNT VOUCHERS
// ==========================================

export async function countVouchersRepository(filters: { productId?: string; status?: VoucherStatus } = {}) {
  const where: Prisma.VoucherWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.productId) where.productId = filters.productId;
  return prisma.voucher.count({ where });
}

// ==========================================
// GET AVAILABLE VOUCHERS BY PRODUCT
// ==========================================

export async function findAvailableVouchersByProductRepository(productId: string) {
  return prisma.voucher.findMany({
    where: { productId, status: "available" },
    orderBy: { createdAt: "asc" }, // FIFO - oldest first
  });
}

// ==========================================
// CLAIM VOUCHER (CRITICAL - WITH ROW LOCKING)
// ==========================================

/**
 * Claim one available voucher for a product
 * Uses SELECT FOR UPDATE to prevent race conditions
 *
 * @param productId - Product to claim voucher from
 * @param transactionId - Transaction that claims the voucher
 * @returns Claimed voucher or null if none available
 */
export async function claimVoucherRepository(productId: string, transactionId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Find and lock one available voucher (FIFO)
    // Using raw query for SELECT FOR UPDATE (row locking)
    const availableVouchers = await tx.$queryRaw<{ id: string; code: string }[]>`
      SELECT id, code 
      FROM vouchers 
      WHERE product_id = ${productId}::uuid 
        AND status = 'available' 
      ORDER BY created_at ASC 
      LIMIT 1 
      FOR UPDATE SKIP LOCKED
    `;

    if (availableVouchers.length === 0) {
      return null; // No voucher available
    }

    const voucherToClaim = availableVouchers[0];

    // 2. Update voucher status to 'sold' and link to transaction
    const claimedVoucher = await tx.voucher.update({
      where: { id: voucherToClaim.id },
      data: {
        status: "sold",
        transaction: {
          connect: { id: transactionId },
        },
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    });

    return claimedVoucher;
  });
}

// ==========================================
// RESERVE VOUCHER (FOR PENDING PAYMENT)
// ==========================================

/**
 * Reserve a voucher temporarily during payment process
 * Prevents double-selling during payment window
 */
export async function reserveVoucherRepository(productId: string) {
  return prisma.$transaction(async (tx) => {
    // Find and lock one available voucher
    const availableVouchers = await tx.$queryRaw<{ id: string }[]>`
      SELECT id 
      FROM vouchers 
      WHERE product_id = ${productId}::uuid 
        AND status = 'available' 
      ORDER BY created_at ASC 
      LIMIT 1 
      FOR UPDATE SKIP LOCKED
    `;

    if (availableVouchers.length === 0) {
      return null;
    }

    // Reserve it
    const reservedVoucher = await tx.voucher.update({
      where: { id: availableVouchers[0].id },
      data: { status: "reserved" },
    });

    return reservedVoucher;
  });
}

// ==========================================
// RELEASE RESERVED VOUCHER (PAYMENT FAILED/TIMEOUT)
// ==========================================

export async function releaseVoucherRepository(voucherId: string) {
  return prisma.voucher.update({
    where: { id: voucherId },
    data: { status: "available" },
  });
}

// ==========================================
// GET VOUCHER STATS BY PRODUCT
// ==========================================

export async function getVoucherStatsByProductRepository(productId: string) {
  const [available, sold, reserved] = await prisma.$transaction([
    prisma.voucher.count({ where: { productId, status: "available" } }),
    prisma.voucher.count({ where: { productId, status: "sold" } }),
    prisma.voucher.count({ where: { productId, status: "reserved" } }),
  ]);

  return { available, sold, reserved, total: available + sold + reserved };
}
