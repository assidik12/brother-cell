/**
 * @file service/voucher/index.ts
 * @description Voucher service - SERVER-SIDE ONLY exports
 *
 * ⚠️ PENTING: File ini HANYA untuk API routes (server-side)
 * Untuk client components, gunakan: import { VoucherAPI } from "@/app/service/voucher/api"
 */

// VoucherStatus type
export type VoucherStatus = "available" | "sold" | "reserved";

// ==========================================
// SERVER-SIDE EXPORTS (untuk API Routes)
// ==========================================

export { createVoucher, createBulkVouchers, getVoucherById, getVouchers, updateVoucher, deleteVoucher, claimVoucher, reserveVoucher, releaseVoucher, getVoucherStats, countVouchers, type ServiceResult } from "./method";
