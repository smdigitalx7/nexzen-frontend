import { Switch, Route, useLocation } from "wouter";
import React, { useEffect, Suspense, lazy, useState } from "react";

import { Header, Sidebar } from "@/components/layout";
import { useAuthStore } from "@/store/authStore";
import { useNavigationStore } from "@/store/navigationStore";
import { cn } from "@/lib/utils";
import { AuthTokenTimers } from "@/lib/api";

import { LazyLoadingWrapper } from "@/components/shared/LazyLoadingWrapper";
import { componentPreloader } from "@/lib/utils/performance/preloader";
import ProductionApp from "@/components/shared/ProductionApp";
import { ROLES, type UserRole } from "@/lib/constants/auth/roles";
import { config } from "@/lib/config/production";

// Lazy-loaded General Components
const Login = lazy(() => import("./components/pages/general/Login"));
const NotFound = lazy(() => import("./components/pages/general/not-found"));
const AdminDashboard = lazy(
  () => import("./components/pages/general/AdminDashboard")
);
const AccountantDashboard = lazy(
  () => import("./components/pages/general/AccountantDashboard")
);
const AcademicDashboard = lazy(
  () => import("./components/pages/general/AcademicDashboard")
);
const ProfilePage = lazy(
  () => import("./components/pages/general/ProfilePage")
);
const SettingsPage = lazy(
  () => import("./components/pages/general/SettingsPage")
);
const UserManagement = lazy(
  () => import("./components/pages/general/UserManagementPage")
);
const EmployeeManagement = lazy(
  () => import("./components/pages/general/EmployeeManagementPage")
);
const PayrollManagement = lazy(
  () => import("./components/pages/general/PayrollManagementPage")
);
const TransportManagement = lazy(
  () => import("./components/pages/general/TransportManagementPage")
);
const AuditLog = lazy(() => import("./components/pages/general/AuditLog"));
const AnnouncementsManagement = lazy(
  () =>
    import("./components/features/general/Announcemnts/AnnouncementsManagement")
);

// Lazy-loaded School Components
const SchoolAcademicManagement = lazy(
  () => import("@/components/pages/school/SchoolAcademicPage")
);
const SchoolReservationManagement = lazy(
  () => import("@/components/pages/school/SchoolReservationPage")
);
const SchoolAdmissionsManagement = lazy(
  () => import("@/components/pages/school/SchoolAdmissionsPage")
);
const SchoolStudentsManagement = lazy(
  () => import("./components/pages/school/SchoolStudentsPage")
);
const SchoolAttendanceManagement = lazy(
  () => import("./components/pages/school/SchoolAttendancePage")
);
const SchoolFeesManagement = lazy(
  () => import("./components/pages/school/SchoolFeesPage")
);
const SchoolMarksManagement = lazy(
  () => import("./components/pages/school/SchoolMarksPage")
);
const SchoolReportsPage = lazy(
  () => import("./components/pages/school/SchoolReportsPage")
);

// Lazy-loaded College Components
const CollegeAcademicManagement = lazy(
  () => import("@/components/pages/college/CollegeAcademicPage")
);
const CollegeReservationManagement = lazy(
  () => import("@/components/pages/college/CollegeReservationPage")
);
const CollegeAdmissionsManagement = lazy(
  () => import("@/components/pages/college/CollegeAdmissionsPage")
);
const CollegeClassesManagement = lazy(
  () => import("@/components/pages/college/CollegeClassesPage")
);
const CollegeStudentsManagement = lazy(
  () => import("@/components/pages/college/CollegeStudentsPage")
);
const CollegeAttendanceManagement = lazy(
  () => import("@/components/pages/college/CollegeAttendancePage")
);
const CollegeMarksManagement = lazy(
  () => import("@/components/pages/college/CollegeMarksPage")
);
const CollegeFeesManagement = lazy(
  () => import("@/components/pages/college/CollegeFeesPage")
);
const CollegeReportsPage = lazy(
  () => import("./components/pages/college/CollegeReportsPage")
);

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useNavigationStore();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          sidebarOpen ? "ml-[280px]" : "ml-[72px]"
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-2">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, user, token } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand persist to hydrate - onRehydrateStorage handles auth restoration
  useEffect(() => {
    let mounted = true;
    let hydrationCheckAttempts = 0;
    const maxAttempts = 50; // Increased attempts to wait longer for hydration

    const checkAndRestore = () => {
      if (!mounted) return;

      hydrationCheckAttempts++;
      const sessionToken = sessionStorage.getItem("access_token");
      const sessionExpires = sessionStorage.getItem("token_expires");
      const store = useAuthStore.getState();

      // CRITICAL: Check if we have token + user data to determine if we should be authenticated
      // This is a backup check in case onRehydrateStorage didn't run or is still running
      if (sessionToken && sessionExpires && store.user) {
        const expireAt = parseInt(sessionExpires);
        const now = Date.now();

        if (now < expireAt) {
          // Valid token - ensure authenticated state is set
          if (!store.isAuthenticated || store.token !== sessionToken) {
            useAuthStore.setState((state) => {
              state.token = sessionToken;
              state.tokenExpireAt = expireAt;
              state.isAuthenticated = true;
            });
          }
          setIsHydrated(true);
          return;
        } else {
          // Token expired - clear everything
          useAuthStore.getState().logout();
          setIsHydrated(true);
          return;
        }
      } else if (store.user && !sessionToken) {
        // If we have user but no token, logout
        useAuthStore.getState().logout();
        setIsHydrated(true);
        return;
      } else if (!sessionToken && !store.user) {
        // No token and no user - not authenticated, but hydration is complete
        setIsHydrated(true);
        return;
      }

      // If we have token but no user yet, wait for hydration to complete
      // This handles the case where Zustand persist is still loading user data
      if (sessionToken && !store.user) {
        // Token exists but user not loaded yet - wait for user data
        if (hydrationCheckAttempts < maxAttempts) {
          setTimeout(checkAndRestore, 100);
          return;
        } else {
          // Exhausted attempts - check localStorage directly one more time
          const localStorageData = localStorage.getItem(
            "enhanced-auth-storage"
          );
          if (localStorageData) {
            try {
              const parsed = JSON.parse(localStorageData);
              if (parsed.state?.user) {
                // User data exists in localStorage but not in store yet
                // Set it directly and authenticate
                useAuthStore.setState((state) => {
                  state.user = parsed.state.user;
                  state.branches = parsed.state.branches || [];
                  state.currentBranch = parsed.state.currentBranch || null;
                  state.academicYear = parsed.state.academicYear || null;
                  state.academicYears = parsed.state.academicYears || [];
                  state.token = sessionToken;
                  if (sessionExpires) {
                    state.tokenExpireAt = parseInt(sessionExpires);
                  }
                  state.isAuthenticated = true;
                });
                setIsHydrated(true);
                return;
              }
            } catch (e) {
              // Failed to parse localStorage data
            }
          }
          // No user data found after all attempts - clear token and logout
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("token_expires");
          useAuthStore.getState().logout();
          setIsHydrated(true);
          return;
        }
      }

      // If we have user but no token, wait a bit for token to be set
      if (store.user && !sessionToken) {
        if (hydrationCheckAttempts < maxAttempts) {
          setTimeout(checkAndRestore, 100);
          return;
        } else {
          // No token found after all attempts - logout
          useAuthStore.getState().logout();
          setIsHydrated(true);
          return;
        }
      }

      // If we reach here, something unexpected happened - complete hydration anyway
      setIsHydrated(true);
    };

    // Start checking after a small delay to allow Zustand to start hydration
    // Zustand persist hydration happens synchronously, but we give it a tick
    setTimeout(checkAndRestore, 50);

    return () => {
      mounted = false;
    };
  }, []);

  // If not hydrated yet, show loading state
  // This will be replaced by LazyLoadingWrapper once hydrated to prevent double loaders
  if (!isHydrated) {
    return null;
    // return (
    //   <div className="flex items-center justify-center h-screen">
    //     <div className="text-center">
    //       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    //       <p className="text-sm text-muted-foreground">Loading...</p>
    //     </div>
    //   </div>
    // );
  }

  if (!isAuthenticated) {
    return (
      <LazyLoadingWrapper>
        <Login />
      </LazyLoadingWrapper>
    );
  }

  return (
    <AuthenticatedLayout>
      <LazyLoadingWrapper>
        <Switch>
          {/* Dashboard - Role-specific */}
          <Route path="/" component={DashboardRouter} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/settings" component={SettingsPage} />
          {/* Role-guarded routes per PRD and Sidebar roles */}
          <ProtectedRoute
            path="/users"
            roles={["ADMIN", "INSTITUTE_ADMIN"]}
            component={UserManagement}
          />
          {/* <ProtectedRoute
            path="/institutes"
            roles={["ADMIN", "INSTITUTE_ADMIN"]}
            component={InstituteManagement}
          /> */}
          {/* <ProtectedRoute
            path="/branches"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"]}
            component={BranchesManagement}
          /> */}
          <ProtectedRoute
            path="/employees"
            roles={["ADMIN", "INSTITUTE_ADMIN"]}
            component={EmployeeManagement}
          />
          <ProtectedRoute
            path="/payroll"
            roles={["ADMIN", "INSTITUTE_ADMIN"]}
            component={PayrollManagement}
          />
          <ProtectedRoute
            path="/transport"
            roles={["ADMIN", "INSTITUTE_ADMIN"]}
            component={TransportManagement}
          />
          <ProtectedRoute
            path="/audit-log"
            roles={["ADMIN", "INSTITUTE_ADMIN"]}
            component={AuditLog}
          />

          {/* School */}
          <ProtectedRoute
            path="/school/academic"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"]}
            component={SchoolAcademicManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/school/reservations/new"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={SchoolReservationManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/school/admissions"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={SchoolAdmissionsManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/school/students"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"]}
            component={SchoolStudentsManagement}
          />
          <ProtectedRoute
            path="/school/attendance"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"]}
            component={SchoolAttendanceManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/school/marks"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"]}
            component={SchoolMarksManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/school/fees"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={SchoolFeesManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/school/financial-reports"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={SchoolReportsPage}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/school/announcements"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"]}
            component={AnnouncementsManagement}
          />

          {/* College */}
          <Route path="/college" />
          <ProtectedRoute
            path="/college/academic"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"]}
            component={CollegeAcademicManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/college/reservations/new"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={CollegeReservationManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/college/admissions"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={CollegeAdmissionsManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/college/classes"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"]}
            component={CollegeClassesManagement}
          />
          <ProtectedRoute
            path="/college/students"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"]}
            component={CollegeStudentsManagement}
          />
          <ProtectedRoute
            path="/college/attendance"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"]}
            component={CollegeAttendanceManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/college/marks"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"]}
            component={CollegeMarksManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/college/fees"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={CollegeFeesManagement}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/college/financial-reports"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"]}
            component={CollegeReportsPage}
            preventDirectAccess={true}
          />
          <ProtectedRoute
            path="/college/announcements"
            roles={["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"]}
            component={AnnouncementsManagement}
          />
          <Route component={NotFound} />
        </Switch>
      </LazyLoadingWrapper>
    </AuthenticatedLayout>
  );
}

type ProtectedRouteProps = {
  path: string;
  roles: UserRole[];
  component: React.ComponentType<any>;
  preventDirectAccess?: boolean; // Prevent ACCOUNTANT and ACADEMIC from accessing directly
};

function ProtectedRoute({
  path,
  roles,
  component: Component,
  preventDirectAccess = false,
}: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const hasAccess = user && roles.includes(user.role);

  const Guard = () => {
    const [location] = useLocation();

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

// Dashboard Router - Shows appropriate dashboard based on role
function DashboardRouter() {
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
      const { getRoleFromToken } = require("@/lib/utils/auth/jwt");
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

// Redirect component for blocked direct access
function RedirectToDashboard() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to dashboard
    setLocation("/");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Redirecting to Dashboard...</p>
        <p className="text-sm text-muted-foreground">
          Direct URL access is not allowed. Please use the navigation menu.
        </p>
      </div>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">
          You do not have access to this module.
        </p>
        <p className="text-sm text-muted-foreground">
          Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}

function App() {
  const { token, tokenExpireAt, user, logout, isAuthenticated } =
    useAuthStore();

  // Restore authentication state on mount (after hydration)
  useEffect(() => {
    // Check if we have token and user data but isAuthenticated is false
    // This handles the case where rehydration hasn't set isAuthenticated yet
    const sessionToken = sessionStorage.getItem("access_token");
    const sessionExpires = sessionStorage.getItem("token_expires");
    const hasUser = user !== null;

    if (sessionToken && sessionExpires && hasUser && !isAuthenticated) {
      const expireAt = parseInt(sessionExpires);
      const now = Date.now();

      if (now < expireAt) {
        // Token is valid, restore authentication
        useAuthStore.setState((state) => {
          state.token = sessionToken;
          state.tokenExpireAt = expireAt;
          state.isAuthenticated = true;
        });
      } else {
        // Token expired - logout will trigger Router to redirect to login
        logout();
      }
    } else if (!sessionToken && isAuthenticated) {
      // No token but marked as authenticated - fix this
      useAuthStore.setState((state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.tokenExpireAt = null;
      });
    }
  }, [user, isAuthenticated, logout]);

  // Proactive refresh scheduling (consolidated - removed redundant periodic check)
  useEffect(() => {
    if (token && tokenExpireAt) {
      AuthTokenTimers.scheduleProactiveRefresh();
    }
    return () => {
      AuthTokenTimers.clearProactiveRefresh();
    };
  }, [token, tokenExpireAt]);

  // Page Visibility API integration - pause refresh when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      AuthTokenTimers.setTabVisible(isVisible);
    };

    // Set initial visibility state
    AuthTokenTimers.setTabVisible(!document.hidden);

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Simple token expiration check (only for logout, refresh is handled proactively)
  useEffect(() => {
    if (!token || !tokenExpireAt) return;

    const checkTokenExpiration = () => {
      const now = Date.now();

      // Only check if token is already expired (proactive refresh should handle before expiry)
      if (now >= tokenExpireAt) {
        if (process.env.NODE_ENV === "development") {
          console.log("Token expired, logging out...");
        }
        logout();
        // Use soft navigation instead of hard redirect
        // Note: This will be handled by the Router component which checks isAuthenticated
        return;
      }
    };

    // Check every 5 minutes (reduced frequency, only for safety logout)
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, tokenExpireAt, logout]);

  // Preload components based on user role
  useEffect(() => {
    if (user?.role) {
      // Preload critical components immediately
      componentPreloader.preloadCritical();

      // Preload role-specific components in background
      componentPreloader.preloadByRole(user.role);
    }
  }, [user?.role]);

  return (
    <ProductionApp>
      <Router />
    </ProductionApp>
  );
}

export default App;
