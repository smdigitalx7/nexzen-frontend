import React from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { getRoleFromToken } from "@/common/utils/auth/jwt";
import { ROLES } from "@/common/constants/auth/roles";
import { lazy } from "react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";

// Lazy-loaded dashboard components
const AdminDashboard = lazy(
  () => import("@/features/general/pages/AdminDashboard")
);
const AccountantDashboard = lazy(
  () => import("@/features/general/pages/AccountantDashboard")
);
const AcademicDashboard = lazy(
  () => import("@/features/general/pages/AcademicDashboard")
);

/**
 * Dashboard Router - Shows appropriate dashboard based on user role
 */
export function DashboardRouter() {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const token = accessToken; // Use accessToken directly
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

  // ✅ FIX: Use container loader for main content area (doesn't cover sidebar/header)
  // Show loading state until mounted and authenticated
  if (!mounted || !isAuthenticated || !token) {
    return <Loader.Container message="Loading dashboard..." />;
  }

  // If we have a token but no role yet, show loading
  if (!role) {
    return <Loader.Container message="Loading dashboard..." />;
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

