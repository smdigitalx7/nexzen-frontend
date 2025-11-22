/**
 * Bundle monitoring component for development
 * Shows bundle size, loading performance, and optimization metrics
 */

import React, { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { Progress } from '@/common/components/ui/progress';
import { Activity, Download, Zap, AlertTriangle } from 'lucide-react';

interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  chunkCount: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

interface BundleMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export const BundleMonitor = memo<BundleMonitorProps>(({ 
  showDetails = false, 
  className = '' 
}) => {
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // Calculate bundle sizes
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      const jsSize = jsResources.reduce((total, r) => total + (r.transferSize || 0), 0);
      const cssSize = cssResources.reduce((total, r) => total + (r.transferSize || 0), 0);
      const totalSize = jsSize + cssSize;
      
      // Calculate performance metrics
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // Memory usage (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
      
      setMetrics({
        totalSize,
        jsSize,
        cssSize,
        chunkCount: jsResources.length,
        loadTime,
        renderTime,
        memoryUsage,
      });
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    // Show monitor on Ctrl+Shift+B
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('load', collectMetrics);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!metrics || !isVisible) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  const getPerformanceStatus = (loadTime: number) => {
    if (loadTime < 1000) return { status: 'excellent', color: 'bg-green-500' };
    if (loadTime < 2000) return { status: 'good', color: 'bg-yellow-500' };
    if (loadTime < 3000) return { status: 'fair', color: 'bg-orange-500' };
    return { status: 'poor', color: 'bg-red-500' };
  };

  const getBundleStatus = (size: number) => {
    if (size < 500) return { status: 'excellent', color: 'bg-green-500' };
    if (size < 1000) return { status: 'good', color: 'bg-yellow-500' };
    if (size < 2000) return { status: 'fair', color: 'bg-orange-500' };
    return { status: 'poor', color: 'bg-red-500' };
  };

  const performanceStatus = getPerformanceStatus(metrics.loadTime);
  const bundleStatus = getBundleStatus(metrics.totalSize / 1024);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Bundle Monitor
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Dev Mode
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Press Ctrl+Shift+B to toggle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Performance Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Load Time
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{formatTime(metrics.loadTime)}</span>
                <div className={`w-2 h-2 rounded-full ${performanceStatus.color}`} />
              </div>
            </div>
            <Progress 
              value={Math.min((metrics.loadTime / 3000) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Bundle Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                Bundle Size
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{formatBytes(metrics.totalSize)}</span>
                <div className={`w-2 h-2 rounded-full ${bundleStatus.color}`} />
              </div>
            </div>
            <Progress 
              value={Math.min((metrics.totalSize / 1024 / 2000) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Detailed Metrics */}
          {showDetails && (
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">JS:</span>
                  <span className="ml-1 font-mono">{formatBytes(metrics.jsSize)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CSS:</span>
                  <span className="ml-1 font-mono">{formatBytes(metrics.cssSize)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Chunks:</span>
                  <span className="ml-1 font-mono">{metrics.chunkCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Memory:</span>
                  <span className="ml-1 font-mono">{metrics.memoryUsage.toFixed(1)}MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {(performanceStatus.status === 'poor' || bundleStatus.status === 'poor') && (
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
              <AlertTriangle className="h-3 w-3" />
              <span>Consider optimizing bundle size or performance</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

BundleMonitor.displayName = 'BundleMonitor';

export default BundleMonitor;
