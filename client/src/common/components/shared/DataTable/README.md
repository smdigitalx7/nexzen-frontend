# DataTable V2 - Usage Guide

A modular, professional data table with consistent pagination, filtering, and export functionality.

## Quick Start

```tsx
import { DataTable } from "@/common/components/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

interface Student {
  id: number;
  name: string;
  class: string;
  status: "active" | "inactive";
}

const columns: ColumnDef<Student>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "class", header: "Class" },
  { accessorKey: "status", header: "Status" },
];

function StudentsPage() {
  const { data, isLoading } = useStudents();
  
  return (
    <DataTable
      data={data || []}
      columns={columns}
      loading={isLoading}
      searchKey="name"
      searchPlaceholder="Search students..."
      filters={[
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ],
        },
      ]}
      actions={[
        { id: "view", label: "View", icon: Eye, onClick: (row) => handleView(row) },
        { id: "edit", label: "Edit", icon: Edit, onClick: (row) => handleEdit(row) },
      ]}
      onAdd={() => setShowAddDialog(true)}
      addButtonText="Add Student"
      export={{ enabled: true, filename: "students" }}
    />
  );
}
```

## Server-Side Pagination

```tsx
function StudentsWithServerPagination() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useStudents({ page, pageSize });
  
  return (
    <DataTable
      data={data?.items || []}
      columns={columns}
      loading={isLoading}
      pagination="server"
      totalCount={data?.total || 0}
      currentPage={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  );
}
```

## Using Individual Components

For custom layouts, use the composable parts:

```tsx
import {
  DataTableProvider,
  DataTableToolbar,
  DataTableCore,
  DataTablePagination,
} from "@/common/components/shared/DataTable";

function CustomLayout() {
  return (
    <DataTableProvider data={data} searchKey="name">
      <div className="custom-header">
        <DataTableToolbar showSearch filters={filters} />
      </div>
      
      <div className="custom-body">
        <DataTableCore columns={columns} actions={actions} />
      </div>
      
      <div className="custom-footer">
        <DataTablePagination compact />
      </div>
    </DataTableProvider>
  );
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | required | Array of data to display |
| `columns` | `ColumnDef<TData>[]` | required | TanStack Table column definitions |
| `loading` | `boolean` | `false` | Show loading state (skeleton for initial, progress bar for updates) |
| `pagination` | `"client" \| "server" \| "none"` | `"client"` | Pagination mode |
| `searchKey` | `keyof TData` | - | Property to search |
| `filters` | `FilterConfig[]` | `[]` | Filter dropdowns |
| `actions` | `ActionConfig<TData>[]` | `[]` | Row action buttons |
| `export` | `ExportConfig` | - | Enable Excel export |
| `selectable` | `boolean` | `false` | Enable row selection |
| `toolbarLeftContent` | `ReactNode` | - | Custom content on the left side of the toolbar |
| `toolbarMiddleContent` | `ReactNode` | - | Custom content in the middle (ideal for period filters) |
| `toolbarRightContent` | `ReactNode` | - | Custom content on the right side of the toolbar |

## UX Features

### Improved Loading State
The `DataTable` now handles loading states intelligently:
- **Initial Load**: Shows a clean skeleton matching your column structure.
- **Background Refresh**: If data already exists (e.g., during filtering or pagination), the table dims slightly and shows an indeterminate progress bar at the top, preventing the "stuttering" feel of full-page replacements.

### Integrated Filters
Use `toolbarMiddleContent` to keep your complex filters (like Month/Year Period switchers) inside the table component, filling empty space and keeping the UI cohesive.

### Header Integration
For period-based tables (like Leaves or Attendance), it's often better to place filters next to the title instead of inside the toolbar.

Use the `headerContent` prop for this:
```tsx
<DataTable
  title="Employee Leaves"
  headerContent={
    <MonthYearFilter 
      month={month} 
      year={year} 
      onMonthChange={setMonth} 
      onYearChange={setYear} 
    />
  }
  // ... other props
/>
```
This automatically aligns the filters side-by-side with the table title.

## Migration from EnhancedDataTable

```diff
- import { EnhancedDataTable } from "@/common/components/shared";
+ import { DataTable } from "@/common/components/shared/DataTable";

- <EnhancedDataTable
+ <DataTable
    data={data}
    columns={columns}
-   showActions
-   actionButtonGroups={[
-     { type: "view", onClick: handleView },
-     { type: "edit", onClick: handleEdit },
-   ]}
+   actions={[
+     { id: "view", label: "View", icon: Eye, onClick: handleView },
+     { id: "edit", label: "Edit", icon: Edit, onClick: handleEdit },
+   ]}
-   exportable
-   onExport={handleExport}
+   export={{ enabled: true, filename: "export" }}
  />
```
