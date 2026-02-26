/**
 * @file app/page.tsx
 * @description Customer Main Page - Brother Cell MVP
 * Halaman utama untuk customer membeli voucher via SMS
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Navbar, Footer, HeroSection, ContactSection, ProductCatalog, TransactionModal, EmptyState, type Product } from "@/app/components";
import { ProductAPI } from "@/app/service/product/api";
import { Package, Loader2 } from "lucide-react";

// ==========================================
// LOADING SKELETON COMPONENT
// ==========================================

function ProductCatalogSkeleton() {
  return (
    <section id="catalog" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Katalog Produk</h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">Pilih voucher atau paket data yang Anda butuhkan</p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 animate-pulse">
              {/* Icon Skeleton */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-2xl mb-4" />
              {/* Title Skeleton */}
              <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2" />
              {/* Description Skeleton */}
              <div className="h-4 bg-gray-100 rounded-lg w-full mb-1" />
              <div className="h-4 bg-gray-100 rounded-lg w-2/3 mb-4" />
              {/* Price Skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded-lg w-24" />
                <div className="h-8 bg-gray-100 rounded-2xl w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// EMPTY STATE COMPONENT
// ==========================================

function ProductEmptyState() {
  return (
    <section id="catalog" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Katalog Produk</h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">Pilih voucher atau paket data yang Anda butuhkan</p>
        </div>

        {/* Empty State */}
        <EmptyState icon={<Package className="w-8 h-8" />} title="Belum Ada Produk" description="Produk sedang dalam proses penambahan. Silakan kembali lagi nanti." className="py-16" />
      </div>
    </section>
  );
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay reset selectedProduct untuk animasi smooth
    setTimeout(() => setSelectedProduct(null), 200);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await ProductAPI.getAll({ isActive: true });
        // Axios wraps response in data property
        // API returns: { success, data: Product[], pagination }
        const apiResponse = response.data;
        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          setProducts(apiResponse.data);
        } else {
          console.error("Invalid API response:", apiResponse);
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Render catalog section based on state
  const renderCatalog = () => {
    if (isLoading) {
      return <ProductCatalogSkeleton />;
    }

    if (products.length === 0) {
      return <ProductEmptyState />;
    }

    return <ProductCatalog products={products} onSelectProduct={handleSelectProduct} />;
  };

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Product Catalog */}
      {renderCatalog()}

      {/* Contact & Location */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Transaction Modal */}
      <TransactionModal key={selectedProduct?.id ?? "no-product"} isOpen={isModalOpen} onClose={handleCloseModal} product={selectedProduct} />
    </main>
  );
}
