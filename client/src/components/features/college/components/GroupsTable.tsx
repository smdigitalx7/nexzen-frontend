import { useMemo } from "react";
import { Edit, Trash2, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DataTableWithFilters, ConfirmDialog } from "@/components/shared";
import { GroupRead } from "@/lib/types/college/college";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createTruncatedTextColumn,
  createCurrencyColumn,
  createCountBadgeColumn,
  createBadgeColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

interface GroupsTableProps {
  groups: GroupRead[];
  isLoading: boolean;
  onAddGroup: () => void;
  onEditGroup: (group: GroupRead) => void;
  onDeleteGroup: (id: number) => void;
  onViewGroup: (group: GroupRead) => void;
}

export const GroupsTable = ({
  groups,
  isLoading,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onViewGroup,
}: GroupsTableProps) => {
  // Define columns for the data table
  const columns: ColumnDef<GroupRead>[] = useMemo(() => [
    createTextColumn<GroupRead>("group_name", { header: "Group Name", className: "font-medium" }),
    createTextColumn<GroupRead>("group_code", { header: "Code", className: "font-mono text-sm" }),
    createTruncatedTextColumn<GroupRead>("description", { header: "Description" }),
    createCurrencyColumn<GroupRead>("group_fee", { header: "Fee" }),
    createCountBadgeColumn<GroupRead>("students_count", { header: "Students", fallback: "students" }),
    createBadgeColumn<GroupRead>("active", { header: "Status", variant: "outline", fallback: "Inactive" }),
    createActionColumn<GroupRead>([
      createViewAction((row) => onViewGroup(row)),
      createEditAction((row) => onEditGroup(row)),
      createDeleteAction((row) => onDeleteGroup(row.id))
    ])
  ], [onViewGroup, onEditGroup, onDeleteGroup]);

  if (isLoading) {
    return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
    );
  }

  return (
    <DataTableWithFilters
      data={groups}
      columns={columns}
      title="Subject Groups"
      description="Manage subject groups and their fees"
      searchKey="group_name"
      exportable={true}
      onAdd={onAddGroup}
    />
  );
};
