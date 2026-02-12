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
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { useSchoolEnrollmentsList } from "@/features/school/hooks/use-school-enrollments";
import {
  useSchoolClasses,
  useSchoolSections,
  useSchoolExams, // Fetches exams
} from "@/features/school/hooks/use-school-dropdowns";
import { useSchoolClass } from "@/features/school/hooks/use-school-class";
import { useBulkCreateMultipleStudentsExamMarks } from "@/features/school/hooks/use-school-exam-marks";
import type {
  CreateBulkMultipleStudentsRequest,
  BulkMultipleStudentsSubject,
  BulkMultipleStudentsStudent,
} from "@/features/school/types/exam-marks";
import type { SchoolEnrollmentRead } from "@/features/school/types/enrollments";

interface StudentMarksData {
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  section_name: string;
  marks: Record<number, { marks_obtained: number; remarks: string }>;
}

interface AddMarksByClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddMarksByClassDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: AddMarksByClassDialogProps) => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [examName, setExamName] = useState<string>("");
  const [marksData, setMarksData] = useState<Record<number, StudentMarksData>>(
    {}
  );
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  const queryClient = useQueryClient();

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedClass(null);
      setSelectedSection(null);
      setSelectedExam(null);
      setExamName("");
      setMarksData({});
      setPage(1);
    }
  }, [isOpen]);

  // Reset marks when class changes (but keep section if it was selected)
  useEffect(() => {
    if (selectedClass) {
      setMarksData({});
      setPage(1);
    }
  }, [selectedClass]);

  // Reset page when section changes
  useEffect(() => {
    setPage(1);
  }, [selectedSection]);

  // Fetch dropdown data
  const { data: classesData, isLoading: classesLoading } = useSchoolClasses();
  const { data: sectionsData, isLoading: sectionsLoading } = useSchoolSections(selectedClass || 0);
  const { data: examsData, isLoading: examsLoading } = useSchoolExams({ enabled: true });

  // Fetch enrollments when class is selected (section is optional)
  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useSchoolEnrollmentsList({
    class_id: selectedClass || 0,
    section_id: selectedSection || undefined,
    enabled: Boolean(selectedClass),
    page,
    page_size: pageSize,
  });

  // Explicitly refetch enrollments whenever class_id or section_id changes
  useEffect(() => {
    if (selectedClass) {
      void queryClient.invalidateQueries({
        queryKey: schoolKeys.enrollments.list({
          class_id: selectedClass,
          section_id: selectedSection || undefined,
          page,
          page_size: pageSize,
        } as Record<string, unknown>),
      });
      void refetchEnrollments();
    }
  }, [selectedClass, selectedSection, page, pageSize, queryClient, refetchEnrollments]);

  // Fetch class details to get full subjects list
  const { classData } = useSchoolClass(selectedClass);
  const subjectsFromClass = classData?.subjects || [];

  // Set exam name when exam is selected
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

  // Initialize marks data when students/subjects change (flat enrollments from API)
  const enrollmentsList = enrollmentsData?.enrollments ?? [];
  useEffect(() => {
    if (!enrollmentsList.length || !subjectsFromClass.length) {
      return;
    }

    setMarksData((prev) => {
      const newMarksData: Record<number, StudentMarksData> = { ...prev };

      enrollmentsList.forEach((enrollment) => {
        const existingData = prev[enrollment.enrollment_id];
        const marks: Record<
          number,
          { marks_obtained: number; remarks: string }
        > = existingData?.marks ? { ...existingData.marks } : {};

        // Initialize marks for all subjects
        subjectsFromClass.forEach((subject: { subject_id: number; subject_name: string }) => {
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
          if (!subjectsFromClass.some((s: { subject_id: number; subject_name: string }) => s.subject_id === subjectId)) {
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
  }, [enrollmentsList, subjectsFromClass]);

  // Memoized students list (flat enrollments from API)
  const students = useMemo(() => {
    if (!enrollmentsList.length) return [];
    return [...enrollmentsList].sort((a, b) => {
      const rollA = a.roll_number || "";
      const rollB = b.roll_number || "";
      return rollA.localeCompare(rollB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [enrollmentsList]);

  // Memoized subjects list
  const subjects = useMemo(() => {
    if (!subjectsFromClass.length) return [];
    return [...subjectsFromClass].sort((a, b) =>
      a.subject_name.localeCompare(b.subject_name)
    );
  }, [subjectsFromClass]);

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

  const totalPages = enrollmentsData?.total_pages || 1;
  const totalCount = enrollmentsData?.total_count || 0;

  const bulkCreateMutation = useBulkCreateMultipleStudentsExamMarks();

  const handleSave = useCallback(() => {
    if (
      !selectedExam ||
      !examName ||
      students.length === 0 ||
      subjects.length === 0
    ) {
      return;
    }

    const studentsPayload: BulkMultipleStudentsStudent[] = students.map(
      (student) => {
        const studentData = marksData[student.enrollment_id];
        if (!studentData) {
          return {
            enrollment_id: student.enrollment_id,
            student_name: student.student_name,
            subjects: [],
          };
        }

        const subjectsPayload: BulkMultipleStudentsSubject[] = subjects.map(
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

    const payload: CreateBulkMultipleStudentsRequest = {
      exam_id: selectedExam,
      students: studentsPayload,
      exam_name: examName,
    };

    bulkCreateMutation.mutate(payload, {
      onSuccess: () => {
        setMarksData({});
        onSuccess?.();
        onClose();
      },
    });
  }, [
    selectedExam,
    examName,
    students,
    subjects,
    marksData,
    bulkCreateMutation,
    onSuccess,
    onClose,
  ]);

  const isReady = Boolean(
    selectedClass && selectedExam && students.length > 0 && subjects.length > 0
  );

  const hasMarks = useMemo(() => {
    return Object.values(marksData).some((studentData) =>
      Object.values(studentData.marks).some((mark) => mark.marks_obtained > 0)
    );
  }, [marksData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full flex flex-col p-0 h-[85vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Add Exam Marks by Class
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add exam marks for multiple students in a class.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-6 pb-6 overflow-hidden">
          {/* Selection Controls */}
          <div className="flex flex-wrap gap-4 items-end py-4 border-b">
            <div className="w-48">
              <label className="text-sm font-medium whitespace-nowrap mb-1.5 block">
                Class <span className="text-red-500">*</span>
              </label>
              <ServerCombobox
                 items={classesData?.items || []}
                 value={selectedClass?.toString() || ""}
                 onSelect={(val) => setSelectedClass(val ? Number(val) : null)}
                 valueKey="class_id"
                 labelKey="class_name"
                 placeholder="Select Class"
                 isLoading={classesLoading}
                 modal={true}
              />
            </div>

            <div className="w-48">
              <label className="text-sm font-medium whitespace-nowrap mb-1.5 block">
                Section
              </label>
              <ServerCombobox
                 items={sectionsData?.items || []}
                 value={selectedSection?.toString() || ""}
                 onSelect={(val) => setSelectedSection(val ? Number(val) : null)}
                 valueKey="section_id"
                 labelKey="section_name"
                 placeholder="All Sections"
                 isLoading={sectionsLoading}
                 disabled={!selectedClass}
                 modal={true}
              />
            </div>

            <div className="w-48">
              <label className="text-sm font-medium whitespace-nowrap mb-1.5 block">
                Exam <span className="text-red-500">*</span>
              </label>
              <ServerCombobox
                 items={examsData?.items || []}
                 value={selectedExam?.toString() || ""}
                 onSelect={(val) => setSelectedExam(val ? Number(val) : null)}
                 valueKey="exam_id"
                 labelKey="exam_name"
                 placeholder="Select Exam"
                 isLoading={examsLoading}
                 modal={true}
              />
            </div>

            <div className="flex-1" />

            <Button
              onClick={handleSave}
              disabled={!isReady || !hasMarks || bulkCreateMutation.isPending}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
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

          {selectedClass && !enrollmentsLoading && !selectedExam && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select an exam to start entering marks.
              </AlertDescription>
            </Alert>
          )}

          {selectedClass &&
            !enrollmentsLoading &&
            selectedExam &&
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
            selectedExam &&
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
              <>
              <div className="flex-1 overflow-auto border rounded-lg mt-4 bg-white relative">
                 {/* Table Header */}
                 <div className="sticky top-0 bg-slate-50 border-b z-20 flex min-w-max">
                    <div className="sticky left-0 z-30 bg-slate-50 border-r border-slate-200 px-3 py-2 w-[80px] flex-shrink-0">
                      <div className="text-xs font-semibold text-slate-700 uppercase">Roll No</div>
                    </div>
                    <div className="sticky left-[80px] z-30 bg-slate-50 border-r border-slate-200 px-3 py-2 w-[250px] flex-shrink-0">
                      <div className="text-xs font-semibold text-slate-700 uppercase">Student</div>
                    </div>
                    {subjects.map((subject, index) => (
                      <div
                        key={subject.subject_id}
                        className={`px-3 py-2 text-center w-[120px] flex-shrink-0 ${
                          index < subjects.length - 1 ? "border-r border-slate-200" : ""
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-700 uppercase truncate" title={subject.subject_name}>
                          {subject.subject_name}
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Table Body */}
                 <div className="divide-y divide-slate-200 min-w-max">
                   {students.map((student) => {
                     const studentData = marksData[student.enrollment_id];
                     return (
                       <div key={student.enrollment_id} className="flex hover:bg-slate-50">
                         <div className="sticky left-0 z-10 bg-white border-r border-slate-200 px-3 py-2 w-[80px] flex-shrink-0 flex items-center">
                           <div className="text-sm font-medium text-slate-900 truncate">{student.roll_number}</div>
                         </div>
                         <div className="sticky left-[80px] z-10 bg-white border-r border-slate-200 px-3 py-2 w-[250px] flex-shrink-0 flex items-center">
                           <div className="text-sm font-medium text-slate-900 truncate" title={student.student_name}>
                             {student.student_name}
                           </div>
                         </div>
                         {subjects.map((subject, index) => {
                           const markData = studentData?.marks[subject.subject_id] || { marks_obtained: 0, remarks: "" };
                           return (
                             <div
                               key={subject.subject_id}
                               className={`px-3 py-2 w-[120px] flex-shrink-0 flex items-center justify-center ${
                                 index < subjects.length - 1 ? "border-r border-slate-200" : ""
                               }`}
                             >
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="-"
                                  value={markData.marks_obtained || ""}
                                  onChange={(e) => handleMarksChange(student.enrollment_id, subject.subject_id, "marks_obtained", e.target.value)}
                                  className="h-8 text-sm text-center w-20 px-1 focus:ring-1 focus:ring-blue-500"
                                />
                             </div>
                           );
                         })}
                       </div>
                     );
                   })}
                 </div>
              </div>

               {/* Pagination Controls */}
               <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 mt-auto rounded-b-lg">
                 <div className="flex items-center gap-2">
                   <p className="text-sm text-slate-600">
                     Showing <span className="font-medium">{enrollmentsList.length}</span> students
                     {totalCount > 0 ? ` of ${totalCount}` : ""}
                   </p>
                 </div>
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setPage((p) => Math.max(1, p - 1))}
                     disabled={page === 1 || enrollmentsLoading}
                   >
                     Previous
                   </Button>
                   <div className="flex items-center gap-1 min-w-[5rem] justify-center">
                     <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setPage((p) => p + 1)}
                     disabled={page >= totalPages || enrollmentsLoading}
                   >
                     Next
                   </Button>
                 </div>
               </div>
               </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMarksByClassDialog;
