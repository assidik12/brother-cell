/**
 * @file service/product/api.ts
 * @description Client-side Product API (untuk frontend components)
 *
 * File ini HANYA berisi axios calls, tidak ada import dari server code.
 * Gunakan ini di client components ("use client")
 */

import instance from "@/app/lib/axios/instance";
import type { ProductInput } from "@/app/validators/product.schema";

// ==========================================
// TYPES
// ==========================================

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
};

// ==========================================
// CLIENT-SIDE API
// ==========================================

export const ProductAPI = {
  /**
   * Get all products with pagination & filters
   */
  getAll: (params?: ProductListParams) => instance.get("/api/products", { params }),

  /**
   * Get single product by ID
   */
  getById: (id: string) => instance.get(`/api/products/${id}`),

  /**
   * Create new product
   */
  create: (data: ProductInput) => instance.post("/api/products", data),

  /**
   * Update existing product
   */
  update: (id: string, data: Partial<ProductInput>) => instance.put(`/api/products/${id}`, data),

  /**
   * Delete product
   */
  delete: (id: string) => instance.delete(`/api/products/${id}`),

  /**
   * Toggle product active status
   */
  toggleStatus: (id: string) => instance.patch(`/api/products/${id}/toggle`),
};

export default ProductAPI;
