import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { DataTable } from "@/common/components/shared";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  useSchoolExamMarksList,
  useSchoolExamMark,
  useCreateSchoolExamMark,
  useUpdateSchoolExamMark,
  useDeleteSchoolExamMark,
} from "@/features/school/hooks/use-school-exam-marks";
import {
  useSchoolSections,
  useSchoolSubjects,
  useSchoolExams,
  useSchoolClasses,
} from "@/features/school/hooks/use-school-dropdowns";
import { useGrades } from "@/features/general/hooks/useGrades";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import type {
  ExamMarkWithDetails,
} from "@/features/school/types/exam-marks";
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
} from "@/common/utils/factory/columnFactories";
import AddMarksByClassDialog from "./AddMarksByClassDialog";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";

interface ExamMarksManagementProps {
  onDataChange?: (data: ExamMarkWithDetails[]) => void;
  selectedClass?: number | null;
  setSelectedClass?: (value: number | null) => void;
  selectedSection?: number | null;
  setSelectedSection?: (value: number | null) => void;
  selectedSubject?: number | null;
  setSelectedSubject?: (value: number | null) => void;
  selectedGrade?: string;
  setSelectedGrade?: (value: string) => void;
  selectedExam?: number | null;
  setSelectedExam?: (value: number | null) => void;
}

// Grade colors mapping
const GRADE_COLORS = {
  "A+": "bg-green-600",
  A: "bg-green-500",
  "B+": "bg-blue-500",
  B: "bg-blue-400",
  "C+": "bg-yellow-500",
  C: "bg-yellow-400",
  D: "bg-orange-500",
  F: "bg-red-500",
} as const;

const ExamMarksManagementComponent = ({
  onDataChange,
  selectedClass: propSelectedClass,
  setSelectedClass: propSetSelectedClass,
  selectedSection: propSelectedSection,
  setSelectedSection: propSetSelectedSection,
  selectedSubject: propSelectedSubject,
  setSelectedSubject: propSetSelectedSubject,
  selectedGrade: propSelectedGrade,
  setSelectedGrade: propSetSelectedGrade,
  selectedExam: propSelectedExam,
  setSelectedExam: propSetSelectedExam,
}: ExamMarksManagementProps) => {
  // Local state for backward compatibility
  const [localSelectedClass, setLocalSelectedClass] = useState<number | null>(null);
  const [localSelectedSection, setLocalSelectedSection] = useState<number | null>(null);
  const [localSelectedSubject, setLocalSelectedSubject] = useState<number | null>(null);
  const [localSelectedGrade, setLocalSelectedGrade] = useState("all");
  const [localSelectedExam, setLocalSelectedExam] = useState<number | null>(null);

  const selectedClass = propSelectedClass ?? localSelectedClass;
  const setSelectedClass = propSetSelectedClass ?? setLocalSelectedClass;
  const selectedSection = propSelectedSection ?? localSelectedSection;
  const setSelectedSection = propSetSelectedSection ?? setLocalSelectedSection;
  const selectedSubject = propSelectedSubject ?? localSelectedSubject;
  const setSelectedSubject = propSetSelectedSubject ?? setLocalSelectedSubject;
  const selectedGrade = propSelectedGrade ?? localSelectedGrade;
  const setSelectedGrade = propSetSelectedGrade ?? setLocalSelectedGrade;
  const selectedExam = propSelectedExam ?? localSelectedExam;
  const setSelectedExam = propSetSelectedExam ?? setLocalSelectedExam;

  // Dialog states
  const [showAddMarksDialog, setShowAddMarksDialog] = useState(false);
  const [editingExamMark, setEditingExamMark] = useState<ExamMarkWithDetails | null>(null);
  const [showViewExamMarkDialog, setShowViewExamMarkDialog] = useState(false);
  const [viewingExamMarkId, setViewingExamMarkId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Memoized class ID for API calls
  const classId = useMemo(() => selectedClass || 0, [selectedClass]);

  // Fetch dropdown data
  const { data: classesData, isLoading: classesLoading } = useSchoolClasses();
  const { data: sectionsData, isLoading: sectionsLoading } = useSchoolSections(classId);
  const { data: subjectsData, isLoading: subjectsLoading } = useSchoolSubjects(classId);
  const { data: examsData, isLoading: examsLoading } = useSchoolExams();
  const { grades } = useGrades();

  // Reset dependent filters when class changes
  useEffect(() => {
    setSelectedSection(null);
    setSelectedSubject(null);
    setSelectedExam(null);
  }, [selectedClass, setSelectedSection, setSelectedSubject, setSelectedExam]);

  // Single exam mark view data
  const viewQuery = useSchoolExamMark(viewingExamMarkId || 0);
  const viewedExamMark = viewingExamMarkId ? viewQuery.data : null;
  const viewExamLoading = viewingExamMarkId ? viewQuery.isLoading : false;
  const viewExamError = viewingExamMarkId ? viewQuery.error : null;

  // Exam marks query params
  const examMarksQuery = useMemo(() => {
    if (!selectedClass || !selectedSubject || !selectedExam) {
      return undefined;
    }
    return {
      class_id: selectedClass,
      exam_id: selectedExam,
      subject_id: selectedSubject,
      ...(selectedSection && { section_id: selectedSection }),
    };
  }, [selectedClass, selectedSection, selectedExam, selectedSubject]);

  const hasRequiredFilters = Boolean(
    selectedClass && selectedClass > 0 &&
    selectedSubject && selectedSubject > 0 &&
    selectedExam && selectedExam > 0
  );

  const {
    data: examMarksData,
    isLoading: examMarksLoading,
  } = useSchoolExamMarksList(examMarksQuery);

  const queryClient = useQueryClient();
  const createExamMarkMutation = useCreateSchoolExamMark();
  const updateExamMarkMutation = useUpdateSchoolExamMark(editingExamMark?.mark_id || 0);
  const deleteExamMarkMutation = useDeleteSchoolExamMark();

  // Handlers
  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value ? Number(value) : null);
  }, [setSelectedClass]);

  const handleSectionChange = useCallback((value: string) => {
    setSelectedSection(value ? Number(value) : null);
  }, [setSelectedSection]);

  const handleSubjectChange = useCallback((value: string) => {
    setSelectedSubject(value ? Number(value) : null);
  }, [setSelectedSubject]);

  const handleExamChange = useCallback((value: string) => {
    setSelectedExam(value ? Number(value) : null);
  }, [setSelectedExam]);

  // Grade calculation
  const calculateGrade = useCallback((percentage: number): string => {
    for (const grade of grades) {
      if (percentage >= grade.min_percentage && percentage <= grade.max_percentage) {
        return grade.grade;
      }
    }
    return "F";
  }, [grades]);

  const calculatePercentage = (marksObtained: number, maxMarks: number = 100): number => {
    return Math.round((marksObtained / maxMarks) * 100 * 10) / 10;
  };

  // Form handling
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExamMarkSubmit = useCallback((data: {
    enrollment_id: number;
    exam_id: number;
    subject_id: number;
    marks_obtained: number;
    remarks: string;
  }) => {
    const maxMarks = editingExamMark?.max_marks ?? 100;
    const percentage = calculatePercentage(data.marks_obtained, maxMarks);
    const grade = calculateGrade(percentage);

    const payload = {
      ...data,
      percentage,
      grade,
      conducted_at: (editingExamMark?.conducted_at || new Date().toISOString()),
    };

    if (editingExamMark) {
      updateExamMarkMutation.mutate(payload);
    } else {
      createExamMarkMutation.mutate(payload);
    }

    setEditingExamMark(null);
    setShowAddMarksDialog(false);
  }, [editingExamMark, updateExamMarkMutation, createExamMarkMutation, calculateGrade]);

  const handleEditExamMark = useCallback((mark: ExamMarkWithDetails) => {
    setEditingExamMark(mark);
    setShowAddMarksDialog(true);
  }, []);

  const handleDeleteExamMark = useCallback((markId: number) => {
    setConfirmDeleteId(markId);
  }, []);

  const handleViewExamMark = useCallback((markId: number) => {
    setViewingExamMarkId(markId);
    setShowViewExamMarkDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (confirmDeleteId) {
      deleteExamMarkMutation.mutate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, deleteExamMarkMutation]);

  // Data processing
  const flattenedMarks = useMemo(() => {
    if (!examMarksData || !Array.isArray(examMarksData)) return [] as ExamMarkWithDetails[];
    const items: ExamMarkWithDetails[] = [];
    examMarksData.forEach((group) => {
      if (group && group.students && Array.isArray(group.students)) {
        group.students.forEach((student) => {
          items.push({
            ...student,
            exam_name: group.exam_name,
            subject_name: group.subject_name,
            exam_date: group.conducted_at,
            exam_id: group.exam_id,
            subject_id: group.subject_id,
          });
        });
      }
    });
    return items;
  }, [examMarksData]);

  // Client-side filtering
  const filteredMarks = useMemo(() => {
    let filtered = flattenedMarks;
    // Note: Most filtering happens server-side via query params. 
    // Additional client-side filtering can be added here if needed.
    if (selectedGrade !== "all") {
      filtered = filtered.filter((mark) => mark.grade === selectedGrade);
    }
    return filtered;
  }, [flattenedMarks, selectedGrade]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(flattenedMarks);
    }
  }, [flattenedMarks, onDataChange]);

  // Column Definitions
  const columns: ColumnDef<ExamMarkWithDetails>[] = useMemo(
    () => [
      createStudentColumn<ExamMarkWithDetails>(
        "student_name",
        "roll_number",
        "section_name",
        { header: "Student" }
      ),
      createSubjectColumn<ExamMarkWithDetails>("subject_name", "exam_name", {
        header: "Subject",
      }),
      createMarksColumn<ExamMarkWithDetails>(
        "marks_obtained",
        "max_marks",
        "percentage",
        { header: "Marks" }
      ),
      createGradeColumn<ExamMarkWithDetails>("grade", GRADE_COLORS, {
        header: "Grade",
      }),
      createTestDateColumn<ExamMarkWithDetails>("conducted_at", {
        header: "Exam Date",
      }),
    ],
    []
  );

  // Actions
  const actions: ActionConfig<ExamMarkWithDetails>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row) => handleViewExamMark(row.mark_id),
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: (row) => handleEditExamMark(row),
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: (row) => handleDeleteExamMark(row.mark_id),
    }
  ], [handleViewExamMark, handleEditExamMark, handleDeleteExamMark]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 space-y-4">
        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border shadow-sm space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-4 items-end flex-1">
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Class <span className="text-red-500">*</span>
                </label>
                <ServerCombobox
                  items={classesData?.items || []}
                  value={selectedClass?.toString() || ""}
                  onSelect={handleClassChange}
                  valueKey="class_id"
                  labelKey="class_name"
                  placeholder="Select Class"
                  searchPlaceholder="Search classes..."
                  isLoading={classesLoading}
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Section
                </label>
                <ServerCombobox
                  items={sectionsData?.items || []}
                  value={selectedSection?.toString() || ""}
                  onSelect={handleSectionChange}
                  valueKey="section_id"
                  labelKey="section_name"
                  placeholder="Select Section"
                  searchPlaceholder="Search sections..."
                  isLoading={sectionsLoading}
                  disabled={!selectedClass}
                  emptyText={!selectedClass ? "Select a class first" : "No sections found"}
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Exam <span className="text-red-500">*</span>
                </label>
                <ServerCombobox
                  items={examsData?.items || []}
                  value={selectedExam?.toString() || ""}
                  onSelect={handleExamChange}
                  valueKey="exam_id"
                  labelKey="exam_name"
                  placeholder="Select Exam"
                  searchPlaceholder="Search exams..."
                  isLoading={examsLoading}
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Subject <span className="text-red-500">*</span>
                </label>
                <ServerCombobox
                  items={subjectsData?.items || []}
                  value={selectedSubject?.toString() || ""}
                  onSelect={handleSubjectChange}
                  valueKey="subject_id"
                  labelKey="subject_name"
                  placeholder="Select Subject"
                  searchPlaceholder="Search subjects..."
                  isLoading={subjectsLoading}
                  disabled={!selectedClass}
                  emptyText={!selectedClass ? "Select a class first" : "No subjects found"}
                />
              </div>
              
              <div className="w-full sm:w-32">
                 <label className="text-sm font-medium mb-1.5 block">
                   Grade
                 </label>
                 <Select
                   value={selectedGrade}
                   onValueChange={setSelectedGrade}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="All" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Grades</SelectItem>
                     {grades.map((g) => (
                       <SelectItem key={g.grade} value={g.grade}>{g.grade}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setShowAddMarksDialog(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Marks
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters Alert */}
        {!hasRequiredFilters && (
          <Alert>
            <AlertDescription>
              Please select <strong>Class</strong>, <strong>Exam</strong>, and <strong>Subject</strong> to view marks.
            </AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        {hasRequiredFilters && (
          <DataTable
            data={filteredMarks}
            columns={columns}
            title="Exam Marks"
            loading={examMarksLoading}
            actions={actions}
            actionsHeader="Actions"
            showSearch={true}
            searchPlaceholder="Search by student name..."
            searchKeys={["student_name", "roll_number"]}
            className=""
          />
        )}

        {/* Dialogs */}
        <Dialog open={showViewExamMarkDialog} onOpenChange={setShowViewExamMarkDialog}>
          <DialogContent className="sm:max-w-[520px]">
             <DialogHeader>
               <DialogTitle>Exam Mark Details</DialogTitle>
             </DialogHeader>
             {viewExamLoading ? (
               <Loader.Data message="Loading mark..." />
             ) : viewExamError ? (
               <div className="p-6 text-center text-red-600">Failed to load mark details.</div>
             ) : viewedExamMark ? (
               <div className="space-y-4 pt-2">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Student</div>
                     <div className="font-medium text-lg">{viewedExamMark.student_name}</div>
                     <div className="text-sm text-muted-foreground">Roll: {viewedExamMark.roll_number}</div>
                   </div>
                   <div>
                     <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Class Info</div>
                     <div className="font-medium">{viewedExamMark.class_name}</div>
                     <div className="text-sm text-muted-foreground">{viewedExamMark.section_name}</div>
                   </div>
                   <div>
                     <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Exam & Subject</div>
                     <div className="font-medium">{viewedExamMark.exam_name}</div>
                     <div className="text-sm text-muted-foreground">{viewedExamMark.subject_name}</div>
                   </div>
                   <div>
                     <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Performance</div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-xl">{viewedExamMark.marks_obtained}</span>
                        <span className="text-muted-foreground">/ {viewedExamMark.max_marks || 100}</span>
                     </div>
                     <div className={`text-sm font-medium ${
                       viewedExamMark.grade === 'F' ? 'text-red-600' : 'text-green-600'
                     }`}>
                       Grade: {viewedExamMark.grade} ({viewedExamMark.percentage}%)
                     </div>
                   </div>
                 </div>
                 {viewedExamMark.remarks && (
                   <div className="bg-slate-50 p-3 rounded-md border text-sm">
                      <span className="font-semibold block mb-1">Remarks:</span>
                      {viewedExamMark.remarks}
                   </div>
                 )}
                 <div className="text-xs text-muted-foreground text-right border-t pt-2">
                    Date: {viewedExamMark.conducted_at ? new Date(viewedExamMark.conducted_at).toLocaleDateString() : 'N/A'}
                 </div>
               </div>
             ) : (
                <div className="p-6 text-center text-muted-foreground">No details found.</div>
             )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
          <AlertDialogContent>
            <AlertHeader>
              <AlertDialogTitle>Delete Exam Mark</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this exam mark? This action cannot be undone.
              </AlertDialogDescription>
            </AlertHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AddMarksByClassDialog
          isOpen={showAddMarksDialog}
          onClose={() => setShowAddMarksDialog(false)}
          onSuccess={() => {
            void queryClient.invalidateQueries({
              queryKey: schoolKeys.examMarks.root(),
            });
            void queryClient.refetchQueries({
              queryKey: schoolKeys.examMarks.root(),
              type: "active",
            });
          }}
        />
      </div>
    </div>
  );
};

export default ExamMarksManagementComponent;
