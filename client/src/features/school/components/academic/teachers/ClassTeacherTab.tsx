import React, { useState, useMemo } from "react";
import { Badge } from "@/common/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { Label } from "@/common/components/ui/label";
import { FormDialog } from "@/common/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/common/components/shared";
import { createTextColumn } from "@/common/utils/factory/columnFactories";
import {
  useClassTeachers,
  useCreateClassTeacher,
  useDeleteClassTeacher,
  useSchoolClasses,
  useSchoolSectionsByClass,
} from "@/features/school/hooks";
import { useEmployeesByBranch } from "@/features/general/hooks";
import { useToast } from "@/common/hooks/use-toast";
import { useCanViewUIComponent } from "@/core/permissions";

interface ClassTeacherData {
  id?: number;
  teacher_id: number;
  teacher_name: string;
  class_id: number;
  class_name: string;
  section_id: number | null;
  section_name?: string | null;
  subject_id?: number;
  created_at?: string;
  created_by?: number;
}

export const ClassTeacherTab = () => {
  const { data: classTeachers = [], isLoading: assignmentsLoading } =
    useClassTeachers();
  const createClassTeacherMutation = useCreateClassTeacher();
  const deleteClassTeacherMutation = useDeleteClassTeacher();
  const { toast } = useToast();

  // Permission checks
  const canAssignClassTeacher = useCanViewUIComponent(
    "teachers",
    "button",
    "class-teacher-assign"
  );
  const canDeleteClassTeacher = useCanViewUIComponent(
    "teachers",
    "button",
    "class-teacher-delete"
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  // ✅ OPTIMIZATION: Track dropdown open states for on-demand fetching
  const [teachersDropdownOpen, setTeachersDropdownOpen] = useState(false);
  const [classesDropdownOpen, setClassesDropdownOpen] = useState(false);

  // ✅ OPTIMIZATION: Only fetch employees when teachers dropdown is opened
  // User requirement: Don't call Teachers API - only call when clicking dropdowns
  const { data: allEmployees = [] } =
    useEmployeesByBranch(teachersDropdownOpen);

  // ✅ OPTIMIZATION: Only fetch classes when classes dropdown is opened
  // User requirement: Don't call Classes API - only call when clicking dropdowns
  const { data: classes = [] } = useSchoolClasses({
    enabled: classesDropdownOpen,
  });

  // Get sections based on selected class - only fetch when classes dropdown was opened AND class is selected
  const { data: sections = [] } = useSchoolSectionsByClass(
    classesDropdownOpen && selectedClassId ? parseInt(selectedClassId) : null
  );

  const resetForm = () => {
    setSelectedTeacherId("");
    setSelectedClassId("");
    setSelectedSectionId("");
  };

  const handleAddClick = () => {
    setIsAddOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!selectedTeacherId || !selectedClassId) {
      toast({
        title: "Validation Error",
        description: "Please select teacher and class",
        variant: "destructive",
      });
      return;
    }

    try {
      await createClassTeacherMutation.mutateAsync({
        teacher_id: parseInt(selectedTeacherId),
        class_id: parseInt(selectedClassId),
        ...(selectedSectionId && { section_id: parseInt(selectedSectionId) }),
      });

      resetForm();
      setIsAddOpen(false);
    } catch (error: any) {
      // Error toast handled by mutation hook
    }
  };

  const handleDelete = async (ct: ClassTeacherData) => {
    try {
      await deleteClassTeacherMutation.mutateAsync({
        class_id: ct.class_id,
        section_id: ct.section_id,
      });
    } catch (error: any) {
      // Error toast handled by mutation hook
    }
  };

  // Memoized columns definition
  const columns: ColumnDef<ClassTeacherData>[] = useMemo(
    () => [
      {
        id: "teacher_name",
        header: "Teacher",
        cell: ({ row }) => (
          <div className="font-medium text-base">
            {row.original.teacher_name}
          </div>
        ),
      },
      {
        id: "class_name",
        header: "Class",
        cell: ({ row }) => (
          <span className="text-green-700 font-semibold">
            {row.original.class_name}
          </span>
        ),
      },
      createTextColumn<ClassTeacherData>("section_name", {
        header: "Section",
      }),
    ],
    []
  );

  return (
    <React.Fragment>
      <EnhancedDataTable
        data={classTeachers as ClassTeacherData[]}
        columns={columns}
        title="Class Teacher Assignments"
        searchKey="teacher_name"
        searchPlaceholder="Search by teacher name..."
        loading={assignmentsLoading}
        exportable={true}
        onAdd={canAssignClassTeacher ? handleAddClick : undefined}
        addButtonText="Assign Class Teacher"
        actionButtons={
          canDeleteClassTeacher
            ? [
                {
                  id: "delete",
                  label: "Delete",
                  icon: Trash2,
                  variant: "destructive" as const,
                  size: "sm" as const,
                  onClick: (row) => handleDelete(row),
                  className: "text-red-600 hover:text-red-700 hover:bg-red-50",
                },
              ]
            : []
        }
        actionColumnHeader="Actions"
        showActions={true}
        showActionLabels={true}
      />

      <FormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            resetForm();
          }
        }}
        title="Assign Class Teacher"
        description="Assign a teacher as class teacher for a class"
        onSave={handleFormSubmit}
        onCancel={() => {
          setIsAddOpen(false);
          resetForm();
        }}
        saveText="Assign Class Teacher"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher *</Label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
              onOpenChange={(open) => {
                setTeachersDropdownOpen(open); // ✅ Trigger fetch when dropdown opens
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.map((teacher: any) => (
                  <SelectItem
                    key={teacher.employee_id}
                    value={teacher.employee_id.toString()}
                  >
                    {teacher.employee_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <Select
              value={selectedClassId}
              onValueChange={(value) => {
                setSelectedClassId(value);
                setSelectedSectionId(""); // Reset section when class changes
              }}
              onOpenChange={(open) => {
                setClassesDropdownOpen(open); // ✅ Trigger fetch when dropdown opens
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem
                    key={classItem.class_id}
                    value={classItem.class_id.toString()}
                  >
                    {classItem.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Section (Optional)</Label>
            <Select
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              disabled={!selectedClassId || sections.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedClassId
                      ? "Select class first"
                      : sections.length === 0
                        ? "No sections available"
                        : "Select section (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem
                    key={section.section_id}
                    value={section.section_id.toString()}
                  >
                    {section.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sections.length === 0 && selectedClassId && (
              <p className="text-sm text-muted-foreground">
                This class has no sections
              </p>
            )}
          </div>
        </div>
      </FormDialog>
    </React.Fragment>
  );
};
