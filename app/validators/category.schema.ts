/**
 * @file validators/category.schema.ts
 * @description Zod validation schemas for categories
 */

import { z } from "zod";

// ==========================================
// CATEGORY SCHEMAS
// ==========================================

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(50, "Nama kategori maksimal 50 karakter"),
  description: z.string().max(200, "Deskripsi maksimal 200 karakter").optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ==========================================
// CATEGORY WITH ID (for updates)
// ==========================================

export const categoryUpdateSchema = categorySchema.extend({
  id: z.string().uuid("ID kategori tidak valid"),
});

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
