/**
 * @file components/layouts/AdminLayout/index.tsx
 * @description Layout wrapper untuk semua halaman Admin Dashboard
 *
 * Struktur:
 * - Sidebar (navigation) - dari fragment
 * - Main content area dengan Header
 *
 * @example
 * <AdminLayout title="Dashboard">
 *   <DashboardContent />
 * </AdminLayout>
 */

"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Search, ChevronDown, User } from "lucide-react";
import Sidebar, { MobileMenuButton } from "@/app/components/fragments/Sidebar/page";
import { cn } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

interface AdminLayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Page title untuk header */
  title?: string;
  /** Page description/subtitle */
  description?: string;
  /** Action buttons di header (optional) */
  headerAction?: React.ReactNode;
  /** Show search bar di header */
  showSearch?: boolean;
  /** Full width content (no padding) */
  fullWidth?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export default function AdminLayout({ children, title, description, headerAction, showSearch = false, fullWidth = false }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect jika belum login
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          {/* Left: Mobile menu + Title */}
          <div className="flex items-center gap-4">
            <MobileMenuButton onClick={toggleSidebar} />

            {title && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>
                {description && <p className="hidden text-sm text-gray-500 sm:block">{description}</p>}
              </div>
            )}
          </div>

          {/* Center: Search (optional) */}
          {showSearch && (
            <div className="hidden flex-1 max-w-md mx-8 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Cari..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          )}

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-3">
            {/* Header Action Slot */}
            {headerAction}

            {/* Notifications */}
            <button className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-gray-100 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <User size={18} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
              <ChevronDown size={16} className="hidden text-gray-400 sm:block" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={cn("flex-1 overflow-y-auto", !fullWidth && "p-4 sm:p-6 lg:p-8")}>{children}</main>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS (Re-export untuk convenience)
// ==========================================

/**
 * Page Header dengan title dan actions
 * Gunakan jika perlu custom header di dalam content
 */
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  );
}

/**
 * Content Card wrapper
 */
export function ContentCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-gray-100 bg-white shadow-sm", className)}>{children}</div>;
}
