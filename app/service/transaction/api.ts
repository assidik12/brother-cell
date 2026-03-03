/**
 * @file service/transaction/api.ts
 * @description Client-side Transaction API (for frontend components)
 *
 * Only axios calls – no server imports.
 * Use this in "use client" components.
 */

import instance from "@/app/lib/axios/instance";
import type { InitiateTransactionInput, TransactionFilterInput } from "@/app/validators/transaction.schema";

// ==========================================
// RESPONSE TYPES
// ==========================================

export type TrxStatus = "PENDING" | "SUCCESS" | "FAILED";

export type TransactionPayment = {
  token: string;
  redirectUrl: string;
  orderId: string;
  amount: number;
  phoneNumber: string;
  expiresAt: string;
};

export type TransactionRecord = {
  id: string;
  orderId: string;
  productId: string;
  voucherId: string | null;
  phoneNumber: string;
  amount: number;
  status: TrxStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string; price: number };
  voucher?: { id: string; code: string } | null;
};

export type InitiateTransactionResponse = {
  success: boolean;
  message: string;
  data: {
    transaction: TransactionRecord;
    payment: TransactionPayment;
  };
};

export type TransactionListParams = Partial<
  Pick<TransactionFilterInput, "status" | "startDate" | "endDate" | "search"> & {
    page: number;
    limit: number;
  }
>;

// ==========================================
// CLIENT-SIDE API
// ==========================================

export const TransactionAPI = {
  /**
   * POST /api/transactions
   * Initiate a new transaction (public — customer facing).
   * Reserves a voucher and creates a PENDING transaction.
   */
  initiate: (data: InitiateTransactionInput) => instance.post<InitiateTransactionResponse>("/api/transactions", data),

  /**
   * POST /api/transactions/:id/confirm
   * Confirm payment success → voucher marked sold, status → SUCCESS.
   */
  confirm: (id: string) => instance.post<{ success: boolean; message: string; data: TransactionRecord }>(`/api/transactions/${id}/confirm`),

  /**
   * POST /api/transactions/:id/cancel
   * Cancel / payment failed → voucher released, status → FAILED.
   */
  cancel: (id: string) => instance.post<{ success: boolean; message: string; data: TransactionRecord }>(`/api/transactions/${id}/cancel`),

  /**
   * GET /api/transactions (admin only)
   * List all transactions with optional filters & pagination.
   */
  getAll: (params?: TransactionListParams) => instance.get<{ success: boolean; data: TransactionRecord[]; pagination: unknown }>("/api/transactions", { params }),

  /**
   * GET /api/transactions/:id (admin only)
   */
  getById: (id: string) => instance.get<{ success: boolean; data: TransactionRecord }>(`/api/transactions/${id}`),

  /**
   * GET /api/transactions/by-order/:orderId (public — used after Midtrans finish redirect)
   */
  getByOrderId: (orderId: string) => instance.get<{ success: boolean; data: TransactionRecord }>(`/api/transactions/by-order/${orderId}`),
};

export default TransactionAPI;
