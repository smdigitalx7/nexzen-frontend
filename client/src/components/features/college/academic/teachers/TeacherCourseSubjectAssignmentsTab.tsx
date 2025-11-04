import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface TeacherCourseSubjectAssignmentsTabProps {
  assignments: any[];
  assignmentsLoading: boolean;
  onDelete: (teacherId: number, courseId: number, subjectId: number) => void;
  onAddClick: () => void;
}

export const TeacherCourseSubjectAssignmentsTab = ({
  assignments,
  assignmentsLoading,
  onDelete,
  onAddClick,
}: TeacherCourseSubjectAssignmentsTabProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const toggleGroup = (groupId: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Transform assignments into hierarchical structure
  const hierarchicalAssignments = React.useMemo(() => {
    const grouped: Map<number, any> = new Map();
    
    assignments.forEach((assignment) => {
      const groupId = assignment.group_id;
      
      if (!grouped.has(groupId)) {
        grouped.set(groupId, {
          group_id: groupId,
          group_name: assignment.group_name,
          courses: new Map(),
        });
      }
      
      const group = grouped.get(groupId)!;
      const courseId = assignment.course_id;
      
      if (!group.courses.has(courseId)) {
        group.courses.set(courseId, {
          course_id: courseId,
          course_name: assignment.course_name,
          teachers: new Map(),
        });
      }
      
      const course = group.courses.get(courseId)!;
      
      // Add teachers from this assignment
      assignment.teachers?.forEach((teacher: any) => {
        const teacherId = teacher.teacher_id;
        
        if (!course.teachers.has(teacherId)) {
          course.teachers.set(teacherId, {
            teacher_id: teacherId,
            teacher_name: teacher.teacher_name,
            subjects: [],
          });
        }
        
        course.teachers.get(teacherId)!.subjects.push({
          subject_id: teacher.subject_id,
          subject_name: teacher.subject_name,
        });
      });
    });
    
    // Convert Maps to arrays
    return Array.from(grouped.values()).map(group => ({
      ...group,
      courses: Array.from(group.courses.values()).map(course => ({
        ...course,
        teachers: Array.from(course.teachers.values()),
      })),
    }));
  }, [assignments]);

  const totalAssignments = React.useMemo(() => {
    return hierarchicalAssignments.reduce((total, group) => {
      return total + group.courses.reduce((courseTotal: number, course: any) => {
        return courseTotal + course.teachers.reduce((teacherTotal: number, teacher: any) => {
          return teacherTotal + teacher.subjects.length;
        }, 0);
      }, 0);
    }, 0);
  }, [hierarchicalAssignments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">All Course-Subject Assignments</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {totalAssignments} {totalAssignments === 1 ? 'Assignment' : 'Assignments'}
          </Badge>
          <Button
            onClick={onAddClick}
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
            <p className="text-muted-foreground">No assignments found</p>
            <p className="text-sm text-muted-foreground mt-2">Add assignments to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hierarchicalAssignments.map((group) => (
              <div key={group.group_id} className="border rounded-lg overflow-hidden">
                <Collapsible
                  open={expandedGroups.has(group.group_id)}
                  onOpenChange={() => toggleGroup(group.group_id)}
                >
                  {/* Group Header */}
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 transition-colors">
                      <div className="flex items-center gap-2">
                        {expandedGroups.has(group.group_id) ? (
                          <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-blue-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{group.group_name}</h4>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {group.courses.length} {group.courses.length === 1 ? 'course' : 'courses'}
                      </span>
                    </div>
                  </CollapsibleTrigger>

                  {/* Hierarchical Table */}
                  <CollapsibleContent>
                    <div className="overflow-x-auto scrollbar-hide pb-0">
                      {group.courses.map((course: any) => (
                        <div key={course.course_id} className="border-b last:border-b-0">
                          <div className="bg-gray-50 px-4 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-gray-900">{course.course_name}</h5>
                              <span className="text-xs text-gray-500">
                                {course.teachers.length} {course.teachers.length === 1 ? 'teacher' : 'teachers'}
                              </span>
                            </div>
                          </div>
                          
                          <Table className="mb-0">
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="font-medium">Teacher</TableHead>
                                <TableHead className="font-medium">Subjects</TableHead>
                                <TableHead className="text-center font-medium w-[80px]">Total</TableHead>
                                <TableHead className="text-center font-medium w-[120px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {course.teachers.map((teacher: any) => (
                                <TableRow 
                                  key={teacher.teacher_id}
                                  className="hover:bg-muted/30 transition-colors"
                                >
                                  {/* Teacher column */}
                                  <TableCell className="font-medium">
                                    {teacher.teacher_name}
                                  </TableCell>
                                  
                                  {/* Subjects column */}
                                  <TableCell>
                                    {teacher.subjects.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {teacher.subjects.map((subject: any, idx: number) => (
                                          <Badge key={subject.subject_id} variant="secondary" className="text-sm">
                                            {subject.subject_name}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground italic">No subjects</span>
                                    )}
                                  </TableCell>
                                  
                                  {/* Total count column */}
                                  <TableCell className="text-center">
                                    <span className="text-sm font-medium">{teacher.subjects.length}</span>
                                  </TableCell>

                                  {/* Actions column */}
                                  <TableCell className="text-center">
                                    {teacher.subjects.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {teacher.subjects.map((subject: any) => (
                                          <Button
                                            key={subject.subject_id}
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => onDelete(teacher.teacher_id, course.course_id, subject.subject_id)}
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
                              ))}
                              {course.teachers.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    No teachers assigned to this course
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

