import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { TabSwitcher } from "@/components/shared";
import { User, BookOpen, ClipboardList } from "lucide-react";
import { useTeachersByBranch } from "@/lib/hooks/general/useEmployees";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { TeacherCourseSubjectAssignmentsTab } from "./TeacherCourseSubjectAssignmentsTab";
import { useTeacherCourseSubjectsList, useCreateTeacherCourseSubject, useDeleteTeacherCourseSubjectRelation } from "@/lib/hooks/college/use-teacher-course-subjects";
import { useCollegeGroups } from "@/lib/hooks/college/use-college-groups";
import { useCollegeCourses } from "@/lib/hooks/college/use-college-courses";
import { useCollegeSubjects } from "@/lib/hooks/college/use-college-subjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const TeachersTab = () => {
  const { data: teachers = [], isLoading, error } = useTeachersByBranch();
  const { data: assignments = [], isLoading: assignmentsLoading } = useTeacherCourseSubjectsList();
  const { data: groups = [] } = useCollegeGroups();
  const { data: courses = [] } = useCollegeCourses();
  const { data: subjects = [] } = useCollegeSubjects();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("assignments");
  
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
  const { data: groupCourses = [] } = useCollegeCourses();
  const filteredCourses = useMemo(() => {
    if (!selectedGroupId) return [];
    // Filter courses that belong to the selected group
    return groupCourses.filter((course: any) => course.group_id === parseInt(selectedGroupId));
  }, [selectedGroupId, groupCourses]);

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

  const handleDelete = async (teacherId: number, courseId: number, subjectId: number) => {
    try {
      await deleteMutation.mutateAsync({ teacherId, courseId, subjectId });
    } catch (error: any) {
      // Error toast handled by mutation hook
    }
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

  // Filter teachers based on search term
  const filteredTeachers = useMemo(() => {
    if (!searchTerm) return teachers;
    return teachers.filter((teacher: any) =>
      teacher.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const columns: ColumnDef<any>[] = useMemo(() => [
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
      accessorKey: "employee_id",
      header: "Employee ID",
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
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (row: any) => {
        setSelectedTeacher(row);
        setIsEditOpen(true);
      }
    }
  ], []);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="search">Search Teachers</Label>
          <Input
            id="search"
            placeholder="Search by name, ID, designation, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <EnhancedDataTable
        data={filteredTeachers}
        columns={columns}
        title="Teachers"
        searchKey="employee_name"
        exportable={true}
        onAdd={() => setIsAddOpen(true)}
        addButtonText="Add Teacher"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
        loading={isLoading}
                />
              </div>
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
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher: any) => (
                  <SelectItem key={teacher.employee_id} value={teacher.employee_id.toString()}>
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
                  <SelectItem key={group.group_id} value={group.group_id.toString()}>
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
                <SelectValue placeholder={selectedGroupId ? "Select course" : "Select group first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course: any) => (
                  <SelectItem key={course.course_id} value={course.course_id.toString()}>
                    {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
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
            <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">
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
        onSave={async () => {
          toast({ 
            title: "Feature Coming Soon", 
            description: "Teacher editing will be available in the employee management section" 
          });
          setIsEditOpen(false);
          setSelectedTeacher(null);
        }}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedTeacher(null);
        }}
        saveText="Update Teacher"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              To edit teacher information, please use the Employee Management section.
            </p>
          </div>
        </div>
      </FormDialog>
    </>
  );
};
