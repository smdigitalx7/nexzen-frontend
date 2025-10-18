import { Switch, Route, useLocation } from "wouter";
import React, { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header, Sidebar } from "@/components/layout";
import { useAuthStore } from "@/store/authStore";
import { useNavigationStore } from "@/store/navigationStore";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AuthTokenTimers } from "@/lib/api";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { LazyLoadingWrapper } from "@/components/shared/LazyLoadingWrapper";
import { componentPreloader } from "@/lib/utils/preloader";
import ProductionApp from "@/components/shared/ProductionApp";
import { config } from "@/lib/config/production";

// Lazy-loaded General Components
const Login = lazy(() => import("./components/pages/general/Login"));
const NotFound = lazy(() => import("./components/pages/general/not-found"));
const Dashboard = lazy(() => import("./components/pages/general/Dashboard"));
const UserManagement = lazy(() => import("./components/pages/general/UserManagementPage"));
const EmployeeManagement = lazy(() => import("./components/pages/general/EmployeeManagementPage"));
const PayrollManagement = lazy(() => import("./components/pages/general/PayrollManagementPage"));
const TransportManagement = lazy(() => import("./components/pages/general/TransportManagementPage"));
const AuditLog = lazy(() => import("./components/pages/general/AuditLog"));
const AnnouncementsManagement = lazy(() => import("./components/features/general/Announcemnts/AnnouncementsManagement"));

// Lazy-loaded School Components
const SchoolAcademicManagement = lazy(() => import("@/components/pages/school/SchoolAcademicPage"));
const SchoolReservationManagement = lazy(() => import("@/components/pages/school/SchoolReservationPage"));
const SchoolStudentsManagement = lazy(() => import("./components/pages/school/SchoolStudentsPage"));
const SchoolAttendanceManagement = lazy(() => import("./components/pages/school/SchoolAttendancePage"));
const SchoolFeesManagement = lazy(() => import("./components/pages/school/SchoolFeesPage"));
const SchoolMarksManagement = lazy(() => import("./components/pages/school/SchoolMarksPage"));
const SchoolReportsPage = lazy(() => import("./components/pages/school/SchoolReportsPage"));

// Lazy-loaded College Components
const CollegeAcademicManagement = lazy(() => import("@/components/pages/college/CollegeAcademicPage"));
const CollegeReservationManagement = lazy(() => import("@/components/pages/college/CollegeReservationPage"));
const CollegeClassesManagement = lazy(() => import("@/components/pages/college/CollegeClassesPage"));
const CollegeStudentsManagement = lazy(() => import("@/components/pages/college/CollegeStudentsPage"));
const CollegeAttendanceManagement = lazy(() => import("@/components/pages/college/CollegeAttendancePage"));
const CollegeMarksManagement = lazy(() => import("@/components/pages/college/CollegeMarksPage"));
const CollegeFeesManagement = lazy(() => import("@/components/pages/college/CollegeFeesPage"));
const CollegeReportsPage = lazy(() => import("./components/pages/college/CollegeReportsPage"));

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useNavigationStore();
  const [location] = useLocation();

  const segments = location.split("/").filter(Boolean);

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
          <div className="px-6 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {segments.length > 0 && <BreadcrumbSeparator />}
                {segments.map((seg, idx) => {
                  const href = "/" + segments.slice(0, idx + 1).join("/");
                  const label = seg
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const isLast = idx === segments.length - 1;
                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator key={`${href}-sep`} />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="p-6">{children}</div>
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
          {/* General */}
          <Route path="/" component={Dashboard} />
          {/* Role-guarded routes per PRD and Sidebar roles */}
          <ProtectedRoute
            path="/users"
            roles={["institute_admin"]}
            component={UserManagement}
          />
          {/* <ProtectedRoute
            path="/institutes"
            roles={["institute_admin"]}
            component={InstituteManagement}
          /> */}
          {/* <ProtectedRoute
            path="/branches"
            roles={["institute_admin", "academic", "accountant"]}
            component={BranchesManagement}
          /> */}
          <ProtectedRoute
            path="/employees"
            roles={["institute_admin"]}
            component={EmployeeManagement}
          />
          <ProtectedRoute
            path="/payroll"
            roles={["institute_admin", "accountant"]}
            component={PayrollManagement}
          />
          <ProtectedRoute
            path="/transport"
            roles={["institute_admin"]}
            component={TransportManagement}
          />
          <ProtectedRoute
            path="/audit-log"
            roles={["institute_admin"]}
            component={AuditLog}
          />  
          
          {/* School */}
          <ProtectedRoute
            path="/school/academic"
            roles={["institute_admin", "academic"]}
            component={SchoolAcademicManagement}
          />
          <ProtectedRoute
            path="/school/reservations/new"
            roles={["institute_admin", "accountant"]}
            component={SchoolReservationManagement}
          />
          <ProtectedRoute
            path="/school/students"
            roles={["institute_admin", "academic"]}
            component={SchoolStudentsManagement}
          />
          <ProtectedRoute
            path="/school/attendance"
            roles={["institute_admin", "academic"]}
            component={SchoolAttendanceManagement}
          />
          <ProtectedRoute
            path="/school/marks"
            roles={["institute_admin", "academic"]}
            component={SchoolMarksManagement}
          />
          <ProtectedRoute
            path="/school/fees"
            roles={["institute_admin", "accountant"]}
            component={SchoolFeesManagement}
          />
           <ProtectedRoute
            path="/school/financial-reports"
            roles={["institute_admin", "accountant"]}
            component={SchoolReportsPage}
          />           
          <ProtectedRoute
            path="/school/announcements"
            roles={["institute_admin", "academic"]}
            component={AnnouncementsManagement}
          />

          {/* College */}
          <Route path="/college" />
          <ProtectedRoute
            path="/college/academic"
            roles={["institute_admin", "academic"]}
            component={CollegeAcademicManagement}
          />
          <ProtectedRoute
            path="/college/reservations/new"
            roles={["institute_admin", "accountant"]}
            component={CollegeReservationManagement}
          />
          <ProtectedRoute
            path="/college/classes"
            roles={["institute_admin", "academic"]}
            component={CollegeClassesManagement}
          />
          <ProtectedRoute
            path="/college/students"
            roles={["institute_admin", "academic"]}
            component={CollegeStudentsManagement}
          />
          <ProtectedRoute
            path="/college/attendance"
            roles={["institute_admin", "academic"]}
            component={CollegeAttendanceManagement}
          />
          <ProtectedRoute
            path="/college/marks"
            roles={["institute_admin", "academic"]}
            component={CollegeMarksManagement}
          />
          <ProtectedRoute
            path="/college/fees"
            roles={["institute_admin", "accountant"]}
            component={CollegeFeesManagement}
          />
          <ProtectedRoute
            path="/college/financial-reports"
            roles={["institute_admin", "accountant"]}
            component={CollegeReportsPage}
          />
          <ProtectedRoute
            path="/college/announcements"
            roles={["institute_admin", "academic"]}
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
  roles: Array<"institute_admin" | "academic" | "accountant">;
  component: React.ComponentType<any>;
};

function ProtectedRoute({
  path,
  roles,
  component: Component,
}: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const [location] = useLocation();
  const hasAccess = user && roles.includes(user.role);
  const Guard = () => (hasAccess ? <Component /> : <NotAuthorized />);
  return <Route path={path} component={Guard} />;
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
  const { setIsMobile } = useNavigationStore();
  const { token, tokenExpireAt, user } = useAuthStore();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [setIsMobile]);

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
