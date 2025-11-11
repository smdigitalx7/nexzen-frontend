import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { componentPreloader } from "@/lib/utils/performance/preloader";
import ProductionApp from "@/components/shared/ProductionApp";
import { AppRouter } from "@/components/routing";
import { useTokenManagement } from "@/hooks/useTokenManagement";

/**
 * Main App component
 * Handles token management and component preloading
 */
function App() {
  const { user } = useAuthStore();

  // Handle token management (refresh, expiration, visibility)
  useTokenManagement();

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
      <AppRouter />
    </ProductionApp>
  );
}

export default App;
