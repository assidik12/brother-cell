/**
 * @file repository/transaction.repository.ts
 * @description Transaction repository - Prisma queries
 */

import { prisma } from "@/app/lib/prisma";
import type { Prisma, TrxStatus } from "../generated/prisma/client";

// ==========================================
// TYPES
// ==========================================

export type CreateTransactionInput = {
  orderId: string;
  productId: string;
  phoneNumber: string;
  amount: number;
  status?: TrxStatus;
};

export type FindTransactionsOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: TrxStatus;
  startDate?: string;
  endDate?: string;
};

// ==========================================
// CREATE TRANSACTION
// ==========================================

export async function createTransactionRepository(data: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      orderId: data.orderId,
      productId: data.productId,
      phoneNumber: data.phoneNumber,
      amount: data.amount,
      status: data.status ?? "PENDING",
    },
    include: {
      product: { select: { id: true, name: true, price: true } },
    },
  });
}

// ==========================================
// FIND TRANSACTION BY ID
// ==========================================

export async function findTransactionByIdRepository(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, price: true } },
      voucher: { select: { id: true, code: true } },
    },
  });
}

// ==========================================
// FIND TRANSACTION BY ORDER ID
// ==========================================

export async function findTransactionByOrderIdRepository(orderId: string) {
  return prisma.transaction.findUnique({
    where: { orderId },
    include: {
      product: { select: { id: true, name: true, price: true } },
      voucher: { select: { id: true, code: true } },
    },
  });
}

// ==========================================
// FIND TRANSACTIONS (LIST WITH PAGINATION)
// ==========================================

export async function findTransactionsRepository(opts: FindTransactionsOptions = {}) {
  const { page = 1, perPage = 20, search, status, startDate, endDate } = opts;

  const where: Prisma.TransactionWhereInput = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [{ orderId: { contains: search, mode: "insensitive" } }, { phoneNumber: { contains: search, mode: "insensitive" } }];
  }
  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };
  }

  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, price: true } },
        voucher: { select: { id: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page, perPage };
}

// ==========================================
// UPDATE TRANSACTION STATUS
// ==========================================

export async function updateTransactionStatusRepository(id: string, status: TrxStatus, voucherId?: string, paidAt?: Date) {
  return prisma.transaction.update({
    where: { id },
    data: {
      status,
      ...(voucherId ? { voucherId } : {}),
      ...(paidAt ? { paidAt } : {}),
    },
    include: {
      product: { select: { id: true, name: true, price: true } },
      voucher: { select: { id: true, code: true } },
    },
  });
}
