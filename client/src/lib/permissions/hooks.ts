import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import type { ActionType, UIComponentType } from "./config";
import {
  canPerformAction,
  canViewUIComponent,
  getVisibleTabs,
  getVisibleSections,
  getVisibleButtons,
  filterTabsByPermission,
  canCreate,
  canEdit,
  canDelete,
  canView,
  canExport,
  canImport,
  getDefaultTab,
} from "./utils";

/**
 * Hook to check if user can perform an action on a resource
 * Optimized to prevent unnecessary re-renders
 */
export function useCanPerformAction(resource: string, action: ActionType): boolean {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;
  return useMemo(
    () => canPerformAction(user, resource, action),
    [user, userRole, resource, action]
  );
}

/**
 * Hook to check if user can view a UI component
 * Optimized to prevent unnecessary re-renders
 */
export function useCanViewUIComponent(
  resource: string,
  componentType: UIComponentType,
  componentId: string
): boolean {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;
  return useMemo(
    () => canViewUIComponent(user, resource, componentType, componentId),
    [user, userRole, resource, componentType, componentId]
  );
}

/**
 * Hook to get visible tabs for a resource
 */
export function useVisibleTabs(resource: string): string[] {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => getVisibleTabs(user, resource), [user, resource]);
}

/**
 * Hook to get visible sections for a resource
 */
export function useVisibleSections(resource: string): string[] {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => getVisibleSections(user, resource), [user, resource]);
}

/**
 * Hook to get visible buttons for a resource
 */
export function useVisibleButtons(resource: string): string[] {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => getVisibleButtons(user, resource), [user, resource]);
}

/**
 * Hook to filter tabs by permission
 */
export function useFilteredTabs<T extends { value: string }>(
  resource: string,
  tabs: T[]
): T[] {
  const user = useAuthStore((state) => state.user);
  return useMemo(
    () => filterTabsByPermission(user, resource, tabs),
    [user, resource, tabs]
  );
}

/**
 * Hook to check create permission
 */
export function useCanCreate(resource: string): boolean {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canCreate(user, resource), [user, resource]);
}

/**
 * Hook to check edit permission
 */
export function useCanEdit(resource: string): boolean {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canEdit(user, resource), [user, resource]);
}

/**
 * Hook to check delete permission
 */
export function useCanDelete(resource: string): boolean {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canDelete(user, resource), [user, resource]);
}

/**
 * Hook to check view permission
 */
export function useCanView(resource: string): boolean {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canView(user, resource), [user, resource]);
}

/**
 * Hook to check export permission
 */
export function useCanExport(resource: string): boolean {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canExport(user, resource), [user, resource]);
}

/**
 * Hook to check import permission
 */
export function useCanImport(resource: string): boolean {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canImport(user, resource), [user, resource]);
}

/**
 * Comprehensive permission hook for a resource
 * Returns all permission checks for a resource
 */
export function useResourcePermissions(resource: string) {
  const user = useAuthStore((state) => state.user);

  return useMemo(
    () => ({
      canCreate: canCreate(user, resource),
      canEdit: canEdit(user, resource),
      canDelete: canDelete(user, resource),
      canView: canView(user, resource),
      canExport: canExport(user, resource),
      canImport: canImport(user, resource),
      visibleTabs: getVisibleTabs(user, resource),
      visibleSections: getVisibleSections(user, resource),
      visibleButtons: getVisibleButtons(user, resource),
    }),
    [user, resource]
  );
}

/**
 * Hook to get default tab for a resource based on user role
 */
export function useDefaultTab(
  resource: string,
  preferredDefault?: string
): string | null {
  const user = useAuthStore((state) => state.user);
  return useMemo(
    () => getDefaultTab(user, resource, preferredDefault),
    [user, resource, preferredDefault]
  );
}

