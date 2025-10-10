import { Switch, Route, useLocation } from "wouter";
import React, { useEffect } from "react";
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

// General
import Login from "./components/pages/general/Login";
import NotFound from "./components/pages/general/not-found";
import Dashboard from "./components/pages/general/Dashboard";
import UserManagement from "./components/pages/general/UserManagementPage";
// import { BranchesManagement, InstituteManagement} from "@/components/features/general/system-management";
import EmployeeManagement from "./components/pages/general/EmployeeManagementPage";
import PayrollManagement from "./components/pages/general/PayrollManagementPage";
import TransportManagement from "./components/pages/general/TransportManagementPage";
import FinancialReports from "./components/pages/general/FinancialReportsPage";
import AuditLog from "./components/pages/general/AuditLog";
import AnnouncementsManagement from "./components/features/general/Announcemnts/AnnouncementsManagement";

// School
import SchoolAcademicManagement from "@/components/pages/school/SchoolAcademicPage";
import SchoolReservationManagement from "@/components/pages/school/SchoolReservationPage";
import SchoolClassesManagement from "./components/pages/school/SchoolClassesPage";
import SchoolStudentsManagement from "./components/pages/school/SchoolStudentsPage";
import SchoolAttendanceManagement from "./components/pages/school/SchoolAttendancePage";
import SchoolFeesManagement from "./components/pages/school/SchoolFeesPage";
import SchoolMarksManagement from "./components/pages/school/SchoolMarksPage";

// College
import CollegeAcademicManagement from "@/components/pages/college/CollegeAcademicPage";
import CollegeReservationManagement from "@/components/pages/college/CollegeReservationPage";
import CollegeClassesManagement from "@/components/pages/college/CollegeClassesPage";
import CollegeStudentsManagement from "@/components/pages/college/CollegeStudentsPage";
import CollegeAttendanceManagement from "@/components/pages/college/CollegeAttendancePage";
import CollegeMarksManagement from "@/components/pages/college/CollegeMarksPage";
import CollegeFeesManagement from "@/components/pages/college/CollegeFeesPage";

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
    return <Login />;
  }

  return (
    <AuthenticatedLayout>
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
          path="/financial-reports"
          roles={["institute_admin", "accountant"]}
          component={FinancialReports}
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
          path="/school/classes"
          roles={["institute_admin", "academic"]}
          component={SchoolClassesManagement}
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
          path="/college/announcements"
          roles={["institute_admin", "academic"]}
          component={AnnouncementsManagement}
        />
        <Route component={NotFound} />
      </Switch>
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
  const { token, tokenExpireAt } = useAuthStore();

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
