import { useState, useMemo, useEffect, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedDataTable } from "@/components/shared";
import {
  SchoolClassDropdown,
  SchoolSectionDropdown,
  SchoolSubjectDropdown,
  SchoolExamDropdown,
} from "@/components/shared/Dropdowns";
import {
  useSchoolExamMarksList,
  useSchoolExamMark,
  useCreateSchoolExamMark,
  useUpdateSchoolExamMark,
  useDeleteSchoolExamMark,
} from "@/lib/hooks/school/use-school-exam-marks";
import {
  useSchoolSections,
  useSchoolSubjects,
  useSchoolExams,
} from "@/lib/hooks/school/use-school-dropdowns";
import type {
  ExamMarkWithDetails,
  ExamMarksQuery,
} from "@/lib/types/school/exam-marks";
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
} from "@/lib/utils/factory/columnFactories";
import AddExamMarkForm from "./AddExamMarkForm";


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

// Grade colors mapping - moved outside component for better performance
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
  // Use props if provided, otherwise use local state (for backward compatibility)
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
  const [showExamMarkDialog, setShowExamMarkDialog] = useState(false);
  const [editingExamMark, setEditingExamMark] =
    useState<ExamMarkWithDetails | null>(null);
  const [showViewExamMarkDialog, setShowViewExamMarkDialog] = useState(false);
  const [viewingExamMarkId, setViewingExamMarkId] = useState<number | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Memoized class ID for API calls
  const classId = useMemo(
    () => selectedClass || 0,
    [selectedClass]
  );

  // Get sections, subjects, and exams data for lookup maps (for filtering by name)
  const { data: sectionsData } = useSchoolSections(classId);
  const { data: subjectsData } = useSchoolSubjects(classId);
  const { data: examsData } = useSchoolExams();

  // Create lookup maps: ID -> Name (for filtering)
  const sectionIdToName = useMemo(() => {
    const map = new Map<number, string>();
    sectionsData?.items?.forEach((section) => {
      map.set(section.section_id, section.section_name);
    });
    return map;
  }, [sectionsData]);

  const subjectIdToName = useMemo(() => {
    const map = new Map<number, string>();
    subjectsData?.items?.forEach((subject) => {
      map.set(subject.subject_id, subject.subject_name);
    });
    return map;
  }, [subjectsData]);

  const examIdToName = useMemo(() => {
    const map = new Map<number, string>();
    examsData?.items?.forEach((exam) => {
      map.set(exam.exam_id, exam.exam_name);
    });
    return map;
  }, [examsData]);

  // Reset section, subject, and exam when class changes
  useEffect(() => {
    setSelectedSection(null);
    setSelectedSubject(null);
    setSelectedExam(null);
  }, [selectedClass]);

  // Single exam mark view data (enabled only when an id is set)
  const viewQuery = useSchoolExamMark(viewingExamMarkId || 0);
  const viewedExamMark = viewingExamMarkId ? viewQuery.data : null;
  const viewExamLoading = viewingExamMarkId ? viewQuery.isLoading : false;
  const viewExamError = viewingExamMarkId ? viewQuery.error : null;

  // Exam marks hooks - only fetch when class is selected
  const examMarksQuery = useMemo(() => {
    if (!selectedClass) {
      return undefined;
    }

    // Only fetch by class, let EnhancedDataTable handle other filters
    const query: ExamMarksQuery = {
      class_id: selectedClass,
    };

    return query;
  }, [selectedClass]);

  const {
    data: examMarksData,
    isLoading: examMarksLoading,
    error: examMarksError,
  } = useSchoolExamMarksList(examMarksQuery);

  const createExamMarkMutation = useCreateSchoolExamMark();
  const updateExamMarkMutation = useUpdateSchoolExamMark(
    editingExamMark?.mark_id || 0
  );
  const deleteExamMarkMutation = useDeleteSchoolExamMark();

  // Memoized handlers
  const handleClassChange = useCallback((value: number | null) => {
    setSelectedClass(value);
  }, []);

  const handleSectionChange = useCallback((value: number | null) => {
    setSelectedSection(value);
  }, []);

  const handleSubjectChange = useCallback((value: number | null) => {
    setSelectedSubject(value);
  }, []);

  const handleGradeChange = useCallback((value: string) => {
    setSelectedGrade(value);
  }, []);

  const handleExamChange = useCallback((value: number | null) => {
    setSelectedExam(value);
  }, []);

  // Memoized form handling functions
  const handleExamMarkSubmit = useCallback(
    (markData: any) => {
      if (editingExamMark) {
        updateExamMarkMutation.mutate({
          marks_obtained: markData.marks_obtained,
          percentage: markData.percentage,
          grade: markData.grade,
          remarks: markData.remarks,
          conducted_at: markData.conducted_at,
        });
      } else {
        createExamMarkMutation.mutate(markData);
      }

      setEditingExamMark(null);
      setShowExamMarkDialog(false);
    },
    [editingExamMark, updateExamMarkMutation, createExamMarkMutation]
  );

  const handleEditExamMark = useCallback((mark: ExamMarkWithDetails) => {
    setEditingExamMark(mark);
    setShowExamMarkDialog(true);
  }, []);

  const handleDeleteExamMark = useCallback((markId: number) => {
    setConfirmDeleteId(markId);
  }, []);

  const handleViewExamMark = useCallback((markId: number) => {
    setViewingExamMarkId(markId);
    setShowViewExamMarkDialog(true);
  }, []);

  // Memoized dialog handlers
  const closeExamMarkDialog = useCallback(() => {
    setShowExamMarkDialog(false);
    setEditingExamMark(null);
  }, []);

  const closeViewDialog = useCallback(() => {
    setShowViewExamMarkDialog(false);
    setViewingExamMarkId(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setConfirmDeleteId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (confirmDeleteId) {
      deleteExamMarkMutation.mutate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, deleteExamMarkMutation]);

  // Process data - flatten grouped response, then apply shared search filter
  const flattenedMarks = useMemo(() => {
    if (!examMarksData || !Array.isArray(examMarksData))
      return [] as ExamMarkWithDetails[];
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

  // Apply client-side filtering for section, subject, and grade
  const filteredMarks = useMemo(() => {
    let filtered = flattenedMarks;

    // Apply section filter (client-side) - filter by section_name using lookup
    if (selectedSection !== null) {
      const sectionName = sectionIdToName.get(selectedSection);
      if (sectionName) {
        filtered = filtered.filter(
          (mark) => mark.section_name === sectionName
        );
      }
    }

    // Apply subject filter (client-side) - filter by subject_id
    if (selectedSubject !== null) {
      filtered = filtered.filter(
        (mark) => mark.subject_id !== undefined && mark.subject_id === selectedSubject
      );
    }

    // Apply grade filter (client-side)
    if (selectedGrade !== "all") {
      filtered = filtered.filter((mark) => mark.grade === selectedGrade);
    }

    // Apply exam filter (client-side) - filter by exam_id
    if (selectedExam !== null) {
      filtered = filtered.filter(
        (mark) => mark.exam_id !== undefined && mark.exam_id === selectedExam
      );
    }

    return filtered;
  }, [
    flattenedMarks,
    selectedSection,
    selectedSubject,
    selectedGrade,
    selectedExam,
    sectionIdToName,
  ]);

  // Use filtered marks for the table
  const examMarks = filteredMarks;

  // Notify parent component when data changes - use flattenedMarks (all data) for statistics
  useEffect(() => {
    if (onDataChange) {
      onDataChange(flattenedMarks);
    }
  }, [flattenedMarks, onDataChange]);

  // Table columns for exam marks using column factories
  const examMarkColumns: ColumnDef<ExamMarkWithDetails>[] = useMemo(
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

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (row: ExamMarkWithDetails) => handleViewExamMark(row.mark_id),
      },
      {
        type: "edit" as const,
        onClick: (row: ExamMarkWithDetails) => handleEditExamMark(row),
      },
      {
        type: "delete" as const,
        onClick: (row: ExamMarkWithDetails) =>
          handleDeleteExamMark(row.mark_id),
      },
    ],
    [handleViewExamMark, handleEditExamMark, handleDeleteExamMark]
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="p-2 space-y-2">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Unified Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Class:</label>
                <SchoolClassDropdown
                  value={selectedClass}
                  onChange={handleClassChange}
                  placeholder="Select class"
                  emptyValue
                  emptyValueLabel="Select class"
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Section:</label>
                <SchoolSectionDropdown
                  classId={classId}
                  value={selectedSection}
                  onChange={handleSectionChange}
                  placeholder="Select section"
                  emptyValue
                  emptyValueLabel="Select section"
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Subject:</label>
                <SchoolSubjectDropdown
                  classId={classId}
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  placeholder="Select subject"
                  emptyValue
                  emptyValueLabel="Select subject"
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Grade:</label>
                <Select
                  value={selectedGrade}
                  onValueChange={handleGradeChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C+">C+</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Exam:</label>
                <SchoolExamDropdown
                  value={selectedExam}
                  onChange={handleExamChange}
                  placeholder="Select exam"
                  emptyValue
                  emptyValueLabel="Select exam"
                  className="w-40"
                />
              </div>
            </div>

            {/* Data Table */}
            {!selectedClass ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Select a Class
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Please select a class from the dropdown above to view exam
                      marks.
                    </p>
                  </div>
                </div>
              </Card>
            ) : examMarksLoading ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600">Loading exam marks...</p>
                </div>
              </Card>
            ) : examMarksError ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Error Loading Data
                    </h3>
                    <p className="text-slate-600 mt-1">
                      {examMarksError?.message ||
                        "Failed to load exam marks. Please try again."}
                    </p>
                  </div>
                </div>
              </Card>
            ) : examMarks.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      No Exam Marks Found
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Try changing filters or ensure marks are recorded for this
                      class.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <EnhancedDataTable
                data={examMarks}
                title="Exam Marks"
                searchKey={
                  [
                    "student_name",
                    "roll_number",
                    "class_name",
                    "section_name",
                    "exam_name",
                    "subject_name",
                  ] as any
                }
                searchPlaceholder="Search students..."
                columns={examMarkColumns}
                onAdd={() => setShowExamMarkDialog(true)}
                addButtonText="Add Exam Mark"
                exportable={true}
                showActions={true}
                actionButtonGroups={actionButtonGroups}
                actionColumnHeader="Actions"
                showActionLabels={true}
              />
            )}

            {/* View Exam Mark Dialog */}
            <Dialog
              open={showViewExamMarkDialog}
              onOpenChange={closeViewDialog}
            >
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Exam Mark Details</DialogTitle>
                </DialogHeader>
                {viewExamLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-600">Loading mark...</p>
                  </div>
                ) : viewExamError ? (
                  <div className="p-6 text-center text-red-600">
                    Failed to load mark details.
                  </div>
                ) : viewedExamMark ? (
                  <div className="space-y-4 p-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Student</div>
                        <div className="font-medium text-slate-900">
                          {viewedExamMark.student_name} (
                          {viewedExamMark.roll_number})
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Class / Section
                        </div>
                        <div className="font-medium text-slate-900">
                          {viewedExamMark.class_name} •{" "}
                          {viewedExamMark.section_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Exam</div>
                        <div className="font-medium text-slate-900">
                          {viewedExamMark.exam_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Subject</div>
                        <div className="font-medium text-slate-900">
                          {viewedExamMark.subject_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Marks</div>
                        <div className="font-semibold text-slate-900">
                          {viewedExamMark.marks_obtained ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Grade</div>
                        <div className="font-semibold text-slate-900">
                          {viewedExamMark.grade ?? "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Percentage</div>
                        <div className="font-semibold text-slate-900">
                          {viewedExamMark.percentage ?? 0}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="font-medium text-slate-900">
                          {viewedExamMark.conducted_at
                            ? new Date(
                                viewedExamMark.conducted_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    {viewedExamMark.remarks && (
                      <div>
                        <div className="text-xs text-slate-500">Remarks</div>
                        <div className="text-slate-800">
                          {viewedExamMark.remarks}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-600">
                    No details found.
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Confirm Delete Exam Mark */}
            <AlertDialog
              open={confirmDeleteId !== null}
              onOpenChange={closeDeleteDialog}
            >
              <AlertDialogContent>
                <AlertHeader>
                  <AlertDialogTitle>Delete Exam Mark</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this exam mark? This action
                    cannot be undone.
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

            {/* Add/Edit Exam Mark Form */}
            <AddExamMarkForm
              isOpen={showExamMarkDialog}
              onClose={closeExamMarkDialog}
              onSubmit={handleExamMarkSubmit}
              editingExamMark={editingExamMark}
              selectedClass={selectedClass}
              selectedSection={selectedSection}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExamMarksManagementComponent;
