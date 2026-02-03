import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/core/auth/authStore";

/**
 * useIdleTimeout Hook
 * 
 * Automatically logs out the user after a period of inactivity.
 * Features:
 * - Cross-tab synchronization: Activity in any tab resets the timer for all tabs.
 * - Warning dialog trigger: Notifies when the user is about to be logged out.
 * - Automatic logout: Performs actual logout when the time is up.
 * 
 * @param timeoutMs Total time in milliseconds before automatic logout (default 5 mins)
 * @param warningMs Time in milliseconds before logout to show warning (default 1 min)
 */
export function useIdleTimeout(
  timeoutMs: number = 5 * 60 * 1000,
  warningMs: number = 60 * 1000
) {
  const [isIdle, setIsIdle] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningMs);
  
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Cross-tab synchronization via BroadcastChannel
  useEffect(() => {
    channelRef.current = new BroadcastChannel("user_activity");
    
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data === "activity") {
        resetTimer(false); // Reset timer locally without re-broadcasting
      } else if (event.data === "logout") {
        logout();
      }
    };

    channelRef.current.onmessage = handleBroadcast;

    return () => {
      channelRef.current?.close();
    };
  }, [logout]);

  const resetTimer = useCallback((shouldBroadcast: boolean = true) => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    setIsIdle(false);
    setIsWarning(false);
    setRemainingTime(warningMs);

    // If not logged in, don't start timer
    if (!user) return;

    // Set timeout for the warning threshold
    timeoutRef.current = setTimeout(() => {
      setIsWarning(true);
      startWarningCountdown();
    }, timeoutMs - warningMs);

    // Broadcast activity to other tabs
    if (shouldBroadcast && channelRef.current) {
      channelRef.current.postMessage("activity");
    }
  }, [user, timeoutMs, warningMs]);

  const startWarningCountdown = useCallback(() => {
    let timeLeft = warningMs;
    
    warningIntervalRef.current = setInterval(() => {
      timeLeft -= 1000;
      setRemainingTime(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(warningIntervalRef.current!);
        handleLogout();
      }
    }, 1000);
  }, [warningMs]);

  const handleLogout = useCallback(() => {
    setIsIdle(true);
    setIsWarning(false);
    
    // Broadcast logout to other tabs
    if (channelRef.current) {
      channelRef.current.postMessage("logout");
    }
    
    logout();
  }, [logout]);

  // Activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    const handleActivity = () => resetTimer(true);

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer(true); // Initial timer start

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    };
  }, [user, resetTimer]);

  return {
    isIdle,
    isWarning,
    remainingTime,
    resetTimer: () => resetTimer(true),
    logout: handleLogout,
  };
}
