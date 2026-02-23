/**
 * @file components/atoms/Toggle/index.tsx
 * @description Toggle switch component for boolean states
 *
 * @example
 * <Toggle checked={isActive} onChange={setIsActive} label="Active" />
 */

import React from "react";
import { cn } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface ToggleProps {
  /** Current toggle state */
  checked: boolean;
  /** Callback when toggle changes */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size of toggle */
  size?: "sm" | "md";
  /** Additional CSS classes */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function Toggle({ checked, onChange, label, disabled = false, size = "md", className }: ToggleProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const sizeStyles = {
    sm: {
      track: "h-5 w-9",
      thumb: "h-3.5 w-3.5",
      translate: checked ? "translate-x-4" : "translate-x-0.5",
    },
    md: {
      track: "h-6 w-11",
      thumb: "h-4 w-4",
      translate: checked ? "translate-x-6" : "translate-x-1",
    },
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          sizeStyles[size].track,
          checked ? "bg-green-500" : "bg-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span className={cn("inline-block rounded-full bg-white transition-transform shadow-sm", sizeStyles[size].thumb, sizeStyles[size].translate)} />
      </button>

      {label && <span className={cn("text-sm font-medium", disabled ? "text-gray-400" : "text-gray-700")}>{label}</span>}
    </div>
  );
}
