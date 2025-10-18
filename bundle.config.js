/**
 * Bundle optimization configuration
 * This file contains settings for optimizing the build process
 */

export const bundleConfig = {
  // Chunk size limits
  chunkSizeLimits: {
    vendor: 500, // KB
    component: 200, // KB
    total: 1000, // KB
  },
  
  // Preload priorities
  preloadPriorities: {
    critical: ['Dashboard', 'Login', 'UserManagement'],
    high: ['SchoolAcademicPage', 'CollegeAcademicPage'],
    medium: ['SchoolStudentsPage', 'CollegeStudentsPage'],
    low: ['ReportsPage', 'SettingsPage'],
  },
  
  // Tree shaking configuration
  treeShaking: {
    // Libraries that should be tree-shaken
    libraries: [
      'lucide-react',
      'date-fns',
      'recharts',
      '@radix-ui/react-icons',
    ],
    
    // Side effects to preserve
    sideEffects: [
      '*.css',
      '*.scss',
      '*.sass',
      '*.less',
    ],
  },
  
  // Code splitting strategy
  codeSplitting: {
    // Route-based splitting
    routes: {
      general: './client/src/components/pages/general',
      school: './client/src/components/pages/school',
      college: './client/src/components/pages/college',
    },
    
    // Feature-based splitting
    features: {
      dataTables: './client/src/components/shared',
      forms: './client/src/components/features',
      charts: './client/src/components/charts',
    },
    
    // Vendor splitting
    vendors: {
      react: ['react', 'react-dom'],
      ui: ['@radix-ui/react-*'],
      utils: ['clsx', 'tailwind-merge', 'date-fns'],
      data: ['@tanstack/react-query', '@tanstack/react-table'],
    },
  },
  
  // Compression settings
  compression: {
    gzip: true,
    brotli: true,
    minify: true,
    removeConsole: true,
  },
  
  // Performance budgets
  performanceBudgets: {
    // First contentful paint
    fcp: 2000, // ms
    
    // Largest contentful paint
    lcp: 2500, // ms
    
    // First input delay
    fid: 100, // ms
    
    // Cumulative layout shift
    cls: 0.1,
    
    // Bundle size
    bundleSize: 1000, // KB
  },
};

export default bundleConfig;
