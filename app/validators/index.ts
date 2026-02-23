/**
 * @file validators/index.ts
 * @description Central export file for all validation schemas
 */

// Auth
export { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./auth.schema";

// Category
export { categorySchema, categoryUpdateSchema, type CategoryInput, type CategoryUpdateInput } from "./category.schema";

// Product
export { productSchema, productUpdateSchema, productFilterSchema, type ProductInput, type ProductUpdateInput, type ProductFilterInput } from "./product.schema";

// Voucher
export { voucherSchema, bulkVoucherSchema, csvVoucherSchema, voucherFilterSchema, type VoucherInput, type BulkVoucherInput, type CsvVoucherInput, type VoucherFilterInput } from "./voucher.schema";

// Transaction
export { initiateTransactionSchema, midtransWebhookSchema, transactionFilterSchema, type InitiateTransactionInput, type MidtransWebhookInput, type TransactionFilterInput } from "./transaction.schema";
