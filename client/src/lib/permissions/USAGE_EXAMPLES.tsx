/**
 * Usage Examples for Global Permissions System
 * 
 * This file demonstrates how to use the permissions system in your components.
 * Copy and adapt these patterns to your actual components.
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { TabSwitcher } from "@/components/shared";
import {
  useCanCreate,
  useCanEdit,
  useCanDelete,
  useFilteredTabs,
  useResourcePermissions,
  useCanViewUIComponent,
} from "@/lib/permissions";

// ==================== Example 1: Action Buttons ====================
export function ExampleActionButtons() {
  const canCreate = useCanCreate("students");
  const canEdit = useCanEdit("students");
  const canDelete = useCanDelete("students");

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button onClick={() => console.log("Create")}>Create Student</Button>
      )}
      {canEdit && (
        <Button onClick={() => console.log("Edit")}>Edit Student</Button>
      )}
      {canDelete && (
        <Button variant="destructive" onClick={() => console.log("Delete")}>
          Delete Student
        </Button>
      )}
    </div>
  );
}

// ==================== Example 2: Filtered Tabs ====================
interface TabItem {
  value: string;
  label: string;
  icon: React.ComponentType;
  content: React.ReactNode;
}

export function ExampleFilteredTabs() {
  const allTabs: TabItem[] = [
    {
      value: "section-mapping",
      label: "Section Mapping",
      icon: () => <span>📋</span>,
      content: <div>Section Mapping Content</div>,
    },
    {
      value: "enrollments",
      label: "Enrollments",
      icon: () => <span>📝</span>,
      content: <div>Enrollments Content</div>,
    },
    {
      value: "transport",
      label: "Transport",
      icon: () => <span>🚌</span>,
      content: <div>Transport Content</div>,
    },
  ];

  // Automatically filters based on user role
  // ADMIN sees all 3 tabs
  // ACCOUNTANT sees enrollments + transport (2 tabs)
  // ACADEMIC sees only enrollments (1 tab)
  const visibleTabs = useFilteredTabs("students", allTabs);
  const [activeTab, setActiveTab] = React.useState(visibleTabs[0]?.value || "");

  return (
    <TabSwitcher
      tabs={visibleTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

// ==================== Example 3: Comprehensive Permissions ====================
export function ExampleComprehensivePermissions() {
  const permissions = useResourcePermissions("students");

  return (
    <div>
      <h2>Student Management</h2>
      
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        {permissions.canCreate && (
          <Button>Create</Button>
        )}
        {permissions.canEdit && (
          <Button>Edit</Button>
        )}
        {permissions.canDelete && (
          <Button variant="destructive">Delete</Button>
        )}
        {permissions.canExport && (
          <Button variant="outline">Export</Button>
        )}
      </div>

      {/* Tabs */}
      <div>
        <p>Visible Tabs: {permissions.visibleTabs.join(", ")}</p>
        {/* Render tabs based on permissions.visibleTabs */}
      </div>
    </div>
  );
}

// ==================== Example 4: Conditional UI Components ====================
export function ExampleConditionalUI() {
  const canViewSectionMapping = useCanViewUIComponent(
    "students",
    "tab",
    "section-mapping"
  );
  const canViewEnrollments = useCanViewUIComponent(
    "students",
    "tab",
    "enrollments"
  );
  const canViewTransport = useCanViewUIComponent("students", "tab", "transport");

  return (
    <div>
      {canViewSectionMapping && (
        <div>
          <h3>Section Mapping</h3>
          {/* Section Mapping Content */}
        </div>
      )}
      {canViewEnrollments && (
        <div>
          <h3>Enrollments</h3>
          {/* Enrollments Content */}
        </div>
      )}
      {canViewTransport && (
        <div>
          <h3>Transport</h3>
          {/* Transport Content */}
        </div>
      )}
    </div>
  );
}

// ==================== Example 5: Table Actions ====================
interface Student {
  id: string;
  name: string;
}

export function ExampleTableActions() {
  const canEdit = useCanEdit("students");
  const canDelete = useCanDelete("students");
  const canExport = useCanExport("students");

  const handleEdit = (student: Student) => {
    if (!canEdit) return;
    console.log("Edit student", student);
  };

  const handleDelete = (student: Student) => {
    if (!canDelete) return;
    console.log("Delete student", student);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example row */}
          <tr>
            <td>John Doe</td>
            <td>
              <div className="flex gap-2">
                {canEdit && (
                  <Button size="sm" onClick={() => handleEdit({ id: "1", name: "John Doe" })}>
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete({ id: "1", name: "John Doe" })}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      {canExport && (
        <Button className="mt-4" onClick={() => console.log("Export")}>
          Export to Excel
        </Button>
      )}
    </div>
  );
}

