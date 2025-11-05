/**
 * Performance monitoring utilities for components
 */

import React from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
  props?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 100;

  recordRender(componentName: string, renderTime: number, props?: Record<string, any>) {
    const metric: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
      props,
    };

    this.metrics.push(metric);

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow renders
    if (renderTime > 16) {
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  getAverageRenderTime(componentName?: string) {
    const filtered = componentName 
      ? this.metrics.filter(m => m.componentName === componentName)
      : this.metrics;
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.renderTime, 0);
    return total / filtered.length;
  }

  getSlowRenders(threshold = 16) {
    return this.metrics.filter(m => m.renderTime > threshold);
  }

  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name || 'Unknown';
  
  const WrappedComponent = React.memo((props: P) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      performanceMonitor.recordRender(displayName, renderTime, props as Record<string, any>);
    });
    
    return React.createElement(Component, props);
  });
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return WrappedComponent;
}

/**
 * Hook for measuring component performance
 */
export function usePerformanceMeasure(componentName: string) {
  const startTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    performanceMonitor.recordRender(componentName, renderTime);
    
    // Reset for next render
    startTime.current = performance.now();
  });
}

/**
 * Utility to measure async operations
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ ${operationName} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Utility to debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Utility to throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
