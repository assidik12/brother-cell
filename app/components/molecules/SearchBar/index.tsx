/**
 * @file components/molecules/SearchBar/index.tsx
 * @description Search input with icon and optional filters
 *
 * @example
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search products..."
 * />
 */

"use client";

import React from "react";
import { cn } from "@/app/lib/utils";
import { Search, X } from "lucide-react";

// ==========================================
// TYPES
// ==========================================

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show clear button when has value */
  showClear?: boolean;
  /** Debounce delay in ms (optional) */
  debounceMs?: number;
}

// ==========================================
// COMPONENT
// ==========================================

export function SearchBar({ value, onChange, placeholder = "Cari...", className, showClear = true }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 text-sm",
          "placeholder-gray-400 shadow-sm transition-all",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
          showClear && value ? "pr-10" : "pr-4",
        )}
      />

      {/* Clear Button */}
      {showClear && value && (
        <button type="button" onClick={() => onChange("")} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600" aria-label="Clear search">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
