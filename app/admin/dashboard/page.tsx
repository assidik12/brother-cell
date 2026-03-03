/**
 * @file app/admin/dashboard/page.tsx
 * @description Halaman Dashboard Admin - fetches real data via React Query
 */

"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, Ticket, DollarSign } from "lucide-react";
import DashboardAdminView, { StatsData, RecentTransaction, LowStockProduct } from "@/app/components/views/admin/dashboard";
import DashboardAPI from "@/app/service/dashboard/api";
import { formatCurrency } from "@/app/lib/utils";

// ==========================================
// QUERY KEYS
// ==========================================

const QUERY_KEYS = {
  dashboard: ["dashboard"] as const,
};

// ==========================================
// PAGE COMPONENT
// ==========================================

export default function DashboardPage() {
  const router = useRouter();

  // ==========================================
  // DATA FETCHING
  // ==========================================

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: () => DashboardAPI.getSummary().then((r) => r.data.data),
    refetchInterval: 30_000, // auto-refresh every 30 s
  });

  // ==========================================
  // DERIVED STATS
  // ==========================================

  const statsData: StatsData[] = [
    {
      label: "Total Produk Aktif",
      value: isLoading ? "..." : String(data?.stats.totalProducts ?? 0),
      icon: Package,
      color: "blue",
      change: "Produk yang sedang aktif",
    },
    {
      label: "Voucher Tersedia",
      value: isLoading ? "..." : (data?.stats.totalAvailableVouchers ?? 0).toLocaleString("id-ID"),
      icon: Ticket,
      color: "green",
      change: "Total stok siap dijual",
    },
    {
      label: "Transaksi Hari Ini",
      value: isLoading ? "..." : String(data?.stats.todayTrxCount ?? 0),
      icon: ShoppingCart,
      color: "purple",
      change: "Transaksi berhasil hari ini",
    },
    {
      label: "Pendapatan Hari Ini",
      value: isLoading ? "..." : formatCurrency(data?.stats.todayRevenue ?? 0),
      icon: DollarSign,
      color: "emerald",
      change: "Total dari transaksi sukses",
    },
  ];

  const recentTransactions: RecentTransaction[] = data?.recentTransactions ?? [];

  const lowStockProducts: LowStockProduct[] = data?.lowStockProducts ?? [];

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleViewAllTransactions = useCallback(() => {
    router.push("/admin/transaction");
  }, [router]);

  const handleAddVoucher = useCallback(() => {
    router.push("/admin/product");
  }, [router]);

  // ==========================================
  // RENDER
  // ==========================================

  return <DashboardAdminView statsData={statsData} recentTransactions={recentTransactions} lowStockProducts={lowStockProducts} onViewAllTransactions={handleViewAllTransactions} onAddVoucher={handleAddVoucher} />;
}
