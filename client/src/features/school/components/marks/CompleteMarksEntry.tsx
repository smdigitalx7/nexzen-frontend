import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { AlertCircle, Save } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  SchoolExamDropdown,
} from "@/common/components/shared/Dropdowns";
import {
  useSchoolEnrollmentsList,
} from "@/features/school/hooks/use-school-enrollments";
import {
  useSchoolSubjects,
  useSchoolExams,
} from "@/features/school/hooks/use-school-dropdowns";
import {
  useBulkCreateMultipleStudentsExamMarks,
} from "@/features/school/hooks/use-school-exam-marks";
import type {
  CreateBulkMultipleStudentsRequest,
  BulkMultipleStudentsSubject,
  BulkMultipleStudentsStudent,
} from "@/features/school/types";
import type { SchoolEnrollmentWithStudentDetails } from "@/features/school/types";

// Session storage key prefix
const STORAGE_KEY_PREFIX = "complete_marks_";

interface StudentMarksData {
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  section_name: string;
  marks: Record<number, { marks_obtained: number; remarks: string }>;
}

interface CompleteMarksEntryProps {
  selectedClass: number | null;
  selectedSection: number | null;
  onClose: () => void;
  onSaveReady?: (saveHandler: () => void) => void;
  onMarksSaved?: () => void;
}

const CompleteMarksEntry = ({ selectedClass, selectedSection, onClose, onSaveReady, onMarksSaved }: CompleteMarksEntryProps) => {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [examName, setExamName] = useState<string>("");
  const [marksData, setMarksData] = useState<Record<number, StudentMarksData>>({});

  // Get storage key based on current selections
  const getStorageKey = useCallback(() => {
    if (!selectedClass || !selectedSection || !selectedExam) return null;
    return `${STORAGE_KEY_PREFIX}${selectedClass}_${selectedSection}_${selectedExam}`;
  }, [selectedClass, selectedSection, selectedExam]);

  // Load from session storage
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMarksData(parsed);
      } else {
        setMarksData({});
      }
    } catch (error) {
      console.error("Error loading from session storage:", error);
      setMarksData({});
    }
  }, [getStorageKey]);

  // Save to session storage whenever marksData changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(marksData));
    } catch (error) {
      console.error("Error saving to session storage:", error);
    }
  }, [marksData, getStorageKey]);

  // Fetch students
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useSchoolEnrollmentsList({
    class_id: selectedClass || 0,
    section_id: selectedSection || undefined,
    enabled: Boolean(selectedClass),
  });

  // Fetch subjects for the class
  const { data: subjectsData } = useSchoolSubjects(selectedClass || 0, {
    enabled: Boolean(selectedClass),
  });

  // Fetch exam name when exam is selected
  const { data: examsData } = useSchoolExams({ enabled: true });
  useEffect(() => {
    if (selectedExam && examsData?.items) {
      const exam = examsData.items.find((e) => e.exam_id === selectedExam);
      if (exam) {
        setExamName(exam.exam_name);
      } else {
        setExamName("");
      }
    } else {
      setExamName("");
    }
  }, [selectedExam, examsData]);

  // Initialize marks data when students/subjects change
  useEffect(() => {
    if (!enrollmentsData?.items || !subjectsData?.items) {
      return;
    }

    setMarksData((prev) => {
      const newMarksData: Record<number, StudentMarksData> = { ...prev };
      
      enrollmentsData.items!.forEach((enrollment: SchoolEnrollmentWithStudentDetails) => {
        const existingData = prev[enrollment.enrollment_id];
        const marks: Record<number, { marks_obtained: number; remarks: string }> = 
          existingData?.marks ? { ...existingData.marks } : {};

        subjectsData.items.forEach((subject) => {
          if (!marks[subject.subject_id]) {
            marks[subject.subject_id] = {
              marks_obtained: 0,
              remarks: "",
            };
          }
        });

        Object.keys(marks).forEach((subjectIdStr) => {
          const subjectId = Number(subjectIdStr);
          if (!subjectsData.items.find((s) => s.subject_id === subjectId)) {
            delete marks[subjectId];
          }
        });

        newMarksData[enrollment.enrollment_id] = {
          enrollment_id: enrollment.enrollment_id,
          student_name: enrollment.student_name,
          roll_number: enrollment.roll_number,
          section_name: enrollment.section_name || "",
          marks,
        };
      });

      return newMarksData;
    });
  }, [enrollmentsData?.items, subjectsData?.items]);

  // Memoized students list
  const students = useMemo(() => {
    if (!enrollmentsData?.items) return [];
    return [...enrollmentsData.items].sort((a, b) => 
      a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [enrollmentsData?.items]);

  // Memoized subjects list
  const subjects = useMemo(() => {
    if (!subjectsData?.items) return [];
    return subjectsData.items.sort((a, b) => a.subject_name.localeCompare(b.subject_name));
  }, [subjectsData?.items]);

  // Handle marks change
  const handleMarksChange = useCallback((
    enrollmentId: number,
    subjectId: number,
    field: "marks_obtained" | "remarks",
    value: string | number
  ) => {
    setMarksData((prev) => {
      const studentData = prev[enrollmentId];
      if (!studentData) return prev;

      return {
        ...prev,
        [enrollmentId]: {
          ...studentData,
          marks: {
            ...studentData.marks,
            [subjectId]: {
              ...studentData.marks[subjectId],
              [field]: field === "marks_obtained" ? Number(value) || 0 : value,
            },
          },
        },
      };
    });
  }, []);

  // Bulk create mutation
  const bulkCreateMutation = useBulkCreateMultipleStudentsExamMarks();

  // Handle save
  const handleSave = useCallback(() => {
    if (!selectedExam || !examName || students.length === 0 || subjects.length === 0) {
      return;
    }

    const studentsPayload: BulkMultipleStudentsStudent[] = students.map((student) => {
      const studentData = marksData[student.enrollment_id];
      if (!studentData) {
        return {
          enrollment_id: student.enrollment_id,
          student_name: student.student_name,
          subjects: [],
        };
      }

      const subjectsPayload: BulkMultipleStudentsSubject[] = subjects.map((subject) => {
        const markData = studentData.marks[subject.subject_id];
        return {
          subject_id: subject.subject_id,
          marks_obtained: markData?.marks_obtained || 0,
          remarks: markData?.remarks || "",
          subject_name: subject.subject_name,
        };
      });

      return {
        enrollment_id: student.enrollment_id,
        student_name: student.student_name,
        subjects: subjectsPayload,
      };
    });

    const payload: CreateBulkMultipleStudentsRequest = {
      exam_id: selectedExam,
      students: studentsPayload,
      exam_name: examName,
    };

    bulkCreateMutation.mutate(payload, {
      onSuccess: () => {
        const storageKey = getStorageKey();
        if (storageKey) {
          sessionStorage.removeItem(storageKey);
        }
        setMarksData({});
        onClose();
      },
    });
  }, [selectedExam, examName, students, subjects, marksData, bulkCreateMutation, getStorageKey, onClose]);

  // Expose handleSave to parent via callback
  useEffect(() => {
    if (onSaveReady) {
      onSaveReady(handleSave);
    }
  }, [handleSave, onSaveReady]);

  // Check if all required fields are selected
  const isReady = Boolean(selectedClass && selectedSection && selectedExam && students.length > 0 && subjects.length > 0);

  // Check if there are any marks entered
  const hasMarks = useMemo(() => {
    return Object.values(marksData).some((studentData) =>
      Object.values(studentData.marks).some((mark) => mark.marks_obtained > 0)
    );
  }, [marksData]);

  if (!selectedClass || !selectedSection) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select Class and Section in the main filters to use Complete Marks entry.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="complete-exam-select" className="text-sm font-medium">
          Exam: <span className="text-red-500">*</span>
        </label>
        <SchoolExamDropdown
          id="complete-exam-select"
          value={selectedExam}
          onChange={setSelectedExam}
          placeholder="Select exam"
          emptyValue
          emptyValueLabel="Select exam"
          className="flex-1"
        />
      </div>

      {!selectedExam && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select an exam to start entering marks.
          </AlertDescription>
        </Alert>
      )}

      {selectedExam && enrollmentsLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader.Data message="Loading students..." />
        </div>
      )}

      {selectedExam && !enrollmentsLoading && students.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No students found for the selected class and section.
          </AlertDescription>
        </Alert>
      )}

      {selectedExam && !enrollmentsLoading && subjects.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No subjects found for the selected class.
          </AlertDescription>
        </Alert>
      )}

      {isReady && !enrollmentsLoading && students.length > 0 && subjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Enter marks for {students.length} students × {subjects.length} subjects
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasMarks || bulkCreateMutation.isPending}
              className="gap-2"
            >
              {bulkCreateMutation.isPending ? (
                <>
                  <Loader.Button size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save All Marks
                </>
              )}
            </Button>
          </div>
          <div className="overflow-x-auto border rounded-lg max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 z-20 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase border-r border-slate-200">
                    Roll No
                  </th>
                  <th className="sticky left-[70px] z-20 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase border-r border-slate-200 min-w-[150px]">
                    Student
                  </th>
                  {subjects.map((subject) => (
                    <th
                      key={subject.subject_id}
                      className="px-3 py-2 text-center text-xs font-semibold text-slate-700 uppercase border-r border-slate-200 min-w-[120px]"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px]">{subject.subject_name}</span>
                        <span className="text-[9px] font-normal text-slate-500">
                          Marks / Remarks
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {students.map((student) => {
                  const studentData = marksData[student.enrollment_id];
                  return (
                    <tr key={student.enrollment_id} className="hover:bg-slate-50">
                      <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs font-medium text-slate-900 border-r border-slate-200">
                        {student.roll_number}
                      </td>
                      <td className="sticky left-[70px] z-10 bg-white px-3 py-2 text-xs font-medium text-slate-900 border-r border-slate-200">
                        {student.student_name}
                      </td>
                      {subjects.map((subject) => {
                        const markData = studentData?.marks[subject.subject_id] || {
                          marks_obtained: 0,
                          remarks: "",
                        };
                        return (
                          <td
                            key={subject.subject_id}
                            className="px-2 py-2 border-r border-slate-200"
                          >
                            <div className="flex flex-col gap-1">
                              <Input
                                id={`complete-mark-${student.enrollment_id}-${subject.subject_id}`}
                                name={`complete-mark-${student.enrollment_id}-${subject.subject_id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Marks"
                                value={markData.marks_obtained || ""}
                                onChange={(e) =>
                                  handleMarksChange(
                                    student.enrollment_id,
                                    subject.subject_id,
                                    "marks_obtained",
                                    e.target.value
                                  )
                                }
                                className="h-7 text-xs"
                                autoComplete="off"
                                aria-label={`Marks for ${student.student_name} in ${subject.subject_name}`}
                              />
                              <Input
                                id={`complete-remark-${student.enrollment_id}-${subject.subject_id}`}
                                name={`complete-remark-${student.enrollment_id}-${subject.subject_id}`}
                                type="text"
                                placeholder="Remarks"
                                value={markData.remarks || ""}
                                onChange={(e) =>
                                  handleMarksChange(
                                    student.enrollment_id,
                                    subject.subject_id,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                                className="h-7 text-xs"
                                autoComplete="off"
                                aria-label={`Remarks for ${student.student_name} in ${subject.subject_name}`}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteMarksEntry;

