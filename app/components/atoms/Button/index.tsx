/**
 * @file components/atoms/Button/index.tsx
 * @description Reusable Button component with multiple variants
 *
 * @example
 * <Button variant="primary" size="md" isLoading={false}>
 *   Click Me
 * </Button>
 */

import React, { forwardRef } from "react";
import { cn } from "@/app/lib/utils";
import { Loader2 } from "lucide-react";

// ==========================================
// TYPES
// ==========================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

// ==========================================
// STYLES
// ==========================================

const baseStyles = "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 focus:ring-blue-500",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
  outline: "border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-500",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 focus:ring-red-500",
};

const sizeStyles = {
  sm: "px-3 py-2 text-sm gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3.5 text-base gap-2",
};

// ==========================================
// COMPONENT
// ==========================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "md", isLoading = false, leftIcon, rightIcon, fullWidth = false, disabled, children, ...props }, ref) => {
  return (
    <button ref={ref} disabled={disabled || isLoading} className={cn(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && "w-full", className)} {...props}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
