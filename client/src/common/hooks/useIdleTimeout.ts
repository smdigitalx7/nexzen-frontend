/**
 * Idle Session Timeout Hook
 *
 * WHAT: Automatically logs out the user after 5 minutes of inactivity
 * WHY: Extra security and compliance - ensures users don't leave sessions open
 * HOW: Listens to user activity events (mouse, keyboard, scroll, touch) and resets timer
 *
 * IMPORTANT: This is frontend-only and independent from JWT expiry
 * The refreshToken cookie might still exist, but UX-wise we log the user out
 */

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/core/auth/authStore";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to implement idle session timeout
 * Automatically logs out user after 5 minutes of inactivity
 */
export function useIdleTimeout() {
  const { logout, isAuthenticated, isLoggingOut, isTokenRefreshing } =
    useAuthStore();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Only set up idle timeout if user is authenticated
    // CRITICAL: Don't set up timer if logout is in progress or token is refreshing
    if (!isAuthenticated || isLoggingOut) {
      // Clear any existing timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    /**
     * Reset the idle timer on user activity
     */
    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();

      // Clear existing timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      // Set new timer
      idleTimerRef.current = setTimeout(() => {
        // CRITICAL: Check state again before logging out (race condition protection)
        const currentState = useAuthStore.getState();

        // Don't logout if:
        // 1. Already logging out (prevent double logout)
        // 2. Token is refreshing (user might be active, just waiting for refresh)
        // 3. Not authenticated anymore (already logged out)
        if (
          currentState.isLoggingOut ||
          currentState.isTokenRefreshing ||
          !currentState.isAuthenticated
        ) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "Idle timeout: Skipping logout - already logging out, refreshing, or not authenticated"
            );
          }
          return;
        }

        // 5 minutes of inactivity - log out user completely
        if (process.env.NODE_ENV === "development") {
          console.log("Idle timeout: Logging out user due to inactivity");
        }

        // CRITICAL: Force complete logout and redirect to login page
        // Pass "idle_timeout" reason to show appropriate message
        logout("idle_timeout")
          .then(() => {
            // Ensure redirect happens even if logout doesn't redirect
            // This is a safety net - logout() should already redirect
            if (
              typeof window !== "undefined" &&
              window.location.pathname !== "/login"
            ) {
              // Force redirect to login page
              window.location.href = "/login";
            }
          })
          .catch((error) => {
            console.error("Error during idle timeout logout:", error);
            // Even if logout fails, redirect to login page
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          });
      }, IDLE_TIMEOUT_MS);
    };

    // List of events that indicate user activity
    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "keypress",
    ];

    // ✅ FIX: Store stable handler reference for proper cleanup
    const handler = resetIdleTimer;

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handler, { passive: true });
    });

    // Initialize timer
    resetIdleTimer();

    // Cleanup function
    return () => {
      // ✅ FIX: Remove event listeners with same reference
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handler);
      });

      // Clear timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [isAuthenticated, isLoggingOut, isTokenRefreshing, logout]);
}
