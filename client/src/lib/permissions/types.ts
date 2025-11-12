import type { UserRole } from "@/lib/constants";
import type { ActionType, UIComponentType } from "./config";

/**
 * Permission check result
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * UI Component permission configuration
 */
export interface UIComponentPermission {
  componentId: string;
  componentType: UIComponentType;
  allowedRoles: UserRole[];
}

/**
 * Action permission configuration
 */
export interface ActionPermission {
  action: ActionType;
  allowedRoles: UserRole[];
}

/**
 * Resource permission summary
 */
export interface ResourcePermissionSummary {
  resource: string;
  actions: Record<ActionType, boolean>;
  ui: {
    tabs: Record<string, boolean>;
    sections: Record<string, boolean>;
    buttons: Record<string, boolean>;
  };
}

