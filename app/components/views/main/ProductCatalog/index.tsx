/**
 * @file components/views/main/ProductCatalog/index.tsx
 * @description Product catalog section with product cards
 */

"use client";

import React, { useMemo } from "react";
import { Phone } from "lucide-react";
import { Button, Card, CardContent } from "@/app/components/atoms";
import { formatCurrency } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  className?: string;
}

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

// ==========================================
// PRODUCT CARD COMPONENT
// ==========================================

function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <Card hoverable className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10" onClick={() => onSelect(product)}>
      <CardContent className="p-5 sm:p-6">
        {/* Product Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
        </div>

        {/* Product Info */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{product.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2">{product.description}</p>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold text-blue-600">{formatCurrency(product.price)}</span>
          <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            Beli
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// PRODUCT CATALOG COMPONENT
// ==========================================

export function ProductCatalog({ products, onSelectProduct, className }: ProductCatalogProps) {
  // Defensive check inside useMemo to ensure products is an array
  const activeProducts = useMemo(() => {
    const productList = Array.isArray(products) ? products : [];
    return productList.filter((p) => p.isActive);
  }, [products]);

  return (
    <section id="catalog" className={`py-16 sm:py-20 lg:py-24 bg-gray-50 ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Katalog Produk</h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">Pilih voucher atau paket data yang Anda butuhkan</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductCatalog;
