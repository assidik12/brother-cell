/**
 * @file app/components/views/admin/Products/index.tsx
 * @description View component untuk halaman manajemen produk
 * View hanya berisi UI rendering, semua logic ada di Page
 */

import { Badge, Button, Input, Modal, Toggle } from "@/app/components/atoms";
import AdminLayout, { ContentCard, PageHeader } from "@/app/components/layouts/AdminLayout";
import { ConfirmDialog, SearchBar } from "@/app/components/molecules";
import { formatCurrency } from "@/app/lib/utils";
import { Edit3, Filter, Loader2, Package, Plus, Ticket, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";

// ==========================================
// TYPES
// ==========================================

export interface Product {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  description: string;
  price: string;
  isActive: boolean;
}

export interface ProductAdminViewProps {
  // Data
  products: Product[];
  filteredProducts: Product[];
  currentProduct: Product | null;
  formData: ProductFormData;

  // Loading states
  isLoading?: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  error?: string;

  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Modal states
  isModalOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Handlers
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onCloseModal: () => void;
  onFormChange: (data: Partial<ProductFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleStatus: (id: string) => void;
  onOpenDeleteDialog: (product: Product) => void;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
}

// ==========================================
// VIEW COMPONENT
// ==========================================

const ProductAdminView: React.FC<ProductAdminViewProps> = ({
  products,
  filteredProducts,
  currentProduct,
  formData,
  isLoading,
  isSubmitting,
  isDeleting,
  error,
  searchQuery,
  onSearchChange,
  isModalOpen,
  isDeleteDialogOpen,
  onOpenAddModal,
  onOpenEditModal,
  onCloseModal,
  onFormChange,
  onSubmit,
  onToggleStatus,
  onOpenDeleteDialog,
  onCloseDeleteDialog,
  onConfirmDelete,
}) => {
  return (
    <AdminLayout title="Produk" description="Kelola produk yang tersedia">
      {/* Header Actions */}
      <PageHeader title="Daftar Produk" description={`${products.length} produk terdaftar`}>
        <Button variant="outline" leftIcon={<Filter size={18} />}>
          Filter
        </Button>
        <Button leftIcon={<Plus size={20} />} onClick={onOpenAddModal}>
          Tambah Produk
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

      {/* Search & Filter */}
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Cari produk berdasarkan nama atau kategori..." className="max-w-md" />
      </div>

      {/* Products Table */}
      <ContentCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Produk</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-2 text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Package size={20} />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                          {product.description && <p className="text-xs text-gray-500 truncate max-w-50">{product.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{product.categoryName || "Uncategorized"}</Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Toggle checked={product.isActive} onChange={() => onToggleStatus(product.id)} size="sm" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/product/vocher?productId=${product.id}`} className="rounded-lg p-2 text-green-600 hover:bg-green-50" title="Kelola Voucher">
                          <Ticket size={18} />
                        </Link>
                        <button onClick={() => onOpenEditModal(product)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => onOpenDeleteDialog(product)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Produk tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal} title={currentProduct ? "Edit Produk" : "Tambah Produk"} size="md">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Nama Produk" value={formData.name} onChange={(e) => onFormChange({ name: e.target.value })} placeholder="Contoh: Telkomsel 10rb" required />
          <Input label="Deskripsi" value={formData.description} onChange={(e) => onFormChange({ description: e.target.value })} placeholder="Deskripsi produk (opsional)" />
          <Input label="Harga" type="number" value={formData.price} onChange={(e) => onFormChange({ price: e.target.value })} placeholder="10000" required />
          <Toggle checked={formData.isActive} onChange={(checked) => onFormChange({ isActive: checked })} label="Produk Aktif" />
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
              ) : currentProduct ? (
                "Simpan"
              ) : (
                "Tambah"
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
        title="Hapus Produk"
        description={`Apakah Anda yakin ingin menghapus "${currentProduct?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="danger"
      />
    </AdminLayout>
  );
};

export default ProductAdminView;
