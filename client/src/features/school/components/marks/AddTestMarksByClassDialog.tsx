import { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { AlertCircle, Save } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import {
  SchoolClassDropdown,
  SchoolSectionDropdown,
  SchoolTestDropdown,
} from "@/common/components/shared/Dropdowns";
import { useSchoolEnrollmentsList } from "@/features/school/hooks/use-school-enrollments";
import {
  useSchoolSubjects,
  useSchoolTests,
} from "@/features/school/hooks/use-school-dropdowns";
import { useBulkCreateMultipleStudentsTestMarks } from "@/features/school/hooks/use-school-test-marks";
import type {
  CreateBulkMultipleStudentsTestRequest,
  BulkMultipleStudentsTestSubject,
  BulkMultipleStudentsTestStudent,
} from "@/features/school/types/test-marks";
import type { SchoolEnrollmentRead } from "@/features/school/types/enrollments";

interface StudentMarksData {
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  section_name: string;
  marks: Record<number, { marks_obtained: number; remarks: string }>;
}

interface AddTestMarksByClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddTestMarksByClassDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: AddTestMarksByClassDialogProps) => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [testName, setTestName] = useState<string>("");
  const [marksData, setMarksData] = useState<Record<number, StudentMarksData>>(
    {}
  );

  const queryClient = useQueryClient();

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedClass(null);
      setSelectedSection(null);
      setSelectedTest(null);
      setTestName("");
      setMarksData({});
    }
  }, [isOpen]);

  // Reset marks when class changes (but keep section if it was selected)
  useEffect(() => {
    if (selectedClass) {
      setMarksData({});
    }
  }, [selectedClass]);

  // Fetch enrollments when class is selected (section is optional)
  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useSchoolEnrollmentsList({
    class_id: selectedClass || 0,
    section_id: selectedSection || undefined,
    enabled: Boolean(selectedClass), // Only require class_id, section_id is optional
    page: 1,
    page_size: 1000, // Get all students
  });

  // Explicitly refetch enrollments whenever class_id or section_id changes
  useEffect(() => {
    if (selectedClass) {
      // Invalidate the specific query to force refetch when class_id or section_id changes
      void queryClient.invalidateQueries({
        queryKey: schoolKeys.enrollments.list({
          class_id: selectedClass,
          section_id: selectedSection || undefined,
          page: 1,
          page_size: 1000,
        } as Record<string, unknown>),
      });
      // Explicitly refetch to ensure fresh data is fetched
      void refetchEnrollments();
    }
  }, [selectedClass, selectedSection, queryClient, refetchEnrollments]);

  // Fetch subjects for the class
  const { data: subjectsData } = useSchoolSubjects(selectedClass || 0, {
    enabled: Boolean(selectedClass),
  });

  // Fetch test name when test is selected
  const { data: testsData } = useSchoolTests({ enabled: true });
  useEffect(() => {
    if (selectedTest && testsData?.items) {
      const test = testsData.items.find((t) => t.test_id === selectedTest);
      if (test) {
        setTestName(test.test_name);
      } else {
        setTestName("");
      }
    } else {
      setTestName("");
    }
  }, [selectedTest, testsData]);

  // Initialize marks data when students/subjects change
  useEffect(() => {
    if (!enrollmentsData?.enrollments || !subjectsData?.items) {
      return;
    }

    // Flatten enrollments - same logic as students memo
    const allEnrollments: SchoolEnrollmentRead[] = [];
    enrollmentsData.enrollments.forEach((group) => {
      if (group?.students && Array.isArray(group.students)) {
        group.students.forEach((student) => {
          if (student && student.enrollment_id) {
            allEnrollments.push(student);
          }
        });
      }
    });

    // Only proceed if we have enrollments and subjects
    if (allEnrollments.length === 0 || subjectsData.items.length === 0) {
      return;
    }

    setMarksData((prev) => {
      const newMarksData: Record<number, StudentMarksData> = { ...prev };

      allEnrollments.forEach((enrollment) => {
        const existingData = prev[enrollment.enrollment_id];
        const marks: Record<
          number,
          { marks_obtained: number; remarks: string }
        > = existingData?.marks ? { ...existingData.marks } : {};

        // Initialize marks for all subjects
        subjectsData.items.forEach((subject) => {
          if (!marks[subject.subject_id]) {
            marks[subject.subject_id] = {
              marks_obtained: 0,
              remarks: "",
            };
          }
        });

        // Remove marks for subjects that are no longer in the class
        Object.keys(marks).forEach((subjectIdStr) => {
          const subjectId = Number(subjectIdStr);
          if (!subjectsData.items.some((s) => s.subject_id === subjectId)) {
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
  }, [enrollmentsData?.enrollments, subjectsData?.items]);

  // Memoized students list - properly flatten the nested structure
  const students = useMemo(() => {
    if (!enrollmentsData?.enrollments) {
      return [];
    }

    const allEnrollments: SchoolEnrollmentRead[] = [];

    // Handle the nested structure: enrollments is an array of groups, each group has students
    enrollmentsData.enrollments.forEach((group) => {
      if (group?.students && Array.isArray(group.students)) {
        group.students.forEach((student) => {
          if (student && student.enrollment_id) {
            allEnrollments.push(student);
          }
        });
      }
    });

    // Sort by roll number (handle null/undefined roll numbers)
    return allEnrollments.sort((a, b) => {
      const rollA = a.roll_number || "";
      const rollB = b.roll_number || "";
      return rollA.localeCompare(rollB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [enrollmentsData?.enrollments]);

  // Memoized subjects list
  const subjects = useMemo(() => {
    if (!subjectsData?.items) return [];
    return subjectsData.items.sort((a, b) =>
      a.subject_name.localeCompare(b.subject_name)
    );
  }, [subjectsData?.items]);

  // Handle marks change
  const handleMarksChange = useCallback(
    (
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
                [field]:
                  field === "marks_obtained" ? Number(value) || 0 : value,
              },
            },
          },
        };
      });
    },
    []
  );

  // Bulk create mutation
  const bulkCreateMutation = useBulkCreateMultipleStudentsTestMarks();

  // Handle save
  const handleSave = useCallback(() => {
    if (
      !selectedTest ||
      !testName ||
      students.length === 0 ||
      subjects.length === 0
    ) {
      return;
    }

    const studentsPayload: BulkMultipleStudentsTestStudent[] = students.map(
      (student) => {
        const studentData = marksData[student.enrollment_id];
        if (!studentData) {
          return {
            enrollment_id: student.enrollment_id,
            student_name: student.student_name,
            subjects: [],
          };
        }

        const subjectsPayload: BulkMultipleStudentsTestSubject[] = subjects.map(
          (subject) => {
            const markData = studentData.marks[subject.subject_id];
            return {
              subject_id: subject.subject_id,
              marks_obtained: markData?.marks_obtained || 0,
              remarks: markData?.remarks || "",
              subject_name: subject.subject_name,
            };
          }
        );

        return {
          enrollment_id: student.enrollment_id,
          student_name: student.student_name,
          subjects: subjectsPayload,
        };
      }
    );

    const payload: CreateBulkMultipleStudentsTestRequest = {
      test_id: selectedTest,
      students: studentsPayload,
      test_name: testName,
    };

    bulkCreateMutation.mutate(payload, {
      onSuccess: () => {
        setMarksData({});
        onSuccess?.();
        onClose();
      },
    });
  }, [
    selectedTest,
    testName,
    students,
    subjects,
    marksData,
    bulkCreateMutation,
    onSuccess,
    onClose,
  ]);

  // Check if all required fields are selected (section is optional)
  const isReady = Boolean(
    selectedClass && selectedTest && students.length > 0 && subjects.length > 0
  );

  // Check if there are any marks entered
  const hasMarks = useMemo(() => {
    return Object.values(marksData).some((studentData) =>
      Object.values(studentData.marks).some((mark) => mark.marks_obtained > 0)
    );
  }, [marksData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Add Test Marks by Class
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add test marks for multiple students in a class by selecting class,
            section, and test.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
          {/* Selection Controls */}
          <div className="flex flex-wrap gap-4 items-end py-4 border-b">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
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
              <label className="text-sm font-medium whitespace-nowrap">
                Section:
              </label>
              <SchoolSectionDropdown
                classId={selectedClass || 0}
                value={selectedSection}
                onChange={setSelectedSection}
                placeholder="All sections"
                emptyValue
                emptyValueLabel="All sections"
                className="w-48"
                disabled={!selectedClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Test: <span className="text-red-500">*</span>
              </label>
              <SchoolTestDropdown
                value={selectedTest}
                onChange={setSelectedTest}
                placeholder="Select test"
                emptyValue
                emptyValueLabel="Select test"
                className="w-48"
              />
            </div>

            <div className="flex-1" />

            <Button
              onClick={handleSave}
              disabled={!isReady || !hasMarks || bulkCreateMutation.isPending}
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

          {/* Alerts */}
          {!selectedClass && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a class to continue.
              </AlertDescription>
            </Alert>
          )}

          {selectedClass && enrollmentsLoading && (
            <div className="flex items-center justify-center flex-1 min-h-[200px]">
              <Loader.Data message="Loading students and subjects..." />
            </div>
          )}

          {selectedClass && !enrollmentsLoading && !selectedTest && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a test to start entering marks.
              </AlertDescription>
            </Alert>
          )}

          {selectedClass &&
            !enrollmentsLoading &&
            selectedTest &&
            students.length === 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No students found for the selected class
                  {selectedSection ? " and section" : ""}.
                </AlertDescription>
              </Alert>
            )}

          {selectedClass &&
            !enrollmentsLoading &&
            selectedTest &&
            subjects.length === 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No subjects found for the selected class.
                </AlertDescription>
              </Alert>
            )}

          {/* Excel-like Table */}
          {isReady &&
            !enrollmentsLoading &&
            students.length > 0 &&
            subjects.length > 0 && (
              <div className="flex-1 overflow-auto border rounded-lg mt-4 bg-white">
                <div className="sticky top-0 bg-slate-50 border-b z-20">
                  <div className="flex">
                    <div className="sticky left-0 z-30 bg-slate-50 border-r border-slate-200 px-3 py-2 w-[80px] flex-shrink-0">
                      <div className="text-xs font-semibold text-slate-700 uppercase">
                        Roll No
                      </div>
                    </div>
                    <div className="sticky left-[80px] z-30 bg-slate-50 border-r border-slate-200 px-3 py-2 w-[300px] flex-shrink-0">
                      <div className="text-xs font-semibold text-slate-700 uppercase">
                        Student
                      </div>
                    </div>
                    {subjects.map((subject, index) => (
                      <div
                        key={subject.subject_id}
                        className={`px-3 py-2 text-center w-[120px] flex-shrink-0 ${
                          index < subjects.length - 1
                            ? "border-r border-slate-200"
                            : ""
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-700 uppercase truncate">
                          {subject.subject_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {students.map((student) => {
                    const studentData = marksData[student.enrollment_id];
                    return (
                      <div
                        key={student.enrollment_id}
                        className="flex hover:bg-slate-50"
                      >
                        <div className="sticky left-0 z-10 bg-white border-r border-slate-200 px-3 py-2 w-[80px] flex-shrink-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {student.roll_number}
                          </div>
                        </div>
                        <div className="sticky left-[80px] z-10 bg-white border-r border-slate-200 px-3 py-2 w-[300px] flex-shrink-0">
                          <div className="text-sm font-medium text-slate-900 ">
                            {student.student_name}
                          </div>
                        </div>
                        {subjects.map((subject, index) => {
                          const markData = studentData?.marks[
                            subject.subject_id
                          ] || {
                            marks_obtained: 0,
                            remarks: "",
                          };
                          return (
                            <div
                              key={subject.subject_id}
                              className={`px-3 py-2 w-[120px] flex-shrink-0 flex items-center justify-center ${
                                index < subjects.length - 1
                                  ? "border-r border-slate-200"
                                  : ""
                              }`}
                            >
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={markData.marks_obtained || ""}
                                onChange={(e) =>
                                  handleMarksChange(
                                    student.enrollment_id,
                                    subject.subject_id,
                                    "marks_obtained",
                                    e.target.value
                                  )
                                }
                                className="h-9 text-sm text-center w-[100px]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestMarksByClassDialog;

