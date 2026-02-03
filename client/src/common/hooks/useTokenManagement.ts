import { useEffect } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { AuthTokenTimers } from "@/core/api";

/**
 * Custom hook to manage token lifecycle
 * Handles proactive refresh, expiration checks, and visibility API
 */
export function useTokenManagement() {
  const { accessToken, tokenExpireAt } = useAuthStore();

  // Proactive refresh scheduling
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
}

