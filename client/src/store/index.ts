// Enhanced Zustand Stores
// This file provides a centralized export for all enhanced stores

// Auth Store
export {
  useAuthStore,
  useAuthSelectors,
  usePermissions,
  useTokenManagement,
  type AuthUser,
  type Branch,
  type AcademicYear,
  type AuthError,
} from './authStore';

// Navigation Store
export {
  useNavigationStore,
  useNavigationSelectors,
  useNavigationHistory,
  useNavigationPreferences,
  type NavigationHistory,
  type NavigationPreferences,
} from './navigationStore';

// Cache Store
export {
  useCacheStore,
  useCache,
  useCacheManagement,
  setupCacheCleanup,
  stopCacheCleanup,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
} from './cacheStore';

// UI Store
export {
  useUIStore,
  useToast,
  useModal,
  useLoading,
  useTheme,
  useUIPreferences,
  type Toast,
  type Modal,
  type LoadingState,
  type UITheme,
  type UIPreferences,
} from './uiStore';

// Store utilities
export const storeUtils = {
  // Generate unique keys for cache
  generateCacheKey: (prefix: string, params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  },

  // Debounce function for store updates
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for store updates
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Store subscription helper
  subscribeToStore: <T>(
    store: any,
    selector: (state: any) => T,
    callback: (value: T) => void
  ) => {
    return store.subscribe(selector, callback);
  },

  // Batch store updates
  batchUpdate: (updates: Array<() => void>) => {
    // In a real implementation, you might want to use React's unstable_batchedUpdates
    // or implement your own batching mechanism
    updates.forEach(update => update());
  },
};

// Store initialization
export const initializeStores = () => {
  // Setup cache cleanup
  const { setupCacheCleanup } = require('./cacheStore');
  setupCacheCleanup();

  // Setup any other store initializations here
  console.log('Enhanced stores initialized');
};

// Store cleanup
export const cleanupStores = () => {
  // Stop cache cleanup
  const { stopCacheCleanup } = require('./cacheStore');
  stopCacheCleanup();

  // Clear all stores
  const { useAuthStore } = require('./authStore');
  const { useNavigationStore } = require('./navigationStore');
  const { useCacheStore } = require('./cacheStore');
  const { useUIStore } = require('./uiStore');

  useAuthStore.getState().logout();
  useNavigationStore.getState().clearHistory();
  useCacheStore.getState().clear();
  useUIStore.getState().clearToasts();
  useUIStore.getState().hideAllModals();

  console.log('Enhanced stores cleaned up');
};
