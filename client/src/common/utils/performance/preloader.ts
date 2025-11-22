/**
 * Component preloading utilities for better performance
 */

import React from "react";

// Critical components that should be preloaded
const CRITICAL_COMPONENTS = [
  () => import("@/features/general/pages/Login"),
  () => import("@/features/general/pages/UserManagementPage"),
];

// School components
const SCHOOL_COMPONENTS = [
  () => import("@/features/school/pages/SchoolAcademicPage"),
  () => import("@/features/school/pages/SchoolStudentsPage"),
  () => import("@/features/school/pages/SchoolAttendancePage"),
  () => import("@/features/school/pages/SchoolFeesPage"),
  () => import("@/features/school/pages/SchoolMarksPage"),
];

// College components
const COLLEGE_COMPONENTS = [
  () => import("@/features/college/pages/CollegeAcademicPage"),
  () => import("@/features/college/pages/CollegeStudentsPage"),
  () => import("@/features/college/pages/CollegeAttendancePage"),
  () => import("@/features/college/pages/CollegeFeesPage"),
  () => import("@/features/college/pages/CollegeMarksPage"),
];

// General management components
const GENERAL_COMPONENTS = [
  () => import("@/features/general/pages/EmployeeManagementPage"),
  () => import("@/features/general/pages/PayrollManagementPage"),
  () => import("@/features/general/pages/TransportManagementPage"),
  () => import("@/features/general/pages/AuditLog"),
];

class ComponentPreloader {
  private preloadedComponents = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  /**
   * Preload a single component
   */
  async preloadComponent(
    importFn: () => Promise<any>,
    componentName: string
  ): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    try {
      const promise = importFn();
      this.preloadPromises.set(componentName, promise);

      await promise;
      this.preloadedComponents.add(componentName);
    } catch (error) {
      // Silently fail - component will load on demand
    }
  }

  /**
   * Preload multiple components in parallel
   */
  async preloadComponents(
    components: Array<() => Promise<any>>,
    groupName: string
  ): Promise<void> {
    const promises = components.map((importFn, index) =>
      this.preloadComponent(importFn, `${groupName}-${index}`)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Preload critical components immediately
   */
  async preloadCritical(): Promise<void> {
    await this.preloadComponents(CRITICAL_COMPONENTS, "critical");
  }

  /**
   * Preload school components
   */
  async preloadSchool(): Promise<void> {
    await this.preloadComponents(SCHOOL_COMPONENTS, "school");
  }

  /**
   * Preload college components
   */
  async preloadCollege(): Promise<void> {
    await this.preloadComponents(COLLEGE_COMPONENTS, "college");
  }

  /**
   * Preload general management components
   */
  async preloadGeneral(): Promise<void> {
    await this.preloadComponents(GENERAL_COMPONENTS, "general");
  }

  /**
   * Preload components based on user role
   */
  async preloadByRole(
    role: "ADMIN" | "INSTITUTE_ADMIN" | "ACADEMIC" | "ACCOUNTANT"
  ): Promise<void> {
    const preloadTasks = [this.preloadCritical()];

    switch (role) {
      case "ADMIN":
      case "INSTITUTE_ADMIN":
        preloadTasks.push(
          this.preloadSchool(),
          this.preloadCollege(),
          this.preloadGeneral()
        );
        break;
      case "ACADEMIC":
        preloadTasks.push(this.preloadSchool(), this.preloadCollege());
        break;
      case "ACCOUNTANT":
        preloadTasks.push(this.preloadGeneral());
        break;
    }

    await Promise.allSettled(preloadTasks);
  }

  /**
   * Preload components in the background using requestIdleCallback
   */
  preloadInBackground(
    components: Array<() => Promise<any>>,
    groupName: string
  ): void {
    if ("requestIdleCallback" in window) {
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
      total: this.preloadedComponents.size,
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
  const [preloadStatus, setPreloadStatus] = React.useState(
    componentPreloader.getStatus()
  );

  const preload = React.useCallback(
    async (components: Array<() => Promise<any>>, groupName: string) => {
      setIsPreloading(true);
      try {
        await componentPreloader.preloadComponents(components, groupName);
        setPreloadStatus(componentPreloader.getStatus());
      } finally {
        setIsPreloading(false);
      }
    },
    []
  );

  const preloadByRole = React.useCallback(
    async (role: "ADMIN" | "INSTITUTE_ADMIN" | "ACADEMIC" | "ACCOUNTANT") => {
      setIsPreloading(true);
      try {
        await componentPreloader.preloadByRole(role);
        setPreloadStatus(componentPreloader.getStatus());
      } finally {
        setIsPreloading(false);
      }
    },
    []
  );

  return {
    isPreloading,
    preloadStatus,
    preload,
    preloadByRole,
    isPreloaded: componentPreloader.isPreloaded.bind(componentPreloader),
  };
};

/**
 * Preload components on route hover (for better UX)
 */
export const useRoutePreloader = () => {
  const preloadOnHover = React.useCallback(
    (importFn: () => Promise<any>, componentName: string) => {
      if (!componentPreloader.isPreloaded(componentName)) {
        componentPreloader.preloadComponent(importFn, componentName);
      }
    },
    []
  );

  return { preloadOnHover };
};

export default componentPreloader;
