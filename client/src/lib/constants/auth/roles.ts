/**
 * Role constants for RBAC
 * Centralized role definitions to avoid duplication
 */
export const ROLES = {
  ADMIN: "ADMIN",
  INSTITUTE_ADMIN: "INSTITUTE_ADMIN",
  ACCOUNTANT: "ACCOUNTANT",
  ACADEMIC: "ACADEMIC",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Roles that have full access (admin roles)
 */
export const FULL_ACCESS_ROLES = [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN] as const;

/**
 * All valid roles array
 */
export const VALID_ROLES = Object.values(ROLES);

/**
 * Check if a role has full access
 */
export function hasFullAccess(role: string | null | undefined): boolean {
  if (!role) return false;
  return FULL_ACCESS_ROLES.includes(role as any);
}

/**
 * Normalize and validate a role string
 * Returns the role if valid, null otherwise
 */
export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  
  const upperRole = role.toUpperCase().trim();
  
  // Handle variations of role names
  const roleMap: Record<string, UserRole> = {
    'ADMIN': ROLES.ADMIN,
    'INSTITUTE_ADMIN': ROLES.INSTITUTE_ADMIN,
    'INSTITUTEADMIN': ROLES.INSTITUTE_ADMIN, // Handle without underscore
    'ACCOUNTANT': ROLES.ACCOUNTANT,
    'ACADEMIC': ROLES.ACADEMIC,
  };
  
  // Check mapped roles first
  if (roleMap[upperRole]) {
    return roleMap[upperRole];
  }
  
  // Check if it's a valid role
  if (VALID_ROLES.includes(upperRole as UserRole)) {
    return upperRole as UserRole;
  }
  
  // Debug log if role not found
  if (import.meta.env.DEV) {
    console.warn(`⚠️ Unknown role: "${role}" (normalized: "${upperRole}")`);
  }
  
  return null;
}

