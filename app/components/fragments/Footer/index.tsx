/**
 * @file components/fragments/Footer/index.tsx
 * @description Main footer component for customer pages
 */

import React from "react";
import { Smartphone } from "lucide-react";

// ==========================================
// TYPES
// ==========================================

export interface FooterProps {
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-900 py-8 sm:py-12 ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-white font-bold text-sm sm:text-base">Brother Cell</span>
          </div>

          {/* Copyright */}
          <p className="text-gray-400 text-xs sm:text-sm text-center">© {currentYear} Brother Cell. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
