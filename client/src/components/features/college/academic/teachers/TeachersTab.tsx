import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocation } from "wouter";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { TabSwitcher } from "@/components/shared";
import { User, BookOpen, ArrowRight } from "lucide-react";
import { useEmployeesByBranch } from "@/lib/hooks/general";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { TeacherCourseSubjectAssignmentsTab } from "./TeacherCourseSubjectAssignmentsTab";
import {
  useTeacherCourseSubjectsList,
  useCreateTeacherCourseSubject,
  useDeleteTeacherCourseSubjectRelation,
  useCollegeGroups,
} from "@/lib/hooks/college";
import {
  useCollegeCourses,
  useCollegeSubjects,
} from "@/lib/hooks/college/use-college-dropdowns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const TeachersTab = () => {
  const { data: allEmployees = [], isLoading, error } = useEmployeesByBranch();
  const { data: assignments = [], isLoading: assignmentsLoading } =
    useTeacherCourseSubjectsList();
  const { data: groups = [] } = useCollegeGroups();

  // Filter to only teaching staff and map to include all fields
  const teachers = useMemo(() => {
    return allEmployees
      .filter((employee: any) => employee.employee_type === "TEACHING")
      .map((employee: any) => ({
        ...employee,
        phone: employee.mobile_no,
        is_active: employee.status === "ACTIVE",
      }));
  }, [allEmployees]);

  // Create a map of full employee details by employee_id for quick lookup
  const teacherDetailsMap = useMemo(() => {
    const map = new Map();
    allEmployees.forEach((employee: any) => {
      map.set(employee.employee_id, employee);
    });
    return map;
  }, [allEmployees]);

  const [, navigate] = useLocation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState("teachers");

  // Form state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateTeacherCourseSubject();
  const deleteMutation = useDeleteTeacherCourseSubjectRelation();
  const { toast } = useToast();

  // Get courses for selected group - fetch courses with group filter
  const { data: coursesData } = useCollegeCourses(
    selectedGroupId ? parseInt(selectedGroupId) : 0
  );
  const courses = coursesData?.items || [];

  // Get subjects for selected group
  const { data: subjectsData } = useCollegeSubjects(
    selectedGroupId ? parseInt(selectedGroupId) : 0
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
    } catch (error: any) {
      // Error toast handled by mutation hook
    }
  };

  const handleFormSubmit = async () => {
    if (
      !selectedTeacherId ||
      !selectedGroupId ||
      !selectedCourseId ||
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
      // We need to get the current academic_year_id and branch_id
      // For now, using placeholders - these should come from the auth context
      await createMutation.mutateAsync({
        teacher_id: parseInt(selectedTeacherId),
        course_id: parseInt(selectedCourseId),
        subject_id: parseInt(selectedSubjectId),
        academic_year_id: 1, // TODO: Get from auth context
        is_active: isActive,
      });

      resetForm();
      setIsAddOpen(false);
    } catch (error: any) {
      // Error toast handled by mutation hook
    }
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "employee_name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{row.getValue("employee_name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.getValue("designation") || "Teacher"}
          </Badge>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
            {row.getValue("is_active") ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  );

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "edit" as const,
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading teachers</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TabSwitcher
        tabs={[
          {
            value: "teachers",
            label: "Teachers",
            icon: User,
            content: (
              <EnhancedDataTable
                data={teachers}
                columns={columns}
                title="Teachers"
                searchKey="employee_name"
                exportable={true}
                showActions={true}
                actionButtonGroups={actionButtonGroups}
                actionColumnHeader="Actions"
                showActionLabels={true}
                loading={isLoading}
              />
            ),
          },
          {
            value: "management",
            label: "Teacher Course Subject Assignments",
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
      />

      {/* Assignment Form Dialog */}
      <FormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            resetForm();
          }
        }}
        title="Assign Teacher to Subject"
        description="Assign a teacher to a group, course, and subject"
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
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher: any) => (
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

          {/* Group Selection */}
          <div className="space-y-2">
            <Label htmlFor="group">Group *</Label>
            <Select
              value={selectedGroupId}
              onValueChange={(value) => {
                setSelectedGroupId(value);
                setSelectedCourseId(""); // Reset course when group changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group: any) => (
                  <SelectItem
                    key={group.group_id}
                    value={group.group_id.toString()}
                  >
                    {group.group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">Course *</Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={!selectedGroupId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedGroupId ? "Select course" : "Select group first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem
                    key={course.course_id}
                    value={course.course_id.toString()}
                  >
                    {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              disabled={!selectedGroupId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedGroupId ? "Select subject" : "Select group first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem
                    key={subject.subject_id}
                    value={subject.subject_id.toString()}
                  >
                    {subject.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Toggle */}
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
              Active Assignment
            </Label>
          </div>
        </div>
      </FormDialog>

      {/* Edit Teacher Dialog */}
      <FormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Teacher"
        description="Update teacher information"
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedTeacher(null);
        }}
        cancelText="Close"
      >
        <div className="space-y-4">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">
              To edit teacher information, please use the Employee Management
              section.
            </p>
            <Button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedTeacher(null);
                navigate("/employees");
              }}
              className="gap-2"
            >
              Go to Employees
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </FormDialog>
    </>
  );
};
