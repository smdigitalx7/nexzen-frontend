import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";

/**
 * UIStabilityProvider
 *
 * This component acts as a "Guardian" for the application's UI state.
 * It automatically detects and fixes the "frozen UI" state caused by
 * Radix UI's focus management (aria-hidden="true" remaining on body).
 *
 * FEATURES:
 * 1. Route Change Cleanup: Unlocks UI when navigating to a new page.
 * 2. Stale Attribute Watchdog: Monitors the body tag for invalid 'aria-hidden' states.
 * 3. Emergency Unlock: Removes pointer-events: none if no dialogs are open.
 */
export const UIStabilityProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // 1. Route Change Guardian
  // When the user navigates, we MUST ensure the UI is unlocked.
  // Dialogs often don't unmount cleanly during rapid navigation.
  useEffect(() => {
    // Small delay to allow previous page's cleanup effects to run first
    const timer = setTimeout(() => {
      cleanupDialogState();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // 2. Global DOM Observer
  // Watches for the specific "frozen" state:
  // - body has aria-hidden="true"
  // - BUT no role="dialog" or role="alertdialog" is actually in the DOM
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "aria-hidden" ||
           mutation.attributeName === "data-aria-hidden" ||
           mutation.attributeName === "style")
        ) {
          shouldCheck = true;
          break;
        }
      }

      if (shouldCheck) {
        // Debounce the check slightly to avoid fighting with legitimate opens
        requestAnimationFrame(() => {
            const isHidden = document.body.getAttribute("aria-hidden") === "true" || 
                           document.body.getAttribute("data-aria-hidden") === "true";
            
            if (isHidden) {
                // Check if a valid modal exists
                const hasModal = document.querySelector('[role="dialog"], [role="alertdialog"], [data-state="open"]');
                
                // If the body is hidden but NO modal exists, we are in a broken state.
                if (!hasModal) {
                    console.warn("[UI Guardian] Detected stale aria-hidden with no open model. Force unlocking.");
                    cleanupDialogState();
                }
            }
        });
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["aria-hidden", "data-aria-hidden", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
};
