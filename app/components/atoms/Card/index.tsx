/**
 * @file components/atoms/Card/index.tsx
 * @description Reusable Card container component
 *
 * @example
 * <Card>
 *   <CardHeader title="Products" />
 *   <CardContent>Content here</CardContent>
 * </Card>
 */

import React from "react";
import { cn } from "@/app/lib/utils";

// ==========================================
// CARD CONTAINER
// ==========================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Add hover effect */
  hoverable?: boolean;
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Click handler */
  onClick?: () => void;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className, hoverable = false, padding = "none", onClick }: CardProps) {
  return (
    <div
      className={cn("bg-white rounded-3xl shadow-sm border border-gray-100", hoverable && "transition-shadow hover:shadow-md", onClick && "cursor-pointer", paddingStyles[padding], className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

// ==========================================
// CARD HEADER
// ==========================================

export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-6 py-4 border-b border-gray-100", className)}>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ==========================================
// CARD CONTENT
// ==========================================

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

// ==========================================
// CARD FOOTER
// ==========================================

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn("px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3", className)}>{children}</div>;
}
