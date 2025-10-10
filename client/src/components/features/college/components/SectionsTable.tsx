import { useMemo } from "react";
import { Edit, Trash2, Eye, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableWithFilters, ConfirmDialog } from "@/components/shared";
import { SectionRead } from "@/lib/types/college/college";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createBadgeColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

interface SectionsTableProps {
  sections: SectionRead[];
  isLoading: boolean;
  onAddSection: () => void;
  onEditSection: (section: SectionRead) => void;
  onDeleteSection: (id: number) => void;
  onViewSection: (section: SectionRead) => void;
}

export const SectionsTable = ({
  sections,
  isLoading,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onViewSection,
}: SectionsTableProps) => {
  // Define columns for the data table
  const columns: ColumnDef<SectionRead>[] = useMemo(() => [
    createTextColumn<SectionRead>("section_name", { header: "Section", className: "font-medium" }),
    createTextColumn<SectionRead>("combination_name", { header: "Combination" }),
    createTextColumn<SectionRead>("academic_year", { header: "Academic Year", className: "text-sm" }),
    createBadgeColumn<SectionRead>("active", { header: "Status", variant: "outline", fallback: "Inactive" }),
    createActionColumn<SectionRead>([
      createViewAction((row) => onViewSection(row)),
      createEditAction((row) => onEditSection(row)),
      createDeleteAction((row) => onDeleteSection(row.id))
    ])
  ], [onViewSection, onEditSection, onDeleteSection]);

  if (isLoading) {
    return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
    );
  }

  return (
    <DataTableWithFilters
      data={sections}
      columns={columns}
      title="Sections"
      description="Manage academic sections and their capacity"
      searchKey="section_name"
      exportable={true}
      onAdd={onAddSection}
    />
  );
};
