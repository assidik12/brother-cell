/**
 * @file stores/ui.store.ts
 * @description Global UI state management with Zustand
 *
 * Manages global UI states like sidebar, modals, and notifications.
 */

import { create } from "zustand";

// ==========================================
// TYPES
// ==========================================

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Loading overlay
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// ==========================================
// STORE
// ==========================================

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Loading
  isLoading: false,
  loadingMessage: "",
  setLoading: (loading, message = "") => set({ isLoading: loading, loadingMessage: message }),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast-${Date.now()}-${Math.random()}` }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Show a success toast notification
 */
export function showSuccess(title: string, message?: string) {
  useUIStore.getState().addToast({ type: "success", title, message });
}

/**
 * Show an error toast notification
 */
export function showError(title: string, message?: string) {
  useUIStore.getState().addToast({ type: "error", title, message });
}

/**
 * Show a warning toast notification
 */
export function showWarning(title: string, message?: string) {
  useUIStore.getState().addToast({ type: "warning", title, message });
}

/**
 * Show an info toast notification
 */
export function showInfo(title: string, message?: string) {
  useUIStore.getState().addToast({ type: "info", title, message });
}
