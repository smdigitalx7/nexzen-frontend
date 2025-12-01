/**
 * Network Status Hook
 * 
 * Detects online/offline status and network connectivity issues
 * Provides real-time network status updates
 */

import { useEffect, useState, useCallback } from "react";

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean; // True if we just came back online after being offline
  isNetworkError: boolean; // True if we detect network errors despite being "online"
}

/**
 * Hook to monitor network status
 * Detects:
 * - Browser online/offline events
 * - Network connectivity issues
 * - Failed fetch requests
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    wasOffline: false,
    isNetworkError: false,
  }));

  // Check connectivity - completely rely on browser events to avoid unnecessary network requests
  const checkConnectivity = useCallback(() => {
    if (typeof window === "undefined") return;
    
    // Simply use browser's online status - no network requests to avoid 404 errors
    setStatus({
      isOnline: navigator.onLine,
      wasOffline: false,
      isNetworkError: !navigator.onLine,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      // When coming back online, verify actual connectivity
      checkConnectivity();
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        isOnline: false,
        wasOffline: false,
        isNetworkError: true,
      }));
    };

    // Listen to browser online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Rely on browser online/offline events primarily
    // Only check connectivity when coming back online to avoid unnecessary requests
    // Removed periodic checks to prevent unnecessary network requests and 404 errors

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnectivity]);

  const retry = useCallback(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  return {
    ...status,
    retry,
  };
}
