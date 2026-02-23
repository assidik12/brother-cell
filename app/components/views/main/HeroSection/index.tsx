/**
 * @file components/views/main/HeroSection/index.tsx
 * @description Hero section for customer main page
 */

"use client";

import React from "react";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { Button } from "@/app/components/atoms";

// ==========================================
// TYPES
// ==========================================

export interface HeroSectionProps {
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function HeroSection({ className }: HeroSectionProps) {
  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={`relative min-h-[90vh] sm:min-h-screen bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center overflow-hidden ${className ?? ""}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Layanan 24 Jam</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Beli Voucher Offline
            <br />
            <span className="text-blue-200">via SMS</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">Dapatkan voucher pulsa dan paket data dengan mudah. Bayar via QRIS, kode voucher langsung dikirim ke HP Anda.</p>

          {/* CTA Button */}
          <Button size="lg" onClick={scrollToCatalog} className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-black/20 hover:shadow-black/30 px-8 sm:px-10">
            <ShoppingCart className="w-5 h-5" />
            Lihat Katalog
          </Button>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
            <ChevronDown className="w-8 h-8 text-white/50" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
