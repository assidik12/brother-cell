/**
 * @file components/fragments/Navbar/index.tsx
 * @description Main navigation bar for customer pages
 */

"use client";

import React, { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface NavbarProps {
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function Navbar({ className }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-300", isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-transparent", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className={cn("text-lg sm:text-xl font-bold transition-colors", isScrolled ? "text-gray-900" : "text-white")}>Brother Cell</h1>
              <p className={cn("text-xs hidden sm:block transition-colors", isScrolled ? "text-gray-500" : "text-blue-100")}>Voucher Digital Terpercaya</p>
            </div>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#catalog" className={cn("font-medium transition-colors", isScrolled ? "text-gray-600 hover:text-blue-600" : "text-white/90 hover:text-white")}>
              Katalog
            </a>
            <a href="#contact" className={cn("font-medium transition-colors", isScrolled ? "text-gray-600 hover:text-blue-600" : "text-white/90 hover:text-white")}>
              Kontak
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
