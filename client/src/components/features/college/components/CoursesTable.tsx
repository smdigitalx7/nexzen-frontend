import { useMemo } from "react";
import { Edit, Trash2, Eye, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DataTableWithFilters, ConfirmDialog } from "@/components/shared";
import { CourseRead } from "@/lib/types/college/college";
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

interface CoursesTableProps {
  courses: CourseRead[];
  isLoading: boolean;
  onAddCourse: () => void;
  onEditCourse: (course: CourseRead) => void;
  onDeleteCourse: (id: number) => void;
  onViewCourse: (course: CourseRead) => void;
}

export const CoursesTable = ({
  courses,
  isLoading,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourse,
}: CoursesTableProps) => {
  // Define columns for the data table
  const columns: ColumnDef<CourseRead>[] = useMemo(() => [
    createTextColumn<CourseRead>("course_name", { header: "Course Name", className: "font-medium" }),
    createTextColumn<CourseRead>("course_code", { header: "Code", className: "font-mono text-sm" }),
    createTruncatedTextColumn<CourseRead>("description", { header: "Description" }),
    createCurrencyColumn<CourseRead>("course_fee", { header: "Fee" }),
    createCountBadgeColumn<CourseRead>("students_count", { header: "Students", fallback: "students" }),
    createBadgeColumn<CourseRead>("active", { header: "Status", variant: "outline", fallback: "Inactive" }),
    createActionColumn<CourseRead>([
      createViewAction((row) => onViewCourse(row)),
      createEditAction((row) => onEditCourse(row)),
      createDeleteAction((row) => onDeleteCourse(row.id))
    ])
  ], [onViewCourse, onEditCourse, onDeleteCourse]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DataTableWithFilters
      data={courses}
      columns={columns}
      title="Courses"
      description="Manage academic courses and their fees"
      searchKey="course_name"
      exportable={true}
      onAdd={onAddCourse}
    />
  );
};
