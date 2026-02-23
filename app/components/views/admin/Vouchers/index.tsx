/**
 * @file app/components/views/admin/Vouchers/index.tsx
 * @description View component untuk halaman manajemen voucher
 */

import { Button, Input, Modal } from "@/app/components/atoms";
import AdminLayout, { ContentCard, PageHeader } from "@/app/components/layouts/AdminLayout";
import { ConfirmDialog, SearchBar } from "@/app/components/molecules";
import { cn } from "@/app/lib/utils";
import { ArrowLeft, Edit3, Loader2, Plus, Ticket, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import React from "react";

// ==========================================
// TYPES
// ==========================================

export interface Voucher {
  id: string;
  code: string;
  status: "available" | "sold" | "reserved";
  productId: string;
  productName?: string;
  createdAt: string;
}

export interface VoucherFormData {
  code: string;
  codes: string; // For bulk input
}

export interface VoucherStats {
  available: number;
  sold: number;
  reserved: number;
  total: number;
}

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
}

export interface VoucherAdminViewProps {
  // Data
  vouchers: Voucher[];
  filteredVouchers: Voucher[];
  currentVoucher: Voucher | null;
  formData: VoucherFormData;
  stats: VoucherStats | null;
  product: ProductInfo | null;

  // Loading states
  isLoading?: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  error?: string;

  // Filters
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;

  // Modal states
  isModalOpen: boolean;
  isBulkModalOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Handlers
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onOpenEditModal: (voucher: Voucher) => void;
  onCloseModal: () => void;
  onCloseBulkModal: () => void;
  onFormChange: (data: Partial<VoucherFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBulkSubmit: (e: React.FormEvent) => void;
  onOpenDeleteDialog: (voucher: Voucher) => void;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
}

// ==========================================
// STATUS BADGE COMPONENT
// ==========================================

const StatusBadge: React.FC<{ status: Voucher["status"] }> = ({ status }) => {
  const variants = {
    available: { label: "Tersedia", className: "bg-green-100 text-green-700" },
    sold: { label: "Terjual", className: "bg-blue-100 text-blue-700" },
    reserved: { label: "Direservasi", className: "bg-yellow-100 text-yellow-700" },
  };

  const { label, className } = variants[status] || variants.available;

  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{label}</span>;
};

// ==========================================
// VIEW COMPONENT
// ==========================================

const VoucherAdminView: React.FC<VoucherAdminViewProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vouchers,
  filteredVouchers,
  currentVoucher,
  formData,
  stats,
  product,
  isLoading,
  isSubmitting,
  isDeleting,
  error,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  isModalOpen,
  isBulkModalOpen,
  isDeleteDialogOpen,
  onOpenAddModal,
  onOpenBulkModal,
  onOpenEditModal,
  onCloseModal,
  onCloseBulkModal,
  onFormChange,
  onSubmit,
  onBulkSubmit,
  onOpenDeleteDialog,
  onCloseDeleteDialog,
  onConfirmDelete,
}) => {
  return (
    <AdminLayout title="Voucher" description="Kelola voucher produk">
      {/* Back Button & Header */}
      <div className="mb-4">
        <Link href="/admin/product" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} />
          Kembali ke Produk
        </Link>
      </div>

      <PageHeader title={product ? `Voucher: ${product.name}` : "Kelola Voucher"} description={stats ? `${stats.available} tersedia, ${stats.sold} terjual, ${stats.reserved} direservasi` : "Memuat..."}>
        <Button variant="outline" leftIcon={<Upload size={18} />} onClick={onOpenBulkModal}>
          Bulk Import
        </Button>
        <Button leftIcon={<Plus size={20} />} onClick={onOpenAddModal}>
          Tambah Voucher
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ContentCard className="p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Voucher</p>
          </ContentCard>
          <ContentCard className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            <p className="text-sm text-gray-500">Tersedia</p>
          </ContentCard>
          <ContentCard className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
            <p className="text-sm text-gray-500">Terjual</p>
          </ContentCard>
          <ContentCard className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
            <p className="text-sm text-gray-500">Direservasi</p>
          </ContentCard>
        </div>
      )}

      {/* Error Alert */}
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Cari kode voucher..." className="max-w-md" />
        <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="">Semua Status</option>
          <option value="available">Tersedia</option>
          <option value="sold">Terjual</option>
          <option value="reserved">Direservasi</option>
        </select>
      </div>

      {/* Vouchers Table */}
      <ContentCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Kode Voucher</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tanggal Dibuat</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-2 text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                          <Ticket size={20} />
                        </div>
                        <code className="font-mono font-medium text-gray-900">{voucher.code}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(voucher.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {voucher.status === "available" && (
                          <>
                            <button onClick={() => onOpenEditModal(voucher)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit">
                              <Edit3 size={18} />
                            </button>
                            <button onClick={() => onOpenDeleteDialog(voucher)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Hapus">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {voucher.status !== "available" && <span className="text-xs text-gray-400">Tidak dapat diedit</span>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Voucher tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Add/Edit Single Voucher Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal} title={currentVoucher ? "Edit Voucher" : "Tambah Voucher"} size="sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Kode Voucher" value={formData.code} onChange={(e) => onFormChange({ code: e.target.value })} placeholder="Contoh: TSEL-XXXX-XXXX" required />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onCloseModal} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : currentVoucher ? (
                "Simpan"
              ) : (
                "Tambah"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={onCloseBulkModal} title="Bulk Import Voucher" size="md">
        <form onSubmit={onBulkSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Kode Voucher (pisahkan dengan enter, koma, atau titik koma)</label>
            <textarea
              value={formData.codes}
              onChange={(e) => onFormChange({ codes: e.target.value })}
              placeholder={`TSEL-0001-XXXX\nTSEL-0002-XXXX\nTSEL-0003-XXXX`}
              className="h-40 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:border-blue-500 focus:outline-none"
              required
            />
            <p className="mt-2 text-xs text-gray-500">Maksimal 500 kode voucher per batch</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onCloseBulkModal} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengimport...
                </>
              ) : (
                "Import Voucher"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={onConfirmDelete}
        title="Hapus Voucher"
        description={`Apakah Anda yakin ingin menghapus voucher "${currentVoucher?.code}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="danger"
      />
    </AdminLayout>
  );
};

export default VoucherAdminView;
