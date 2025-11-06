/**
 * Extract primary role from roles array
 * Priority: ADMIN > INSTITUTE_ADMIN > ACCOUNTANT > ACADEMIC > first role
 */
export function extractPrimaryRole(roles: string[]): string | null {
  if (!roles || roles.length === 0) return null;
  
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('INSTITUTE_ADMIN')) return 'INSTITUTE_ADMIN';
  if (roles.includes('ACCOUNTANT')) return 'ACCOUNTANT';
  if (roles.includes('ACADEMIC')) return 'ACADEMIC';
  
  return roles[0];
}




