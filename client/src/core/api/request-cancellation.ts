/**
 * Global Request Cancellation Registry
 * 
 * Tracks all active fetch requests so they can be cancelled on logout
 * This prevents requests from being sent after logout starts
 */

// Registry of all active AbortControllers
const activeControllers = new Set<AbortController>();

/**
 * Register an AbortController for tracking
 * Returns a cleanup function to unregister
 */
export function registerAbortController(controller: AbortController): () => void {
  activeControllers.add(controller);
  
  // Return cleanup function
  return () => {
    activeControllers.delete(controller);
  };
}

/**
 * Cancel all active requests
 * Called during logout to prevent requests from completing
 */
export function cancelAllRequests(): void {
  activeControllers.forEach((controller) => {
    try {
      controller.abort();
    } catch (e) {
      // Ignore errors - controller might already be aborted
    }
  });
  activeControllers.clear();
}

/**
 * Get count of active requests
 */
export function getActiveRequestCount(): number {
  return activeControllers.size;
}



