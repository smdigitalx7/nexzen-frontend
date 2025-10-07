import { useMemo } from "react";
import { Edit, Trash2, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DataTableWithFilters, ConfirmDialog } from "@/components/shared";
import { CombinationRead } from "@/lib/types/college";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createCurrencyColumn,
  createCountBadgeColumn,
  createBadgeColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

interface CombinationsTableProps {
  combinations: CombinationRead[];
  isLoading: boolean;
  onAddCombination: () => void;
  onEditCombination: (combination: CombinationRead) => void;
  onDeleteCombination: (id: number) => void;
  onViewCombination: (combination: CombinationRead) => void;
}

export const CombinationsTable = ({
  combinations,
  isLoading,
  onAddCombination,
  onEditCombination,
  onDeleteCombination,
  onViewCombination,
}: CombinationsTableProps) => {
  // Define columns for the data table
  const columns: ColumnDef<CombinationRead>[] = useMemo(() => [
    createTextColumn<CombinationRead>("group_name", { header: "Group", className: "font-medium" }),
    createTextColumn<CombinationRead>("course_name", { header: "Course", className: "font-medium" }),
    createCurrencyColumn<CombinationRead>("combination_fee", { header: "Combination Fee" }),
    createCountBadgeColumn<CombinationRead>("students_count", { header: "Students", fallback: "students" }),
    createBadgeColumn<CombinationRead>("active", { header: "Status", variant: "outline", fallback: "Inactive" }),
    createActionColumn<CombinationRead>([
      createViewAction((row) => onViewCombination(row)),
      createEditAction((row) => onEditCombination(row)),
      createDeleteAction((row) => onDeleteCombination(row.id))
    ])
  ], [onViewCombination, onEditCombination, onDeleteCombination]);

  if (isLoading) {
    return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
    );
  }

  return (
    <DataTableWithFilters
      data={combinations}
      columns={columns}
      title="Group-Course Combinations"
      description="Manage group and course combinations with their fees"
      searchKey="group_name"
      exportable={true}
      onAdd={onAddCombination}
    />
  );
};
