import React, { useState, useMemo } from "react";
import { Label } from "@/common/components/ui/label";
import { FormDialog } from "@/common/components/shared";
import { UserCheck, ClipboardList } from "lucide-react";
import { useTeachersByBranch, useEmployeesByBranch } from "@/features/general/hooks";
import {
  useTeacherClassSubjectsHierarchical,
  useCreateTeacherClassSubject,
  useDeleteTeacherClassSubject,
  useSchoolClasses,
  useSchoolSectionsByClass,
  useSchoolSubjects,
} from "@/features/school/hooks";
import { useToast } from "@/common/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { TeacherAssignmentsTab } from "./TeacherAssignmentsTab";
import { ClassTeacherTab } from "./ClassTeacherTab";
import { useEffect, useCallback } from "react";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { useUrlState } from "@/common/hooks/useUrlState";
import { useEmployeesMinimal } from "@/features/general/hooks";

export const TeachersTab = () => {
  // ✅ OPTIMIZATION: Only fetch assignments data - teachers/employees/classes/subjects fetched on-demand when dialog opens
  // User requirement: Don't call Teachers, Classes APIs - only call when clicking dropdowns (add teacher subjects)
  const { data: hierarchicalAssignments = [], isLoading: assignmentsLoading } =
    useTeacherClassSubjectsHierarchical();

  const createMutation = useCreateTeacherClassSubject();
  const deleteMutation = useDeleteTeacherClassSubject();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useUrlState("subtab", "assignments");

  // Form state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // ✅ OPTIMIZATION: Track dropdown open states for on-demand fetching
  const [teachersDropdownOpen, setTeachersDropdownOpen] = useState(false);
  const [classesDropdownOpen, setClassesDropdownOpen] = useState(false);
  const [subjectsDropdownOpen, setSubjectsDropdownOpen] = useState(false);

  // Fetch teachers/employees when dropdown is opened OR when Teacher Assignments tab is active (so export has employee code & phone)
  const { data: teachersList = [], error, isLoading: isLoadingTeachers } = useTeachersByBranch(teachersDropdownOpen || activeSubTab === "assignments");
  const { data: allEmployeesData, isLoading: isLoadingEmployees } = useEmployeesByBranch(
    teachersDropdownOpen || activeSubTab === "assignments",
    1,
    100
  );

  // ✅ FIX: Handle paginated employee data and direct arrays
  const allEmployees = useMemo(() => {
    if (!allEmployeesData) return [];
    const raw: any = allEmployeesData;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
      return raw.data;
    }
    return [];
  }, [allEmployeesData]);

  // Create a map of full employee details by employee_id for quick lookup
  const teacherDetailsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(allEmployees)) {
      allEmployees.forEach((employee: any) => {
        map.set(employee.employee_id, employee);
      });
    }
    return map;
  }, [allEmployees]);

  // ✅ OPTIMIZATION: Only fetch classes when classes dropdown is opened
  // User requirement: Don't call Classes API - only call when clicking dropdowns
  const { data: classes = [], isLoading: isLoadingClasses } = useSchoolClasses({ enabled: classesDropdownOpen });

  // Get sections based on selected class - only fetch when classes dropdown was opened AND class is selected
  const { data: sections = [], isLoading: isLoadingSections } = useSchoolSectionsByClass(
    classesDropdownOpen && selectedClassId ? parseInt(selectedClassId) : null
  );

  // ✅ OPTIMIZATION: Only fetch subjects when subjects dropdown is opened
  // User requirement: Don't call Subjects API - only call when clicking dropdowns
  const { data: subjects = [], isLoading: isLoadingSubjects } = useSchoolSubjects({ enabled: subjectsDropdownOpen });

  const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(
    new Set()
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

  const { toast } = useToast();

  const toggleTeacher = (teacherId: number) => {
    setExpandedTeachers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const resetForm = () => {
    setSelectedTeacherId("");
    setSelectedClassId("");
    setSelectedSectionId("");
    setSelectedSubjectId("");
    setIsClassTeacher(false);
    setIsActive(true);
  };

  const handleAddClick = () => {
    setIsAddOpen(true);
    toast({
      title: "Add Assignment",
      description: "Select teacher, class, section, and subject to assign",
    });
  };

  const handleDelete = async (
    teacherId: number,
    classId: number,
    subjectId: number,
    sectionId: number
  ) => {
    try {
      await deleteMutation.mutateAsync({
        teacherId,
        classId,
        subjectId,
        sectionId,
      });
      // Toast handled by mutation hook
    } catch (error: any) {
      // Error toast is handled by mutation hook
    }
  };

  const handleFormSubmit = async () => {
    if (
      !selectedTeacherId ||
      !selectedClassId ||
      !selectedSectionId ||
      !selectedSubjectId
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        teacher_id: parseInt(selectedTeacherId),
        class_id: parseInt(selectedClassId),
        section_id: parseInt(selectedSectionId),
        subject_id: parseInt(selectedSubjectId),
        is_class_teacher: isClassTeacher,
        is_active: isActive,
      });

      resetForm();
      setIsAddOpen(false);
      // Toast handled by mutation hook
    } catch (error: any) {
      // Error toast is handled by mutation hook
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading teachers</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid grid-cols-2 w-auto max-w-md">
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Teacher Assignments
          </TabsTrigger>
          <TabsTrigger
            value="class-teacher"
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Class Teacher
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-6">
          <TeacherAssignmentsTab
            hierarchicalAssignments={hierarchicalAssignments}
            assignmentsLoading={assignmentsLoading}
            teacherDetailsMap={teacherDetailsMap}
            expandedTeachers={expandedTeachers}
            toggleTeacher={toggleTeacher}
            handleDelete={handleDelete}
            handleAddClick={handleAddClick}
          />
        </TabsContent>

        <TabsContent value="class-teacher" className="mt-6">
          <ClassTeacherTab />
        </TabsContent>
      </Tabs>

      <FormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            resetForm();
          }
        }}
        title="Assign Teacher to Subject"
        description="Assign a teacher to a class, section, and subject"
        onSave={handleFormSubmit}
        onCancel={() => {
          setIsAddOpen(false);
          resetForm();
        }}
        saveText="Assign"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher *</Label>
            <ServerCombobox
              items={Array.isArray(teachersList) ? teachersList : []}
              isLoading={isLoadingTeachers}
              value={selectedTeacherId}
              onSelect={setSelectedTeacherId}
              labelKey="employee_name"
              valueKey="employee_id"
              placeholder="Select teacher..."
              searchPlaceholder="Search teacher name..."
              emptyText="No teachers found"
              onDropdownOpen={setTeachersDropdownOpen}
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <ServerCombobox
              items={Array.isArray(classes) ? classes : []}
              isLoading={isLoadingClasses}
              value={selectedClassId}
              onSelect={(val) => {
                setSelectedClassId(val);
                setSelectedSectionId("");
              }}
              labelKey="class_name"
              valueKey="class_id"
              placeholder="Select class..."
              searchPlaceholder="Search class..."
              onDropdownOpen={setClassesDropdownOpen}
            />
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <ServerCombobox
              items={Array.isArray(sections) ? sections : []}
              isLoading={isLoadingSections}
              value={selectedSectionId}
              onSelect={setSelectedSectionId}
              labelKey="section_name"
              valueKey="section_id"
              placeholder={selectedClassId ? "Select section..." : "Select class first"}
              disabled={!selectedClassId}
            />
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <ServerCombobox
              items={Array.isArray(subjects) ? subjects : []}
              isLoading={isLoadingSubjects}
              value={selectedSubjectId}
              onSelect={setSelectedSubjectId}
              labelKey="subject_name"
              valueKey="subject_id"
              placeholder="Select subject..."
              searchPlaceholder="Search subject..."
              onDropdownOpen={setSubjectsDropdownOpen}
            />
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {/* <div className="flex items-center space-x-2">
              <Checkbox
                id="is_class_teacher"
                checked={isClassTeacher}
                onCheckedChange={(checked) =>
                  setIsClassTeacher(checked as boolean)
                }
              />
              <Label
                htmlFor="is_class_teacher"
                className="text-sm font-normal cursor-pointer"
              >
                Class Teacher
              </Label>
            </div> */}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label
                htmlFor="is_active"
                className="text-sm font-normal cursor-pointer"
              >
                Active
              </Label>
            </div>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
