import React, { lazy } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { getRoleFromToken } from "@/common/utils/auth/jwt";
import { ROLES, normalizeRole, type UserRole } from "@/common/constants/auth/roles";
import { ContentSkeleton } from "@/common/components/shared/ContentSkeleton";

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
  // ✅ PERF: Use selectors so dashboard doesn't rerender on unrelated auth updates
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken); // Use accessToken directly
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = React.useState(false);

  // Wait for component to mount and state to stabilize
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // CRITICAL: If user.role is not available, try to get it from token
  // This handles race conditions when logging in with a different role
  let role: UserRole | undefined = user?.role;
  if (!role && token) {
    try {
      role = normalizeRole(getRoleFromToken(token, user?.current_branch_id)) ?? undefined;
    } catch (e) {
      // If we can't get role from token, fall back to user.role
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to derive role from token:", e);
      }
    }
  }

  // Until ready, show skeleton (no overlay); only dashboard content shows the middle loader
  const ready = mounted && isAuthenticated && !!token && !!role;
  if (!ready) {
    return <ContentSkeleton />;
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

