/**
 * Idle Session Timeout Hook
 *
 * WHAT: Automatically logs out the user after 5 minutes of inactivity (with 1-minute warning)
 * WHY: Extra security and compliance - ensures users don't leave sessions open
 * HOW: Listens to user activity events (mouse, keyboard, scroll, touch) and resets timer
 *
 * IMPORTANT: This is frontend-only and independent from JWT expiry
 * The refreshToken cookie might still exist, but UX-wise we log the user out
 */

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/core/auth/authStore";

// Configuration
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity before logout
const WARNING_TIME_MS = 1 * 60 * 1000; // Show warning 1 minute before logout

/**
 * Hook to implement idle session timeout with warning dialog
 * Automatically logs out user after 5 minutes of inactivity (with 1-minute warning)
 */
export function useIdleTimeout() {
  const { logout, isAuthenticated, isLoggingOut, isTokenRefreshing } =
    useAuthStore();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const resetIdleTimerRef = useRef<(() => void) | null>(null);
  
  // State for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [secondsUntilLogout, setSecondsUntilLogout] = useState(60);

  useEffect(() => {
    // Only set up idle timeout if user is authenticated
    // CRITICAL: Don't set up timer if logout is in progress or token is refreshing
    if (!isAuthenticated || isLoggingOut) {
      // Clear any existing timers
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setShowWarning(false);
      return;
    }

    /**
     * Perform logout due to inactivity
     */
    const performLogout = () => {
      setShowWarning(false);
      
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
        return;
      }

      // CRITICAL: Call logout API directly - logout() handles API call and redirect
      // Pass "idle_timeout" reason to show appropriate message
      // The logout() function will:
      // 1. Call /auth/logout API to invalidate refresh token
      // 2. Clear all auth state
      // 3. Set flag to prevent bootstrapAuth from restoring session
      // 4. Redirect to login page using window.location.replace()
      logout("idle_timeout").catch((error) => {
        console.error("Error during idle timeout logout:", error);
        // If logout fails, still redirect to login page as fallback
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      });
    };

    /**
     * Reset the idle timer on user activity
     */
    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();

      // Clear existing timers
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }

      // Hide warning if visible
      setShowWarning(false);

      // Schedule warning dialog (1 minute before logout)
      const warningTime = IDLE_TIMEOUT_MS - WARNING_TIME_MS;
      warningTimerRef.current = setTimeout(() => {
        const currentState = useAuthStore.getState();
        if (
          !currentState.isLoggingOut &&
          !currentState.isTokenRefreshing &&
          currentState.isAuthenticated
        ) {
          setShowWarning(true);
          let remainingSeconds = Math.floor(WARNING_TIME_MS / 1000);
          setSecondsUntilLogout(remainingSeconds);
          
          // Clear any existing countdown interval
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          
          // Update countdown every second
          countdownIntervalRef.current = setInterval(() => {
            remainingSeconds -= 1;
            setSecondsUntilLogout(remainingSeconds);
            
            // Check if we should stop (user extended session or logged out)
            const state = useAuthStore.getState();
            if (
              state.isLoggingOut ||
              state.isTokenRefreshing ||
              !state.isAuthenticated ||
              remainingSeconds <= 0
            ) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
            }
          }, 1000);
        }
      }, warningTime);

      // Schedule logout timer (5 minutes of inactivity)
      idleTimerRef.current = setTimeout(performLogout, IDLE_TIMEOUT_MS);
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
    resetIdleTimerRef.current = resetIdleTimer;
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

      // Clear timers
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, isLoggingOut, isTokenRefreshing, logout]);

  /**
   * Handle extending session when user clicks "Stay Logged In"
   */
  const handleExtendSession = () => {
    setShowWarning(false);
    
    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Reset timer by calling resetIdleTimer function
    if (resetIdleTimerRef.current) {
      resetIdleTimerRef.current();
    }
  };

  /**
   * Handle immediate logout when user clicks "Log Out Now" or countdown reaches 0
   * Calls logout API directly to invalidate refresh token
   */
  const handleTimeout = () => {
    const currentState = useAuthStore.getState();
    if (
      !currentState.isLoggingOut &&
      !currentState.isTokenRefreshing &&
      currentState.isAuthenticated
    ) {
      // Call logout API directly - logout() handles everything including redirect
      logout("idle_timeout").catch((error) => {
        console.error("Error during idle timeout logout:", error);
        // Fallback redirect if logout fails
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      });
    }
  };

  return {
    showWarning,
    secondsUntilLogout,
    handleExtendSession,
    handleTimeout,
  };
}
