/**
 * @file validators/voucher.schema.ts
 * @description Zod validation schemas for vouchers
 */

import { z } from "zod";

// ==========================================
// SINGLE VOUCHER SCHEMA
// ==========================================

export const voucherSchema = z.object({
  productId: z.string().uuid("Pilih produk yang valid"),
  code: z.string().min(4, "Kode voucher minimal 4 karakter").max(100, "Kode voucher maksimal 100 karakter"),
});

export type VoucherInput = z.infer<typeof voucherSchema>;

// ==========================================
// BULK VOUCHER SCHEMA (Manual Input)
// Accepts both string (textarea input) or array (pre-parsed)
// ==========================================

export const bulkVoucherSchema = z.object({
  productId: z.string().uuid("Pilih produk yang valid"),
  codes: z
    .union([
      // Accept string input (from textarea) - transform to array
      z
        .string()
        .min(1, "Masukkan minimal 1 kode voucher")
        .transform((val) =>
          val
            .split(/[\n,;]+/)
            .map((code) => code.trim())
            .filter((code) => code.length > 0),
        ),
      // Accept array input (pre-parsed from frontend)
      z.array(z.string().min(1)).min(1, "Masukkan minimal 1 kode voucher"),
    ])
    .refine((codes) => codes.length > 0, {
      message: "Minimal 1 kode voucher valid",
    })
    .refine((codes) => codes.length <= 500, {
      message: "Maksimal 500 kode voucher per batch",
    }),
});

// Type for input (before validation) - accepts string or array
export type BulkVoucherInput = {
  productId: string;
  codes: string | string[];
};

// Type for validated output - always array
export type BulkVoucherValidated = {
  productId: string;
  codes: string[];
};

// ==========================================
// CSV VOUCHER SCHEMA
// ==========================================

export const csvVoucherSchema = z.object({
  productId: z.string().uuid("Pilih produk yang valid"),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File maksimal 5MB",
    })
    .refine((file) => ["text/csv", "application/vnd.ms-excel"].includes(file.type) || file.name.endsWith(".csv"), {
      message: "File harus berformat CSV",
    }),
});

export type CsvVoucherInput = z.infer<typeof csvVoucherSchema>;

// ==========================================
// VOUCHER FILTER SCHEMA
// ==========================================

export const voucherFilterSchema = z.object({
  productId: z.string().uuid().optional(),
  status: z.enum(["available", "sold", "reserved"]).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type VoucherFilterInput = z.infer<typeof voucherFilterSchema>;
