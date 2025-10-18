/**
 * Bundle optimization utilities for better code splitting and performance
 */

import { ComponentType, lazy } from 'react';

// Preload function for components
export const preloadComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  let componentPromise: Promise<{ default: T }> | null = null;
  
  return () => {
    if (!componentPromise) {
      componentPromise = importFn();
    }
    return componentPromise;
  };
};

// Enhanced lazy loading with preloading
export const createOptimizedLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    preload?: boolean;
    priority?: 'high' | 'medium' | 'low';
  }
) => {
  const LazyComponent = lazy(importFn);
  
  if (options?.preload) {
    // Preload based on priority
    const preloadFn = preloadComponent(importFn);
    
    if (options.priority === 'high') {
      // Preload immediately
      preloadFn();
    } else if (options.priority === 'medium') {
      // Preload on idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => preloadFn());
      } else {
        setTimeout(() => preloadFn(), 100);
      }
    } else {
      // Preload on user interaction
      const preloadOnInteraction = () => {
        preloadFn();
        document.removeEventListener('mousemove', preloadOnInteraction);
        document.removeEventListener('touchstart', preloadOnInteraction);
      };
      
      document.addEventListener('mousemove', preloadOnInteraction, { once: true });
      document.addEventListener('touchstart', preloadOnInteraction, { once: true });
    }
  }
  
  return LazyComponent;
};

// Bundle analyzer helper
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Bundle Analysis Available');
    console.log('Run: npm run build:analyze to generate bundle report');
  }
};

// Dynamic import with error handling
export const safeDynamicImport = async <T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await importFn();
  } catch (error) {
    console.error('Failed to load module:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
};

// Resource hints for better loading
export const addResourceHints = (urls: string[]) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Critical resource preloading
export const preloadCriticalResources = () => {
  const criticalResources = [
    // Add critical CSS, fonts, or other resources here
    '/fonts/inter.woff2',
    '/css/critical.css',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'font';
    if (resource.endsWith('.woff2')) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('📦 Bundle Load Time:', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }
};

// Tree shaking optimization helpers
export const optimizeImports = {
  // Only import what you need from large libraries
  lucide: (iconName: string) => import(`lucide-react`).then(m => m[iconName]),
  
  // Lazy load heavy components
  charts: () => import('recharts'),
  
  // Conditional imports
  conditional: (condition: boolean, importFn: () => Promise<any>) => 
    condition ? importFn() : Promise.resolve(null),
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('🧠 Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
    });
  }
};

// Export all utilities
export default {
  preloadComponent,
  createOptimizedLazyComponent,
  analyzeBundle,
  safeDynamicImport,
  addResourceHints,
  preloadCriticalResources,
  monitorBundleSize,
  optimizeImports,
  monitorMemoryUsage,
};
