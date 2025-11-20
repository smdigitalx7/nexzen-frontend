import React from "react";
import { Route, useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { ROLES, type UserRole } from "@/lib/constants/auth/roles";
import { NotAuthorized } from "./NotAuthorized";
import { RedirectToDashboard } from "./RedirectToDashboard";
import { Loader } from "@/components/ui/ProfessionalLoader";

type ProtectedRouteProps = {
  path: string;
  roles: UserRole[];
  component: React.ComponentType<any>;
  preventDirectAccess?: boolean; // Prevent ACCOUNTANT and ACADEMIC from accessing directly
};

/**
 * Protected route component that checks user roles before rendering
 * Supports preventing direct URL access for certain roles
 */
export function ProtectedRoute({
  path,
  roles,
  component: Component,
  preventDirectAccess = false,
}: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const hasAccess = user && roles.includes(user.role);

  const Guard = () => {
    const [location] = useLocation();
    const { isAuthInitializing } = useAuthStore();

    // Show loading screen while auth is initializing (bootstrapAuth is running)
    if (isAuthInitializing) {
      return <Loader.Container message="Initializing..." />;
    }

    if (!hasAccess) return <NotAuthorized />;

    // For ACCOUNTANT and ACADEMIC: Block direct URL access to restricted routes
    // But allow navigation from sidebar or internal navigation
    if (preventDirectAccess) {
      const isRestrictedRole =
        user?.role === ROLES.ACCOUNTANT || user?.role === ROLES.ACADEMIC;
      if (isRestrictedRole) {
        // Check if navigation came from sidebar using path-based check with timestamp
        const storedNavData = sessionStorage.getItem("navigation_from_sidebar");
        let fromSidebar = false;

        if (storedNavData) {
          try {
            const { path: storedPath, timestamp } = JSON.parse(storedNavData);
            const currentTime = Date.now();
            const timeDiff = currentTime - timestamp;

            // Check if path matches and navigation was recent (within 5 seconds)
            // Increased timeout to handle React navigation delays
            fromSidebar = storedPath === location && timeDiff < 5000;

            // Clear the stored data after successful navigation check
            if (fromSidebar) {
              sessionStorage.removeItem("navigation_from_sidebar");
            } else if (timeDiff > 5000) {
              // Clear stale data
              sessionStorage.removeItem("navigation_from_sidebar");
            }
          } catch (e) {
            sessionStorage.removeItem("navigation_from_sidebar");
          }
        }

        // Also check if this is a valid route for the user's role
        // Allow navigation if user has permission for this route
        const isAllowedRoute = hasAccess;

        // Only block if it's NOT from sidebar AND NOT an allowed route
        // Actually, if user has access, allow it - remove the blocking
        // The preventDirectAccess should only apply to unauthorized routes
        if (!fromSidebar && !isAllowedRoute) {
          return <RedirectToDashboard />;
        }
      }
    }

    return <Component />;
  };

  return <Route path={path} component={Guard} />;
}

