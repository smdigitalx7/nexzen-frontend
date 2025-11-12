import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { componentPreloader } from "@/lib/utils/performance/preloader";
import ProductionApp from "@/components/shared/ProductionApp";
import { AppRouter } from "@/components/routing";
import { useTokenManagement } from "@/hooks/useTokenManagement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFavicon } from "@/hooks/useFavicon";
import { SEOHead } from "@/components/shared/SEOHead";

/**
 * Main App component
 * Handles token management, component preloading, document title, favicon, and SEO
 */
function App() {
  const { user } = useAuthStore();

  // Handle token management (refresh, expiration, visibility)
  useTokenManagement();

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
