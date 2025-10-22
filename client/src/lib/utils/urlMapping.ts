/**
 * Utility functions for mapping URLs between college and school branches
 */

export interface BranchType {
  COLLEGE: "COLLEGE";
  SCHOOL: "SCHOOL";
}

export const BRANCH_TYPES: BranchType = {
  COLLEGE: "COLLEGE",
  SCHOOL: "SCHOOL",
};

/**
 * Maps a URL from one branch type to another
 * @param currentUrl - The current URL path
 * @param fromBranchType - Current branch type
 * @param toBranchType - Target branch type
 * @returns The equivalent URL for the target branch type
 */
export function mapUrlToBranchType(
  currentUrl: string,
  fromBranchType: string,
  toBranchType: string
): string {
  // If switching to the same branch type, return current URL
  if (fromBranchType === toBranchType) {
    return currentUrl;
  }

  // Handle root path
  if (currentUrl === "/" || currentUrl === "") {
    return "/";
  }

  // Define URL mapping patterns
  const urlMappings: Record<string, { college: string; school: string }> = {
    // Academic management
    academic: { college: "/college/academic", school: "/school/academic" },

    // Reservations
    "reservations/new": {
      college: "/college/reservations/new",
      school: "/school/reservations/new",
    },
    reservations: {
      college: "/college/reservations",
      school: "/school/reservations",
    },

    // Admissions
    admissions: {
      college: "/college/admissions",
      school: "/school/admissions",
    },
    "admissions/new": {
      college: "/college/admissions/new",
      school: "/school/admissions/new",
    },

    // Classes (college specific)
    classes: { college: "/college/classes", school: "/school/academic" }, // School doesn't have separate classes page

    // Students
    students: { college: "/college/students", school: "/school/students" },

    // Attendance
    attendance: {
      college: "/college/attendance",
      school: "/school/attendance",
    },

    // Marks
    marks: { college: "/college/marks", school: "/school/marks" },

    // Fees
    fees: { college: "/college/fees", school: "/school/fees" },

    // Financial Reports
    "financial-reports": {
      college: "/college/financial-reports",
      school: "/school/financial-reports",
    },

    // Announcements
    announcements: {
      college: "/college/announcements",
      school: "/school/announcements",
    },
  };

  // Extract the path segment after the branch type
  let pathSegment = "";

  if (fromBranchType === "COLLEGE" && currentUrl.startsWith("/college/")) {
    pathSegment = currentUrl.replace("/college/", "");
  } else if (fromBranchType === "SCHOOL" && currentUrl.startsWith("/school/")) {
    pathSegment = currentUrl.replace("/school/", "");
  } else {
    // Handle general paths (not branch-specific)
    pathSegment = currentUrl.startsWith("/")
      ? currentUrl.substring(1)
      : currentUrl;
  }

  // Find matching mapping
  const mapping = urlMappings[pathSegment];
  if (mapping) {
    return toBranchType === "COLLEGE" ? mapping.college : mapping.school;
  }

  // Handle nested paths (e.g., /college/fees/collect)
  for (const [key, mapping] of Object.entries(urlMappings)) {
    if (pathSegment.startsWith(key + "/")) {
      const remainingPath = pathSegment.substring(key.length);
      const baseUrl =
        toBranchType === "COLLEGE" ? mapping.college : mapping.school;
      return baseUrl + remainingPath;
    }
  }

  // If no mapping found, redirect to dashboard
  return "/";
}

/**
 * Gets the equivalent URL for switching between branch types
 * @param currentUrl - Current URL path
 * @param currentBranchType - Current branch type
 * @param targetBranchType - Target branch type
 * @returns The equivalent URL for the target branch type
 */
export function getEquivalentUrl(
  currentUrl: string,
  currentBranchType: string,
  targetBranchType: string
): string {
  return mapUrlToBranchType(currentUrl, currentBranchType, targetBranchType);
}

/**
 * Checks if a URL is branch-specific (starts with /college/ or /school/)
 * @param url - URL to check
 * @returns true if URL is branch-specific
 */
export function isBranchSpecificUrl(url: string): boolean {
  return url.startsWith("/college/") || url.startsWith("/school/");
}

/**
 * Gets the branch type from a URL
 * @param url - URL to analyze
 * @returns The branch type ('COLLEGE', 'SCHOOL', or null)
 */
export function getBranchTypeFromUrl(url: string): string | null {
  if (url.startsWith("/college/")) return "COLLEGE";
  if (url.startsWith("/school/")) return "SCHOOL";
  return null;
}
