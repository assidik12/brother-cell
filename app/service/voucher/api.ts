/**
 * @file service/voucher/api.ts
 * @description Client-side Voucher API (untuk frontend components)
 *
 * File ini HANYA berisi axios calls, tidak ada import dari server code.
 * Gunakan ini di client components ("use client")
 */

import instance from "@/app/lib/axios/instance";
import type { VoucherInput, BulkVoucherInput } from "@/app/validators/voucher.schema";

// ==========================================
// TYPES
// ==========================================

export type VoucherStatus = "available" | "sold" | "reserved";

export type VoucherListParams = {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  status?: VoucherStatus;
};

// ==========================================
// CLIENT-SIDE API
// ==========================================

export const VoucherAPI = {
  /**
   * Get all vouchers with pagination & filters
   */
  getAll: (params?: VoucherListParams) => instance.get("/api/vouchers", { params }),

  /**
   * Get single voucher by ID
   */
  getById: (id: string) => instance.get(`/api/vouchers/${id}`),

  /**
   * Create single voucher
   */
  create: (data: VoucherInput) => instance.post("/api/vouchers", data),

  /**
   * Bulk create vouchers
   */
  createBulk: (data: BulkVoucherInput) => instance.post("/api/vouchers/bulk", data),

  /**
   * Update voucher
   */
  update: (id: string, data: Partial<VoucherInput & { status?: VoucherStatus }>) => instance.put(`/api/vouchers/${id}`, data),

  /**
   * Delete voucher
   */
  delete: (id: string) => instance.delete(`/api/vouchers/${id}`),

  /**
   * Get voucher stats by product
   */
  getStats: (productId: string) => instance.get(`/api/vouchers/stats/${productId}`),

  /**
   * Get vouchers by product
   */
  getByProduct: (productId: string, params?: Omit<VoucherListParams, "productId">) => instance.get(`/api/products/${productId}/vouchers`, { params }),
};

export default VoucherAPI;
