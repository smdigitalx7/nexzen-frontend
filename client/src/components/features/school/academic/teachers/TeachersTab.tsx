import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared";
import { ChevronDown, ChevronRight, BookOpen, Plus, Trash2 } from "lucide-react";
import { useTeachersByBranch, useEmployeesByBranch } from "@/lib/hooks/general/useEmployees";
import { useTeacherClassSubjectsHierarchical, useCreateTeacherClassSubject, useDeleteTeacherClassSubject } from "@/lib/hooks/school/use-teacher-class-subjects";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolSectionsByClass } from "@/lib/hooks/school/use-school-sections";
import { useSchoolSubjects } from "@/lib/hooks/school/use-school-subjects";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SchoolTeacherDetail, SchoolClassDetail, SchoolSectionDetail } from "@/lib/types/school";

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
      {/* Hierarchical Assignments Section */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Teacher Subject Assignments</h3>
          </div>
        <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {hierarchicalAssignments.length} {hierarchicalAssignments.length === 1 ? 'Assignment' : 'Assignments'}
            </Badge>
            <Button
              onClick={handleAddClick}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Assign Subject
            </Button>
          </div>
        </div>
        <div className="border-t pt-4">
        {assignmentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading assignments...</p>
            </div>
          </div>
        ) : hierarchicalAssignments.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No teacher assignments found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hierarchicalAssignments.map((teacher) => (
              <div key={teacher.employee_id} className="border rounded-lg overflow-hidden">
                <Collapsible
                  open={expandedTeachers.has(teacher.employee_id)}
                  onOpenChange={() => toggleTeacher(teacher.employee_id)}
                >
                  {/* Teacher Header */}
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        {expandedTeachers.has(teacher.employee_id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{teacher.teacher_name}</h4>
                          <div className="flex gap-3 text-xs text-gray-500">
                            {teacherDetailsMap.get(teacher.employee_id)?.employee_code && (
                              <span>Code: {teacherDetailsMap.get(teacher.employee_id)?.employee_code}</span>
                            )}
                            {teacherDetailsMap.get(teacher.employee_id)?.mobile_no && (
                              <span>Phone: {teacherDetailsMap.get(teacher.employee_id)?.mobile_no}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {teacher.classes.length} {teacher.classes.length === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  </CollapsibleTrigger>

                  {/* Hierarchical Table */}
                  <CollapsibleContent>
                    <div className="overflow-x-auto pb-0">
                      <Table className="mb-0">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[140px] font-medium">Classes</TableHead>
                            <TableHead className="w-[140px] font-medium">Sections</TableHead>
                            <TableHead className="font-medium">Subjects</TableHead>
                            <TableHead className="w-[100px] text-center font-medium">Total</TableHead>
                            <TableHead className="w-[80px] text-center font-medium">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="[&>*:last-child]:border-b-0">
                          {teacher.classes.map((classItem, classIdx) => {
                            const sectionCount = classItem.sections.length;
                            let isFirstSectionForClass = true;
                            
                            return (
                              <React.Fragment key={classItem.class_id}>
                                {classItem.sections.map((section, sectionIdx) => {
                                  const subjects = section.subjects.map(s => {
                                    const isCT = section.subjects.find(subj => subj.subject_id === s.subject_id && s.is_class_teacher);
                                    return `${s.subject_name}${isCT ? ' (CT)' : ''}`;
                                  }).join(", ");
                                  const totalSubjects = section.subjects.length;
                                  const currentIsFirst = isFirstSectionForClass;
                                  if (isFirstSectionForClass) isFirstSectionForClass = false;
                                  const isLastSection = sectionIdx === classItem.sections.length - 1;
                                  
                                  return (
                                    <TableRow 
                                      key={`${classItem.class_id}-${section.section_id}`}
                                      className={`hover:bg-muted/30 transition-colors ${isLastSection && classIdx !== teacher.classes.length - 1 ? 'border-b-2' : ''}`}
                                    >
                                      {/* Class column - only show on first section of each class */}
                                      {currentIsFirst ? (
                                        <TableCell 
                                          rowSpan={sectionCount} 
                                          className="align-top font-medium"
                                          style={{ verticalAlign: 'top', width: '140px' }}
                                        >
                                          <span className="font-semibold">{classItem.class_name}</span>
                                        </TableCell>
                                      ) : null}
                                      
                                      {/* Section column */}
                                      <TableCell>
                                        <span>{section.section_name}</span>
                                      </TableCell>
                                      
                                      {/* Subjects column */}
                                      <TableCell>
                                        {section.subjects.length > 0 ? (
                                          <div className="flex flex-wrap gap-1.5">
                                            {section.subjects.map((subject, idx) => (
                                              <span key={subject.subject_id} className="text-sm">
                                                {subject.is_class_teacher ? (
                                                  <span className="font-semibold">{subject.subject_name} <span className="text-xs text-yellow-600">(CLASS TEACHER)</span></span>
                                                ) : (
                                                  subject.subject_name
                                                )}
                                                {idx < section.subjects.length - 1 && ', '}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <span className="text-sm text-muted-foreground italic">No subjects</span>
                                        )}
                                      </TableCell>
                                      
                                      {/* Total count column */}
                                      <TableCell className="text-center">
                                        <span className="text-sm">{totalSubjects}</span>
                                      </TableCell>

                                      {/* Actions column */}
                                      <TableCell className="text-center">
                                        {section.subjects.length > 0 ? (
                                          <div className="flex flex-col gap-1">
                                            {section.subjects.map((subject) => (
                                              <Button
                                                key={subject.subject_id}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => handleDelete(teacher.employee_id, classItem.class_id, subject.subject_id, section.section_id)}
                                                title={`Delete ${subject.subject_name} assignment`}
                                              >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Delete
                                              </Button>
                                            ))}
                                          </div>
                                        ) : null}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
        </div>
        )}
        </div>
      </div>

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

