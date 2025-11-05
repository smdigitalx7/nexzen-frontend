/**
 * JWT Token Payload Structure (as per backend)
 */
export interface JWTPayload {
  user_id: number;
  institute_id: number;
  is_institute_admin: boolean;
  current_branch_id: number;
  current_branch: "SCHOOL" | "COLLEGE";
  branch_name: string;
  roles: Array<{
    role: string;
    branch_id: number;
  }>;
  academic_year_id?: number;
  exp: number;
  token_type: "access" | "refresh";
}

/**
 * Decode JWT token and extract payload
 * JWT format: header.payload.signature
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Invalid JWT token format');
      }
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode
    // Replace URL-safe characters and add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    try {
      const decoded = atob(padded);
      return JSON.parse(decoded) as JWTPayload;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error decoding JWT payload:', error);
      }
      return null;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error decoding JWT token:', error);
    }
    return null;
  }
}

/**
 * Extract role from JWT token payload based on current branch
 * The JWT contains a roles array with objects: [{ role: "ADMIN", branch_id: 1 }, ...]
 * We need to find the role for the current branch_id
 */
export function getRoleFromToken(
  token: string,
  currentBranchId?: number
): string | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  // If roles array exists, extract role for current branch
  if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
    // Use current_branch_id from token if branch_id not provided
    const branchId = currentBranchId ?? payload.current_branch_id;
    
    // Find roles for the current branch (user can have multiple roles per branch)
    const branchRoles = payload.roles
      .filter((r) => r.branch_id === branchId)
      .map((r) => r.role.toUpperCase());

    if (branchRoles.length > 0) {
      // Priority: ADMIN > INSTITUTE_ADMIN > ACCOUNTANT > ACADEMIC
      if (branchRoles.includes('ADMIN')) return 'ADMIN';
      if (branchRoles.includes('INSTITUTE_ADMIN')) return 'INSTITUTE_ADMIN';
      if (branchRoles.includes('ACCOUNTANT')) return 'ACCOUNTANT';
      if (branchRoles.includes('ACADEMIC')) return 'ACADEMIC';
      
      // Return first role if no priority match
      return branchRoles[0];
    }
  }

  // Fallback: Check is_institute_admin flag
  if (payload.is_institute_admin) {
    return 'INSTITUTE_ADMIN';
  }

  // Final fallback: Check if any roles exist at all
  if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
    // Return the first role found (user might have switched branches)
    const firstRole = payload.roles[0]?.role;
    if (firstRole) {
      return firstRole.toUpperCase();
    }
  }

  return null;
}

/**
 * Get all roles for a specific branch from JWT token
 */
export function getAllRolesFromToken(
  token: string,
  branchId?: number
): string[] {
  const payload = decodeJWT(token);
  if (!payload || !payload.roles) return [];

  const targetBranchId = branchId ?? payload.current_branch_id;
  
  return payload.roles
    .filter((r) => r.branch_id === targetBranchId)
    .map((r) => r.role.toUpperCase());
}

/**
 * Extract user ID from JWT token payload
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return payload.user_id ? String(payload.user_id) : null;
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= payload.exp * 1000;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return null;
  
  // Convert seconds to milliseconds
  return payload.exp * 1000;
}

