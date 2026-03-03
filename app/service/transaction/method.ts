/**
 * @file service/transaction/method.ts
 * @description Transaction service layer - business logic
 *
 * Flow:
 * 1. initiateTransaction  → validate → check product → reserve voucher → create PENDING trx → dummy payment
 * 2. confirmTransaction   → verify webhook → claim reserved voucher → set SUCCESS + paidAt
 * 3. cancelTransaction    → release reserved voucher → set FAILED
 */

import type { TrxStatus } from "@/app/generated/prisma/client";
import {
  createTransactionRepository,
  findTransactionByIdRepository,
  findTransactionByOrderIdRepository,
  findTransactionsRepository,
  updateTransactionStatusRepository,
  type FindTransactionsOptions,
} from "@/app/repository/transaction.repository";
import { reserveVoucherRepository, claimVoucherRepository, releaseVoucherRepository } from "@/app/repository/voucher.repository";
import { findProductByIdRepository } from "@/app/repository/product.repository";
import { initiateTransactionSchema, midtransWebhookSchema, transactionFilterSchema, type InitiateTransactionInput, type MidtransWebhookInput, type TransactionFilterInput } from "@/app/validators/transaction.schema";

// ==========================================
// TYPES
// ==========================================

export type ServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// ==========================================
// MIDTRANS SNAP PAYMENT
// ==========================================

/**
 * Create a real Midtrans Snap transaction token.
 * Returns snap_token + redirect_url for the frontend to open the Snap popup.
 */
async function createSnapTransaction(orderId: string, amount: number, phoneNumber: string) {
  // Dynamic import keeps midtrans-client out of the client bundle
  const midtrans = (await import("@/app/lib/midtrans")).default;

  // finish callback URL: send the user back to our own app with order info as query params
  // so we can detect a completed payment even if the popup redirects instead of calling onSuccess
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const finishUrl = `${baseUrl}/?order_id=${orderId}&transaction_status=settlement`;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      phone: phoneNumber,
    },
    expiry: {
      unit: "minutes",
      duration: 15,
    },
    callbacks: {
      finish: finishUrl,
    },
  };

  const snapResponse = await midtrans.createTransaction(parameter);

  return {
    token: snapResponse.token as string,
    redirectUrl: snapResponse.redirect_url as string,
    orderId,
    amount,
    phoneNumber,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

// ==========================================
// INITIATE TRANSACTION
// ==========================================

/**
 * POST /api/transactions
 * 1. Validate input
 * 2. Check product exists & active
 * 3. Reserve one available voucher (row-locked, FIFO)
 * 4. Generate a unique orderId
 * 5. Create PENDING transaction
 * 6. Call dummy payment gateway
 * 7. Return payment info to client
 */
export async function initiateTransaction(input: InitiateTransactionInput): Promise<
  ServiceResult<{
    transaction: Awaited<ReturnType<typeof createTransactionRepository>>;
    payment: Awaited<ReturnType<typeof createSnapTransaction>>;
  }>
> {
  try {
    // 1. Validate
    const validated = initiateTransactionSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { productId, phoneNumber } = validated.data;

    // 2. Check product
    const product = await findProductByIdRepository(productId);
    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }
    if (!product.isActive) {
      return { success: false, error: "Produk tidak tersedia saat ini" };
    }

    // 3. Reserve a voucher (atomic, prevents race conditions)
    const reservedVoucher = await reserveVoucherRepository(productId);
    if (!reservedVoucher) {
      return { success: false, error: "Stok voucher habis untuk produk ini" };
    }

    // 4. Generate unique orderId
    const orderId = `TRX-${Date.now()}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

    const price = Number(product.price);

    // 5. Create PENDING transaction (voucherId will be set after payment success)
    const transaction = await createTransactionRepository({
      orderId,
      productId,
      phoneNumber,
      amount: price,
      status: "PENDING",
    });

    // 6. Midtrans Snap payment
    const payment = await createSnapTransaction(orderId, price, phoneNumber);

    return { success: true, data: { transaction, payment } };
  } catch (error) {
    console.error("initiateTransaction error:", error);
    return { success: false, error: "Gagal membuat transaksi" };
  }
}

// ==========================================
// CONFIRM TRANSACTION (PAYMENT SUCCESS)
// ==========================================

/**
 * POST /api/transactions/[id]/confirm
 * Simulates a successful payment callback / webhook.
 * 1. Find the PENDING transaction
 * 2. Claim the reserved voucher (mark as sold, link to transaction)
 * 3. Update transaction → SUCCESS + paidAt
 */
export async function confirmTransaction(transactionId: string): Promise<ServiceResult<Awaited<ReturnType<typeof updateTransactionStatusRepository>>>> {
  try {
    const trx = await findTransactionByIdRepository(transactionId);
    if (!trx) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }
    if (trx.status !== "PENDING") {
      return { success: false, error: `Transaksi sudah berstatus ${trx.status}` };
    }

    // Claim the reserved voucher and link it to this transaction
    const claimedVoucher = await claimVoucherRepository(trx.productId, transactionId);
    if (!claimedVoucher) {
      // No reserved voucher found – mark as FAILED
      await updateTransactionStatusRepository(transactionId, "FAILED");
      return { success: false, error: "Voucher tidak tersedia, transaksi dibatalkan" };
    }

    // Update transaction to SUCCESS
    const updated = await updateTransactionStatusRepository(transactionId, "SUCCESS", claimedVoucher.id, new Date());

    return { success: true, data: updated };
  } catch (error) {
    console.error("confirmTransaction error:", error);
    return { success: false, error: "Gagal mengkonfirmasi transaksi" };
  }
}

// ==========================================
// CANCEL TRANSACTION (PAYMENT FAILED)
// ==========================================

/**
 * POST /api/transactions/[id]/cancel
 * Cancels a PENDING transaction:
 * 1. Release the reserved voucher back to available
 * 2. Update transaction → FAILED
 */
export async function cancelTransaction(transactionId: string): Promise<ServiceResult<Awaited<ReturnType<typeof updateTransactionStatusRepository>>>> {
  try {
    const trx = await findTransactionByIdRepository(transactionId);
    if (!trx) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }
    if (trx.status !== "PENDING") {
      return { success: false, error: `Transaksi sudah berstatus ${trx.status}` };
    }

    // Release reserved voucher back to available pool
    // Find the reserved voucher for this product (linked via claimVoucherRepository logic)
    // Since voucherId is only set on SUCCESS, we find reserved vouchers for the product
    if (trx.voucherId) {
      await releaseVoucherRepository(trx.voucherId);
    } else {
      // Find reserved voucher for this product and release it
      // (It was reserved but not yet claimed/linked)
      const { prisma } = await import("@/app/lib/prisma");
      const reservedVoucher = await prisma.voucher.findFirst({
        where: { productId: trx.productId, status: "reserved" },
        orderBy: { createdAt: "asc" },
      });
      if (reservedVoucher) {
        await releaseVoucherRepository(reservedVoucher.id);
      }
    }

    const updated = await updateTransactionStatusRepository(transactionId, "FAILED");

    return { success: true, data: updated };
  } catch (error) {
    console.error("cancelTransaction error:", error);
    return { success: false, error: "Gagal membatalkan transaksi" };
  }
}

// ==========================================
// HANDLE MIDTRANS WEBHOOK
// ==========================================

/**
 * POST /api/transactions/webhook
 * Handles Midtrans payment notification (dummy implementation).
 * In production: verify signature key before processing.
 */
export async function handleWebhook(payload: MidtransWebhookInput): Promise<ServiceResult<Awaited<ReturnType<typeof updateTransactionStatusRepository>> | null>> {
  try {
    const validated = midtransWebhookSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: "Payload webhook tidak valid",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { order_id, transaction_status } = validated.data;

    const trx = await findTransactionByOrderIdRepository(order_id);
    if (!trx) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    // Map Midtrans status to our TrxStatus
    const isSuccess = ["capture", "settlement"].includes(transaction_status);
    const isFailed = ["deny", "cancel", "expire", "refund"].includes(transaction_status);

    if (isSuccess && trx.status === "PENDING") {
      return confirmTransaction(trx.id);
    }

    if (isFailed && trx.status === "PENDING") {
      return cancelTransaction(trx.id);
    }

    // Already processed or still pending
    return { success: true, data: null };
  } catch (error) {
    console.error("handleWebhook error:", error);
    return { success: false, error: "Gagal memproses webhook" };
  }
}

// ==========================================
// GET TRANSACTION BY ID
// ==========================================

export async function getTransactionById(id: string): Promise<ServiceResult<Awaited<ReturnType<typeof findTransactionByIdRepository>>>> {
  try {
    if (!id) return { success: false, error: "ID transaksi wajib diisi" };

    const trx = await findTransactionByIdRepository(id);
    if (!trx) return { success: false, error: "Transaksi tidak ditemukan" };

    return { success: true, data: trx };
  } catch (error) {
    console.error("getTransactionById error:", error);
    return { success: false, error: "Gagal mengambil transaksi" };
  }
}

// ==========================================
// GET TRANSACTIONS (LIST)
// ==========================================

export async function getTransactions(input: TransactionFilterInput): Promise<ServiceResult<Awaited<ReturnType<typeof findTransactionsRepository>>>> {
  try {
    const validated = transactionFilterSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Filter tidak valid",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const opts: FindTransactionsOptions = {
      page: validated.data.page,
      perPage: validated.data.limit,
      search: validated.data.search,
      status: validated.data.status as TrxStatus | undefined,
      startDate: validated.data.startDate,
      endDate: validated.data.endDate,
    };

    const result = await findTransactionsRepository(opts);

    return { success: true, data: result };
  } catch (error) {
    console.error("getTransactions error:", error);
    return { success: false, error: "Gagal mengambil daftar transaksi" };
  }
}
