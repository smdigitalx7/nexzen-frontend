/**
 * Reusable Dropdown Components
 * 
 * Professional, consistent dropdown components for use throughout the frontend.
 * 
 * Features:
 * - Loading states with spinners
 * - Error states with retry options
 * - Empty states with custom messages
 * - Consistent styling
 * - Type-safe with TypeScript
 * - Accessible
 * 
 * Usage:
 * ```tsx
 * import { SchoolClassDropdown, CollegeGroupDropdown, BusRouteDropdown } from "@/components/shared/Dropdowns";
 * 
 * <SchoolClassDropdown
 *   value={selectedClass}
 *   onChange={(value) => setSelectedClass(value)}
 *   placeholder="Select class"
 * />
 * ```
 */

// Base component
export { BaseDropdown } from "./BaseDropdown";
export type { BaseDropdownProps } from "./BaseDropdown";

// School dropdowns
export * from "./School";

// College dropdowns
export * from "./College";

// Shared dropdowns
export * from "./Shared";

