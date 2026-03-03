/**
 * @file service/dashboard/api.ts
 * @description Client-side Dashboard API
 */

import instance from "@/app/lib/axios/instance";

// ==========================================
// TYPES
// ==========================================

export type DashboardStats = {
  totalProducts: number;
  totalAvailableVouchers: number;
  todayTrxCount: number;
  todayRevenue: number;
};

export type DashboardTransaction = {
  id: string;
  product: string;
  phone: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  time: string;
};

export type DashboardLowStockProduct = {
  id: string;
  name: string;
  stock: number;
};

export type DashboardData = {
  stats: DashboardStats;
  recentTransactions: DashboardTransaction[];
  lowStockProducts: DashboardLowStockProduct[];
};

export type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};

// ==========================================
// CLIENT-SIDE API
// ==========================================

export const DashboardAPI = {
  /**
   * GET /api/dashboard
   * Fetches stats, recent 5 transactions, and low-stock products in one call.
   */
  getSummary: () => instance.get<DashboardResponse>("/api/dashboard"),
};

export default DashboardAPI;
