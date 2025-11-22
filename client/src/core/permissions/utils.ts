import type { UserRole } from "@/common/constants";
import type { AuthUser } from "@/core/auth/types";
import { ROLES } from "@/common/constants";
import { GLOBAL_PERMISSIONS, DEFAULT_ACTION_PERMISSIONS } from "./config";
import type { ActionType, UIComponentType } from "./config";

/**
 * Check if a user role has permission for a specific action on a resource
 */
export function canPerformAction(
  user: AuthUser | null,
  resource: string,
  action: ActionType
): boolean {
  if (!user?.role) return false;

  // Admin roles have all permissions
  if (user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN) {
    return true;
  }

  // Get resource permissions
  const resourcePerms = GLOBAL_PERMISSIONS[resource];
  
  if (resourcePerms?.actions?.[action]) {
    return resourcePerms.actions[action]!.includes(user.role);
  }

  // Fall back to default permissions
  const defaultPerms = DEFAULT_ACTION_PERMISSIONS[action];
  return defaultPerms ? defaultPerms.includes(user.role) : false;
}

/**
 * Check if a user role can view a specific UI component (tab, section, button)
 */
export function canViewUIComponent(
  user: AuthUser | null,
  resource: string,
  componentType: UIComponentType,
  componentId: string
): boolean {
  if (!user?.role) return false;

  // Admin roles can view all UI components
  if (user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN) {
    return true;
  }

  // Get resource permissions
  const resourcePerms = GLOBAL_PERMISSIONS[resource];
  if (!resourcePerms?.ui) return false;

  // Check based on component type
  switch (componentType) {
    case "tab":
      if (resourcePerms.ui.tabs) {
        const allowedRoles = resourcePerms.ui.tabs[componentId];
        return allowedRoles ? allowedRoles.includes(user.role) : false;
      }
      break;
    case "section":
      if (resourcePerms.ui.sections) {
        const allowedRoles = resourcePerms.ui.sections[componentId];
        return allowedRoles ? allowedRoles.includes(user.role) : false;
      }
      break;
    case "button":
      if (resourcePerms.ui.buttons) {
        const allowedRoles = resourcePerms.ui.buttons[componentId];
        return allowedRoles ? allowedRoles.includes(user.role) : false;
      }
      break;
  }

  return false;
}

/**
 * Get all visible tabs for a user in a resource
 */
export function getVisibleTabs(
  user: AuthUser | null,
  resource: string
): string[] {
  if (!user?.role) return [];

  const resourcePerms = GLOBAL_PERMISSIONS[resource];
  if (!resourcePerms?.ui?.tabs) return [];

  const visibleTabs: string[] = [];

  // Admin roles see all tabs
  if (user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN) {
    return Object.keys(resourcePerms.ui.tabs);
  }

  // Filter tabs based on user role
  Object.entries(resourcePerms.ui.tabs).forEach(([tabId, allowedRoles]) => {
    if (allowedRoles.includes(user.role)) {
      visibleTabs.push(tabId);
    }
  });

  return visibleTabs;
}

/**
 * Get all visible sections for a user in a resource
 */
export function getVisibleSections(
  user: AuthUser | null,
  resource: string
): string[] {
  if (!user?.role) return [];

  const resourcePerms = GLOBAL_PERMISSIONS[resource];
  if (!resourcePerms?.ui?.sections) return [];

  const visibleSections: string[] = [];

  // Admin roles see all sections
  if (user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN) {
    return Object.keys(resourcePerms.ui.sections);
  }

  // Filter sections based on user role
  Object.entries(resourcePerms.ui.sections).forEach(([sectionId, allowedRoles]) => {
    if (allowedRoles.includes(user.role)) {
      visibleSections.push(sectionId);
    }
  });

  return visibleSections;
}

/**
 * Get all visible buttons for a user in a resource
 */
export function getVisibleButtons(
  user: AuthUser | null,
  resource: string
): string[] {
  if (!user?.role) return [];

  const resourcePerms = GLOBAL_PERMISSIONS[resource];
  if (!resourcePerms?.ui?.buttons) return [];

  const visibleButtons: string[] = [];

  // Admin roles see all buttons
  if (user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN) {
    return Object.keys(resourcePerms.ui.buttons);
  }

  // Filter buttons based on user role
  Object.entries(resourcePerms.ui.buttons).forEach(([buttonId, allowedRoles]) => {
    if (allowedRoles.includes(user.role)) {
      visibleButtons.push(buttonId);
    }
  });

  return visibleButtons;
}

/**
 * Filter tabs array based on user permissions
 * Useful for filtering TabItem arrays in components
 */
export function filterTabsByPermission<T extends { value: string }>(
  user: AuthUser | null,
  resource: string,
  tabs: T[]
): T[] {
  if (!user?.role) return [];

  const visibleTabIds = getVisibleTabs(user, resource);
  return tabs.filter((tab) => visibleTabIds.includes(tab.value));
}

/**
 * Check if user can create in a resource
 */
export function canCreate(user: AuthUser | null, resource: string): boolean {
  return canPerformAction(user, resource, "create");
}

/**
 * Check if user can edit in a resource
 */
export function canEdit(user: AuthUser | null, resource: string): boolean {
  return canPerformAction(user, resource, "edit");
}

/**
 * Check if user can delete in a resource
 */
export function canDelete(user: AuthUser | null, resource: string): boolean {
  return canPerformAction(user, resource, "delete");
}

/**
 * Check if user can view a resource
 */
export function canView(user: AuthUser | null, resource: string): boolean {
  return canPerformAction(user, resource, "view");
}

/**
 * Check if user can export from a resource
 */
export function canExport(user: AuthUser | null, resource: string): boolean {
  return canPerformAction(user, resource, "export");
}

/**
 * Check if user can import to a resource
 */
export function canImport(user: AuthUser | null, resource: string): boolean {
  return canPerformAction(user, resource, "import");
}

/**
 * Get the default tab for a resource based on user role
 * Returns the first visible tab for the user, or a specified default
 */
export function getDefaultTab(
  user: AuthUser | null,
  resource: string,
  preferredDefault?: string
): string | null {
  if (!user?.role) return preferredDefault || null;

  const visibleTabs = getVisibleTabs(user, resource);
  if (visibleTabs.length === 0) return preferredDefault || null;

  // If preferred default is visible, use it
  if (preferredDefault && visibleTabs.includes(preferredDefault)) {
    return preferredDefault;
  }

  // Otherwise return the first visible tab
  return visibleTabs[0];
}

