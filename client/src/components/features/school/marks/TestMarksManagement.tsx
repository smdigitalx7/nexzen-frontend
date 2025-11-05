import { useState, useMemo, useEffect, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Eye, Edit, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EnhancedDataTable } from "@/components/shared";
import { LoadingStates } from "@/components/ui/loading";
import { useSearchFilters } from "@/lib/hooks/common";
import {
  useSchoolTestMarksList,
  useSchoolTestMark,
  useCreateSchoolTestMark,
  useUpdateSchoolTestMark,
  useDeleteSchoolTestMark,
  useSchoolStudentsList,
} from '@/lib/hooks/school';
// Note: useSchoolClasses, useSchoolSections, useSchoolSubjects, useSchoolTests from dropdowns
// Import dropdowns directly: import { useSchoolClasses } from "@/lib/hooks/school/use-school-dropdowns"
import { useSchoolClasses, useSchoolSections, useSchoolSubjects, useSchoolTests } from '@/lib/hooks/school/use-school-dropdowns';
import type { TestMarkWithDetails, TestMarksQuery } from '@/lib/types/school/test-marks';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
} from "@/lib/utils/factory/columnFactories";

// Utility functions for grade calculation - moved outside component for better performance
const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C+";
  if (percentage >= 40) return "C";
  if (percentage >= 35) return "D";
  return "F";
};

const calculatePercentage = (
  marksObtained: number,
  maxMarks: number = 100
): number => {
  return Math.round((marksObtained / maxMarks) * 100 * 10) / 10; // Round to 1 decimal place
};

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

const testMarkFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  test_id: z.string().min(1, "Test is required"),
  subject_id: z.string().min(1, "Subject is required"),
  marks_obtained: z.string().min(1, "Marks obtained is required"),
  percentage: z.string().min(1, "Percentage is required"),
  grade: z.string().min(1, "Grade is required"),
  conducted_at: z.string().min(1, "Test date is required"),
  remarks: z.string().optional(),
});

interface TestMarksManagementProps {
  onDataChange?: (data: TestMarkWithDetails[]) => void;
}

const TestMarksManagementComponent = ({
  onDataChange,
}: TestMarksManagementProps) => {
  // State management
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedTest, setSelectedTest] = useState("all");

  // Dialog states
  const [showTestMarkDialog, setShowTestMarkDialog] = useState(false);
  const [editingTestMark, setEditingTestMark] =
    useState<TestMarkWithDetails | null>(null);
  const [showViewTestMarkDialog, setShowViewTestMarkDialog] = useState(false);
  const [viewingTestMarkId, setViewingTestMarkId] = useState<number | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Memoized class ID for API calls
  const classId = useMemo(
    () => (selectedClass ? parseInt(selectedClass) : 0),
    [selectedClass]
  );

  // API hooks with memoized parameters
  const {
    data: classesData,
    isLoading: classesLoading,
    error: classesError,
  } = useSchoolClasses();
  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useSchoolSections(classId);
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSchoolSubjects(classId);
  const { data: studentsData } = useSchoolStudentsList();
  const { data: testsData } = useSchoolTests();

  // Memoized extracted data
  const classes = useMemo(() => classesData?.items || [], [classesData]);
  const sections = useMemo(() => sectionsData?.items || [], [sectionsData]);
  const subjects = useMemo(() => subjectsData?.items || [], [subjectsData]);
  const students = useMemo(() => studentsData?.data || [], [studentsData]);
  const tests = useMemo(() => testsData?.items || [], [testsData]);

  // Auto-select first class when available
  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].class_id.toString());
    }
  }, [selectedClass, classes]);

  // Reset section, subject, and test when class changes
  useEffect(() => {
    setSelectedSection("all");
    setSelectedSubject("all");
    setSelectedTest("all");
  }, [selectedClass]);

  // Single test mark view data (enabled only when an id is set)
  const viewQuery = useSchoolTestMark(viewingTestMarkId || 0);
  const viewedTestMark = viewingTestMarkId ? viewQuery.data : null;
  const viewTestLoading = viewingTestMarkId ? viewQuery.isLoading : false;
  const viewTestError = viewingTestMarkId ? viewQuery.error : null;

  // Test marks query - only filter by class (server-side)
  const testMarksQuery = useMemo(() => {
    if (!selectedClass || isNaN(parseInt(selectedClass))) {
      return undefined;
    }

    // Only fetch by class, let client-side handle other filters
    const query: TestMarksQuery = {
      class_id: parseInt(selectedClass),
    };

    return query;
  }, [selectedClass]);

  // Test marks hooks - only fetch when class is selected
  const {
    data: testMarksData,
    isLoading: testMarksLoading,
    error: testMarksError,
  } = useSchoolTestMarksList(testMarksQuery);
  const createTestMarkMutation = useCreateSchoolTestMark();
  const updateTestMarkMutation = useUpdateSchoolTestMark(
    editingTestMark?.test_mark_id || 0
  );
  const deleteTestMarkMutation = useDeleteSchoolTestMark();

  // Form
  const testMarkForm = useForm({
    resolver: zodResolver(testMarkFormSchema),
    defaultValues: {
      enrollment_id: "",
      test_id: "",
      subject_id: "",
      marks_obtained: "",
      percentage: "",
      grade: "",
      conducted_at: "",
      remarks: "",
    },
  });

  // Memoized handlers
  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value === "all" ? "" : value);
  }, []);

  const handleSectionChange = useCallback((value: string) => {
    setSelectedSection(value);
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSelectedSubject(value);
  }, []);

  const handleGradeChange = useCallback((value: string) => {
    setSelectedGrade(value);
  }, []);

  const handleTestChange = useCallback((value: string) => {
    setSelectedTest(value);
  }, []);

  // Memoized form handling functions
  const handleTestMarkSubmit = useCallback(
    (values: any) => {
      const markData = {
        enrollment_id: parseInt(values.enrollment_id),
        test_id: parseInt(values.test_id),
        subject_id: parseInt(values.subject_id),
        marks_obtained: parseFloat(values.marks_obtained),
        percentage: parseFloat(values.percentage),
        grade: values.grade,
        conducted_at: values.conducted_at,
        remarks: values.remarks || "",
      };

      if (editingTestMark) {
        updateTestMarkMutation.mutate({
          marks_obtained: markData.marks_obtained,
          percentage: markData.percentage,
          grade: markData.grade,
          remarks: markData.remarks,
          conducted_at: markData.conducted_at,
        });
      } else {
        createTestMarkMutation.mutate(markData);
      }

      testMarkForm.reset();
      setEditingTestMark(null);
      setShowTestMarkDialog(false);
    },
    [
      editingTestMark,
      updateTestMarkMutation,
      createTestMarkMutation,
      testMarkForm,
    ]
  );

  const handleEditTestMark = useCallback(
    (mark: TestMarkWithDetails) => {
      setEditingTestMark(mark);
      testMarkForm.reset({
        enrollment_id: mark.enrollment_id.toString(),
        test_id: mark.test_id?.toString() || "",
        subject_id: mark.subject_id?.toString() || "",
        marks_obtained: mark.marks_obtained?.toString() || "0",
        percentage: mark.percentage?.toString() || "0",
        grade: mark.grade || "",
        conducted_at: mark.conducted_at || "",
        remarks: mark.remarks || "",
      });
      setShowTestMarkDialog(true);
    },
    [testMarkForm]
  );

  const handleDeleteTestMark = useCallback((markId: number) => {
    setConfirmDeleteId(markId);
  }, []);

  const handleViewTestMark = useCallback((markId: number) => {
    setViewingTestMarkId(markId);
    setShowViewTestMarkDialog(true);
  }, []);

  // Memoized dialog handlers
  const closeTestMarkDialog = useCallback(() => {
    testMarkForm.reset();
    setEditingTestMark(null);
    setShowTestMarkDialog(false);
  }, [testMarkForm]);

  const closeViewDialog = useCallback(() => {
    setShowViewTestMarkDialog(false);
    setViewingTestMarkId(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setConfirmDeleteId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (confirmDeleteId) {
      deleteTestMarkMutation.mutate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, deleteTestMarkMutation]);

  // Process and filter data - flatten grouped response from backend
  const flattenedMarks = useMemo(() => {
    if (!testMarksData) return [] as TestMarkWithDetails[];
    const items: TestMarkWithDetails[] = [];
    testMarksData.forEach((group) => {
      if (group.students) {
        group.students.forEach((student) => {
          items.push({
            ...student,
            test_name: group.test_name,
            subject_name: group.subject_name,
            test_date: group.conducted_at,
            test_id: group.test_id,
            subject_id: group.subject_id,
          });
        });
      }
    });
    return items;
  }, [testMarksData]);

  // Apply client-side filtering for section, subject, and grade
  const filteredMarks = useMemo(() => {
    let filtered = flattenedMarks;

    // Apply section filter (client-side)
    if (selectedSection !== "all") {
      filtered = filtered.filter(
        (mark) => mark.section_name === selectedSection
      );
    }

    // Apply subject filter (client-side)
    if (selectedSubject !== "all") {
      filtered = filtered.filter(
        (mark) => mark.subject_name === selectedSubject
      );
    }

    // Apply grade filter (client-side)
    if (selectedGrade !== "all") {
      filtered = filtered.filter((mark) => mark.grade === selectedGrade);
    }

    // Apply test filter (client-side)
    if (selectedTest !== "all") {
      filtered = filtered.filter((mark) => mark.test_name === selectedTest);
    }

    return filtered;
  }, [
    flattenedMarks,
    selectedSection,
    selectedSubject,
    selectedGrade,
    selectedTest,
  ]);

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: testMarks,
  } = useSearchFilters<TestMarkWithDetails>(filteredMarks, {
    keys: ["student_name", "subject_name", "roll_number"] as any,
  });

  // Notify parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(testMarks);
    }
  }, [testMarks, onDataChange]);

  // Table columns for test marks using column factories
  const testMarkColumns: ColumnDef<TestMarkWithDetails>[] = useMemo(
    () => [
      createStudentColumn<TestMarkWithDetails>(
        "student_name",
        "roll_number",
        "section_name",
        { header: "Student" }
      ),
      createSubjectColumn<TestMarkWithDetails>("subject_name", "test_name", {
        header: "Subject",
      }),
      createMarksColumn<TestMarkWithDetails>(
        "marks_obtained",
        "max_marks",
        "percentage",
        { header: "Marks" }
      ),
      createGradeColumn<TestMarkWithDetails>("grade", GRADE_COLORS, {
        header: "Grade",
      }),
      createTestDateColumn<TestMarkWithDetails>("conducted_at", {
        header: "Test Date",
      }),
    ],
    []
  );

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (row: TestMarkWithDetails) =>
          handleViewTestMark(row.test_mark_id),
      },
      {
        type: "edit" as const,
        onClick: (row: TestMarkWithDetails) => handleEditTestMark(row),
      },
      {
        type: "delete" as const,
        onClick: (row: TestMarkWithDetails) =>
          handleDeleteTestMark(row.test_mark_id),
      },
    ],
    [handleViewTestMark, handleEditTestMark, handleDeleteTestMark]
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="p-2 space-y-2">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex gap-3">
              <Dialog
                open={showTestMarkDialog}
                onOpenChange={setShowTestMarkDialog}
              >
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTestMark ? "Edit Test Mark" : "Add New Test Mark"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...testMarkForm}>
                    <form
                      onSubmit={testMarkForm.handleSubmit(handleTestMarkSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={testMarkForm.control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!!editingTestMark}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                  {students.map((student: any) => (
                                    <SelectItem
                                      key={student.student_id}
                                      value={
                                        student.student_id?.toString() || ""
                                      }
                                    >
                                      {student.student_name} (
                                      {student.admission_no})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={testMarkForm.control}
                          name="test_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={!!editingTestMark}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select test" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tests.map((test: any) => (
                                      <SelectItem
                                        key={test.test_id || test.id}
                                        value={
                                          (
                                            test.test_id || test.id
                                          )?.toString() || ""
                                        }
                                      >
                                        {test.test_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={testMarkForm.control}
                          name="subject_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={!!editingTestMark}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {subjects.map((subject: any) => (
                                      <SelectItem
                                        key={subject.subject_id}
                                        value={
                                          subject.subject_id?.toString() || ""
                                        }
                                      >
                                        {subject.subject_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={testMarkForm.control}
                        name="marks_obtained"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marks Obtained</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="18"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);

                                  // Auto-calculate percentage and grade
                                  if (value && !isNaN(Number(value))) {
                                    const marks = Number(value);
                                    const percentage =
                                      calculatePercentage(marks);
                                    const grade = calculateGrade(percentage);

                                    testMarkForm.setValue(
                                      "percentage",
                                      percentage.toString()
                                    );
                                    testMarkForm.setValue("grade", grade);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={testMarkForm.control}
                          name="percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Percentage</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="90.0"
                                  step="0.1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={testMarkForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select grade" />
                                  </SelectTrigger>
                                  <SelectContent>
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
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={testMarkForm.control}
                        name="conducted_at"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={testMarkForm.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Additional comments..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeTestMarkDialog}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingTestMark ? "Update" : "Add"} Test Mark
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

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
                <Select
                  value={selectedClass || "all"}
                  onValueChange={handleClassChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem
                        key={cls.class_id}
                        value={cls.class_id.toString()}
                      >
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Section:</label>
                <Select
                  value={selectedSection}
                  onValueChange={handleSectionChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map((section) => (
                      <SelectItem
                        key={section.section_id}
                        value={section.section_name}
                      >
                        {section.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Subject:</label>
                <Select
                  value={selectedSubject}
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.subject_id}
                        value={subject.subject_name}
                      >
                        {subject.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Grade:</label>
                <Select value={selectedGrade} onValueChange={handleGradeChange}>
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
                <label className="text-sm font-medium">Test:</label>
                <Select value={selectedTest} onValueChange={handleTestChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Tests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tests</SelectItem>
                    {tests.map((test: any) => (
                      <SelectItem key={test.test_id} value={test.test_name}>
                        {test.test_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Table */}
            {!selectedClass ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Select a Class
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Please select a class from the dropdown above to view test
                      marks.
                    </p>
                  </div>
                </div>
              </Card>
            ) : testMarksLoading ? (
              <Card className="p-8 text-center">
                <LoadingStates.Data message="Loading test marks..." />
              </Card>
            ) : testMarksError ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Error Loading Data
                    </h3>
                    <p className="text-slate-600 mt-1">
                      {testMarksError?.message ||
                        "Failed to load test marks. Please try again."}
                    </p>
                  </div>
                </div>
              </Card>
            ) : testMarks.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      No Test Marks Found
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
                data={testMarks}
                title="Test Marks"
                searchKey={
                  [
                    "student_name",
                    "roll_number",
                    "class_name",
                    "section_name",
                    "test_name",
                    "subject_name",
                  ] as any
                }
                searchPlaceholder="Search students..."
                columns={testMarkColumns}
                onAdd={() => setShowTestMarkDialog(true)}
                addButtonText="Add Test Mark"
                exportable={true}
                showActions={true}
                actionButtonGroups={actionButtonGroups}
                actionColumnHeader="Actions"
                showActionLabels={true}
              />
            )}

            {/* View Test Mark Dialog */}
            <Dialog
              open={showViewTestMarkDialog}
              onOpenChange={closeViewDialog}
            >
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Test Mark Details</DialogTitle>
                </DialogHeader>
                {viewTestLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-600">Loading mark...</p>
                  </div>
                ) : viewTestError ? (
                  <div className="p-6 text-center text-red-600">
                    Failed to load mark details.
                  </div>
                ) : viewedTestMark ? (
                  <div className="space-y-4 p-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Student</div>
                        <div className="font-medium text-slate-900">
                          {viewedTestMark.student_name} (
                          {viewedTestMark.roll_number})
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Section</div>
                        <div className="font-medium text-slate-900">
                          {viewedTestMark.section_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Test</div>
                        <div className="font-medium text-slate-900">
                          {viewedTestMark.test_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Subject</div>
                        <div className="font-medium text-slate-900">
                          {viewedTestMark.subject_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Marks</div>
                        <div className="font-semibold text-slate-900">
                          {viewedTestMark.marks_obtained ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Grade</div>
                        <div className="font-semibold text-slate-900">
                          {viewedTestMark.grade ?? "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Percentage</div>
                        <div className="font-semibold text-slate-900">
                          {viewedTestMark.percentage ?? 0}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="font-medium text-slate-900">
                          {viewedTestMark.conducted_at
                            ? new Date(
                                viewedTestMark.conducted_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    {viewedTestMark.remarks && (
                      <div>
                        <div className="text-xs text-slate-500">Remarks</div>
                        <div className="text-slate-800">
                          {viewedTestMark.remarks}
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
          </motion.div>
        </div>
      </div>
      {/* Confirm Delete Test Mark */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={closeDeleteDialog}
      >
        <AlertDialogContent>
          <AlertHeader>
            <AlertDialogTitle>Delete Test Mark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test mark? This action cannot
              be undone.
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
    </div>
  );
};

export default TestMarksManagementComponent;
