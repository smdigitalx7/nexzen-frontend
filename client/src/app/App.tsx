import React, { useEffect } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { componentPreloader } from "@/common/utils/performance/preloader";
import ProductionApp from "@/common/components/shared/ProductionApp";
import { AppRouter } from "@/routes";
import { useTokenManagement } from "@/common/hooks/useTokenManagement";
import { useDocumentTitle } from "@/common/hooks/useDocumentTitle";
import { useFavicon } from "@/common/hooks/useFavicon";
import { SEOHead } from "@/common/components/shared/SEOHead";
import { useNetworkStatus } from "@/common/hooks/useNetworkStatus";
import { NetworkErrorPage } from "@/common/components/shared/NetworkErrorPage";

/**
 * Main App component
 * Handles authentication bootstrap, token management, idle timeout, component preloading, document title, favicon, and SEO
 */
function App() {
  // ✅ PERF: Use selectors to avoid rerendering App on unrelated auth store updates
  const user = useAuthStore((s) => s.user);
  const bootstrapAuth = useAuthStore((s) => s.bootstrapAuth);
  const hasBootstrappedRef = React.useRef(false);

  // Bootstrap authentication on app startup (only once on initial mount)
  // Calls POST /api/v1/auth/refresh to restore session from refreshToken cookie
  // Skip if already authenticated (user just logged in) or if already bootstrapped
  useEffect(() => {
    // Only bootstrap once on initial mount
    if (hasBootstrappedRef.current) {
      return;
    }

    // Mark as bootstrapped immediately to prevent multiple calls
    hasBootstrappedRef.current = true;

    // Skip bootstrap if already authenticated (user just logged in)
    const currentState = useAuthStore.getState();
    if (currentState.isAuthenticated && currentState.user && currentState.accessToken) {
      return;
    }

    // Run bootstrap auth
    bootstrapAuth().catch((error) => {
      console.error("Failed to bootstrap auth:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Handle token management (refresh, expiration, visibility)
  useTokenManagement();

  // Monitor network status
  const { isOnline, isNetworkError, retry } = useNetworkStatus();
  // Show network error page if we detect a network error
  // (Either browser says offline OR we detected actual connectivity issues)
  const showNetworkError = isNetworkError || (!isOnline && typeof navigator !== "undefined" && !navigator.onLine);

  // Manage document title based on route
  useDocumentTitle();

  // Manage favicon based on branch
  useFavicon();

  // Preload components based on user role
  useEffect(() => {
    if (user?.role) {
      // Preload critical components immediately
      componentPreloader.preloadCritical();

      // Preload role-specific components in background
      componentPreloader.preloadByRole(user.role);
    }
  }, [user?.role]);

  return (
    <ProductionApp>
      <SEOHead />
      <NetworkErrorPage isVisible={showNetworkError} onRetry={retry} />
      {!showNetworkError && <AppRouter />}
    </ProductionApp>
  );
}

export default App;
