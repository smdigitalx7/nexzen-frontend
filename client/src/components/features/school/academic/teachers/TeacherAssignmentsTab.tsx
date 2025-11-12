import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useCanViewUIComponent } from "@/lib/permissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeacherAssignmentsTabProps {
  hierarchicalAssignments: any[];
  assignmentsLoading: boolean;
  teacherDetailsMap: Map<number, any>;
  expandedTeachers: Set<number>;
  toggleTeacher: (teacherId: number) => void;
  handleDelete: (
    teacherId: number,
    classId: number,
    subjectId: number,
    sectionId: number
  ) => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  
  // Permission checks
  const canAddSubject = useCanViewUIComponent("teachers", "button", "teacher-assignment-add-subject");
  const canDeleteSubject = useCanViewUIComponent("teachers", "button", "teacher-assignment-delete-subject");
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    open: boolean;
    teacherId: number;
    classId: number;
    subjectId: number;
    sectionId: number;
    subjectName: string;
  } | null>(null);

  const handleDeleteClick = (
    teacherId: number,
    classId: number,
    subjectId: number,
    sectionId: number,
    subjectName: string
  ) => {
    setDeleteConfirm({
      open: true,
      teacherId,
      classId,
      subjectId,
      sectionId,
      subjectName,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      handleDelete(
        deleteConfirm.teacherId,
        deleteConfirm.classId,
        deleteConfirm.subjectId,
        deleteConfirm.sectionId
      );
      setDeleteConfirm(null);
    }
  };

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
      teacher.classes.reduce((classAcc: number, classItem: any) => {
        return (
          classAcc +
          classItem.sections.reduce((sectionAcc: number, section: any) => {
            return sectionAcc + section.subjects.length;
          }, 0)
        );
      }, 0)
    );
  }, 0);

  // Export to Excel
  const handleExportToExcel = async () => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Velocity ERP";
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet("Teacher Assignments");

      // Header row with styling
      const headerRow = worksheet.addRow([
        "Teacher Name",
        "Employee Code",
        "Phone",
        "Class",
        "Section",
        "Subject",
        "Class Teacher",
        "Status",
      ]);
      headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2C3E50" },
      };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;

      // Data rows
      filteredAssignments.forEach((teacher) => {
        const teacherDetails = teacherDetailsMap.get(teacher.employee_id);
        teacher.classes.forEach((classItem: any) => {
          classItem.sections.forEach((section: any) => {
            section.subjects.forEach((subject: any) => {
              const row = worksheet.addRow([
                teacher.teacher_name || "N/A",
                teacherDetails?.employee_code || "N/A",
                teacherDetails?.mobile_no || "N/A",
                classItem.class_name || "N/A",
                section.section_name || "N/A",
                subject.subject_name || "N/A",
                subject.is_class_teacher ? "Yes" : "No",
                subject.is_active ? "Active" : "Inactive",
              ]);
              row.alignment = { vertical: "middle" };
            });
          });
        });
      });

      // Set column widths
      worksheet.getColumn(1).width = 25; // Teacher Name
      worksheet.getColumn(2).width = 15; // Employee Code
      worksheet.getColumn(3).width = 15; // Phone
      worksheet.getColumn(4).width = 12; // Class
      worksheet.getColumn(5).width = 12; // Section
      worksheet.getColumn(6).width = 20; // Subject
      worksheet.getColumn(7).width = 15; // Class Teacher
      worksheet.getColumn(8).width = 12; // Status

      // Add borders to all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teacher_assignments_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      // Fallback to CSV
      const csvRows = [
        [
          "Teacher Name",
          "Employee Code",
          "Phone",
          "Class",
          "Section",
          "Subject",
          "Class Teacher",
          "Status",
        ],
      ];

      filteredAssignments.forEach((teacher) => {
        const teacherDetails = teacherDetailsMap.get(teacher.employee_id);
        teacher.classes.forEach((classItem: any) => {
          classItem.sections.forEach((section: any) => {
            section.subjects.forEach((subject: any) => {
              csvRows.push([
                teacher.teacher_name || "N/A",
                teacherDetails?.employee_code || "N/A",
                teacherDetails?.mobile_no || "N/A",
                classItem.class_name || "N/A",
                section.section_name || "N/A",
                subject.subject_name || "N/A",
                subject.is_class_teacher ? "Yes" : "No",
                subject.is_active ? "Active" : "Inactive",
              ]);
            });
          });
        });
      });

      const csvContent = csvRows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teacher_assignments_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Teacher Assignments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subject assignments for teachers across classes and sections
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
          {canAddSubject && (
            <Button
              onClick={handleAddClick}
              className="flex items-center gap-2"
              size="default"
            >
              <Plus className="h-4 w-4" />
              Assign Subject
            </Button>
          )}
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
              onClick={handleAddClick}
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
            const isExpanded = expandedTeachers.has(teacher.employee_id);
            const totalClasses = teacher.classes.length;
            const totalSections = teacher.classes.reduce(
              (acc: number, classItem: any) => acc + classItem.sections.length,
              0
            );
            const totalSubjects = teacher.classes.reduce(
              (acc: number, classItem: any) =>
                acc +
                classItem.sections.reduce(
                  (sectionAcc: number, section: any) =>
                    sectionAcc + section.subjects.length,
                  0
                ),
              0
            );

            return (
              <Card key={teacher.employee_id} className="overflow-hidden">
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleTeacher(teacher.employee_id)}
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
                                  {totalClasses}{" "}
                                  {totalClasses === 1 ? "Class" : "Classes"}
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
                          {totalSections}{" "}
                          {totalSections === 1 ? "Section" : "Sections"}
                        </Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {teacher.classes.map((classItem: any) => (
                        <div key={classItem.class_id} className="space-y-3">
                          {/* Class Header */}
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {classItem.class_name}
                                </span>
                              </div>
                              <h4 className="font-semibold text-base">
                                Class {classItem.class_name}
                              </h4>
                            </div>
                          </div>

                          {/* Sections */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-2">
                            {classItem.sections.map((section: any) => (
                              <div
                                key={section.section_id}
                                className="rounded-lg border bg-card p-4 space-y-3"
                              >
                                {/* Section Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="font-medium"
                                    >
                                      Section {section.section_name}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {section.subjects.length}{" "}
                                      {section.subjects.length === 1
                                        ? "subject"
                                        : "subjects"}
                                    </span>
                                  </div>
                                </div>

                                {/* Subjects */}
                                {section.subjects.length > 0 ? (
                                  <div className="flex flex-col gap-2">
                                    {section.subjects.map((subject: any) => (
                                      <div
                                        key={subject.subject_id}
                                        className="group relative flex items-center justify-between gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                          <span className="text-sm font-medium truncate">
                                            {subject.subject_name}
                                          </span>
                                          {subject.is_class_teacher && (
                                            <Badge
                                              variant="default"
                                              className="text-xs px-1.5 py-0 bg-amber-500 hover:bg-amber-600 shrink-0"
                                            >
                                              CT
                                            </Badge>
                                          )}
                                        </div>
                                        {canDeleteSubject && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground shrink-0"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteClick(
                                                teacher.employee_id,
                                                classItem.class_id,
                                                subject.subject_id,
                                                section.section_id,
                                                subject.subject_name
                                              );
                                            }}
                                            title={`Remove ${subject.subject_name}`}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        )}
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
