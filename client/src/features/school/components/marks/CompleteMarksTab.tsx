import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Download, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Input } from "@/common/components/ui/input";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  SchoolClassDropdown,
  SchoolSectionDropdown,
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
  marks: Record<number, { marks_obtained: number; remarks: string }>; // subject_id -> marks data
}

const CompleteMarksTab = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [examName, setExamName] = useState<string>("");

  // Student marks data - stored in state and session storage
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

  // Initialize marks data when students/subjects change (only if not already initialized)
  useEffect(() => {
    if (!enrollmentsData?.items || !subjectsData?.items) {
      return;
    }

    // Check if we already have data for all students - if so, don't overwrite
    const hasAllStudents = enrollmentsData.items.every((enrollment) => 
      marksData[enrollment.enrollment_id]
    );
    if (hasAllStudents && Object.keys(marksData).length > 0) {
      // Only update if new subjects were added
      const existingSubjectIds = new Set(
        Object.values(marksData)[0]?.marks ? Object.keys(Object.values(marksData)[0].marks).map(Number) : []
      );
      const newSubjectIds = new Set(subjectsData.items.map((s) => s.subject_id));
      const hasNewSubjects = Array.from(newSubjectIds).some((id) => !existingSubjectIds.has(id));
      
      if (!hasNewSubjects) {
        return; // No new subjects, keep existing data
      }
    }

    setMarksData((prev) => {
      const newMarksData: Record<number, StudentMarksData> = { ...prev };
      
      enrollmentsData.items.forEach((enrollment: SchoolEnrollmentWithStudentDetails) => {
        const existingData = prev[enrollment.enrollment_id];
        const marks: Record<number, { marks_obtained: number; remarks: string }> = 
          existingData?.marks ? { ...existingData.marks } : {};

        // Add marks for new subjects
        subjectsData.items.forEach((subject) => {
          if (!marks[subject.subject_id]) {
            marks[subject.subject_id] = {
              marks_obtained: 0,
              remarks: "",
            };
          }
        });

        // Remove marks for subjects that no longer exist
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
    return enrollmentsData.items.sort((a, b) => 
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
        // Clear session storage after successful save
        const storageKey = getStorageKey();
        if (storageKey) {
          sessionStorage.removeItem(storageKey);
        }
        setMarksData({});
      },
    });
  }, [selectedExam, examName, students, subjects, marksData, bulkCreateMutation, getStorageKey]);

  // Check if all required fields are selected
  const isReady = Boolean(selectedClass && selectedSection && selectedExam && students.length > 0 && subjects.length > 0);

  // Check if there are any marks entered
  const hasMarks = useMemo(() => {
    return Object.values(marksData).some((studentData) =>
      Object.values(studentData.marks).some((mark) => mark.marks_obtained > 0)
    );
  }, [marksData]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Complete Marks Entry</h2>
              <p className="text-slate-600 mt-1">
                Enter marks for all students and all subjects at once
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Select Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    Class: <span className="text-red-500">*</span>
                  </label>
                  <SchoolClassDropdown
                    value={selectedClass}
                    onChange={setSelectedClass}
                    placeholder="Select class"
                    emptyValue
                    emptyValueLabel="Select class"
                    className="w-48"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    Section: <span className="text-red-500">*</span>
                  </label>
                  <SchoolSectionDropdown
                    classId={selectedClass || 0}
                    value={selectedSection}
                    onChange={setSelectedSection}
                    placeholder="Select section"
                    emptyValue
                    emptyValueLabel="Select section"
                    className="w-48"
                    disabled={!selectedClass}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    Exam: <span className="text-red-500">*</span>
                  </label>
                  <SchoolExamDropdown
                    value={selectedExam}
                    onChange={setSelectedExam}
                    placeholder="Select exam"
                    emptyValue
                    emptyValueLabel="Select exam"
                    className="w-48"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {!isReady && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select Class, Section, and Exam to start entering marks.
              </AlertDescription>
            </Alert>
          )}

          {isReady && enrollmentsLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader.Data message="Loading students..." />
            </div>
          )}

          {isReady && !enrollmentsLoading && students.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No students found for the selected class and section.
              </AlertDescription>
            </Alert>
          )}

          {isReady && !enrollmentsLoading && subjects.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No subjects found for the selected class.
              </AlertDescription>
            </Alert>
          )}

          {/* Marks Table */}
          {isReady && !enrollmentsLoading && students.length > 0 && subjects.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Marks Entry Table ({students.length} students × {subjects.length} subjects)
                  </CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200">
                            Roll No
                          </th>
                          <th className="sticky left-[80px] z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 min-w-[200px]">
                            Student Name
                          </th>
                          {subjects.map((subject) => (
                            <th
                              key={subject.subject_id}
                              className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 min-w-[150px]"
                            >
                              <div className="flex flex-col gap-1">
                                <span>{subject.subject_name}</span>
                                <span className="text-[10px] font-normal text-slate-500">
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
                              <td className="sticky left-0 z-10 bg-white px-4 py-2 text-sm font-medium text-slate-900 border-r border-slate-200">
                                {student.roll_number}
                              </td>
                              <td className="sticky left-[80px] z-10 bg-white px-4 py-2 text-sm font-medium text-slate-900 border-r border-slate-200">
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
                                        className="h-8 text-sm"
                                      />
                                      <Input
                                        type="text"
                                        placeholder="Remarks (optional)"
                                        value={markData.remarks || ""}
                                        onChange={(e) =>
                                          handleMarksChange(
                                            student.enrollment_id,
                                            subject.subject_id,
                                            "remarks",
                                            e.target.value
                                          )
                                        }
                                        className="h-8 text-xs"
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteMarksTab;

