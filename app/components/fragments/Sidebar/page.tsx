/**
 * @file components/fragments/Sidebar/page.tsx
 * @description Sidebar navigation component untuk Admin Dashboard
 *
 * Menampilkan navigasi menu dan logout button.
 * Responsive: drawer di mobile, fixed di desktop.
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Menu, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

// ==========================================
// TYPES
// ==========================================

interface SidebarProps {
  /** Sidebar open state (mobile) */
  isOpen: boolean;
  /** Callback to toggle sidebar */
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// ==========================================
// NAVIGATION CONFIG
// ==========================================

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Produk",
    href: "/admin/product",
    icon: <Package size={20} />,
  },
  {
    label: "Transaksi",
    href: "/admin/transaction",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Pengaturan",
    href: "/admin/settings",
    icon: <Settings size={20} />,
  },
];

// ==========================================
// COMPONENT
// ==========================================

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onToggle} aria-hidden="true" />}

      {/* Sidebar Container */}
      <aside className={cn("fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transition-transform duration-300", "lg:static lg:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full")}>
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-xl font-bold text-blue-600">BrotherCell</span>
          </Link>

          {/* Close button (mobile only) */}
          <button onClick={onToggle} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden" aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-gray-500 hover:bg-blue-50 hover:text-blue-600",
                )}
              >
                <span className={cn("transition-transform", !isActive && "group-hover:scale-110")}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

// ==========================================
// MOBILE MENU BUTTON (Export untuk Header)
// ==========================================

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
      <Menu size={24} />
    </button>
  );
}
