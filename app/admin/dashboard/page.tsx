/**
 * @file app/admin/dashboard/page.tsx
 * @description Halaman Dashboard Admin - hanya logic & state management
 * UI rendering dilakukan di DashboardAdminView
 */

"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingCart, Ticket, DollarSign } from "lucide-react";
import DashboardAdminView, { StatsData, RecentTransaction, LowStockProduct } from "@/app/components/views/admin/dashboard";

// ==========================================
// MOCK DATA (Akan diganti dengan React Query)
// ==========================================

const statsData: StatsData[] = [
  {
    label: "Total Produk",
    value: "24",
    icon: Package,
    color: "blue",
    change: "+2 minggu ini",
  },
  {
    label: "Voucher Tersedia",
    value: "1,250",
    icon: Ticket,
    color: "green",
    change: "85% dari total",
  },
  {
    label: "Transaksi Hari Ini",
    value: "48",
    icon: ShoppingCart,
    color: "purple",
    change: "+12% dari kemarin",
  },
  {
    label: "Pendapatan Hari Ini",
    value: "Rp 2.4jt",
    icon: DollarSign,
    color: "emerald",
    change: "+8% dari kemarin",
  },
];

const recentTransactions: RecentTransaction[] = [
  {
    id: "BC-001",
    product: "Telkomsel 10rb",
    phone: "0812****5678",
    amount: 10500,
    status: "SUCCESS",
    time: "2 menit lalu",
  },
  {
    id: "BC-002",
    product: "XL Data 5GB",
    phone: "0856****1234",
    amount: 35000,
    status: "SUCCESS",
    time: "5 menit lalu",
  },
  {
    id: "BC-003",
    product: "Token PLN 50rb",
    phone: "0878****9012",
    amount: 50500,
    status: "PENDING",
    time: "8 menit lalu",
  },
  {
    id: "BC-004",
    product: "Indosat 25rb",
    phone: "0857****3456",
    amount: 25200,
    status: "SUCCESS",
    time: "15 menit lalu",
  },
];

const lowStockProducts: LowStockProduct[] = [
  { name: "XL Data 5GB", stock: 5, category: "Paket Data" },
  { name: "Tri AON 2GB", stock: 0, category: "Paket Data" },
  { name: "Smartfren 10rb", stock: 8, category: "Pulsa" },
];

// ==========================================
// PAGE COMPONENT (Logic Only)
// ==========================================

export default function DashboardPage() {
  const router = useRouter();

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleViewAllTransactions = useCallback(() => {
    router.push("/admin/transactions");
  }, [router]);

  const handleAddVoucher = useCallback(() => {
    router.push("/admin/product/voucher");
  }, [router]);

  // ==========================================
  // RENDER - Pass all data & handlers to View
  // ==========================================
  return <DashboardAdminView statsData={statsData} recentTransactions={recentTransactions} lowStockProducts={lowStockProducts} onViewAllTransactions={handleViewAllTransactions} onAddVoucher={handleAddVoucher} />;
}
