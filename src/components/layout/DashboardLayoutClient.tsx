"use client";

import { useState, createContext, useContext, type ReactNode } from "react";

interface MobileSidebarContextValue {
  mobileOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextValue>({
  mobileOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
});

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider
      value={{
        mobileOpen,
        openSidebar:  () => setMobileOpen(true),
        closeSidebar: () => setMobileOpen(false),
      }}
    >
      {children}
    </MobileSidebarContext.Provider>
  );
}
