"use client";

import VoucherAdminView, { Voucher, VoucherFormData, VoucherStats, ProductInfo } from "@/app/components/views/admin/Vouchers";
import { VoucherAPI } from "@/app/service/voucher/api";
import { ProductAPI } from "@/app/service/product/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function VoucherPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "";
  const queryClient = useQueryClient();

  // ==========================================
  // STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<VoucherFormData>({ code: "", codes: "" });

  // ==========================================
  // QUERIES
  // ==========================================
  const {
    data: vouchersData,
    isLoading: isLoadingVouchers,
    error: vouchersError,
  } = useQuery({
    queryKey: ["vouchers", productId],
    queryFn: async () => {
      const res = await VoucherAPI.getAll({ productId });
      return res.data;
    },
    enabled: !!productId,
  });

  const { data: statsData } = useQuery({
    queryKey: ["voucher-stats", productId],
    queryFn: async () => {
      const res = await VoucherAPI.getStats(productId);
      return res.data.data;
    },
    enabled: !!productId,
  });

  const { data: productData } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await ProductAPI.getById(productId);
      return res.data.data;
    },
    enabled: !!productId,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================
  const createMutation = useMutation({
    mutationFn: async (data: { code: string; productId: string }) => {
      const res = await VoucherAPI.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers", productId] });
      queryClient.invalidateQueries({ queryKey: ["voucher-stats", productId] });
      toast.success("Voucher berhasil ditambahkan");
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan voucher");
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (data: { codes: string[]; productId: string }) => {
      const res = await VoucherAPI.createBulk(data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vouchers", productId] });
      queryClient.invalidateQueries({ queryKey: ["voucher-stats", productId] });
      toast.success(`${data.data?.created || 0} voucher berhasil diimport`);
      handleCloseBulkModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengimport voucher");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { code: string } }) => {
      const res = await VoucherAPI.update(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers", productId] });
      toast.success("Voucher berhasil diupdate");
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate voucher");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await VoucherAPI.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers", productId] });
      queryClient.invalidateQueries({ queryKey: ["voucher-stats", productId] });
      toast.success("Voucher berhasil dihapus");
      handleCloseDeleteDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus voucher");
    },
  });

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const vouchers: Voucher[] = useMemo(() => {
    if (!vouchersData?.data) return [];
    return vouchersData.data.map((v: Record<string, unknown>) => ({
      id: v.id as string,
      code: v.code as string,
      status: v.status as "available" | "sold" | "reserved",
      productId: v.productId as string,
      createdAt: v.createdAt as string,
    }));
  }, [vouchersData]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchQuery, statusFilter]);

  const stats: VoucherStats | null = statsData
    ? {
        available: statsData.available || 0,
        sold: statsData.sold || 0,
        reserved: statsData.reserved || 0,
        total: statsData.total || 0,
      }
    : null;

  const product: ProductInfo | null = productData
    ? {
        id: productData.id,
        name: productData.name,
        price: productData.price,
      }
    : null;

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleOpenAddModal = () => {
    setCurrentVoucher(null);
    setFormData({ code: "", codes: "" });
    setIsModalOpen(true);
  };

  const handleOpenBulkModal = () => {
    setFormData({ code: "", codes: "" });
    setIsBulkModalOpen(true);
  };

  const handleOpenEditModal = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    setFormData({ code: voucher.code, codes: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVoucher(null);
    setFormData({ code: "", codes: "" });
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
    setFormData({ code: "", codes: "" });
  };

  const handleFormChange = (data: Partial<VoucherFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentVoucher) {
      updateMutation.mutate({ id: currentVoucher.id, data: { code: formData.code } });
    } else {
      createMutation.mutate({ code: formData.code, productId });
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse codes from text (split by newline, comma, or semicolon)
    const codes = formData.codes
      .split(/[\n,;]+/)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    if (codes.length === 0) {
      toast.error("Masukkan minimal 1 kode voucher");
      return;
    }

    if (codes.length > 500) {
      toast.error("Maksimal 500 kode voucher per batch");
      return;
    }

    bulkCreateMutation.mutate({ codes, productId });
  };

  const handleOpenDeleteDialog = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCurrentVoucher(null);
  };

  const handleConfirmDelete = () => {
    if (currentVoucher) {
      deleteMutation.mutate(currentVoucher.id);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <VoucherAdminView
      vouchers={vouchers}
      filteredVouchers={filteredVouchers}
      currentVoucher={currentVoucher}
      formData={formData}
      stats={stats}
      product={product}
      isLoading={isLoadingVouchers}
      isSubmitting={createMutation.isPending || updateMutation.isPending || bulkCreateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      error={vouchersError?.message}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      onSearchChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
      isModalOpen={isModalOpen}
      isBulkModalOpen={isBulkModalOpen}
      isDeleteDialogOpen={isDeleteDialogOpen}
      onOpenAddModal={handleOpenAddModal}
      onOpenBulkModal={handleOpenBulkModal}
      onOpenEditModal={handleOpenEditModal}
      onCloseModal={handleCloseModal}
      onCloseBulkModal={handleCloseBulkModal}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
      onBulkSubmit={handleBulkSubmit}
      onOpenDeleteDialog={handleOpenDeleteDialog}
      onCloseDeleteDialog={handleCloseDeleteDialog}
      onConfirmDelete={handleConfirmDelete}
    />
  );
}
