/**
 * @file app/admin/product/page.tsx
 * @description Halaman manajemen produk - logic & state management dengan React Query
 * UI rendering dilakukan di ProductAdminView
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductAdminView, { Product, ProductFormData } from "@/app/components/views/admin/Products";
import { ProductAPI } from "@/app/service/product/api";

// ==========================================
// QUERY KEYS
// ==========================================

const QUERY_KEYS = {
  products: ["products"] as const,
  voucherStats: (productId: string) => ["voucher-stats", productId] as const,
};

// ==========================================
// DEFAULT VALUES
// ==========================================

const defaultFormData: ProductFormData = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  isActive: true,
};

// ==========================================
// PAGE COMPONENT (Logic Only)
// ==========================================

export default function ProductPage() {
  const queryClient = useQueryClient();

  // ==========================================
  // STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

  // ==========================================
  // QUERIES
  // ==========================================

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: async () => {
      const response = await ProductAPI.getAll({ limit: 100 });
      return response.data;
    },
  });

  const products: Product[] = useMemo(() => {
    if (!productsData?.data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return productsData.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      categoryName: p.category?.name || "Uncategorized",
      description: p.description || "",
      price: Number(p.price),
      stock: p.voucherStats?.available || 0, // Assuming voucherStats is included in the product data
      isActive: p.isActive,
    }));
  }, [productsData]);

  // ==========================================
  // MUTATIONS
  // ==========================================

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await ProductAPI.create({
        name: data.name,
        description: data.description || null,
        price: Number(data.price),
        isActive: data.isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const response = await ProductAPI.update(id, {
        name: data.name,
        description: data.description || null,
        price: data.price ? Number(data.price) : undefined,
        isActive: data.isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await ProductAPI.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      handleCloseDeleteDialog();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await ProductAPI.toggleStatus(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
    },
  });

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(query) || product.categoryName?.toLowerCase().includes(query));
  }, [products, searchQuery]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setCurrentProduct(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId || "",
      description: product.description || "",
      price: product.price.toString(),
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setFormData(defaultFormData);
  }, []);

  const handleFormChange = useCallback((data: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (currentProduct) {
        updateMutation.mutate({ id: currentProduct.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    },
    [currentProduct, formData, createMutation, updateMutation],
  );

  const handleToggleStatus = useCallback(
    (id: string) => {
      toggleMutation.mutate(id);
    },
    [toggleMutation],
  );

  const handleOpenDeleteDialog = useCallback((product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentProduct) {
      deleteMutation.mutate(currentProduct.id);
    }
  }, [currentProduct, deleteMutation]);

  // ==========================================
  // RENDER - Pass all data & handlers to View
  // ==========================================
  return (
    <ProductAdminView
      // Data
      products={products}
      filteredProducts={filteredProducts}
      currentProduct={currentProduct}
      formData={formData}
      // Loading states
      isLoading={isLoading}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      error={error?.message}
      // Search
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      // Modal states
      isModalOpen={isModalOpen}
      isDeleteDialogOpen={isDeleteDialogOpen}
      // Handlers
      onOpenAddModal={handleOpenAddModal}
      onOpenEditModal={handleOpenEditModal}
      onCloseModal={handleCloseModal}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
      onToggleStatus={handleToggleStatus}
      onOpenDeleteDialog={handleOpenDeleteDialog}
      onCloseDeleteDialog={handleCloseDeleteDialog}
      onConfirmDelete={handleConfirmDelete}
    />
  );
}
