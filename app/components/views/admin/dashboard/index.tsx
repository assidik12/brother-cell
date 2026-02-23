/**
 * @file app/components/views/admin/dashboard/index.tsx
 * @description View component untuk Dashboard Admin
 * View hanya berisi UI rendering, semua logic ada di Page
 */

import AdminLayout, { ContentCard } from "@/app/components/layouts/AdminLayout";
import { cn } from "@/app/lib/utils";
import { AlertCircle, ShoppingCart, TrendingUp } from "lucide-react";
import React from "react";

// ==========================================
// TYPES
// ==========================================

export interface StatsData {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  change: string;
}

export interface RecentTransaction {
  id: string;
  product: string;
  phone: string;
  amount: number;
  status: string;
  time: string;
}

export interface LowStockProduct {
  name: string;
  stock: number;
  category: string;
}

export interface DashboardAdminViewProps {
  statsData: StatsData[];
  recentTransactions: RecentTransaction[];
  lowStockProducts: LowStockProduct[];
  onViewAllTransactions?: () => void;
  onAddVoucher?: () => void;
}

// ==========================================
// VIEW COMPONENT
// ==========================================

const DashboardAdminView: React.FC<DashboardAdminViewProps> = ({ statsData, recentTransactions, lowStockProducts, onViewAllTransactions, onAddVoucher }) => {
  return (
    <AdminLayout title="Dashboard" description="Selamat datang kembali, Admin!">
      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <ContentCard className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="font-bold text-gray-900">Transaksi Terbaru</h3>
            <button onClick={onViewAllTransactions} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Lihat Semua
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTransactions.map((trx) => (
              <div key={trx.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trx.product}</p>
                    <p className="text-sm text-gray-500">{trx.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Rp {trx.amount.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-gray-500">{trx.time}</p>
                </div>
                <StatusBadge status={trx.status} />
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Low Stock Alert */}
        <ContentCard>
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">Stok Menipis</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", product.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>{product.stock === 0 ? "Habis" : `${product.stock} tersisa`}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-6 py-4">
            <button onClick={onAddVoucher} className="w-full rounded-xl bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100">
              Tambah Voucher
            </button>
          </div>
        </ContentCard>
      </div>
    </AdminLayout>
  );
};

export default DashboardAdminView;

// ==========================================
// SUB-COMPONENTS
// ==========================================

function StatCard({ label, value, icon: Icon, color, change }: StatsData) {
  const colorStyles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <ContentCard className="p-6">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorStyles[color])}>
          <Icon size={24} />
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className="mt-2 text-xs text-gray-400">{change}</p>
    </ContentCard>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUCCESS: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", styles[status] || styles.PENDING)}>{status}</span>;
}
