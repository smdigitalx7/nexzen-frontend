/**
 * Global Permissions System
 * 
 * Centralized permission management for UI components and actions
 * 
 * Usage:
 * ```tsx
 * import { useCanCreate, useCanEdit, useFilteredTabs } from '@/lib/permissions';
 * 
 * // In component
 * const canCreate = useCanCreate('students');
 * const canEdit = useCanEdit('students');
 * const filteredTabs = useFilteredTabs('students', allTabs);
 * ```
 */

// Configuration
export * from "./config";
export type { ResourcePermission } from "./config";

// Types
export * from "./types";

// Utilities
export * from "./utils";

// Hooks
export * from "./hooks";

