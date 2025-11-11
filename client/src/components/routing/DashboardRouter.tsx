import React from "react";
import { useAuthStore } from "@/store/authStore";
import { getRoleFromToken } from "@/lib/utils/auth/jwt";
import { ROLES } from "@/lib/constants/auth/roles";
import { lazy } from "react";

// Lazy-loaded dashboard components
const AdminDashboard = lazy(
  () => import("@/components/pages/general/AdminDashboard")
);
const AccountantDashboard = lazy(
  () => import("@/components/pages/general/AccountantDashboard")
);
const AcademicDashboard = lazy(
  () => import("@/components/pages/general/AcademicDashboard")
);

/**
 * Dashboard Router - Shows appropriate dashboard based on user role
 */
export function DashboardRouter() {
  const { user, token, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  // Wait for component to mount and state to stabilize
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // CRITICAL: If user.role is not available, try to get it from token
  // This handles race conditions when logging in with a different role
  let role = user?.role;
  if (!role && token) {
    try {
      role = getRoleFromToken(token, user?.current_branch_id);
    } catch (e) {
      // If we can't get role from token, fall back to user.role
    }
  }

  // Show loading state until mounted and authenticated
  if (!mounted || !isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // If we have a token but no role yet, show loading
  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (role === ROLES.ADMIN || role === ROLES.INSTITUTE_ADMIN) {
    return <AdminDashboard />;
  }
  if (role === ROLES.ACCOUNTANT) {
    return <AccountantDashboard />;
  }
  if (role === ROLES.ACADEMIC) {
    return <AcademicDashboard />;
  }

  // Default fallback
  return <AdminDashboard />;
}

