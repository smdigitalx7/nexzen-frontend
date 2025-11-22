import { useEffect } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { AuthTokenTimers } from "@/core/api";

/**
 * Custom hook to manage token lifecycle
 * Handles proactive refresh, expiration checks, and visibility API
 */
export function useTokenManagement() {
  const { accessToken, tokenExpireAt, user, logout, isAuthenticated } =
    useAuthStore();
  const token = accessToken; // Use accessToken instead of token alias

  // Restore authentication state on mount (after hydration)
  useEffect(() => {
    // CRITICAL: Access token is stored ONLY in memory, NOT in sessionStorage
    // Check if we have accessToken and user data but isAuthenticated is false
    // This handles the case where rehydration hasn't set isAuthenticated yet
    const store = useAuthStore.getState();
    const hasUser = user !== null;
    const hasToken = store.accessToken !== null;
    const hasExpiry = store.tokenExpireAt !== null;

    if (hasToken && hasExpiry && hasUser && !isAuthenticated) {
      const expireAt = store.tokenExpireAt;
      const now = Date.now();

      if (now < expireAt) {
        // Token is valid, restore authentication
        useAuthStore.setState((state) => {
          state.isAuthenticated = true;
        });
      } else {
        // Token expired - logout will trigger Router to redirect to login
        logout();
      }
    } else if (!hasToken && isAuthenticated) {
      // No token but marked as authenticated - fix this
      useAuthStore.setState((state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.tokenExpireAt = null;
      });
    }
  }, [user, isAuthenticated, logout]);

  // Proactive refresh scheduling (consolidated - removed redundant periodic check)
  useEffect(() => {
    if (accessToken && tokenExpireAt) {
      AuthTokenTimers.scheduleProactiveRefresh();
    }
    return () => {
      AuthTokenTimers.clearProactiveRefresh();
    };
  }, [accessToken, tokenExpireAt]);

  // Page Visibility API integration - pause refresh when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      AuthTokenTimers.setTabVisible(isVisible);
    };

    // Set initial visibility state
    AuthTokenTimers.setTabVisible(!document.hidden);

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Simple token expiration check (only for logout, refresh is handled proactively)
  useEffect(() => {
    if (!token || !tokenExpireAt) return;

    const checkTokenExpiration = () => {
      const now = Date.now();

      // Only check if token is already expired (proactive refresh should handle before expiry)
      if (now >= tokenExpireAt) {
        if (process.env.NODE_ENV === "development") {
          console.log("Token expired, logging out...");
        }
        logout();
        // Use soft navigation instead of hard redirect
        // Note: This will be handled by the Router component which checks isAuthenticated
        return;
      }
    };

    // Check every 5 minutes (reduced frequency, only for safety logout)
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, tokenExpireAt, logout]);
}

