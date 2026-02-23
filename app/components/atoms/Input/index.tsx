/**
 * @file components/atoms/Input/index.tsx
 * @description Reusable Input component with label and error states
 *
 * @example
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   error="Email is required"
 *   leftIcon={<Mail />}
 * />
 */

import React, { forwardRef } from "react";
import { cn } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Icon displayed on the left side */
  leftIcon?: React.ReactNode;
  /** Icon displayed on the right side */
  rightIcon?: React.ReactNode;
  /** Full width input */
  fullWidth?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", label, error, helperText, leftIcon, rightIcon, fullWidth = true, disabled, ...props }, ref) => {
  const hasError = !!error;

  return (
    <div className={cn("space-y-2", fullWidth && "w-full")}>
      {/* Label */}
      {label && <label className="block text-sm font-semibold text-gray-700 ml-1">{label}</label>}

      {/* Input Container */}
      <div className="relative group">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className={cn("h-5 w-5 text-gray-400 transition-colors", "group-focus-within:text-blue-600", hasError && "text-red-400 group-focus-within:text-red-500")}>{leftIcon}</span>
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            // Base styles
            "block w-full rounded-2xl border bg-gray-50 text-gray-900 transition-all outline-none",
            "placeholder:text-gray-400",
            "focus:bg-white focus:ring-2 focus:border-transparent",
            // Padding based on icons
            leftIcon ? "pl-12" : "pl-4",
            rightIcon ? "pr-12" : "pr-4",
            "py-3.5",
            // Normal state
            !hasError && "border-gray-200 focus:ring-blue-500",
            // Error state
            hasError && "border-red-300 focus:ring-red-500 bg-red-50/50",
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed bg-gray-100",
            className,
          )}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <span className="h-5 w-5 text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && <p className="text-sm text-red-600 ml-1">{error}</p>}

      {/* Helper Text */}
      {!hasError && helperText && <p className="text-sm text-gray-500 ml-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
