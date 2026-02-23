/**
 * @file types/database.types.ts
 * @description TypeScript types for database entities
 *
 * These types mirror the Prisma schema for use in the application.
 * Import from generated Prisma client for actual database operations.
 */

// ==========================================
// ENUMS
// ==========================================

export type UserRole = "owner" | "customer";
export type VoucherStatus = "available" | "sold" | "reserved";
export type TrxStatus = "PENDING" | "SUCCESS" | "FAILED";
export type SmsStatus = "sent" | "failed";

// ==========================================
// ENTITY TYPES
// ==========================================

export interface Admin {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface ProductWithStock extends Product {
  category: Category;
  _count: {
    vouchers: number;
  };
  availableStock: number;
}

export interface Voucher {
  id: string;
  productId: string;
  code: string;
  status: VoucherStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoucherWithProduct extends Voucher {
  product: Product;
}

export interface Transaction {
  id: string;
  orderId: string;
  productId: string;
  voucherId: string | null;
  phoneNumber: string;
  amount: number;
  status: TrxStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithDetails extends Transaction {
  product: Product;
  voucher: Voucher | null;
  smsLogs: SmsLog[];
}

export interface SmsLog {
  id: string;
  transactionId: string;
  phoneNumber: string;
  message: string;
  status: SmsStatus;
  providerRef: string | null;
  sentAt: Date;
}

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

export interface DashboardStats {
  totalProducts: number;
  totalVouchers: number;
  availableVouchers: number;
  soldVouchers: number;
  pendingTransactions: number;
  successTransactions: number;
  todayRevenue: number;
  monthRevenue: number;
}
