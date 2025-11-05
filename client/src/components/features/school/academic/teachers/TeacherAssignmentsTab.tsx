import React from "react";
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

interface TeacherAssignmentsTabProps {
  hierarchicalAssignments: any[];
  assignmentsLoading: boolean;
  teacherDetailsMap: Map<number, any>;
  expandedTeachers: Set<number>;
  toggleTeacher: (teacherId: number) => void;
  handleDelete: (teacherId: number, classId: number, subjectId: number, sectionId: number) => void;
  handleAddClick: () => void;
}

export const TeacherAssignmentsTab = ({
  hierarchicalAssignments,
  assignmentsLoading,
  teacherDetailsMap,
  expandedTeachers,
  toggleTeacher,
  handleDelete,
  handleAddClick,
}: TeacherAssignmentsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">All Teacher Assignments</h3>
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
                    <div className="overflow-x-auto scrollbar-hide pb-0">
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
                          {teacher.classes.map((classItem: any, classIdx: number) => {
                            const sectionCount = classItem.sections.length;
                            let isFirstSectionForClass = true;
                            
                            return (
                              <React.Fragment key={classItem.class_id}>
                                {classItem.sections.map((section: any, sectionIdx: number) => {
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
                                            {section.subjects.map((subject: any, idx: number) => (
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
                                            {section.subjects.map((subject: any) => (
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
  );
};

