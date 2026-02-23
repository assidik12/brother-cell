/**
 * @file service/product/index.ts
 * @description Product service - SERVER-SIDE ONLY exports
 *
 * ⚠️ PENTING: File ini HANYA untuk API routes (server-side)
 * Untuk client components, gunakan: import { ProductAPI } from "@/app/service/product/api"
 */

// ==========================================
// SERVER-SIDE EXPORTS (untuk API Routes)
// ==========================================

export { createProduct, getProductById, getProducts, updateProduct, deleteProduct, toggleProductStatus, getProductsByCategory, countProducts, type ServiceResult } from "./method";
