import { ROLES } from "@/lib/constants";
import type { AuthUser } from "./types";

/**
 * Permission mapping constants
 * Extracted from authStore.ts for better organization
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["*"], // All permissions
  INSTITUTE_ADMIN: ["*"], // All permissions
  ACADEMIC: ["students", "attendance", "marks", "announcements"],
  ACCOUNTANT: [
    "reservations",
    "admissions",
    "students",
    "fees",
    "financial_reports",
    "announcements",
  ],
};

export const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: ["*"],
  students: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
  attendance: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
  marks: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
  academic: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
  reservations: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  admissions: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  fees: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  financial_reports: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  announcements: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
  users: ["ADMIN", "INSTITUTE_ADMIN"],
  employees: ["ADMIN", "INSTITUTE_ADMIN"],
  payroll: ["ADMIN", "INSTITUTE_ADMIN"],
  transport: ["ADMIN", "INSTITUTE_ADMIN"],
  audit_log: ["ADMIN", "INSTITUTE_ADMIN"],
};

/**
 * Permission checking helper functions
 */
export const checkIsAdmin = (user: AuthUser | null): boolean => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;
};

export const checkIsFullAccess = (user: AuthUser | null): boolean => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;
};

export const checkCanAccessModule = (
  user: AuthUser | null,
  module: string
): boolean => {
  if (!user) return false;

  const moduleRoles = MODULE_PERMISSIONS[module];
  if (!moduleRoles) return false;

  return moduleRoles.includes("*") || moduleRoles.includes(user.role);
};

export const checkHasPermission = (
  user: AuthUser | null,
  permission: string
): boolean => {
  if (!user) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role];
  return (
    rolePermissions.includes("*") || rolePermissions.includes(permission)
  );
};

