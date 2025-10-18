/**
 * Component preloading utilities for better performance
 */

import React from 'react';

// Critical components that should be preloaded
const CRITICAL_COMPONENTS = [
  () => import("@/components/pages/general/Dashboard"),
  () => import("@/components/pages/general/Login"),
  () => import("@/components/pages/general/UserManagementPage"),
];

// School components
const SCHOOL_COMPONENTS = [
  () => import("@/components/pages/school/SchoolAcademicPage"),
  () => import("@/components/pages/school/SchoolStudentsPage"),
  () => import("@/components/pages/school/SchoolAttendancePage"),
  () => import("@/components/pages/school/SchoolFeesPage"),
  () => import("@/components/pages/school/SchoolMarksPage"),
];

// College components
const COLLEGE_COMPONENTS = [
  () => import("@/components/pages/college/CollegeAcademicPage"),
  () => import("@/components/pages/college/CollegeStudentsPage"),
  () => import("@/components/pages/college/CollegeAttendancePage"),
  () => import("@/components/pages/college/CollegeFeesPage"),
  () => import("@/components/pages/college/CollegeMarksPage"),
];

// General management components
const GENERAL_COMPONENTS = [
  () => import("@/components/pages/general/EmployeeManagementPage"),
  () => import("@/components/pages/general/PayrollManagementPage"),
  () => import("@/components/pages/general/TransportManagementPage"),
  () => import("@/components/pages/general/AuditLog"),
];

class ComponentPreloader {
  private preloadedComponents = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  /**
   * Preload a single component
   */
  async preloadComponent(importFn: () => Promise<any>, componentName: string): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    try {
      const promise = importFn();
      this.preloadPromises.set(componentName, promise);
      
      await promise;
      this.preloadedComponents.add(componentName);
      console.log(`✅ Preloaded component: ${componentName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload component: ${componentName}`, error);
    }
  }

  /**
   * Preload multiple components in parallel
   */
  async preloadComponents(components: Array<() => Promise<any>>, groupName: string): Promise<void> {
    console.log(`🚀 Preloading ${groupName} components...`);
    
    const promises = components.map((importFn, index) => 
      this.preloadComponent(importFn, `${groupName}-${index}`)
    );

    await Promise.allSettled(promises);
    console.log(`✅ Completed preloading ${groupName} components`);
  }

  /**
   * Preload critical components immediately
   */
  async preloadCritical(): Promise<void> {
    await this.preloadComponents(CRITICAL_COMPONENTS, 'critical');
  }

  /**
   * Preload school components
   */
  async preloadSchool(): Promise<void> {
    await this.preloadComponents(SCHOOL_COMPONENTS, 'school');
  }

  /**
   * Preload college components
   */
  async preloadCollege(): Promise<void> {
    await this.preloadComponents(COLLEGE_COMPONENTS, 'college');
  }

  /**
   * Preload general management components
   */
  async preloadGeneral(): Promise<void> {
    await this.preloadComponents(GENERAL_COMPONENTS, 'general');
  }

  /**
   * Preload components based on user role
   */
  async preloadByRole(role: 'institute_admin' | 'academic' | 'accountant'): Promise<void> {
    const preloadTasks = [this.preloadCritical()];

    switch (role) {
      case 'institute_admin':
        preloadTasks.push(
          this.preloadSchool(),
          this.preloadCollege(),
          this.preloadGeneral()
        );
        break;
      case 'academic':
        preloadTasks.push(
          this.preloadSchool(),
          this.preloadCollege()
        );
        break;
      case 'accountant':
        preloadTasks.push(
          this.preloadGeneral()
        );
        break;
    }

    await Promise.allSettled(preloadTasks);
  }

  /**
   * Preload components in the background using requestIdleCallback
   */
  preloadInBackground(components: Array<() => Promise<any>>, groupName: string): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadComponents(components, groupName);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadComponents(components, groupName);
      }, 100);
    }
  }

  /**
   * Check if a component is preloaded
   */
  isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }

  /**
   * Get preload status
   */
  getStatus(): { preloaded: string[]; total: number } {
    return {
      preloaded: Array.from(this.preloadedComponents),
      total: this.preloadedComponents.size
    };
  }
}

// Create singleton instance
export const componentPreloader = new ComponentPreloader();

/**
 * Hook for component preloading
 */
export const usePreloader = () => {
  const [isPreloading, setIsPreloading] = React.useState(false);
  const [preloadStatus, setPreloadStatus] = React.useState(componentPreloader.getStatus());

  const preload = React.useCallback(async (components: Array<() => Promise<any>>, groupName: string) => {
    setIsPreloading(true);
    try {
      await componentPreloader.preloadComponents(components, groupName);
      setPreloadStatus(componentPreloader.getStatus());
    } finally {
      setIsPreloading(false);
    }
  }, []);

  const preloadByRole = React.useCallback(async (role: 'institute_admin' | 'academic' | 'accountant') => {
    setIsPreloading(true);
    try {
      await componentPreloader.preloadByRole(role);
      setPreloadStatus(componentPreloader.getStatus());
    } finally {
      setIsPreloading(false);
    }
  }, []);

  return {
    isPreloading,
    preloadStatus,
    preload,
    preloadByRole,
    isPreloaded: componentPreloader.isPreloaded.bind(componentPreloader)
  };
};

/**
 * Preload components on route hover (for better UX)
 */
export const useRoutePreloader = () => {
  const preloadOnHover = React.useCallback((importFn: () => Promise<any>, componentName: string) => {
    if (!componentPreloader.isPreloaded(componentName)) {
      componentPreloader.preloadComponent(importFn, componentName);
    }
  }, []);

  return { preloadOnHover };
};

export default componentPreloader;
