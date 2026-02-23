/**
 * @file components/atoms/Badge/index.tsx
 * @description Status badge component for displaying labels
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 */

import React from "react";
import { cn } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface BadgeProps {
  /** Visual variant of the badge */
  variant?: "default" | "success" | "warning" | "danger" | "info";
  /** Size of the badge */
  size?: "sm" | "md";
  /** Badge content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ==========================================
// STYLES
// ==========================================

const variantStyles = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

// ==========================================
// COMPONENT
// ==========================================

export function Badge({ variant = "default", size = "sm", children, className }: BadgeProps) {
  return <span className={cn("inline-flex items-center font-medium rounded-full", variantStyles[variant], sizeStyles[size], className)}>{children}</span>;
}
