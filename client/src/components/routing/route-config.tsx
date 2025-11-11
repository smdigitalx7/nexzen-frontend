import { lazy } from "react";
import type { UserRole } from "@/lib/constants/auth/roles";

// Lazy-loaded General Components
export const Login = lazy(() => import("@/components/pages/general/Login"));
export const NotFound = lazy(
  () => import("@/components/pages/general/not-found")
);
export const ProfilePage = lazy(
  () => import("@/components/pages/general/ProfilePage")
);
export const SettingsPage = lazy(
  () => import("@/components/pages/general/SettingsPage")
);
export const UserManagement = lazy(
  () => import("@/components/pages/general/UserManagementPage")
);
export const EmployeeManagement = lazy(
  () => import("@/components/pages/general/EmployeeManagementPage")
);
export const PayrollManagement = lazy(
  () => import("@/components/pages/general/PayrollManagementPage")
);
export const TransportManagement = lazy(
  () => import("@/components/pages/general/TransportManagementPage")
);
export const AuditLog = lazy(() => import("@/components/pages/general/AuditLog"));
export const AnnouncementsManagement = lazy(
  () =>
    import(
      "@/components/features/general/Announcemnts/AnnouncementsManagement"
    )
);

// Lazy-loaded School Components
export const SchoolAcademicManagement = lazy(
  () => import("@/components/pages/school/SchoolAcademicPage")
);
export const SchoolReservationManagement = lazy(
  () => import("@/components/pages/school/SchoolReservationPage")
);
export const SchoolAdmissionsManagement = lazy(
  () => import("@/components/pages/school/SchoolAdmissionsPage")
);
export const SchoolStudentsManagement = lazy(
  () => import("@/components/pages/school/SchoolStudentsPage")
);
export const SchoolAttendanceManagement = lazy(
  () => import("@/components/pages/school/SchoolAttendancePage")
);
export const SchoolFeesManagement = lazy(
  () => import("@/components/pages/school/SchoolFeesPage")
);
export const SchoolMarksManagement = lazy(
  () => import("@/components/pages/school/SchoolMarksPage")
);
export const SchoolReportsPage = lazy(
  () => import("@/components/pages/school/SchoolReportsPage")
);

// Lazy-loaded College Components
export const CollegeAcademicManagement = lazy(
  () => import("@/components/pages/college/CollegeAcademicPage")
);
export const CollegeReservationManagement = lazy(
  () => import("@/components/pages/college/CollegeReservationPage")
);
export const CollegeAdmissionsManagement = lazy(
  () => import("@/components/pages/college/CollegeAdmissionsPage")
);
export const CollegeClassesManagement = lazy(
  () => import("@/components/pages/college/CollegeClassesPage")
);
export const CollegeStudentsManagement = lazy(
  () => import("@/components/pages/college/CollegeStudentsPage")
);
export const CollegeAttendanceManagement = lazy(
  () => import("@/components/pages/college/CollegeAttendancePage")
);
export const CollegeMarksManagement = lazy(
  () => import("@/components/pages/college/CollegeMarksPage")
);
export const CollegeFeesManagement = lazy(
  () => import("@/components/pages/college/CollegeFeesPage")
);
export const CollegeReportsPage = lazy(
  () => import("@/components/pages/college/CollegeReportsPage")
);

/**
 * Route configuration type
 */
export interface RouteConfig {
  path: string;
  roles: UserRole[];
  component: React.ComponentType<any>;
  preventDirectAccess?: boolean;
}

/**
 * Route definitions for the application
 */
export const routes: RouteConfig[] = [
  // General routes
  {
    path: "/users",
    roles: ["ADMIN", "INSTITUTE_ADMIN"],
    component: UserManagement,
  },
  {
    path: "/employees",
    roles: ["ADMIN", "INSTITUTE_ADMIN"],
    component: EmployeeManagement,
  },
  {
    path: "/payroll",
    roles: ["ADMIN", "INSTITUTE_ADMIN"],
    component: PayrollManagement,
  },
  {
    path: "/transport",
    roles: ["ADMIN", "INSTITUTE_ADMIN"],
    component: TransportManagement,
  },
  {
    path: "/audit-log",
    roles: ["ADMIN", "INSTITUTE_ADMIN"],
    component: AuditLog,
  },
  // School routes
  {
    path: "/school/academic",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
    component: SchoolAcademicManagement,
    preventDirectAccess: true,
  },
  {
    path: "/school/reservations/new",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: SchoolReservationManagement,
    preventDirectAccess: true,
  },
  {
    path: "/school/admissions",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: SchoolAdmissionsManagement,
    preventDirectAccess: true,
  },
  {
    path: "/school/students",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
    component: SchoolStudentsManagement,
  },
  {
    path: "/school/attendance",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
    component: SchoolAttendanceManagement,
    preventDirectAccess: true,
  },
  {
    path: "/school/marks",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
    component: SchoolMarksManagement,
    preventDirectAccess: true,
  },
  {
    path: "/school/fees",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: SchoolFeesManagement,
    preventDirectAccess: true,
  },
  {
    path: "/school/financial-reports",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: SchoolReportsPage,
    preventDirectAccess: true,
  },
  {
    path: "/school/announcements",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
    component: AnnouncementsManagement,
  },
  // College routes
  {
    path: "/college/academic",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
    component: CollegeAcademicManagement,
    preventDirectAccess: true,
  },
  {
    path: "/college/reservations/new",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: CollegeReservationManagement,
    preventDirectAccess: true,
  },
  {
    path: "/college/admissions",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: CollegeAdmissionsManagement,
    preventDirectAccess: true,
  },
  {
    path: "/college/classes",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
    component: CollegeClassesManagement,
  },
  {
    path: "/college/students",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
    component: CollegeStudentsManagement,
  },
  {
    path: "/college/attendance",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
    component: CollegeAttendanceManagement,
    preventDirectAccess: true,
  },
  {
    path: "/college/marks",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
    component: CollegeMarksManagement,
    preventDirectAccess: true,
  },
  {
    path: "/college/fees",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: CollegeFeesManagement,
    preventDirectAccess: true,
  },
  {
    path: "/college/financial-reports",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: CollegeReportsPage,
    preventDirectAccess: true,
  },
  {
    path: "/college/announcements",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
    component: AnnouncementsManagement,
  },
];

