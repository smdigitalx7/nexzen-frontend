import { lazy } from "react";
import type { UserRole } from "@/common/constants/auth/roles";

// Lazy-loaded General Components
export const Login = lazy(() => import("@/features/general/pages/Login"));
export const NotFound = lazy(
  () => import("@/features/general/pages/not-found")
);
export const ProfilePage = lazy(
  () => import("@/features/general/pages/ProfilePage")
);
export const SettingsPage = lazy(
  () => import("@/features/general/pages/SettingsPage")
);
export const UserManagement = lazy(
  () => import("@/features/general/pages/UserManagementPage")
);
export const EmployeeManagement = lazy(
  () => import("@/features/general/pages/EmployeeManagementPage")
);
export const PayrollManagement = lazy(
  () => import("@/features/general/pages/PayrollManagementPage")
);
export const SupportPage = lazy(
  () => import("@/features/general/pages/SupportPage")
);
export const TransportManagement = lazy(
  () => import("@/features/general/pages/TransportManagementPage")
);
export const AuditLog = lazy(() => import("@/features/general/pages/AuditLog"));
export const AnnouncementsManagement = lazy(
  () =>
    import(
      "@/features/general/components/Announcemnts/AnnouncementsManagement"
    )
);

// Lazy-loaded School Components
export const SchoolAcademicManagement = lazy(
  () => import("@/features/school/pages/SchoolAcademicPage")
);
export const SchoolReservationManagement = lazy(
  () => import("@/features/school/pages/SchoolReservationPage")
);
export const SchoolAdmissionsManagement = lazy(
  () => import("@/features/school/pages/SchoolAdmissionsPage")
);
export const SchoolAdmissionDetails = lazy(
  () => import("@/features/school/components/admissions/AdmissionDetailsPage")
);
export const SchoolStudentsManagement = lazy(
  () => import("@/features/school/pages/SchoolStudentsPage")
);
export const SchoolAttendanceManagement = lazy(
  () => import("@/features/school/pages/SchoolAttendancePage")
);
export const SchoolFeesManagement = lazy(
  () => import("@/features/school/pages/SchoolFeesPage")
);
export const SchoolMarksManagement = lazy(
  () => import("@/features/school/pages/SchoolMarksPage")
);
export const SchoolReportsPage = lazy(
  () => import("@/features/school/pages/SchoolReportsPage")
);

// Lazy-loaded College Components
export const CollegeAcademicManagement = lazy(
  () => import("@/features/college/pages/CollegeAcademicPage")
);
export const CollegeReservationManagement = lazy(
  () => import("@/features/college/pages/CollegeReservationPage")
);
export const CollegeAdmissionsManagement = lazy(
  () => import("@/features/college/pages/CollegeAdmissionsPage")
);
export const CollegeAdmissionDetails = lazy(
  () => import("@/features/college/components/admissions/AdmissionDetailsPage")
);
export const CollegeClassesManagement = lazy(
  () => import("@/features/college/pages/CollegeClassesPage")
);
export const CollegeStudentsManagement = lazy(
  () => import("@/features/college/pages/CollegeStudentsPage")
);
export const CollegeAttendanceManagement = lazy(
  () => import("@/features/college/pages/CollegeAttendancePage")
);
export const CollegeMarksManagement = lazy(
  () => import("@/features/college/pages/CollegeMarksPage")
);
export const CollegeFeesManagement = lazy(
  () => import("@/features/college/pages/CollegeFeesPage")
);
export const CollegeReportsPage = lazy(
  () => import("@/features/college/pages/CollegeReportsPage")
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
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT", "ACADEMIC"],
    component: EmployeeManagement,
  },
  {
    path: "/payroll",
    roles: ["ADMIN", "INSTITUTE_ADMIN"],
    component: PayrollManagement,
  },
  {
    path: "/transport",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: TransportManagement,
  },
  {
    path: "/audit-log",
    roles: ["ADMIN", "INSTITUTE_ADMIN"],
    component: AuditLog,
  },
  {
    path: "/support",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT", "ACADEMIC"],
    component: SupportPage,
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
    path: "/school/admissions/:id",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    // We can lazily load the page directly or create a wrapper. 
    // Since RouteConfig expects a component, and we exported the component default from the file.
    // However, the component is likely not lazy loaded yet.
    // I need to add a lazy load entry at the top, or just use react.lazy here inline if allowed, 
    // but the pattern is to define it at the top. 
    // Let's assume I will add `SchoolAdmissionDetails` at the top and use it here.
    component: SchoolAdmissionDetails,
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
    path: "/college/admissions/:id",
    roles: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
    component: CollegeAdmissionDetails,
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

