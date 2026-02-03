/**
 * Performance utilities barrel export
 */
export * from './performance';
export * from './bundleOptimizer';
export * from './preloader';
// Avoid duplicate exports (e.g. withPerformanceMonitoring exists in multiple files)
export { performanceUtils, withErrorBoundary, memoizationUtils } from './production-optimizations';
