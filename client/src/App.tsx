import { Switch, Route, useLocation } from "wouter";
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Login from "@/pages/Login";
import UserManagement from "@/components/modules/UserManagement";
import StudentManagement from "@/components/modules/StudentManagement";
import EmployeeManagement from "@/components/modules/EmployeeManagement";
import ClassesManagement from "@/components/modules/ClassesManagement";
import AttendanceManagement from "@/components/modules/AttendanceManagement";
import MarksManagement from "@/components/modules/MarksManagement";
import FeesManagement from "@/components/modules/FeesManagement";
import TransportManagement from "@/components/modules/TransportManagement";
import PayrollManagement from "@/components/modules/PayrollManagement";
import InstituteManagement from "@/components/modules/InstituteManagement";
import AnnouncementsManagement from "@/components/modules/AnnouncementsManagement";
import CollegeManagement from "@/components/modules/CollegeManagement";
import AcademicManagement from "@/components/modules/AcademicManagement";
import FinancialReports from "@/components/modules/FinancialReports";
import AuditLog from "@/components/modules/AuditLog";
import NotFound from "@/pages/not-found";
import ReservationNew from "@/pages/ReservationNew";
import AdmissionNew from "@/pages/AdmissionNew";
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
import BranchesManagement from "@/components/modules/BranchesManagement";

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
        <Route path="/" component={Dashboard} />
        {/* Role-guarded routes per PRD and Sidebar roles */}
        <ProtectedRoute
          path="/institutes"
          roles={["institute_admin"]}
          component={InstituteManagement}
        />
        <ProtectedRoute
          path="/branches"
          roles={["institute_admin", "academic", "accountant", "admin" as any]}
          component={BranchesManagement}
        />
        <ProtectedRoute
          path="/reservations/new"
          roles={["institute_admin", "accountant"]}
          component={ReservationNew}
        />
        <ProtectedRoute
          path="/admissions/new"
          roles={["institute_admin", "accountant"]}
          component={AdmissionNew}
        />
        <Route path="/users" component={UserManagement} />
        <Route path="/students" component={StudentManagement} />
        <Route path="/employees" component={EmployeeManagement} />
        <Route path="/classes" component={ClassesManagement} />
        <Route path="/attendance" component={AttendanceManagement} />
        <Route path="/marks" component={MarksManagement} />
        <ProtectedRoute
          path="/fees"
          roles={["institute_admin", "accountant"]}
          component={FeesManagement}
        />
        <Route path="/transport" component={TransportManagement} />
        <ProtectedRoute
          path="/payroll"
          roles={["institute_admin", "accountant"]}
          component={PayrollManagement}
        />
        <ProtectedRoute
          path="/announcements"
          roles={["institute_admin", "academic"]}
          component={AnnouncementsManagement}
        />
        <Route path="/college" component={CollegeManagement} />
        <Route path="/academic" component={AcademicManagement} />
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
