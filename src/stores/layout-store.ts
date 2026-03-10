import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  /** Desktop: sidebar expanded (200px) vs collapsed (64px) */
  navSidebarExpanded: boolean;
  toggleNavSidebar: () => void;

  /** Mobile: nav overlay open/close */
  navSidebarMobileOpen: boolean;
  setNavSidebarMobileOpen: (open: boolean) => void;

  /** Mobile: config sidebar drawer */
  configDrawerOpen: boolean;
  setConfigDrawerOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      navSidebarExpanded: false,
      toggleNavSidebar: () => set((s) => ({ navSidebarExpanded: !s.navSidebarExpanded })),

      navSidebarMobileOpen: false,
      setNavSidebarMobileOpen: (open) => set({ navSidebarMobileOpen: open }),

      configDrawerOpen: false,
      setConfigDrawerOpen: (open) => set({ configDrawerOpen: open }),
    }),
    {
      name: "layout-store",
      partialize: (s) => ({ navSidebarExpanded: s.navSidebarExpanded }),
    }
  )
);
