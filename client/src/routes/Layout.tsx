import React from "react";
import { useLocation, useNavigation } from "react-router-dom";
import { Header, Sidebar } from "@/common/components/layout";
import { useNavigationStore } from "@/store/navigationStore";
import { cn } from "@/common/utils";
import { RouteSuspense } from "@/common/components/shared/RouteSuspense";
import { GlobalProgress } from "@/common/components/shared/GlobalProgress";
import { Loader } from "@/common/components/ui/ProfessionalLoader";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Persistent shell layout: Sidebar and Header never unmount when switching pages.
 * Only the main content (children/Outlet) swaps. Uses RouteSuspense for skeleton-first loading.
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigation = useNavigation();

  const sidebarOpen = useNavigationStore((s) => s.sidebarOpen);
  const pendingRoutePath = useNavigationStore((s) => s.pendingRoutePath);
  const pendingRouteStartedAt = useNavigationStore(
    (s) => s.pendingRouteStartedAt
  );
  const finishRouteTransition = useNavigationStore(
    (s) => s.finishRouteTransition
  );
  const clearRouteTransition = useNavigationStore(
    (s) => s.clearRouteTransition
  );

  const isRouteChanging =
    Boolean(pendingRoutePath) && pendingRoutePath !== location.pathname;
  const isRouterLoading = navigation.state === "loading";
  const showRouteLoader = isRouteChanging || isRouterLoading;

  React.useEffect(() => {
    if (pendingRoutePath && location.pathname === pendingRoutePath) {
      finishRouteTransition(pendingRoutePath);
    }
  }, [pendingRoutePath, location.pathname, finishRouteTransition]);

  React.useEffect(() => {
    if (!pendingRoutePath || !pendingRouteStartedAt) return;

    const timeoutId = window.setTimeout(() => {
      clearRouteTransition();
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [pendingRoutePath, pendingRouteStartedAt, clearRouteTransition]);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-900">
      <GlobalProgress />
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
          {showRouteLoader && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
              <Loader.Data message="Switching module..." />
            </div>
          )}
          <div className="flex-1 flex flex-col min-h-0 p-2 relative bg-card">
            <RouteSuspense>{children}</RouteSuspense>
          </div>
        </main>
      </div>
    </div>
  );
}
