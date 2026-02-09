import { Outlet } from "react-router-dom";
import { UIStabilityProvider } from "@/common/components/providers/UIStabilityProvider";
import { SEOHead } from "@/common/components/shared/SEOHead";
import { NetworkErrorPage } from "@/common/components/shared/NetworkErrorPage";
import { useNetworkStatus } from "@/common/hooks/useNetworkStatus";
import { useDocumentTitle } from "@/common/hooks/useDocumentTitle";
import { useFavicon } from "@/common/hooks/useFavicon";

// ...
export function RootLayout() {
  // Global Hooks
  useDocumentTitle();
  useFavicon();

  // Network Status
  const { isOnline, isNetworkError, retry } = useNetworkStatus();
  const showNetworkError = isNetworkError || (!isOnline && typeof navigator !== "undefined" && !navigator.onLine);

  // Network Error Boundary
  if (showNetworkError) {
    return (
      <UIStabilityProvider>
        <SEOHead />
        <NetworkErrorPage isVisible={showNetworkError} onRetry={retry} />
      </UIStabilityProvider>
    );
  }

  return (
    <UIStabilityProvider>
      <SEOHead />
      {/* Outlet renders matched route (Login, or RequireAuth > AuthenticatedLayout > route content). No full-page loader. */}
      <Outlet />
    </UIStabilityProvider>
  );
}
