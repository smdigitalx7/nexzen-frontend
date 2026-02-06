import React, { useState, useMemo } from "react";
import { Badge } from "@/common/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { Label } from "@/common/components/ui/label";
import { FormDialog } from "@/common/components/shared";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/common/components/shared";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
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
import { useEffect, useCallback } from "react";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";

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

  // ✅ GLOBAL MODAL GUARDIAN: Ensure UI is unlocked when no modals are open
  useEffect(() => {
    if (!isAddOpen) {
      const timer = setTimeout(() => {
        cleanupDialogState();
      }, 100);
      
      const longTimer = setTimeout(() => {
        cleanupDialogState();
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(longTimer);
      };
    }
  }, [isAddOpen]);

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
        section_id: ct.section_id ?? undefined,
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
        id: "class_section",
        header: "Class & Section",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {row.original.class_name}
            </Badge>
            {row.original.section_name && (
              <>
                <span className="text-muted-foreground">-</span>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  {row.original.section_name}
                </Badge>
              </>
            )}
          </div>
        ),
      },
    ],
    []
  );

  // Memoized actions for DataTable V2
  const actions: ActionConfig<ClassTeacherData>[] = useMemo(
    () => {
      const acts: ActionConfig<ClassTeacherData>[] = [];
      
      if (canDeleteClassTeacher) {
        acts.push({
          id: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onClick: (row) => handleDelete(row),
        });
      }
      return acts;
    },
    [canDeleteClassTeacher]
  );

  return (
    <React.Fragment>
      <DataTable
        data={classTeachers as ClassTeacherData[]}
        columns={columns}
        title="Class Teacher Assignments"
        searchKey="teacher_name"
        searchPlaceholder="Search by teacher name..."
        loading={assignmentsLoading}
        export={{ enabled: true }}
        onAdd={canAssignClassTeacher ? handleAddClick : undefined}
        addButtonText="Assign Class Teacher"
        actions={actions}
        actionsHeader="Actions"
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
            <ServerCombobox
              items={Array.isArray(allEmployees) ? allEmployees : []}
              value={selectedTeacherId}
              onSelect={setSelectedTeacherId}
              onDropdownOpen={setTeachersDropdownOpen}
              labelKey="employee_name"
              valueKey="employee_id"
              placeholder="Select teacher"
              searchPlaceholder="Search teacher..."
              emptyText="No teachers found"
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <ServerCombobox
              items={Array.isArray(classes) ? classes : []}
              value={selectedClassId}
              onSelect={(value: string) => {
                setSelectedClassId(value);
                setSelectedSectionId(""); // Reset section when class changes
              }}
              onDropdownOpen={setClassesDropdownOpen}
              labelKey="class_name"
              valueKey="class_id"
              placeholder="Select class"
              searchPlaceholder="Search class..."
              emptyText="No classes found"
            />
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Section (Optional)</Label>
            <ServerCombobox
              items={Array.isArray(sections) ? sections : []}
              value={selectedSectionId}
              onSelect={setSelectedSectionId}
              labelKey="section_name"
              valueKey="section_id"
              placeholder={
                !selectedClassId
                  ? "Select class first"
                  : sections.length === 0
                  ? "No sections available"
                  : "Select section (optional)"
              }
              searchPlaceholder="Search section..."
              emptyText="No sections found"
              disabled={!selectedClassId || sections.length === 0}
            />
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
