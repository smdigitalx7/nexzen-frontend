import React, { useMemo, useState } from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  Trash2,
  Plus,
  Phone,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  User,
  Loader2,
} from "lucide-react";
import { useCanViewUIComponent } from "@/core/permissions";
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
import { Card, CardContent } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Progress } from "@/common/components/ui/progress";
import { useToast } from "@/common/hooks/use-toast";
import { exportToExcel } from "@/common/utils/export/excel-export-utils";
import { cn } from "@/common/utils";

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
  const { toast } = useToast();

  // Permission checks
  const canAddSubject = useCanViewUIComponent(
    "teachers",
    "button",
    "teacher-assignment-add-subject"
  );
  const canDeleteSubject = useCanViewUIComponent(
    "teachers",
    "button",
    "teacher-assignment-delete-subject"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{
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
  const filteredTeachers = useMemo(() => {
    if (!Array.isArray(hierarchicalAssignments)) return [];
    if (!searchQuery.trim()) return hierarchicalAssignments;
    
    const query = searchQuery.toLowerCase().trim();
    return hierarchicalAssignments.filter((teacher) => {
      const teacherDetails = teacherDetailsMap.get(teacher.employee_id);
      const nameMatch = teacher.teacher_name.toLowerCase().includes(query);
      const codeMatch = teacherDetails?.employee_code?.toLowerCase().includes(query);
      const phoneMatch = teacherDetails?.mobile_no?.includes(query);
      return nameMatch || codeMatch || phoneMatch;
    });
  }, [hierarchicalAssignments, searchQuery, teacherDetailsMap]);

  // Calculate total assignments count
  const totalAssignmentsCount = useMemo(() => {
    if (!Array.isArray(filteredTeachers)) return 0;
    return filteredTeachers.reduce((acc, teacher) => {
      const classes = Array.isArray(teacher.classes) ? teacher.classes : [];
      return acc + classes.reduce((cAcc: number, cls: any) => {
        const sections = Array.isArray(cls.sections) ? cls.sections : [];
        return cAcc + sections.reduce((sAcc: number, sec: any) => {
          return sAcc + (Array.isArray(sec.subjects) ? sec.subjects.length : 0);
        }, 0);
      }, 0);
    }, 0);
  }, [filteredTeachers]);

  // Export to Excel using shared professional design (global code, employee code, phone included)
  const handleExportToExcel = async () => {
    const flatData: Record<string, string | number>[] = [];

    if (Array.isArray(hierarchicalAssignments)) {
      hierarchicalAssignments.forEach((teacher) => {
        const teacherDetails = teacherDetailsMap.get(teacher.employee_id) as Record<string, unknown> | undefined;
        const globalCode = String(teacherDetails?.global_code ?? teacherDetails?.employee_code ?? "N/A");
        const employeeCode = String(teacherDetails?.employee_code ?? "N/A");
        const phone = String(teacherDetails?.mobile_no ?? "N/A");

        const classes = Array.isArray(teacher.classes) ? teacher.classes : [];
        classes.forEach((classItem: any) => {
          const sections = Array.isArray(classItem.sections) ? classItem.sections : [];
          sections.forEach((section: any) => {
            const subjects = Array.isArray(section.subjects) ? section.subjects : [];
            subjects.forEach((subject: any) => {
              flatData.push({
                teacher_name: teacher.teacher_name || "N/A",
                global_code: globalCode,
                employee_code: employeeCode,
                phone,
                class_name: classItem.class_name || "N/A",
                section_name: section.section_name || "N/A",
                subject_name: subject.subject_name || "N/A",
                class_teacher: subject.is_class_teacher ? "Yes" : "No",
                status: subject.is_active ? "Active" : "Inactive",
              });
            });
          });
        });
      });
    }

    if (flatData.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no teacher assignments to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(10);

    const progressInterval = setInterval(() => {
      setExportProgress((p) => (p >= 90 ? 90 : p + 15));
    }, 200);

    try {
      await exportToExcel(flatData, [
        { header: "Teacher Name", key: "teacher_name", width: 22 },
        { header: "Global Code", key: "global_code", width: 14 },
        { header: "Employee Code", key: "employee_code", width: 14 },
        { header: "Phone", key: "phone", width: 14 },
        { header: "Class", key: "class_name", width: 12 },
        { header: "Section", key: "section_name", width: 12 },
        { header: "Subject", key: "subject_name", width: 20 },
        { header: "Class Teacher", key: "class_teacher", width: 12 },
        { header: "Status", key: "status", width: 10 },
      ], {
        filename: "teacher_assignments",
        sheetName: "Teacher Assignments",
        title: "Teacher Assignments",
        includeMetadata: true,
      });
      toast({
        title: "Export complete",
        description: "Teacher assignments have been downloaded.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teacher Assignments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subject assignments for teachers across classes and sections
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted border whitespace-nowrap hidden sm:flex">
             <GraduationCap className="h-4 w-4 text-muted-foreground" />
             <span className="text-sm font-medium">
               {totalAssignmentsCount} Assignments
             </span>
           </div>
           <Button
             onClick={handleExportToExcel}
             variant="outline"
             size="sm"
             className="hidden sm:flex"
             disabled={isExporting}
           >
             <Download className="h-4 w-4 mr-2" />
             Export
           </Button>
           {canAddSubject && (
             <Button onClick={handleAddClick} size="sm" className="w-full sm:w-auto">
               <Plus className="h-4 w-4 mr-2" />
               Assign Subject
             </Button>
           )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Content */}
      {assignmentsLoading ? (
        <div className="flex items-center justify-center py-20 border rounded-md">
           <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
             <div className="rounded-full bg-muted p-4 mb-4">
               <User className="h-8 w-8 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-semibold mb-2">No Teachers Found</h3>
             <p className="text-sm text-muted-foreground text-center mb-4">
               {searchQuery ? "Try adjusting your search query." : "Start by assigning subjects to teachers."}
             </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assignment Stats</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => {
                const teacherDetails = teacherDetailsMap.get(teacher.employee_id);
                const isExpanded = expandedTeachers.has(teacher.employee_id);
                
                // Calculate stats for this teacher
                const classes = Array.isArray(teacher.classes) ? teacher.classes : [];
                const totalClasses = classes.length;
                const totalSections = classes.reduce((acc: number, c: any) => 
                  acc + (Array.isArray(c.sections) ? c.sections.length : 0), 0);
                const totalSubjects = classes.reduce((acc: number, c: any) => 
                  acc + (Array.isArray(c.sections) ? c.sections.reduce((sAcc: number, s: any) => 
                    sAcc + (Array.isArray(s.subjects) ? s.subjects.length : 0), 0) : 0), 0);

                return (
                  <React.Fragment key={teacher.employee_id}>
                    {/* Master Row */}
                    <TableRow 
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        isExpanded && "bg-muted/50 border-b-0"
                      )}
                      onClick={() => toggleTeacher(teacher.employee_id)}
                    >
                      <TableCell className="w-[50px]">
                         {isExpanded ? (
                           <ChevronDown className="h-4 w-4 text-muted-foreground" />
                         ) : (
                           <ChevronRight className="h-4 w-4 text-muted-foreground" />
                         )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{teacher.teacher_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {teacherDetails?.employee_code || "ID: N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacherDetails?.mobile_no ? (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{teacherDetails.mobile_no}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                           <div className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{totalClasses} Cls</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5" />
                              <span>{totalSubjects} Sub</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleTeacher(teacher.employee_id);
                           }}
                         >
                           {isExpanded ? "Collapse" : "View Details"}
                         </Button>
                      </TableCell>
                    </TableRow>

                    {/* Detail Row (Nested Table) */}
                    {isExpanded && (
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={5} className="p-0 border-t-0">
                          <div className="p-4 pt-0 pl-14">
                            <div className="rounded-md border bg-background overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted hover:bg-muted h-9">
                                    <TableHead className="h-9">Class & Section</TableHead>
                                    <TableHead className="h-9">Subject</TableHead>
                                    <TableHead className="h-9">Status</TableHead>
                                    <TableHead className="h-9 text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {classes.map((cls: any) => (
                                     Array.isArray(cls.sections) && cls.sections.map((sec: any) => (
                                        Array.isArray(sec.subjects) && sec.subjects.map((sub: any) => (
                                          <TableRow key={`${cls.class_id}-${sec.section_id}-${sub.subject_id}`}>
                                             <TableCell>
                                               <div className="flex items-center gap-2">
                                                 <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                   {cls.class_name}
                                                 </Badge>
                                                 <span className="text-muted-foreground">-</span>
                                                 <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                                   {sec.section_name}
                                                 </Badge>
                                               </div>
                                             </TableCell>
                                             <TableCell>
                                               <div className="flex items-center gap-2">
                                                 <span className="font-medium">{sub.subject_name}</span>
                                                 {sub.is_class_teacher && (
                                                   <Badge className="bg-amber-500 text-white text-[10px] px-1.5 h-4.5">CT</Badge>
                                                 )}
                                               </div>
                                             </TableCell>
                                             <TableCell>
                                                <Badge variant={sub.is_active ? "default" : "secondary"} className="h-5 text-[10px] px-1.5">
                                                  {sub.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                             </TableCell>
                                             <TableCell className="text-right">
                                               {canDeleteSubject && (
                                                 <Button
                                                   variant="ghost"
                                                   size="sm"
                                                   className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                   onClick={() => handleDeleteClick(
                                                     teacher.employee_id,
                                                     cls.class_id,
                                                     sub.subject_id,
                                                     sec.section_id,
                                                     sub.subject_name
                                                   )}
                                                 >
                                                   <Trash2 className="h-4 w-4" />
                                                 </Button>
                                               )}
                                             </TableCell>
                                          </TableRow>
                                        ))
                                     ))
                                  ))}
                                  {classes.length === 0 && (
                                    <TableRow>
                                       <TableCell colSpan={4} className="text-center text-muted-foreground h-16">
                                          No subjects assigned.
                                       </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Export progress dialog */}
      <Dialog open={isExporting} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Exporting Data...
            </DialogTitle>
            <DialogDescription>
              Preparing your teacher assignments export. Please wait.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Progress value={exportProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {exportProgress}%
            </p>
          </div>
        </DialogContent>
      </Dialog>

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
