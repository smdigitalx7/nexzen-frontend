import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
  tags: string[];
  version: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
  version?: number;
  staleWhileRevalidate?: boolean;
  maxAge?: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  lastCleanup: number;
}

interface CacheState {
  // Cache storage
  cache: Map<string, CacheEntry>;
  
  // Cache configuration
  defaultTTL: number;
  maxCacheSize: number;
  cleanupInterval: number;
  
  // Statistics
  stats: CacheStats;
  hits: number;
  misses: number;
  
  // Computed selectors
  getCacheSize: () => number;
  getCacheKeys: () => string[];
  getCacheKeysByTag: (tag: string) => string[];
  isExpired: (key: string) => boolean;
  getCacheStats: () => CacheStats;
  
  // Cache operations
  set: <T>(key: string, data: T, options?: CacheOptions) => void;
  get: <T>(key: string) => T | null;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;
  clearByTag: (tag: string) => void;
  clearExpired: () => number;
  
  // Cache management
  cleanup: () => void;
  evict: (strategy: 'lru' | 'fifo' | 'random') => void;
  invalidate: (pattern: string | RegExp) => void;
  refresh: <T>(key: string, fetcher: () => Promise<T>) => Promise<T | null>;
  
  // Configuration
  setDefaultTTL: (ttl: number) => void;
  setMaxCacheSize: (size: number) => void;
  setCleanupInterval: (interval: number) => void;
  
  // Utilities
  generateKey: (prefix: string, params: Record<string, any>) => string;
  isStale: (key: string) => boolean;
  getAge: (key: string) => number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_SIZE = 1000;
const DEFAULT_CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Enable MapSet plugin for Immer
enableMapSet();

export const useCacheStore = create<CacheState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      cache: new Map(),
      defaultTTL: DEFAULT_TTL,
      maxCacheSize: DEFAULT_MAX_SIZE,
      cleanupInterval: DEFAULT_CLEANUP_INTERVAL,
      stats: {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        evictions: 0,
        lastCleanup: Date.now(),
      },
      hits: 0,
      misses: 0,

      // Computed selectors
      getCacheSize: () => {
        const { cache } = get();
        return cache.size;
      },

      getCacheKeys: () => {
        const { cache } = get();
        return Array.from(cache.keys());
      },

      getCacheKeysByTag: (tag: string) => {
        const { cache } = get();
        return Array.from(cache.entries())
          .filter(([_, entry]) => entry.tags.includes(tag))
          .map(([key]) => key);
      },

      isExpired: (key: string) => {
        const { cache } = get();
        const entry = cache.get(key);
        if (!entry) return true;
        return Date.now() > entry.expiresAt;
      },

      getCacheStats: () => {
        const { stats, hits, misses } = get();
        const total = hits + misses;
        return {
          ...stats,
          hitRate: total > 0 ? hits / total : 0,
          missRate: total > 0 ? misses / total : 0,
        };
      },

      // Cache operations
      set: <T>(key: string, data: T, options: CacheOptions = {}) => {
        const { defaultTTL, maxCacheSize, cache } = get();
        
        set((state) => {
          const now = Date.now();
          const ttl = options.ttl || defaultTTL;
          const version = options.version || 1;
          
          const entry: CacheEntry<T> = {
            data,
            timestamp: now,
            expiresAt: now + ttl,
            key,
            tags: options.tags || [],
            version,
          };

          // Check if we need to evict entries
          if (cache.size >= maxCacheSize) {
            get().evict('lru');
          }

          state.cache.set(key, entry);
          state.stats.totalEntries = state.cache.size;
          const entries = Array.from(state.cache.values()) as CacheEntry[];
          state.stats.totalSize = entries.reduce((total: number, entry: CacheEntry) => total + JSON.stringify(entry.data).length, 0);
        });
      },

      get: <T>(key: string): T | null => {
        const { cache } = get();
        const entry = cache.get(key) as CacheEntry<T> | undefined;
        
        if (!entry) {
          set((state) => {
            state.misses++;
          });
          return null;
        }

        if (get().isExpired(key)) {
          set((state) => {
            state.cache.delete(key);
            state.misses++;
            state.stats.totalEntries = state.cache.size;
          });
          return null;
        }

        set((state) => {
          state.hits++;
        });

        return entry.data;
      },

      has: (key: string) => {
        const { cache } = get();
        const entry = cache.get(key);
        return entry ? !get().isExpired(key) : false;
      },

      delete: (key: string) => {
        const { cache } = get();
        const deleted = cache.has(key);
        
        set((state) => {
          state.cache.delete(key);
          state.stats.totalEntries = state.cache.size;
        });

        return deleted;
      },

      clear: () => {
        set((state) => {
          state.cache.clear();
          state.stats.totalEntries = 0;
          state.stats.totalSize = 0;
          state.hits = 0;
          state.misses = 0;
        });
      },

      clearByTag: (tag: string) => {
        const keysToDelete = get().getCacheKeysByTag(tag);
        
        set((state) => {
          keysToDelete.forEach(key => {
            state.cache.delete(key);
          });
          state.stats.totalEntries = state.cache.size;
        });
      },

      clearExpired: () => {
        const { cache } = get();
        const now = Date.now();
        let clearedCount = 0;

        set((state) => {
          for (const [key, entry] of Array.from(state.cache.entries())) {
            if (now > entry.expiresAt) {
              state.cache.delete(key);
              clearedCount++;
            }
          }
          state.stats.totalEntries = state.cache.size;
          state.stats.lastCleanup = now;
        });

        return clearedCount;
      },

      // Cache management
      cleanup: () => {
        get().clearExpired();
      },

      evict: (strategy: 'lru' | 'fifo' | 'random') => {
        const { cache } = get();
        const entries = Array.from(cache.entries());
        let entryToEvict: [string, CacheEntry] | null = null;

        switch (strategy) {
          case 'lru':
            entryToEvict = entries.reduce((oldest, current) => 
              current[1].timestamp < oldest[1].timestamp ? current : oldest
            );
            break;
          case 'fifo':
            entryToEvict = entries[0];
            break;
          case 'random':
            entryToEvict = entries[Math.floor(Math.random() * entries.length)];
            break;
        }

        if (entryToEvict) {
          set((state) => {
            state.cache.delete(entryToEvict[0]);
            state.stats.evictions++;
            state.stats.totalEntries = state.cache.size;
          });
        }
      },

      invalidate: (pattern: string | RegExp) => {
        const { cache } = get();
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        const keysToDelete: string[] = [];

        const keys = Array.from(cache.keys());
        for (const key of keys) {
          if (regex.test(key)) {
            keysToDelete.push(key);
          }
        }

        set((state) => {
          keysToDelete.forEach(key => {
            state.cache.delete(key);
          });
          state.stats.totalEntries = state.cache.size;
        });
      },

      refresh: async <T>(key: string, fetcher: () => Promise<T>) => {
        try {
          const data = await fetcher();
          get().set(key, data);
          return data;
        } catch (error) {
          console.error(`Failed to refresh cache for key ${key}:`, error);
          return null;
        }
      },

      // Configuration
      setDefaultTTL: (ttl: number) => {
        set((state) => {
          state.defaultTTL = ttl;
        });
      },

      setMaxCacheSize: (size: number) => {
        set((state) => {
          state.maxCacheSize = size;
        });
      },

      setCleanupInterval: (interval: number) => {
        set((state) => {
          state.cleanupInterval = interval;
        });
      },

      // Utilities
      generateKey: (prefix: string, params: Record<string, any>) => {
        const sortedParams = Object.keys(params)
          .sort()
          .map(key => `${key}:${params[key]}`)
          .join('|');
        return `${prefix}:${sortedParams}`;
      },

      isStale: (key: string) => {
        const { cache } = get();
        const entry = cache.get(key);
        if (!entry) return true;
        
        const now = Date.now();
        const maxAge = entry.version * 60 * 1000; // 1 minute per version
        return (now - entry.timestamp) > maxAge;
      },

      getAge: (key: string) => {
        const { cache } = get();
        const entry = cache.get(key);
        if (!entry) return -1;
        return Date.now() - entry.timestamp;
      },
    }))
  )
);

// Cache hooks for common patterns
export const useCache = <T>(key: string, fetcher?: () => Promise<T>, options?: CacheOptions) => {
  const cache = useCacheStore();
  const data = cache.get<T>(key);
  const isLoading = false; // This would be managed by the component

  const refresh = async () => {
    if (fetcher) {
      return await cache.refresh(key, fetcher);
    }
    return null;
  };

  const set = (data: T, opts?: CacheOptions) => {
    cache.set(key, data, { ...options, ...opts });
  };

  return {
    data,
    isLoading,
    refresh,
    set,
    has: cache.has(key),
    delete: () => cache.delete(key),
    isExpired: cache.isExpired(key),
    isStale: cache.isStale(key),
    age: cache.getAge(key),
  };
};

// Cache management hooks
export const useCacheManagement = () => {
  const cache = useCacheStore();
  
  return {
    clear: cache.clear,
    clearByTag: cache.clearByTag,
    clearExpired: cache.clearExpired,
    cleanup: cache.cleanup,
    invalidate: cache.invalidate,
    stats: cache.getCacheStats(),
    size: cache.getCacheSize(),
    keys: cache.getCacheKeys(),
  };
};

// Auto-cleanup setup
let cleanupInterval: NodeJS.Timeout | null = null;

export const setupCacheCleanup = () => {
  const cache = useCacheStore.getState();
  
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  cleanupInterval = setInterval(() => {
    cache.cleanup();
  }, cache.cleanupInterval);
};

export const stopCacheCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};
