import { Switch, Route, useLocation } from "wouter";
import React, { useEffect, Suspense, lazy } from "react";
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
import { ROLES, type UserRole } from "@/lib/constants";
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
        <main className="flex-1 overflow-auto">
          <div className="p-2">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuthStore();

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
    if (preventDirectAccess) {
      const isRestrictedRole = user?.role === ROLES.ACCOUNTANT || user?.role === ROLES.ACADEMIC;
      if (isRestrictedRole) {
        // Check if navigation came from sidebar using path-based check with timestamp
        // Get the stored navigation path and timestamp
        const storedNavData = sessionStorage.getItem('navigation_from_sidebar');
        let fromSidebar = false;
        
        if (storedNavData) {
          try {
            const { path: storedPath, timestamp } = JSON.parse(storedNavData);
            const currentTime = Date.now();
            const timeDiff = currentTime - timestamp;
            
            // Check if path matches and navigation was recent (within 2 seconds)
            // This handles timing issues between navigation and route check
            fromSidebar = storedPath === location && timeDiff < 2000;
            
            // Clear the stored data after successful navigation check
            if (fromSidebar) {
              // Clear immediately after confirming it's from sidebar
              sessionStorage.removeItem('navigation_from_sidebar');
            }
          } catch (e) {
            // If parsing fails, treat as not from sidebar
            sessionStorage.removeItem('navigation_from_sidebar');
          }
        }
        
        if (!fromSidebar) {
          // Direct URL access - redirect to dashboard
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
  const { token, tokenExpireAt, user } = useAuthStore();

  useEffect(() => {
    if (token && tokenExpireAt) {
      AuthTokenTimers.scheduleProactiveRefresh();
    }
    return () => {
      AuthTokenTimers.clearProactiveRefresh();
    };
  }, [token, tokenExpireAt]);

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
