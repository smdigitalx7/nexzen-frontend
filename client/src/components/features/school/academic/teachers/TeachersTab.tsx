import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/shared";
import { UserCheck, ClipboardList } from "lucide-react";
import { useTeachersByBranch, useEmployeesByBranch } from "@/lib/hooks/general/useEmployees";
import { useTeacherClassSubjectsHierarchical, useCreateTeacherClassSubject, useDeleteTeacherClassSubject } from "@/lib/hooks/school/use-teacher-class-subjects";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolSectionsByClass } from "@/lib/hooks/school/use-school-sections";
import { useSchoolSubjects } from "@/lib/hooks/school/use-school-subjects";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherAssignmentsTab } from "./TeacherAssignmentsTab";
import { ClassTeacherTab } from "./ClassTeacherTab";

export const TeachersTab = () => {
  const { data: teachersList = [], error } = useTeachersByBranch();
  const { data: allEmployees = [] } = useEmployeesByBranch();
  const { data: hierarchicalAssignments = [], isLoading: assignmentsLoading } = useTeacherClassSubjectsHierarchical();

  // Create a map of full employee details by employee_id for quick lookup
  const teacherDetailsMap = useMemo(() => {
    const map = new Map();
    allEmployees.forEach((employee: any) => {
      map.set(employee.employee_id, employee);
    });
    return map;
  }, [allEmployees]);

  const { data: classes = [] } = useSchoolClasses();
  const createMutation = useCreateTeacherClassSubject();
  const deleteMutation = useDeleteTeacherClassSubject();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("assignments");
  
  // Form state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Get sections based on selected class
  const { data: sections = [] } = useSchoolSectionsByClass(
    selectedClassId ? parseInt(selectedClassId) : null
  );
  
  // Get subjects based on selected class
  const { data: subjects = [] } = useSchoolSubjects();

  const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(new Set());

  const { toast } = useToast();

  const toggleTeacher = (teacherId: number) => {
    setExpandedTeachers(prev => {
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


  const handleDelete = async (teacherId: number, classId: number, subjectId: number, sectionId: number) => {
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
    if (!selectedTeacherId || !selectedClassId || !selectedSectionId || !selectedSubjectId) {
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Teacher Assignments
          </TabsTrigger>
          <TabsTrigger value="class-teacher" className="flex items-center gap-2">
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
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.map((teacher: any) => (
                  <SelectItem key={teacher.employee_id} value={teacher.employee_id.toString()}>
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
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.class_id} value={classItem.class_id.toString()}>
                    {classItem.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Select 
              value={selectedSectionId} 
              onValueChange={setSelectedSectionId}
              disabled={!selectedClassId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedClassId ? "Select section" : "Select class first"} />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.section_id} value={section.section_id.toString()}>
                    {section.section_name}
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
                {subjects.map((subject) => (
                  <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                    {subject.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_class_teacher" 
                checked={isClassTeacher}
                onCheckedChange={(checked) => setIsClassTeacher(checked as boolean)}
              />
              <Label htmlFor="is_class_teacher" className="text-sm font-normal cursor-pointer">
                Class Teacher
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_active" 
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

