import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/core/auth/authStore";
import { useAuthHydration } from "@/common/hooks/useAuthHydration";
import { LazyLoadingWrapper } from "@/common/components/shared/LazyLoadingWrapper";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { UIStabilityProvider } from "@/common/components/providers/UIStabilityProvider";
import { SEOHead } from "@/common/components/shared/SEOHead";
import { NetworkErrorPage } from "@/common/components/shared/NetworkErrorPage";
import { useNetworkStatus } from "@/common/hooks/useNetworkStatus";
import { useDocumentTitle } from "@/common/hooks/useDocumentTitle";
import { useFavicon } from "@/common/hooks/useFavicon";

// ...
export function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitializing = useAuthStore((s) => s.isAuthInitializing);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthHydration();
  const location = useLocation();

  // Global Hooks
  useDocumentTitle();
  useFavicon();


  // Network Status
  const { isOnline, isNetworkError, retry } = useNetworkStatus();
  const showNetworkError = isNetworkError || (!isOnline && typeof navigator !== "undefined" && !navigator.onLine);

  // Loading Logic
  const shouldShowLoader = !isHydrated || isAuthInitializing || (user && !isAuthenticated);

  if (shouldShowLoader) {
    return (
      <LazyLoadingWrapper>
        <Loader.Page message="Initializing..." />
      </LazyLoadingWrapper>
    );
  }

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
      {/* 
        Routing Logic:
        If authenticated, render Dashboard/Protected Routes (via Outlet).
        If (user && !auth) -> handled by loader above.
        If (!user && !auth) -> Render Login (via Outlet or Navigate).
        
        However, createBrowserRouter handles the Route matching. 
        We rely on the router configuration to assume that if we are here, 
        we are rendering the matched route. 
        
        BUT, we need to handle the "Not Authenticated" redirection globally 
        if we are trying to access protected routes.
      */}
      <Outlet />
    </UIStabilityProvider>
  );
}
