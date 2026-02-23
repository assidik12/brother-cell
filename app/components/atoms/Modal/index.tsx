/**
 * @file components/atoms/Modal/index.tsx
 * @description Reusable Modal component with animations
 *
 * @example
 * <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Product">
 *   <p>Modal content here</p>
 * </Modal>
 */

"use client";

import React, { useEffect } from "react";
import { cn } from "@/app/lib/utils";
import { X } from "lucide-react";

// ==========================================
// TYPES
// ==========================================

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
}

// ==========================================
// STYLES
// ==========================================

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

// ==========================================
// COMPONENT
// ==========================================

export function Modal({ isOpen, onClose, title, description, children, size = "md", showCloseButton = true, closeOnOverlayClick = true }: ModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeOnOverlayClick ? onClose : undefined} aria-hidden="true" />

      {/* Modal Content */}
      <div
        className={cn("relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 mx-4 w-full", "animate-in zoom-in-95 fade-in duration-200", sizeStyles[size])}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between mb-6">
            <div>
              {title && (
                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>

            {showCloseButton && (
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close modal">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
