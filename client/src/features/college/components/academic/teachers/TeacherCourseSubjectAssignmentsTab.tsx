import React, { useMemo, useState } from "react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/common/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  User,
  BookOpen,
  GraduationCap,
  Phone,
  Hash,
  X,
  Search,
  Download,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { exportTeacherAssignmentsToExcel } from "@/common/utils/export/teacher-assignments-export";
import { useToast } from "@/common/hooks/use-toast";

interface TeacherCourseSubjectAssignmentsTabProps {
  assignments: any[];
  assignmentsLoading: boolean;
  teacherDetailsMap: Map<number, any>;
  onDelete: (teacherId: number, courseId: number, subjectId: number) => void;
  onAddClick: () => void;
}

export const TeacherCourseSubjectAssignmentsTab = ({
  assignments,
  assignmentsLoading,
  teacherDetailsMap,
  onDelete,
  onAddClick,
}: TeacherCourseSubjectAssignmentsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    open: boolean;
    teacherId: number;
    courseId: number;
    subjectId: number;
    subjectName: string;
  } | null>(null);
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

  const handleDeleteClick = (
    teacherId: number,
    courseId: number,
    subjectId: number,
    subjectName: string
  ) => {
    setDeleteConfirm({
      open: true,
      teacherId,
      courseId,
      subjectId,
      subjectName,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(
        deleteConfirm.teacherId,
        deleteConfirm.courseId,
        deleteConfirm.subjectId
      );
      setDeleteConfirm(null);
    }
  };

  // Transform assignments into teacher-centric hierarchical structure
  const hierarchicalAssignments = useMemo(() => {
    const teacherMap = new Map<number, any>();

    assignments.forEach((assignment) => {
      assignment.teachers?.forEach((teacher: any) => {
        const teacherId = teacher.teacher_id;

        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            teacher_id: teacherId,
            employee_id: teacherId, // Assuming teacher_id maps to employee_id
            teacher_name: teacher.teacher_name,
            groups: new Map(),
          });
        }

        const teacherData = teacherMap.get(teacherId)!;
        const groupId = assignment.group_id;

        if (!teacherData.groups.has(groupId)) {
          teacherData.groups.set(groupId, {
            group_id: groupId,
            group_name: assignment.group_name,
            courses: new Map(),
          });
        }

        const group = teacherData.groups.get(groupId)!;
        const courseId = assignment.course_id;

        if (!group.courses.has(courseId)) {
          group.courses.set(courseId, {
            course_id: courseId,
            course_name: assignment.course_name,
            subjects: [],
          });
        }

        const course = group.courses.get(courseId)!;
        course.subjects.push({
          subject_id: teacher.subject_id,
          subject_name: teacher.subject_name,
          is_active: teacher.is_active !== undefined ? teacher.is_active : true,
        });
      });
    });

    // Convert Maps to arrays
    return Array.from(teacherMap.values()).map((teacher: any) => ({
      ...teacher,
      groups: Array.from(teacher.groups.values()).map((group: any) => ({
        ...group,
        courses: Array.from(group.courses.values()),
      })),
    }));
  }, [assignments]);

  // Filter teachers based on search query
  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) {
      return hierarchicalAssignments;
    }
    const query = searchQuery.toLowerCase().trim();
    return hierarchicalAssignments.filter((teacher) => {
      const teacherDetails = teacherDetailsMap.get(teacher.employee_id);
      const nameMatch = teacher.teacher_name.toLowerCase().includes(query);
      const codeMatch = teacherDetails?.employee_code
        ?.toLowerCase()
        .includes(query);
      const phoneMatch = teacherDetails?.mobile_no?.includes(query);
      return nameMatch || codeMatch || phoneMatch;
    });
  }, [hierarchicalAssignments, searchQuery, teacherDetailsMap]);

  // Calculate total assignments
  const totalAssignments = filteredAssignments.reduce((acc, teacher) => {
    return (
      acc +
      teacher.groups.reduce((groupAcc: number, group: any) => {
        return (
          groupAcc +
          group.courses.reduce((courseAcc: number, course: any) => {
            return courseAcc + course.subjects.length;
          }, 0)
        );
      }, 0)
    );
  }, 0);

  // Export to Excel - transform teacher-centric data back to group-centric for export
  const handleExportToExcel = async () => {
    try {
      // Transform teacher-centric structure back to group-centric for export
      const groupMap = new Map<number, any>();

      filteredAssignments.forEach((teacher) => {
        teacher.groups.forEach((group: any) => {
          if (!groupMap.has(group.group_id)) {
            groupMap.set(group.group_id, {
              group_id: group.group_id,
              group_name: group.group_name,
              courses: new Map(),
            });
          }

          const groupData = groupMap.get(group.group_id)!;
          group.courses.forEach((course: any) => {
            if (!groupData.courses.has(course.course_id)) {
              groupData.courses.set(course.course_id, {
                course_id: course.course_id,
                course_name: course.course_name,
                teachers: new Map(),
              });
            }

            const courseData = groupData.courses.get(course.course_id)!;
            if (!courseData.teachers.has(teacher.teacher_id)) {
              courseData.teachers.set(teacher.teacher_id, {
                teacher_id: teacher.teacher_id,
                teacher_name: teacher.teacher_name,
                subjects: [],
              });
            }

            const teacherData = courseData.teachers.get(teacher.teacher_id)!;
            course.subjects.forEach((subject: any) => {
              teacherData.subjects.push(subject);
            });
          });
        });
      });

      const groupCentricData = Array.from(groupMap.values()).map((group: any) => ({
        ...group,
        courses: Array.from(group.courses.values()).map((course: any) => ({
          ...course,
          teachers: Array.from(course.teachers.values()),
        })),
      }));

      await exportTeacherAssignmentsToExcel(
        groupCentricData,
        'college_teacher_assignments',
        true // isCollege = true
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export assignments to Excel. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Teacher Course Subject Assignments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subject assignments for teachers across groups and courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted border">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {totalAssignments}{" "}
              {totalAssignments === 1 ? "Assignment" : "Assignments"}
            </span>
          </div>
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            className="flex items-center gap-2"
            size="default"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button
            onClick={onAddClick}
            className="flex items-center gap-2"
            size="default"
          >
            <Plus className="h-4 w-4" />
            Assign Subject
          </Button>
        </div>
      </div>

      {/* Search Box */}
      {hierarchicalAssignments.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name, code, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-9"
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Content Section */}
      {assignmentsLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-sm text-muted-foreground">
                Loading assignments...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : hierarchicalAssignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Assignments Found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
              Start by assigning subjects to teachers. Click the button above to
              get started.
            </p>
            <Button
              onClick={onAddClick}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Teachers Found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
              No teachers match your search query. Try a different search term.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-2"
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((teacher) => {
            const teacherDetails = teacherDetailsMap.get(teacher.employee_id);
            const isExpanded = expandedTeachers.has(teacher.teacher_id);
            const totalGroups = teacher.groups.length;
            const totalCourses = teacher.groups.reduce(
              (acc: number, group: any) => acc + group.courses.length,
              0
            );
            const totalSubjects = teacher.groups.reduce(
              (acc: number, group: any) =>
                acc +
                group.courses.reduce(
                  (courseAcc: number, course: any) =>
                    courseAcc + course.subjects.length,
                  0
                ),
              0
            );

            return (
              <Card key={teacher.teacher_id} className="overflow-hidden">
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleTeacher(teacher.teacher_id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {teacher.teacher_name}
                              </h3>
                              {teacherDetails?.employee_code && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-normal"
                                >
                                  <Hash className="h-3 w-3 mr-1" />
                                  {teacherDetails.employee_code}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              {teacherDetails?.mobile_no && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{teacherDetails.mobile_no}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>
                                  {totalGroups}{" "}
                                  {totalGroups === 1 ? "Group" : "Groups"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>
                                  {totalSubjects}{" "}
                                  {totalSubjects === 1 ? "Subject" : "Subjects"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {totalCourses}{" "}
                          {totalCourses === 1 ? "Course" : "Courses"}
                        </Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {teacher.groups.map((group: any) => (
                        <div key={group.group_id} className="space-y-3">
                          {/* Group Header */}
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {group.group_name.charAt(0)}
                                </span>
                              </div>
                              <h4 className="font-semibold text-base">
                                {group.group_name}
                              </h4>
                            </div>
                          </div>

                          {/* Courses */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-2">
                            {group.courses.map((course: any) => (
                              <div
                                key={course.course_id}
                                className="rounded-lg border bg-card p-4 space-y-3"
                              >
                                {/* Course Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="font-medium"
                                    >
                                      {course.course_name}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {course.subjects.length}{" "}
                                      {course.subjects.length === 1
                                        ? "subject"
                                        : "subjects"}
                                    </span>
                                  </div>
                                </div>

                                {/* Subjects */}
                                {course.subjects.length > 0 ? (
                                  <div className="flex flex-col gap-2">
                                    {course.subjects.map((subject: any) => (
                                      <div
                                        key={subject.subject_id}
                                        className="group relative flex items-center justify-between gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                          <span className="text-sm font-medium truncate">
                                            {subject.subject_name}
                                          </span>
                                          {!subject.is_active && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs px-1.5 py-0 shrink-0"
                                            >
                                              Inactive
                                            </Badge>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(
                                              teacher.teacher_id,
                                              course.course_id,
                                              subject.subject_id,
                                              subject.subject_name
                                            );
                                          }}
                                          title={`Remove ${subject.subject_name}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground italic py-2">
                                    No subjects assigned
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm?.open || false}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteConfirm?.subjectName}</strong> assignment? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

