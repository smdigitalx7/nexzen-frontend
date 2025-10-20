// Shared Components
export { EnhancedDataTable } from './EnhancedDataTable';
export { FormDialog } from './FormDialog';
export { ConfirmDialog } from './ConfirmDialog';
export { TabSwitcher } from './TabSwitcher';
export { default as ViewDialog } from './ViewDialog';

// ViewDialog Types and Utilities
export type {
  ViewDialogField,
  ViewDialogSection,
  ViewDialogAction,
  ViewDialogProps,
} from './ViewDialog';

export {
  formatCurrency,
  formatDate,
  getIconColorClasses,
  getBadgeVariant,
  getButtonVariant,
  renderFieldValue,
} from './ViewDialog';

// Dashboard Components
export * from './dashboard';

