/**
 * Optimized component demonstrating best practices for bundle optimization
 */

import React, { memo, Suspense, lazy, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createOptimizedLazyComponent, optimizeImports } from '@/lib/utils/performance/bundleOptimizer';

// Lazy load heavy components with optimization
const HeavyChart = createOptimizedLazyComponent(
  () => import('recharts').then(module => ({ default: module.LineChart })),
  { preload: true, priority: 'medium' }
);

// Note: DataVisualization component would need to be created
// const DataVisualization = createOptimizedLazyComponent(
//   () => import('@/components/shared/DataVisualization'),
//   { preload: false, priority: 'low' }
// );

// Optimized icon loading
const OptimizedIcon = memo(({ name, ...props }: { name: string; [key: string]: any }) => {
  const IconComponent = useMemo(() => {
    // Simplified icon loading - in practice, you'd import specific icons
    return lazy(() => import('lucide-react').then(module => ({ 
      default: (module as any)[name] || module.Activity 
    })));
  }, [name]);

  return (
    <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
      <IconComponent {...props} />
    </Suspense>
  );
});

interface OptimizedComponentProps {
  title: string;
  description?: string;
  showChart?: boolean;
  showVisualization?: boolean;
  iconName?: string;
  children?: React.ReactNode;
}

export const OptimizedComponent = memo<OptimizedComponentProps>(({
  title,
  description,
  showChart = false,
  showVisualization = false,
  iconName = 'Activity',
  children
}) => {
  // Memoize expensive computations
  const chartData = useMemo(() => {
    if (!showChart) return null;
    
    return [
      { name: 'Jan', value: 400 },
      { name: 'Feb', value: 300 },
      { name: 'Mar', value: 200 },
      { name: 'Apr', value: 500 },
    ];
  }, [showChart]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <OptimizedIcon name={iconName} className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        
        {/* Conditionally render heavy components */}
        {showChart && chartData && (
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading chart...</span>
              </div>
            }
          >
            <div className="h-64">
              <HeavyChart data={chartData} />
            </div>
          </Suspense>
        )}
        
        {/* DataVisualization component would be rendered here when available */}
      </CardContent>
    </Card>
  );
});

OptimizedComponent.displayName = 'OptimizedComponent';

// Export with performance monitoring
export default OptimizedComponent;
