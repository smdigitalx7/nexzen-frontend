import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { componentPreloader } from "@/lib/utils/performance/preloader";
import ProductionApp from "@/components/shared/ProductionApp";
import { AppRouter } from "@/components/routing";
import { useTokenManagement } from "@/hooks/useTokenManagement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFavicon } from "@/hooks/useFavicon";
import { SEOHead } from "@/components/shared/SEOHead";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

/**
 * Main App component
 * Handles authentication bootstrap, token management, idle timeout, component preloading, document title, favicon, and SEO
 */
function App() {
  const { user, bootstrapAuth, isAuthInitializing, isAuthenticated } = useAuthStore();
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

  // Handle idle timeout (5 minutes of inactivity = auto logout)
  useIdleTimeout();

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
      <AppRouter />
    </ProductionApp>
  );
}

export default App;
