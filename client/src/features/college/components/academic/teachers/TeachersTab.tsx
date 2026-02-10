import { useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { FormDialog } from "@/common/components/shared";
import { TabSwitcher } from "@/common/components/shared";
import {
  User,
  BookOpen,
  ArrowRight,
  Phone,
  Mail,
  IdCard,
  Briefcase,
  Info,
} from "lucide-react";
import { useEmployeesByBranch } from "@/features/general/hooks";
import { useToast } from "@/common/hooks/use-toast";
import { Badge } from "@/common/components/ui/badge";
import { TeacherCourseSubjectAssignmentsTab } from "./TeacherCourseSubjectAssignmentsTab";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";
import {
  useTeacherCourseSubjectsList,
  useCreateTeacherCourseSubject,
  useDeleteTeacherCourseSubjectRelation,
  useCollegeGroups,
} from "@/features/college/hooks";
import {
  useCollegeCourses,
  useCollegeSubjects,
} from "@/features/college/hooks/use-college-dropdowns";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { Checkbox } from "@/common/components/ui/checkbox";
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';

export const TeachersTab = () => {
  const { data: assignments = [], isLoading: assignmentsLoading } =
    useTeacherCourseSubjectsList();

  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState("teachers");

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [groupsDropdownOpen, setGroupsDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [subjectsDropdownOpen, setSubjectsDropdownOpen] = useState(false);

  const {
    data: allEmployees = [],
    isLoading,
    error,
    refetch: refetchEmployees,
  } = useEmployeesByBranch(true);

  useEffect(() => {
    if (!isAddOpen && !isEditOpen) {
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
  }, [isAddOpen, isEditOpen]);

  const teachers = useMemo(() => {
    if (!Array.isArray(allEmployees)) return [];
    return allEmployees
      .filter((employee: any) => employee.employee_type === "TEACHING")
      .map((employee: any) => ({
        ...employee,
        phone: employee.mobile_no,
        is_active: employee.status === "ACTIVE",
      }));
  }, [allEmployees]);

  const teacherDetailsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(allEmployees)) {
      allEmployees.forEach((employee: any) => {
        map.set(employee.employee_id, employee);
      });
    }
    return map;
  }, [allEmployees]);

  const createMutation = useCreateTeacherCourseSubject();
  const deleteMutation = useDeleteTeacherCourseSubjectRelation();
  const { toast } = useToast();

  const { data: groupsData, isLoading: isLoadingGroups } = useCollegeGroups({
    enabled: groupsDropdownOpen,
  });
  const groups = Array.isArray(groupsData) ? groupsData : [];

  const { data: coursesData, isLoading: isLoadingCourses } = useCollegeCourses(
    coursesDropdownOpen && selectedGroupId ? parseInt(selectedGroupId) : 0,
    { enabled: coursesDropdownOpen && !!selectedGroupId }
  );
  const courses = coursesData?.items || [];

  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
  } = useCollegeSubjects(
    subjectsDropdownOpen && selectedGroupId ? parseInt(selectedGroupId) : 0,
    { enabled: subjectsDropdownOpen && !!selectedGroupId }
  );
  const subjects = subjectsData?.items || [];

  const resetForm = () => {
    setSelectedTeacherId("");
    setSelectedGroupId("");
    setSelectedCourseId("");
    setSelectedSubjectId("");
    setIsActive(true);
  };

  const handleAddClick = () => {
    setIsAddOpen(true);
  };

  const handleDelete = async (
    teacherId: number,
    courseId: number,
    subjectId: number
  ) => {
    try {
      await deleteMutation.mutateAsync({ teacherId, courseId, subjectId });
    } catch (error: any) { }
  };

  const handleFormSubmit = async () => {
    if (!selectedTeacherId || !selectedGroupId || !selectedCourseId || !selectedSubjectId) {
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
        course_id: parseInt(selectedCourseId),
        subject_id: parseInt(selectedSubjectId),
        academic_year_id: 1,
        is_active: isActive,
      });
      resetForm();
      setIsAddOpen(false);
    } catch (error: any) { }
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "employee_name",
        header: "Teacher Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">{row.original.employee_name}</span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                <IdCard className="h-2.5 w-2.5" /> {row.original.employee_id}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
            <Badge variant="outline" className="font-medium bg-slate-50 text-slate-700 border-slate-200">
              {row.original.designation || "Educator"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email Address",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-sm italic">{row.original.email}</span>
          </div>
        )
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-sm font-mono">{row.original.phone}</span>
          </div>
        )
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "success" : "secondary"} className="shadow-none">
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  );

  const actions: ActionConfig<any>[] = useMemo(
    () => [
      {
        id: "edit",
        label: "Edit Profile",
        icon: Briefcase,
        onClick: (row: any) => {
          setSelectedTeacher(row);
          setIsEditOpen(true);
        },
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-white rounded-2xl border border-red-50 shadow-xl">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mb-2">Error Loading Teachers</p>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">We encountered a problem fetching the teaching staff records. Please check your connection.</p>
          <Button onClick={() => refetchEmployees()} variant="outline" className="rounded-xl px-8">Try Refreshing</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabSwitcher
        tabs={[
          {
            value: "teachers",
            label: "Teaching Staff",
            icon: User,
            content: (
              <DataTable
                data={teachers}
                columns={columns}
                actions={actions}
                title="Academic Educators"
                searchKey="employee_name"
                searchPlaceholder="Search teachers by name or ID..."
                loading={isLoading}
                export={{ enabled: true, filename: 'teaching_staff' }}
                className="border-none shadow-none"
              />
            ),
          },
          {
            value: "management",
            label: "Subject Assignments",
            icon: BookOpen,
            content: (
              <TeacherCourseSubjectAssignmentsTab
                assignments={assignments}
                assignmentsLoading={assignmentsLoading}
                teacherDetailsMap={teacherDetailsMap}
                onDelete={handleDelete}
                onAddClick={handleAddClick}
              />
            ),
          },
        ]}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
        className="bg-transparent border-none shadow-none p-0"
      />

      {/* Assignment Form Dialog */}
      <FormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
        title="Associate Educator"
        description="Configure teaching assignments for subjects and courses."
        onSave={handleFormSubmit}
        onCancel={() => {
          setIsAddOpen(false);
          resetForm();
        }}
        saveText="Assign Subject"
        cancelText="Cancel"
      >
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Educator *</Label>
            <ServerCombobox
              items={teachers}
              isLoading={isLoading}
              value={selectedTeacherId}
              onSelect={setSelectedTeacherId}
              placeholder="Select faculty member"
              searchPlaceholder="Search educators..."
              valueKey="employee_id"
              labelKey="employee_name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Group *</Label>
              <ServerCombobox
                items={groups}
                isLoading={isLoadingGroups}
                value={selectedGroupId}
                onSelect={(value) => {
                  setSelectedGroupId(value);
                  setSelectedCourseId("");
                  setSelectedSubjectId("");
                }}
                placeholder="Select group"
                searchPlaceholder="Search groups..."
                valueKey="group_id"
                labelKey="group_name"
                onDropdownOpen={setGroupsDropdownOpen}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Course / Level *</Label>
              <ServerCombobox
                items={courses}
                isLoading={isLoadingCourses}
                value={selectedCourseId}
                onSelect={setSelectedCourseId}
                disabled={!selectedGroupId}
                placeholder={
                  selectedGroupId ? "Select course" : "Select group first"
                }
                searchPlaceholder="Search courses..."
                valueKey="course_id"
                labelKey="course_name"
                onDropdownOpen={setCoursesDropdownOpen}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Academic Subject *</Label>
            <ServerCombobox
              items={subjects}
              isLoading={isLoadingSubjects}
              value={selectedSubjectId}
              onSelect={setSelectedSubjectId}
              disabled={!selectedGroupId}
              placeholder={
                selectedGroupId ? "Select subject" : "Select group first"
              }
              searchPlaceholder="Search subjects..."
              valueKey="subject_id"
              labelKey="subject_name"
              onDropdownOpen={setSubjectsDropdownOpen}
            />
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
              className="h-5 w-5 data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-slate-700">
              Set assignment as currently active
            </Label>
          </div>
        </div>
      </FormDialog>

      {/* Edit Teacher Dialog */}
      <FormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Teacher Profile"
        description="Detailed educator information and management."
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedTeacher(null);
        }}
        cancelText="Close Profile"
      >
        <div className="py-6 px-1">
          <div className="text-center bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-6 shadow-inner">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedTeacher?.employee_name}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">{selectedTeacher?.designation || "Academic Faculty"}</p>

            <div className="inline-flex gap-2">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none font-bold">STAFF-ID: {selectedTeacher?.employee_id}</Badge>
              <Badge variant={selectedTeacher?.is_active ? "success" : "secondary"} className="shadow-none">
                {selectedTeacher?.is_active ? "ACTIVE STATUS" : "INACTIVE STATUS"}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex gap-3 italic">
              <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              Teacher demographic and payroll data is centralized in Employee Management for security compliance.
            </p>
            <Button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedTeacher(null);
                navigate("/employees");
              }}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-blue-100 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Access Complete Employee File
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
