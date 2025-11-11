import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Custom hook to handle authentication state hydration
 * Manages the complex logic of restoring auth state from storage
 */
export function useAuthHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    let hydrationCheckAttempts = 0;
    const maxAttempts = 50; // Increased attempts to wait longer for hydration

    const checkAndRestore = () => {
      if (!mounted) return;

      hydrationCheckAttempts++;
      const sessionToken = sessionStorage.getItem("access_token");
      const sessionExpires = sessionStorage.getItem("token_expires");
      const store = useAuthStore.getState();

      // CRITICAL: Check if we have token + user data to determine if we should be authenticated
      // This is a backup check in case onRehydrateStorage didn't run or is still running
      if (sessionToken && sessionExpires && store.user) {
        const expireAt = parseInt(sessionExpires);
        const now = Date.now();

        if (now < expireAt) {
          // Valid token - ensure authenticated state is set
          if (!store.isAuthenticated || store.token !== sessionToken) {
            useAuthStore.setState((state) => {
              state.token = sessionToken;
              state.tokenExpireAt = expireAt;
              state.isAuthenticated = true;
            });
          }
          setIsHydrated(true);
          return;
        } else {
          // Token expired - clear everything
          useAuthStore.getState().logout();
          setIsHydrated(true);
          return;
        }
      } else if (store.user && !sessionToken) {
        // If we have user but no token, logout
        useAuthStore.getState().logout();
        setIsHydrated(true);
        return;
      } else if (!sessionToken && !store.user) {
        // No token and no user - not authenticated, but hydration is complete
        setIsHydrated(true);
        return;
      }

      // If we have token but no user yet, wait for hydration to complete
      // This handles the case where Zustand persist is still loading user data
      if (sessionToken && !store.user) {
        // Token exists but user not loaded yet - wait for user data
        if (hydrationCheckAttempts < maxAttempts) {
          setTimeout(checkAndRestore, 100);
          return;
        } else {
          // Exhausted attempts - check localStorage directly one more time
          const localStorageData = localStorage.getItem(
            "enhanced-auth-storage"
          );
          if (localStorageData) {
            try {
              const parsed = JSON.parse(localStorageData);
              if (parsed.state?.user) {
                // User data exists in localStorage but not in store yet
                // Set it directly and authenticate
                useAuthStore.setState((state) => {
                  state.user = parsed.state.user;
                  state.branches = parsed.state.branches || [];
                  state.currentBranch = parsed.state.currentBranch || null;
                  state.academicYear = parsed.state.academicYear || null;
                  state.academicYears = parsed.state.academicYears || [];
                  state.token = sessionToken;
                  if (sessionExpires) {
                    state.tokenExpireAt = parseInt(sessionExpires);
                  }
                  state.isAuthenticated = true;
                });
                setIsHydrated(true);
                return;
              }
            } catch (e) {
              // Failed to parse localStorage data
            }
          }
          // No user data found after all attempts - clear token and logout
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("token_expires");
          useAuthStore.getState().logout();
          setIsHydrated(true);
          return;
        }
      }

      // If we have user but no token, wait a bit for token to be set
      if (store.user && !sessionToken) {
        if (hydrationCheckAttempts < maxAttempts) {
          setTimeout(checkAndRestore, 100);
          return;
        } else {
          // No token found after all attempts - logout
          useAuthStore.getState().logout();
          setIsHydrated(true);
          return;
        }
      }

      // If we reach here, something unexpected happened - complete hydration anyway
      setIsHydrated(true);
    };

    // Start checking after a small delay to allow Zustand to start hydration
    // Zustand persist hydration happens synchronously, but we give it a tick
    setTimeout(checkAndRestore, 50);

    return () => {
      mounted = false;
    };
  }, []);

  return isHydrated;
}

