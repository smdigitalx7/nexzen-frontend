import { useState, useEffect, useCallback } from "react";
import { toast } from "@/common/hooks/use-toast";

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  isNetworkError: boolean;
}

/**
 * useNetworkStatus - Hook to monitor browser's online/offline status
 * 
 * Features:
 * - Real-time monitoring of navigator.onLine
 * - Tracking if user was recently offline (used for refetching)
 * - Toast notifications for status changes
 * - Automatic query invalidation when coming back online (via App.tsx)
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(!navigator.onLine);

  const checkConnectivity = useCallback(async () => {
    const online = navigator.onLine;
    setIsOnline(online);
    if (online) {
      setIsNetworkError(false);
    } else {
      setIsNetworkError(true);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline((prev) => {
        if (!prev) {
          setWasOffline(true);
          toast({
            title: "Internet Restored",
            description: "You are back online. All features are now available.",
            variant: "success",
          });
          return true;
        }
        return prev;
      });
      setIsNetworkError(false);
    };

    const handleOffline = () => {
      setIsOnline((prev) => {
        if (prev) {
          toast({
            title: "No Internet Connection",
            description: "You are currently offline. Some features may be limited.",
            variant: "destructive",
          });
          return false;
        }
        return prev;
      });
      setIsNetworkError(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const intervalId = setInterval(() => {
      const currentStatus = navigator.onLine;
      setIsOnline((prev) => {
        if (currentStatus !== prev) {
          if (currentStatus && !prev) {
            setWasOffline(true);
          }
          return currentStatus;
        }
        return prev;
      });
      setIsNetworkError(!currentStatus);
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Reset wasOffline after a delay to allow components to react
  useEffect(() => {
    if (wasOffline && isOnline) {
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  const retry = useCallback(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  return {
    isOnline,
    wasOffline,
    isNetworkError,
    retry,
  };
}
