import React from "react";
import { Header, Sidebar } from "@/common/components/layout";
import { useNavigationStore } from "@/store/navigationStore";
import { cn } from "@/common/utils";
import { RouteSuspense } from "@/common/components/shared/RouteSuspense";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Persistent shell layout: Sidebar and Header never unmount when switching pages.
 * Only the main content (children/Outlet) swaps. Uses RouteSuspense for skeleton-first loading.
 */
export function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useNavigationStore();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0",
          sidebarOpen ? "ml-[250px]" : "ml-[72px]"
        )}
        style={{ minWidth: 0, maxWidth: "100%" }}
      >
        <Header />
        <main
          className="flex-1 flex flex-col overflow-auto relative bg-card min-h-0"
          style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
        >
          <div className="flex-1 flex flex-col min-h-0 p-2 relative bg-card">
            <RouteSuspense>{children}</RouteSuspense>
          </div>
        </main>
      </div>
    </div>
  );
}
