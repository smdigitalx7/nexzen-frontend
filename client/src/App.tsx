import { Switch, Route, useLocation } from "wouter";
import React, { useEffect, Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header, Sidebar } from "@/components/layout";
import { useAuthStore } from "@/store/authStore";
import { useNavigationStore } from "@/store/navigationStore";
import { cn } from "@/lib/utils";
import { AuthTokenTimers } from "@/lib/api";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { LazyLoadingWrapper } from "@/components/shared/LazyLoadingWrapper";
import { componentPreloader } from "@/lib/utils/performance/preloader";
import ProductionApp from "@/components/shared/ProductionApp";
import { ROLES, type UserRole } from "@/lib/constants/auth/roles";
import { config } from "@/lib/config/production";

// Lazy-loaded General Components
const Login = lazy(() => import("./components/pages/general/Login"));
const NotFound = lazy(() => import("./components/pages/general/not-found"));
const AdminDashboard = lazy(() => import("./components/pages/general/AdminDashboard"));
const AccountantDashboard = lazy(() => import("./components/pages/general/AccountantDashboard"));
const AcademicDashboard = lazy(() => import("./components/pages/general/AcademicDashboard"));
const ProfilePage = lazy(() => import("./components/pages/general/ProfilePage"));
const SettingsPage = lazy(() => import("./components/pages/general/SettingsPage"));
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
    
    const checkAndRestore = () => {
      if (!mounted) return;
      
      const sessionToken = sessionStorage.getItem('access_token');
      const sessionExpires = sessionStorage.getItem('token_expires');
      const store = useAuthStore.getState();
      
      // CRITICAL CHECK: If we have token + user, we MUST be authenticated
      // This is a backup check in case onRehydrateStorage didn't run
      if (sessionToken && sessionExpires && store.user) {
        const expireAt = parseInt(sessionExpires);
        
        if (Date.now() < expireAt) {
          // Valid token - ensure authenticated state is set
          if (!store.isAuthenticated || store.token !== sessionToken) {
            useAuthStore.setState((state) => {
              state.token = sessionToken;
              state.tokenExpireAt = expireAt;
              state.isAuthenticated = true;
            });
          }
        } else {
          // Token expired
          useAuthStore.getState().logout();
        }
      } else if (store.user && !sessionToken) {
        // If we have user but no token, logout
        useAuthStore.getState().logout();
      }
      
      setIsHydrated(true);
    };

    // Check multiple times to catch hydration at different stages
    // onRehydrateStorage should handle this, but this is a safety net
    const timer1 = setTimeout(checkAndRestore, 100);
    const timer2 = setTimeout(checkAndRestore, 300);
    const timer3 = setTimeout(checkAndRestore, 500);
    
    return () => {
      mounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Also watch for user changes to ensure auth state is correct
  useEffect(() => {
    if (!isHydrated && user) {
      const sessionToken = sessionStorage.getItem('access_token');
      const sessionExpires = sessionStorage.getItem('token_expires');
      const store = useAuthStore.getState();
      
      // If we have both token and user, ensure authenticated
      if (sessionToken && sessionExpires) {
        const expireAt = parseInt(sessionExpires);
        if (Date.now() < expireAt) {
          if (!store.isAuthenticated || store.token !== sessionToken) {
            useAuthStore.setState((state) => {
              state.token = sessionToken;
              state.tokenExpireAt = expireAt;
              state.isAuthenticated = true;
            });
          }
          setIsHydrated(true);
        } else {
          // Expired
          useAuthStore.getState().logout();
          setIsHydrated(true);
        }
      } else if (!sessionToken) {
        // No token
        useAuthStore.getState().logout();
        setIsHydrated(true);
      } else {
        setIsHydrated(true);
      }
    } else if (!user && !isHydrated) {
      // No user - set hydrated after a short delay
      setTimeout(() => setIsHydrated(true), 200);
    }
  }, [user, isHydrated]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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
      const isRestrictedRole = user?.role === ROLES.ACCOUNTANT || user?.role === ROLES.ACADEMIC;
      if (isRestrictedRole) {
        // Check if navigation came from sidebar using path-based check with timestamp
        const storedNavData = sessionStorage.getItem('navigation_from_sidebar');
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
              sessionStorage.removeItem('navigation_from_sidebar');
            } else if (timeDiff > 5000) {
              // Clear stale data
              sessionStorage.removeItem('navigation_from_sidebar');
            }
          } catch (e) {
            sessionStorage.removeItem('navigation_from_sidebar');
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
  const { user } = useAuthStore();
  
  if (user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN) {
    return <AdminDashboard />;
  }
  if (user?.role === ROLES.ACCOUNTANT) {
    return <AccountantDashboard />;
  }
  if (user?.role === ROLES.ACADEMIC) {
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
  const { token, tokenExpireAt, user, logout, isAuthenticated } = useAuthStore();

  // Restore authentication state on mount (after hydration)
  useEffect(() => {
    // Check if we have token and user data but isAuthenticated is false
    // This handles the case where rehydration hasn't set isAuthenticated yet
    const sessionToken = sessionStorage.getItem('access_token');
    const sessionExpires = sessionStorage.getItem('token_expires');
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
        // Token expired
        logout();
        window.location.href = "/login";
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

  useEffect(() => {
    if (token && tokenExpireAt) {
      AuthTokenTimers.scheduleProactiveRefresh();
    }
    return () => {
      AuthTokenTimers.clearProactiveRefresh();
    };
  }, [token, tokenExpireAt]);

  // Auto-logout on token expiration - Check every 15 minutes (900000ms)
  useEffect(() => {
    if (!token || !tokenExpireAt) return;

    const checkTokenExpiration = () => {
      const now = Date.now();
      
      // Check if token is expired
      if (now >= tokenExpireAt) {
        if (process.env.NODE_ENV === 'development') {
          console.log("Token expired, logging out...");
        }
        logout();
        // Force redirect to login
        window.location.href = "/login";
        return;
      }
      
      // Check if token will expire in next 1 minute (buffer)
      const oneMinuteFromNow = now + 60000;
      if (oneMinuteFromNow >= tokenExpireAt) {
        // Try to refresh token first
        const { refreshTokenAsync } = useAuthStore.getState();
        refreshTokenAsync().then((refreshed) => {
          if (!refreshed) {
            if (process.env.NODE_ENV === 'development') {
              console.log("Token refresh failed, logging out...");
            }
            logout();
            window.location.href = "/login";
          }
        });
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every 15 minutes (900000ms = 15 * 60 * 1000)
    const interval = setInterval(checkTokenExpiration, 15 * 60 * 1000);

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
