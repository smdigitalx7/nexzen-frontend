import React, { useEffect } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { componentPreloader } from "@/common/utils/performance/preloader";
import ProductionApp from "@/common/components/shared/ProductionApp";
import { router } from "@/routes/router";
import { RouterProvider } from "react-router-dom";
import { useTokenManagement } from "@/common/hooks/useTokenManagement";
// Removed unused hooks
import { UIStabilityProvider } from "@/common/components/providers/UIStabilityProvider";


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

  // (Network status is handled in RootLayout)


  // Preload only critical chunks (Login + UserManagement). Do NOT preload role-based
  // route chunks here — that caused 700+ requests and 30MB+ transfer (continuous loading).
  // Routes load on demand when user navigates; matches fast-loading reference (ADA).
  useEffect(() => {
    if (!user?.role) return;
    void componentPreloader.preloadCritical();
  }, [user?.role]);

  return (
    <ProductionApp>
      <RouterProvider router={router} />
    </ProductionApp>
  );
}

export default App;
