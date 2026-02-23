/**
 * @file components/molecules/ConfirmDialog/index.tsx
 * @description Confirmation dialog for destructive actions
 *
 * @example
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Product"
 *   description="Are you sure? This action cannot be undone."
 *   confirmText="Delete"
 *   variant="danger"
 * />
 */

"use client";

import React from "react";
import { Modal, Button } from "@/app/components/atoms";
import { AlertTriangle, Info } from "lucide-react";

// ==========================================
// TYPES
// ==========================================

export interface ConfirmDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Callback when dialog closes */
  onClose: () => void;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Visual variant */
  variant?: "danger" | "warning" | "info";
  /** Loading state for confirm button */
  isLoading?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmText = "Confirm", cancelText = "Cancel", variant = "danger", isLoading = false }: ConfirmDialogProps) {
  const iconColors = {
    danger: "bg-red-100 text-red-600",
    warning: "bg-yellow-100 text-yellow-600",
    info: "bg-blue-100 text-blue-600",
  };

  const Icon = variant === "info" ? Info : AlertTriangle;

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center ${iconColors[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>

        {/* Description */}
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant === "info" ? "primary" : "danger"} onClick={handleConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
