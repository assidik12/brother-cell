/**
 * @file app/providers/index.tsx
 * @description Central providers wrapper combining all context providers
 *
 * Wrap the application with all necessary providers in the correct order.
 * SessionProvider (NextAuth) -> QueryProvider (React Query) -> Children
 */

"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "sonner";

// ==========================================
// TYPES
// ==========================================

interface ProvidersProps {
  children: React.ReactNode;
}

// ==========================================
// COMPONENT
// ==========================================

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </SessionProvider>
  );
}
