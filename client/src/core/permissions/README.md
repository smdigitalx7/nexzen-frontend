# Global Permissions System

A centralized permission management system for controlling UI visibility and action permissions based on user roles.

## Overview

This system allows you to configure:
- **UI Component Visibility**: Which tabs, sections, and buttons are visible to which roles
- **Action Permissions**: Which actions (create, edit, delete, view, export, import) are allowed for which roles

## Configuration

All permissions are configured in `config.ts`. The configuration follows this structure:

```typescript
{
  resource: "students",
  actions: {
    create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC],
  },
  ui: {
    tabs: {
      "section-mapping": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      "enrollments": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      "transport": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
  },
}
```

## Usage Examples

### 1. Check Action Permissions

```tsx
import { useCanCreate, useCanEdit, useCanDelete } from '@/lib/permissions';

function StudentManagement() {
  const canCreate = useCanCreate('students');
  const canEdit = useCanEdit('students');
  const canDelete = useCanDelete('students');

  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>Create Student</Button>
      )}
      {canEdit && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      {canDelete && (
        <Button onClick={handleDelete}>Delete</Button>
      )}
    </div>
  );
}
```

### 2. Filter Tabs by Permission

```tsx
import { useFilteredTabs } from '@/lib/permissions';

function StudentManagement() {
  const allTabs = [
    { value: "section-mapping", label: "Section Mapping", icon: LayoutGrid, content: <SectionMappingTab /> },
    { value: "enrollments", label: "Enrollments", icon: IdCard, content: <EnrollmentsTab /> },
    { value: "transport", label: "Transport", icon: MapPin, content: <TransportTab /> },
  ];

  // Automatically filters tabs based on user role
  const visibleTabs = useFilteredTabs('students', allTabs);

  return (
    <TabSwitcher
      tabs={visibleTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
```

### 3. Check UI Component Visibility

```tsx
import { useCanViewUIComponent } from '@/lib/permissions';

function StudentManagement() {
  const canViewSectionMapping = useCanViewUIComponent('students', 'tab', 'section-mapping');
  const canViewEnrollments = useCanViewUIComponent('students', 'tab', 'enrollments');
  const canViewTransport = useCanViewUIComponent('students', 'tab', 'transport');

  return (
    <div>
      {canViewSectionMapping && <SectionMappingTab />}
      {canViewEnrollments && <EnrollmentsTab />}
      {canViewTransport && <TransportTab />}
    </div>
  );
}
```

### 4. Get All Visible Components

```tsx
import { useVisibleTabs, useVisibleSections } from '@/lib/permissions';

function StudentManagement() {
  const visibleTabIds = useVisibleTabs('students');
  const visibleSectionIds = useVisibleSections('students');

  // visibleTabIds: ['section-mapping', 'enrollments', 'transport'] for ADMIN
  // visibleTabIds: ['enrollments', 'transport'] for ACCOUNTANT
  // visibleTabIds: ['enrollments'] for ACADEMIC
}
```

### 5. Comprehensive Resource Permissions

```tsx
import { useResourcePermissions } from '@/lib/permissions';

function StudentManagement() {
  const permissions = useResourcePermissions('students');

  // permissions.canCreate
  // permissions.canEdit
  // permissions.canDelete
  // permissions.canView
  // permissions.canExport
  // permissions.visibleTabs
  // permissions.visibleSections
  // permissions.visibleButtons
}
```

### 6. Using Utility Functions (Outside React Components)

```tsx
import { canCreate, canEdit, filterTabsByPermission } from '@/lib/permissions';
import { useAuthStore } from '@/store/authStore';

// In a non-React context or utility function
const user = useAuthStore.getState().user;
if (canCreate(user, 'students')) {
  // Allow creation
}

const filteredTabs = filterTabsByPermission(user, 'students', allTabs);
```

## Available Hooks

- `useCanCreate(resource)` - Check if user can create
- `useCanEdit(resource)` - Check if user can edit
- `useCanDelete(resource)` - Check if user can delete
- `useCanView(resource)` - Check if user can view
- `useCanExport(resource)` - Check if user can export
- `useCanImport(resource)` - Check if user can import
- `useCanPerformAction(resource, action)` - Check any action
- `useCanViewUIComponent(resource, type, id)` - Check UI component visibility
- `useVisibleTabs(resource)` - Get visible tab IDs
- `useVisibleSections(resource)` - Get visible section IDs
- `useVisibleButtons(resource)` - Get visible button IDs
- `useFilteredTabs(resource, tabs)` - Filter tabs array by permission
- `useResourcePermissions(resource)` - Get all permissions for a resource

## Available Utility Functions

- `canCreate(user, resource)`
- `canEdit(user, resource)`
- `canDelete(user, resource)`
- `canView(user, resource)`
- `canExport(user, resource)`
- `canImport(user, resource)`
- `canPerformAction(user, resource, action)`
- `canViewUIComponent(user, resource, type, id)`
- `getVisibleTabs(user, resource)`
- `getVisibleSections(user, resource)`
- `getVisibleButtons(user, resource)`
- `filterTabsByPermission(user, resource, tabs)`

## Adding New Permissions

To add permissions for a new resource:

1. Open `config.ts`
2. Add a new entry to `GLOBAL_PERMISSIONS`:

```typescript
new_resource: {
  resource: "new_resource",
  actions: {
    create: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    edit: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    delete: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
    view: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
  },
  ui: {
    tabs: {
      "tab1": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN],
      "tab2": [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
    },
  },
},
```

## Role Hierarchy

- **ADMIN** & **INSTITUTE_ADMIN**: Full access to everything (automatically granted)
- **ACCOUNTANT**: Financial operations, reservations, admissions
- **ACADEMIC**: Academic operations, students, attendance, marks

## Notes

- Admin roles (ADMIN, INSTITUTE_ADMIN) automatically have all permissions
- If a resource is not configured, default permissions apply (ADMIN/INSTITUTE_ADMIN only)
- All permission checks are memoized for performance
- The system is type-safe with full TypeScript support

