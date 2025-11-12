import { ROLES } from "@/lib/constants";
import type { AuthUser } from "./types";
import { canView } from "@/lib/permissions";

/**
 * Permission mapping constants
 * Extracted from authStore.ts for better organization
 * 
 * @deprecated Consider using the new global permissions system from @/lib/permissions
 * This is kept for backward compatibility
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

/**
 * Module access permissions
 * 
 * @deprecated Consider using the new global permissions system from @/lib/permissions
 * This is kept for backward compatibility
 */
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
 * 
 * Note: For new code, prefer using the global permissions system from @/lib/permissions
 * These functions are kept for backward compatibility
 */

/**
 * Check if user is an admin
 */
export const checkIsAdmin = (user: AuthUser | null): boolean => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;
};

/**
 * Check if user has full access
 */
export const checkIsFullAccess = (user: AuthUser | null): boolean => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;
};

/**
 * Check if user can access a module
 * 
 * @deprecated Consider using canView() from @/lib/permissions instead
 */
export const checkCanAccessModule = (
  user: AuthUser | null,
  module: string
): boolean => {
  if (!user) return false;

  // Try new permissions system first
  if (canView(user, module)) {
    return true;
  }

  // Fallback to old system
  const moduleRoles = MODULE_PERMISSIONS[module];
  if (!moduleRoles) return false;

  return moduleRoles.includes("*") || moduleRoles.includes(user.role);
};

/**
 * Check if user has a specific permission
 * 
 * @deprecated Consider using action-specific functions from @/lib/permissions instead
 */
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

