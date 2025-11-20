import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Custom hook to handle authentication state hydration
 * Manages the complex logic of restoring auth state from storage
 */
export function useAuthHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthInitializing } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    let hydrationCheckAttempts = 0;
    const maxAttempts = 20; // Wait for bootstrapAuth to complete

    const checkAndRestore = () => {
      if (!mounted) return;

      hydrationCheckAttempts++;
      const store = useAuthStore.getState();

      // CRITICAL: Access token is stored ONLY in memory, NOT in sessionStorage
      // On initial load, accessToken will be null until bootstrapAuth completes
      // Wait for bootstrapAuth to finish before completing hydration
      
      // If bootstrapAuth is still running, wait a bit
      // Also wait if we have user data but bootstrapAuth hasn't completed yet
      if (store.isAuthInitializing && hydrationCheckAttempts < maxAttempts) {
        setTimeout(checkAndRestore, 100);
        return;
      }

      // After bootstrapAuth completes, complete hydration
      // Don't call logout here - bootstrapAuth handles that
      setIsHydrated(true);
    };

    // Start checking immediately
    checkAndRestore();

    return () => {
      mounted = false;
    };
  }, [isAuthInitializing]);

  return isHydrated;
}

