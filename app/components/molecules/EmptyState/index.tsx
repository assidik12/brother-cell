/**
 * @file components/molecules/EmptyState/index.tsx
 * @description Empty state placeholder with icon and action
 *
 * @example
 * <EmptyState
 *   icon={<Package />}
 *   title="No products"
 *   description="Add your first product to get started"
 *   action={<Button>Add Product</Button>}
 * />
 */

import React from "react";
import { cn } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button/element */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {/* Icon */}
      {icon && <div className="mb-4 h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">{icon}</div>}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      {/* Description */}
      {description && <p className="mt-2 text-sm text-gray-500 max-w-sm">{description}</p>}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
