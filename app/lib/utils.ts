/**
 * @file lib/utils.ts
 * @description Utility functions used across the application
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal className handling
 * Allows conditional classes and proper Tailwind class merging
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", "px-6") // "py-2 px-6 bg-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah currency
 *
 * @example
 * formatCurrency(50000) // "Rp 50.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 *
 * @example
 * formatDate(new Date()) // "16 Februari 2026"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format datetime to Indonesian locale with time
 *
 * @example
 * formatDateTime(new Date()) // "16 Feb 2026, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Generate a slug from string
 *
 * @example
 * slugify("Paket Data") // "paket-data"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Delay execution for specified milliseconds
 * Useful for testing loading states
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate order ID with timestamp prefix
 *
 * @example
 * generateOrderId() // "BC-1708012345678-ABC123"
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BC-${timestamp}-${random}`;
}
