/**
 * @file validators/product.schema.ts
 * @description Zod validation schemas for products
 */

import { z } from "zod";

// ==========================================
// PRODUCT SCHEMAS
// ==========================================

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(100, "Nama produk maksimal 100 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional().nullable(),
  price: z.number().positive("Harga harus lebih dari 0").max(100000000, "Harga maksimal 100 juta"),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

// ==========================================
// PRODUCT WITH ID (for updates)
// ==========================================

export const productUpdateSchema = productSchema.extend({
  id: z.string().uuid("ID produk tidak valid"),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// ==========================================
// PRODUCT FILTER SCHEMA
// ==========================================

export const productFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
