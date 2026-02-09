/**
 * Cookie Utilities
 * 
 * Provides helper functions for reading and parsing browser cookies.
 */

/**
 * Get a cookie by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      // Handle cases where value might be missing or empty
      return cookieValue ? decodeURIComponent(cookieValue) : "";
    }
  }
  
  return null;
}

/**
 * Check if a cookie exists
 * @param name - The name of the cookie to check
 * @returns True if the cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}
