/**
 * @file validators/transaction.schema.ts
 * @description Zod validation schemas for transactions
 */

import { z } from "zod";

// ==========================================
// PHONE NUMBER REGEX (Indonesian format)
// ==========================================

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;

// ==========================================
// TRANSACTION INITIATION SCHEMA
// ==========================================

export const initiateTransactionSchema = z.object({
  productId: z.string().uuid("Pilih produk yang valid"),
  phoneNumber: z
    .string()
    .regex(phoneRegex, "Format nomor HP tidak valid (contoh: 08123456789)")
    .transform((val) => {
      // Normalize to 08xxx format
      if (val.startsWith("+62")) return "0" + val.slice(3);
      if (val.startsWith("62")) return "0" + val.slice(2);
      return val;
    }),
});

export type InitiateTransactionInput = z.infer<typeof initiateTransactionSchema>;

// ==========================================
// MIDTRANS WEBHOOK SCHEMA
// ==========================================

export const midtransWebhookSchema = z.object({
  transaction_status: z.enum(["capture", "settlement", "pending", "deny", "cancel", "expire", "refund"]),
  order_id: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  status_code: z.string(),
  payment_type: z.string().optional(),
  transaction_id: z.string().optional(),
  transaction_time: z.string().optional(),
  fraud_status: z.string().optional(),
});

export type MidtransWebhookInput = z.infer<typeof midtransWebhookSchema>;

// ==========================================
// TRANSACTION FILTER SCHEMA
// ==========================================

export const transactionFilterSchema = z.object({
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(), // Search by order ID or phone
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
