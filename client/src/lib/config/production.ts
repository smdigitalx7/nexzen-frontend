/**
 * Production configuration and optimizations
 * This file contains production-ready settings and optimizations
 */

// Environment detection
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';
export const isTest = import.meta.env.MODE === 'test';

// Performance configuration
export const performanceConfig = {
  // Bundle size limits
  maxBundleSize: 2 * 1024 * 1024, // 2MB
  maxChunkSize: 500 * 1024, // 500KB
  
  // Render performance
  maxRenderTime: 16, // 16ms (60fps)
  slowRenderThreshold: 50, // 50ms
  
  // Memory limits
  maxMemoryUsage: 100, // 100MB
  memoryWarningThreshold: 80, // 80MB
  
  // Cache settings
  defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 1000, // 1000 entries
  cacheCleanupInterval: 60 * 1000, // 1 minute
};

// Error handling configuration
export const errorConfig = {
  // Error reporting
  enableErrorReporting: isProduction,
  errorReportingEndpoint: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT || '/api/errors',
  
  // Retry settings
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryBackoff: 2, // Exponential backoff multiplier
  
  // Error boundaries
  enableErrorBoundaries: true,
  showErrorDetails: isDevelopment,
  
  // Logging
  logLevel: isDevelopment ? 'debug' : 'error',
  enableConsoleLogging: isDevelopment,
};

// API configuration
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Caching
  enableCaching: true,
  defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
  cacheStaleTime: 2 * 60 * 1000, // 2 minutes
  
  // Request/Response interceptors
  enableInterceptors: true,
  enableRequestLogging: isDevelopment,
  enableResponseLogging: isDevelopment,
};

// Security configuration
export const securityConfig = {
  // Content Security Policy
  enableCSP: isProduction,
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", import.meta.env.VITE_API_BASE_URL || '/api'],
  },
  
  // Input sanitization
  enableInputSanitization: true,
  maxInputLength: 10000,
  
  // Rate limiting
  enableRateLimiting: true,
  maxRequestsPerMinute: 60,
  
  // Token security
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes
  maxTokenRefreshAttempts: 3,
};

// Monitoring configuration
export const monitoringConfig = {
  // Performance monitoring
  enablePerformanceMonitoring: isProduction,
  performanceSamplingRate: 0.1, // 10% of users
  
  // Error monitoring
  enableErrorMonitoring: isProduction,
  errorSamplingRate: 1.0, // 100% of errors
  
  // User analytics
  enableAnalytics: isProduction,
  analyticsEndpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics',
  
  // Real user monitoring
  enableRUM: isProduction,
  rumSamplingRate: 0.1, // 10% of users
};

// Feature flags
export const featureFlags = {
  // Performance features
  enableLazyLoading: true,
  enableCodeSplitting: true,
  enableTreeShaking: true,
  enableBundleOptimization: true,
  
  // UI features
  enableDarkMode: true,
  enableAnimations: true,
  enableAccessibility: true,
  
  // Development features
  enableHotReload: isDevelopment,
  enableDevTools: isDevelopment,
  enableSourceMaps: isDevelopment,
  
  // Production features
  enableServiceWorker: isProduction,
  enableOfflineSupport: isProduction,
  enablePushNotifications: isProduction,
};

// Optimization settings
export const optimizationConfig = {
  // Image optimization
  enableImageOptimization: true,
  imageQuality: 80,
  imageFormats: ['webp', 'avif', 'jpeg', 'png'],
  
  // Font optimization
  enableFontOptimization: true,
  fontDisplay: 'swap',
  
  // CSS optimization
  enableCSSOptimization: true,
  enableCriticalCSS: isProduction,
  
  // JavaScript optimization
  enableJSOptimization: true,
  enableMinification: isProduction,
  enableCompression: isProduction,
  
  // Bundle optimization
  enableBundleAnalysis: isDevelopment,
  enableTreeShaking: true,
  enableDeadCodeElimination: true,
};

// Development tools
export const devToolsConfig = {
  // React DevTools
  enableReactDevTools: isDevelopment,
  
  // Redux DevTools
  enableReduxDevTools: isDevelopment,
  
  // Performance profiling
  enableProfiling: isDevelopment,
  
  // Bundle analyzer
  enableBundleAnalyzer: isDevelopment,
  
  // Source maps
  enableSourceMaps: isDevelopment,
  sourceMapType: 'cheap-module-source-map',
};

// Production optimizations
export const productionOptimizations = {
  // Code splitting
  enableCodeSplitting: true,
  splitChunks: {
    vendor: ['react', 'react-dom'],
    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
    utils: ['lodash', 'date-fns'],
  },
  
  // Lazy loading
  enableLazyLoading: true,
  lazyLoadThreshold: 100, // Load when 100px from viewport
  
  // Preloading
  enablePreloading: true,
  preloadCritical: true,
  preloadOnHover: true,
  
  // Caching
  enableCaching: true,
  cacheStrategy: 'stale-while-revalidate',
  cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  
  // Compression
  enableCompression: true,
  compressionLevel: 6,
  
  // Minification
  enableMinification: true,
  removeConsole: isProduction,
  removeDebugger: isProduction,
};

// Export all configurations
export const config = {
  environment: {
    isDevelopment,
    isProduction,
    isTest,
  },
  performance: performanceConfig,
  error: errorConfig,
  api: apiConfig,
  security: securityConfig,
  monitoring: monitoringConfig,
  features: featureFlags,
  optimization: optimizationConfig,
  devTools: devToolsConfig,
  production: productionOptimizations,
};

// Utility functions
export const configUtils = {
  // Get configuration value with fallback
  get: <T>(path: string, fallback: T): T => {
    const keys = path.split('.');
    let value: unknown = config;
    
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
      if (value === undefined) {
        return fallback;
      }
    }
    
    return value as T;
  },
  
  // Check if feature is enabled
  isFeatureEnabled: (feature: string): boolean => {
    return configUtils.get(`features.${feature}`, false);
  },
  
  // Get environment-specific value
  getEnvValue: <T>(dev: T, prod: T, test?: T): T => {
    if (isTest && test !== undefined) return test;
    if (isProduction) return prod;
    return dev;
  },
  
  // Validate configuration
  validate: (): boolean => {
    const required = [
      'api.baseURL',
      'performance.maxBundleSize',
      'error.maxRetries',
    ];
    
    return required.every(path => configUtils.get(path, null) !== null);
  },
};

export default config;
