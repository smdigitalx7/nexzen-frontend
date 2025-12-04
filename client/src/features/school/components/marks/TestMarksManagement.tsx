import { useState, useMemo, useEffect, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Eye, Edit, Trash2, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EnhancedDataTable } from "@/common/components/shared";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { useSearchFilters } from "@/common/hooks";
import {
  SchoolClassDropdown,
  SchoolSectionDropdown,
  SchoolSubjectDropdown,
  SchoolTestDropdown,
} from "@/common/components/shared/Dropdowns";
import {
  useSchoolTestMarksList,
  useSchoolTestMark,
  useCreateSchoolTestMark,
  useUpdateSchoolTestMark,
  useDeleteSchoolTestMark,
} from '@/features/school/hooks';
import { useSchoolEnrollmentsList } from '@/features/school/hooks/use-school-enrollments';
import { useCreateSchoolTestMarksMultipleSubjects } from '@/features/school/hooks/use-school-test-marks';
import {
  useSchoolSections,
  useSchoolSubjects,
  useSchoolTests,
} from '@/features/school/hooks/use-school-dropdowns';
import { useGrades } from "@/features/general/hooks/useGrades";
import type { TestMarkWithDetails, TestMarksQuery } from '@/features/school/types/test-marks';
import type { 
  SchoolEnrollmentWithClassSectionDetails, 
  SchoolEnrollmentRead,
} from '@/features/school/types/enrollments';
import type { SchoolSubjectList } from '@/features/school/types/subjects';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
} from "@/common/utils/factory/columnFactories";
import AddTestMarksByClassDialog from "./AddTestMarksByClassDialog";
import { useQueryClient } from "@tanstack/react-query";
import { schoolKeys } from "@/features/school/hooks/query-keys";

// Utility function to calculate grade from percentage using grades from API
// This will be used inside the component where grades are available
const createCalculateGradeFunction = (grades: Array<{ grade: string; min_percentage: number; max_percentage: number }>) => {
  return (percentage: number): string => {
    // Find the grade where percentage falls within min_percentage and max_percentage
    // Grades are ordered by max_percentage descending, so we check from highest to lowest
    for (const grade of grades) {
      if (percentage >= grade.min_percentage && percentage <= grade.max_percentage) {
        return grade.grade;
      }
    }
    // Default to "F" if no match found (shouldn't happen if grades are configured correctly)
    return "F";
  };
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
  remarks: z.string().optional(),
});

const multipleTestSubjectsFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  test_id: z.string().min(1, "Test is required"),
  subjects: z.array(z.object({
    subject_id: z.string().min(1, "Subject is required"),
    marks_obtained: z.string().min(1, "Marks obtained is required"),
    remarks: z.string().optional(),
  })).min(1, "At least one subject is required"),
});

interface TestMarksManagementProps {
  onDataChange?: (data: TestMarkWithDetails[]) => void;
  selectedClass?: number | null;
  setSelectedClass?: (value: number | null) => void;
  selectedSection?: number | null;
  setSelectedSection?: (value: number | null) => void;
  selectedSubject?: number | null;
  setSelectedSubject?: (value: number | null) => void;
  selectedGrade?: string;
  setSelectedGrade?: (value: string) => void;
  selectedTest?: number | null;
  setSelectedTest?: (value: number | null) => void;
}

const TestMarksManagementComponent = ({
  onDataChange,
  selectedClass: propSelectedClass,
  setSelectedClass: propSetSelectedClass,
  selectedSection: propSelectedSection,
  setSelectedSection: propSetSelectedSection,
  selectedSubject: propSelectedSubject,
  setSelectedSubject: propSetSelectedSubject,
  selectedGrade: propSelectedGrade,
  setSelectedGrade: propSetSelectedGrade,
  selectedTest: propSelectedTest,
  setSelectedTest: propSetSelectedTest,
}: TestMarksManagementProps) => {
  // Use props if provided, otherwise use local state (for backward compatibility)
  const [localSelectedClass, setLocalSelectedClass] = useState<number | null>(null);
  const [localSelectedSection, setLocalSelectedSection] = useState<number | null>(null);
  const [localSelectedSubject, setLocalSelectedSubject] = useState<number | null>(null);
  const [localSelectedGrade, setLocalSelectedGrade] = useState("all");
  const [localSelectedTest, setLocalSelectedTest] = useState<number | null>(null);

  const selectedClass = propSelectedClass ?? localSelectedClass;
  const setSelectedClass = propSetSelectedClass ?? setLocalSelectedClass;
  const selectedSection = propSelectedSection ?? localSelectedSection;
  const setSelectedSection = propSetSelectedSection ?? setLocalSelectedSection;
  const selectedSubject = propSelectedSubject ?? localSelectedSubject;
  const setSelectedSubject = propSetSelectedSubject ?? setLocalSelectedSubject;
  const selectedGrade = propSelectedGrade ?? localSelectedGrade;
  const setSelectedGrade = propSetSelectedGrade ?? setLocalSelectedGrade;
  const selectedTest = propSelectedTest ?? localSelectedTest;
  const setSelectedTest = propSetSelectedTest ?? setLocalSelectedTest;

  // Dialog states
  const [showTestMarkDialog, setShowTestMarkDialog] = useState(false);
  const [editingTestMark, setEditingTestMark] =
    useState<TestMarkWithDetails | null>(null);
  const [showViewTestMarkDialog, setShowViewTestMarkDialog] = useState(false);
  const [viewingTestMarkId, setViewingTestMarkId] = useState<number | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('single');
  const [showAddTestMarksDialog, setShowAddTestMarksDialog] = useState(false);

  // Memoized class ID for API calls
  const classId = useMemo(
    () => selectedClass || 0,
    [selectedClass]
  );

  // Get sections, subjects, and tests data for lookup maps (for filtering by name)
  const { data: sectionsData } = useSchoolSections(classId);
  const { data: subjectsData } = useSchoolSubjects(classId);
  const { data: testsData } = useSchoolTests();
  
  // Get grades from API endpoint
  const { grades } = useGrades();
  
  // Create calculateGrade function using grades from API
  const calculateGrade = useMemo(() => createCalculateGradeFunction(grades), [grades]);
  
  // Get enrollments filtered by class and section
  // ✅ FIX: Reduced page size from 1000 to 50 to prevent UI freezes
  const enrollmentsParams = useMemo(() => {
    if (!selectedClass) return undefined;
    return {
      class_id: selectedClass,
      section_id: selectedSection || undefined,
      page: 1,
      page_size: 50, // ✅ CRITICAL FIX: Reduced from 100 to 50 for optimal performance
    };
  }, [selectedClass, selectedSection]);

  const { data: enrollmentsData } = useSchoolEnrollmentsList(enrollmentsParams);
  
  // Extract enrollments - flatten the grouped response and add class_name
  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    const allEnrollments: (SchoolEnrollmentRead & { class_name: string })[] = [];
    enrollmentsData.enrollments.forEach((group: SchoolEnrollmentWithClassSectionDetails) => {
      if (group.students && Array.isArray(group.students)) {
        group.students.forEach((student: SchoolEnrollmentRead) => {
          allEnrollments.push({
            ...student,
            class_name: group.class_name || student.class_name || '',
          });
        });
      }
    });
    return allEnrollments;
  }, [enrollmentsData]);

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

  const testIdToName = useMemo(() => {
    const map = new Map<number, string>();
    testsData?.items?.forEach((test) => {
      map.set(test.test_id, test.test_name);
    });
    return map;
  }, [testsData]);

  // Reset section, subject, and test when class changes
  useEffect(() => {
    setSelectedSection(null);
    setSelectedSubject(null);
    setSelectedTest(null);
  }, [selectedClass]);

  // Single test mark view data (enabled only when an id is set)
  const viewQuery = useSchoolTestMark(viewingTestMarkId || 0);
  const viewedTestMark = viewingTestMarkId ? viewQuery.data : null;
  const viewTestLoading = viewingTestMarkId ? viewQuery.isLoading : false;
  const viewTestError = viewingTestMarkId ? viewQuery.error : null;

  // Test marks query - require class_id, subject_id, and test_id (server-side)
  const testMarksQuery = useMemo(() => {
    if (!selectedClass || !selectedSubject || !selectedTest) {
      return undefined;
    }

    // Require class_id, subject_id, and test_id for API call
    const query: TestMarksQuery = {
      class_id: selectedClass,
      subject_id: selectedSubject,
      test_id: selectedTest,
    };

    return query;
  }, [selectedClass, selectedSubject, selectedTest]);

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
  const createMultipleSubjectsMutation = useCreateSchoolTestMarksMultipleSubjects();
  const queryClient = useQueryClient();

  // Single subject form
  const testMarkForm = useForm({
    resolver: zodResolver(testMarkFormSchema),
    defaultValues: {
      enrollment_id: "",
      test_id: "",
      subject_id: "",
      marks_obtained: "",
      remarks: "",
    },
  });

  // Multiple subjects form
  const multipleTestSubjectsForm = useForm({
    resolver: zodResolver(multipleTestSubjectsFormSchema),
    defaultValues: {
      enrollment_id: "",
      test_id: "",
      subjects: [{ subject_id: "", marks_obtained: "", remarks: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: multipleTestSubjectsForm.control,
    name: 'subjects',
  });

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

  const handleTestChange = useCallback((value: number | null) => {
    setSelectedTest(value);
  }, []);

  // Single subject form submission handler
  const handleTestMarkSubmit = useCallback(
    (values: z.infer<typeof testMarkFormSchema>) => {
      const markData = {
        enrollment_id: parseInt(values.enrollment_id),
        test_id: parseInt(values.test_id),
        subject_id: parseInt(values.subject_id),
        marks_obtained: parseFloat(values.marks_obtained),
        remarks: values.remarks || "",
      };

      if (editingTestMark) {
        updateTestMarkMutation.mutate({
          marks_obtained: markData.marks_obtained,
          percentage: 0, // Will be calculated by backend
          grade: '', // Will be calculated by backend
          remarks: markData.remarks,
          conducted_at: new Date().toISOString(),
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

  // Multiple subjects form submission handler
  const handleMultipleTestSubjectsSubmit = useCallback(async (values: z.infer<typeof multipleTestSubjectsFormSchema>) => {
    const selectedEnrollment = enrollments.find((e) => e.enrollment_id?.toString() === values.enrollment_id);
    const subjects = subjectsData?.items || [];
    
    const payload = {
      enrollment_id: parseInt(values.enrollment_id),
      test_id: parseInt(values.test_id),
      subjects: values.subjects.map((subj) => ({
        subject_id: parseInt(subj.subject_id),
        marks_obtained: parseFloat(subj.marks_obtained),
        remarks: subj.remarks || null,
        subject_name: subjects.find((s: SchoolSubjectList) => s.subject_id === parseInt(subj.subject_id))?.subject_name || null,
      })),
      student_name: selectedEnrollment?.student_name || null,
      test_name: null, // Can be fetched if needed
    };

    try {
      await createMultipleSubjectsMutation.mutateAsync(payload);
      multipleTestSubjectsForm.reset();
      setShowTestMarkDialog(false);
    } catch (error) {
      // Error is handled by mutation hook
    }
  }, [enrollments, subjectsData, createMultipleSubjectsMutation, multipleTestSubjectsForm]);

  const handleEditTestMark = useCallback(
    (mark: TestMarkWithDetails) => {
      setActiveTab('single');
      setEditingTestMark(mark);
      testMarkForm.reset({
        enrollment_id: mark.enrollment_id.toString(),
        test_id: mark.test_id?.toString() || "",
        subject_id: mark.subject_id?.toString() || "",
        marks_obtained: mark.marks_obtained?.toString() || "0",
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
    setActiveTab('single');
    testMarkForm.reset();
    multipleTestSubjectsForm.reset({
      enrollment_id: "",
      test_id: "",
      subjects: [{ subject_id: "", marks_obtained: "", remarks: "" }],
    });
    setEditingTestMark(null);
    setShowTestMarkDialog(false);
  }, [testMarkForm, multipleTestSubjectsForm]);

  const addSubjectRow = useCallback(() => {
    append({ subject_id: "", marks_obtained: "", remarks: "" });
  }, [append]);

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
    
    // Ensure we have an array - handle different response structures
    let dataArray: any[] = [];
    if (Array.isArray(testMarksData)) {
      dataArray = testMarksData;
    } else if (testMarksData && typeof testMarksData === 'object') {
      // Handle wrapped responses
      if (Array.isArray(testMarksData.data)) {
        dataArray = testMarksData.data;
      } else if (Array.isArray(testMarksData.items)) {
        dataArray = testMarksData.items;
      } else if (Array.isArray(testMarksData.results)) {
        dataArray = testMarksData.results;
      } else {
        // If it's an object but not an array, return empty
        console.warn('testMarksData is not an array or array-wrapped object:', testMarksData);
        return [] as TestMarkWithDetails[];
      }
    } else {
      console.warn('testMarksData is not a valid type:', typeof testMarksData, testMarksData);
      return [] as TestMarkWithDetails[];
    }
    
    const items: TestMarkWithDetails[] = [];
    dataArray.forEach((group) => {
      if (group && group.students) {
        if (Array.isArray(group.students)) {
          group.students.forEach((student: any) => {
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
      }
    });
    return items;
  }, [testMarksData]);

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

    // Apply test filter (client-side) - filter by test_id
    if (selectedTest !== null) {
      filtered = filtered.filter(
        (mark) => mark.test_id !== undefined && mark.test_id === selectedTest
      );
    }

    return filtered;
  }, [
    flattenedMarks,
    selectedSection,
    selectedSubject,
    selectedGrade,
    selectedTest,
    sectionIdToName,
  ]);

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: testMarks,
  } = useSearchFilters<TestMarkWithDetails>(filteredMarks, {
    keys: ["student_name", "subject_name", "roll_number"] as any,
  });

  // Notify parent component when data changes - use flattenedMarks (all data) for statistics
  useEffect(() => {
    if (onDataChange) {
      onDataChange(flattenedMarks);
    }
  }, [flattenedMarks, onDataChange]);

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
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTestMark ? "Edit Test Mark" : "Add New Test Mark"}
                    </DialogTitle>
                  </DialogHeader>
                  {!editingTestMark ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single">Single Subject</TabsTrigger>
                        <TabsTrigger value="multiple">Multiple Subjects</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="single" className="mt-4">
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
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {enrollments.map((enrollment) => {
                                          const displayParts = [
                                            enrollment.student_name,
                                            enrollment.class_name || '',
                                            enrollment.section_name || '',
                                          ].filter(Boolean);
                                          const displayText = displayParts.join(' - ');
                                          const rollNumber = enrollment.roll_number ? ` (Roll: ${enrollment.roll_number})` : '';
                                          return (
                                            <SelectItem
                                              key={enrollment.enrollment_id}
                                              value={
                                                enrollment.enrollment_id?.toString() || ""
                                              }
                                            >
                                              {displayText}{rollNumber}
                                            </SelectItem>
                                          );
                                        })}
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
                                render={({ field }) => {
                                  let numValue: number | null = null;
                                  if (field.value && field.value !== '') {
                                    const parsed = typeof field.value === 'string'
                                      ? parseInt(field.value, 10)
                                      : Number(field.value);
                                    if (!isNaN(parsed) && parsed > 0) {
                                      numValue = parsed;
                                    }
                                  }

                                  return (
                                    <FormItem>
                                      <FormLabel>Test</FormLabel>
                                      <FormControl>
                                        <SchoolTestDropdown
                                          value={numValue}
                                          onChange={(value) => {
                                            if (value !== null && value !== undefined) {
                                              field.onChange(value.toString());
                                            } else {
                                              field.onChange('');
                                            }
                                          }}
                                          placeholder="Select test"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />
                              <FormField
                                control={testMarkForm.control}
                                name="subject_id"
                                render={({ field }) => {
                                  let numValue: number | null = null;
                                  if (field.value && field.value !== '') {
                                    const parsed = typeof field.value === 'string'
                                      ? parseInt(field.value, 10)
                                      : Number(field.value);
                                    if (!isNaN(parsed) && parsed > 0) {
                                      numValue = parsed;
                                    }
                                  }

                                  return (
                                    <FormItem>
                                      <FormLabel>Subject</FormLabel>
                                      <FormControl>
                                        <SchoolSubjectDropdown
                                          classId={classId}
                                          value={numValue}
                                          onChange={(value) => {
                                            if (value !== null && value !== undefined) {
                                              field.onChange(value.toString());
                                            } else {
                                              field.onChange('');
                                            }
                                          }}
                                          disabled={classId <= 0}
                                          placeholder={classId <= 0 ? "Select class first" : "Select subject"}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
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
                                    />
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
                                Add Test Mark
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>

                      <TabsContent value="multiple" className="mt-4">
                        <Form {...multipleTestSubjectsForm}>
                          <form
                            onSubmit={multipleTestSubjectsForm.handleSubmit(handleMultipleTestSubjectsSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={multipleTestSubjectsForm.control}
                              name="enrollment_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Student</FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {enrollments.map((enrollment) => {
                                          const displayParts = [
                                            enrollment.student_name,
                                            enrollment.class_name || '',
                                            enrollment.section_name || '',
                                          ].filter(Boolean);
                                          const displayText = displayParts.join(' - ');
                                          const rollNumber = enrollment.roll_number ? ` (Roll: ${enrollment.roll_number})` : '';
                                          return (
                                            <SelectItem
                                              key={enrollment.enrollment_id}
                                              value={
                                                enrollment.enrollment_id?.toString() || ""
                                              }
                                            >
                                              {displayText}{rollNumber}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={multipleTestSubjectsForm.control}
                              name="test_id"
                              render={({ field }) => {
                                let numValue: number | null = null;
                                if (field.value && field.value !== '') {
                                  const parsed = typeof field.value === 'string'
                                    ? parseInt(field.value, 10)
                                    : Number(field.value);
                                  if (!isNaN(parsed) && parsed > 0) {
                                    numValue = parsed;
                                  }
                                }

                                return (
                                  <FormItem>
                                    <FormLabel>Test</FormLabel>
                                    <FormControl>
                                      <SchoolTestDropdown
                                        value={numValue}
                                        onChange={(value) => {
                                          if (value !== null && value !== undefined) {
                                            field.onChange(value.toString());
                                          } else {
                                            field.onChange('');
                                          }
                                        }}
                                        placeholder="Select test"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <FormLabel>Subjects</FormLabel>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addSubjectRow}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Subject
                                </Button>
                              </div>
                              {fields.map((field, index) => (
                                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Subject {index + 1}</span>
                                    {fields.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  <FormField
                                    control={multipleTestSubjectsForm.control}
                                    name={`subjects.${index}.subject_id`}
                                    render={({ field }) => {
                                      let numValue: number | null = null;
                                      if (field.value && field.value !== '') {
                                        const parsed = typeof field.value === 'string'
                                          ? parseInt(field.value, 10)
                                          : Number(field.value);
                                        if (!isNaN(parsed) && parsed > 0) {
                                          numValue = parsed;
                                        }
                                      }

                                      return (
                                        <FormItem>
                                          <FormLabel>Subject</FormLabel>
                                          <FormControl>
                                            <SchoolSubjectDropdown
                                              classId={classId}
                                              value={numValue}
                                              onChange={(value) => {
                                                if (value !== null && value !== undefined) {
                                                  field.onChange(value.toString());
                                                } else {
                                                  field.onChange('');
                                                }
                                              }}
                                              disabled={classId <= 0}
                                              placeholder={classId <= 0 ? "Select class first" : "Select subject"}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      );
                                    }}
                                  />
                                  <FormField
                                    control={multipleTestSubjectsForm.control}
                                    name={`subjects.${index}.marks_obtained`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Marks Obtained</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder="18"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={multipleTestSubjectsForm.control}
                                    name={`subjects.${index}.remarks`}
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
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={closeTestMarkDialog}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit"
                                disabled={createMultipleSubjectsMutation.isPending}
                              >
                                {createMultipleSubjectsMutation.isPending ? "Adding..." : "Add Test Marks"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>
                    </Tabs>
                  ) : (
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
                                  disabled={true}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select student" />
                                  </SelectTrigger>
                                  <SelectContent>
                                        {enrollments.map((enrollment) => (
                                      <SelectItem
                                        key={enrollment.enrollment_id}
                                        value={
                                          enrollment.enrollment_id?.toString() || ""
                                        }
                                      >
                                        {enrollment.student_name} ({enrollment.admission_no})
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
                            render={({ field }) => {
                              let numValue: number | null = null;
                              if (field.value && field.value !== '') {
                                const parsed = typeof field.value === 'string'
                                  ? parseInt(field.value, 10)
                                  : Number(field.value);
                                if (!isNaN(parsed) && parsed > 0) {
                                  numValue = parsed;
                                }
                              }

                              return (
                                <FormItem>
                                  <FormLabel>Test</FormLabel>
                                  <FormControl>
                                    <SchoolTestDropdown
                                      value={numValue}
                                      onChange={(value) => {
                                        if (value !== null && value !== undefined) {
                                          field.onChange(value.toString());
                                        } else {
                                          field.onChange('');
                                        }
                                      }}
                                      disabled={true}
                                      placeholder="Select test"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={testMarkForm.control}
                            name="subject_id"
                            render={({ field }) => {
                              let numValue: number | null = null;
                              if (field.value && field.value !== '') {
                                const parsed = typeof field.value === 'string'
                                  ? parseInt(field.value, 10)
                                  : Number(field.value);
                                if (!isNaN(parsed) && parsed > 0) {
                                  numValue = parsed;
                                }
                              }

                              return (
                                <FormItem>
                                  <FormLabel>Subject</FormLabel>
                                  <FormControl>
                                    <SchoolSubjectDropdown
                                      classId={classId}
                                      value={numValue}
                                      onChange={(value) => {
                                        if (value !== null && value !== undefined) {
                                          field.onChange(value.toString());
                                        } else {
                                          field.onChange('');
                                        }
                                      }}
                                      disabled={true}
                                      placeholder="Select subject"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
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
                                />
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
                            Update Test Mark
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
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
            {/* Unified Filter Controls with Add Button */}
            <div className="space-y-4">
              {/* Top Section: Filters and Add Button */}
              <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                {/* Left Side: Filters */}
                <div className="flex flex-wrap gap-4 items-center flex-1">
                  {/* Required Filters */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Class: <span className="text-red-500">*</span>
                    </label>
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
                      placeholder={
                        selectedClass ? "Select section" : "Select class first"
                      }
                      emptyValue
                      emptyValueLabel={
                        selectedClass ? "Select section" : "Select class first"
                      }
                      className="w-40"
                      disabled={!selectedClass}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Test: <span className="text-red-500">*</span>
                    </label>
                    <SchoolTestDropdown
                      value={selectedTest}
                      onChange={handleTestChange}
                      placeholder={
                        selectedClass ? "Select test" : "Select class first"
                      }
                      emptyValue
                      emptyValueLabel={
                        selectedClass ? "Select test" : "Select class first"
                      }
                      className="w-40"
                      disabled={!selectedClass}
                    />
                  </div>

                  {/* Required Filters - Subject */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Subject: <span className="text-red-500">*</span>
                    </label>
                    <SchoolSubjectDropdown
                      classId={classId}
                      value={selectedSubject}
                      onChange={handleSubjectChange}
                      placeholder={
                        selectedClass ? "Select subject" : "Select class first"
                      }
                      emptyValue
                      emptyValueLabel={
                        selectedClass ? "Select subject" : "Select class first"
                      }
                      className="w-40"
                      disabled={!selectedClass}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Grade:
                    </label>
                    <Select
                      value={selectedGrade}
                      onValueChange={handleGradeChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {grades.map((grade) => (
                          <SelectItem key={grade.grade} value={grade.grade}>
                            {grade.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Side: Add Marks Button */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowAddTestMarksDialog(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Marks by Class
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="space-y-4">
              {/* Filter Selection Alerts */}
              {!selectedClass && (
                <Alert>
                  <AlertDescription>
                    Please select a class, subject, and test from the dropdowns above to view test marks.
                  </AlertDescription>
                </Alert>
              )}
              {selectedClass && !selectedSubject && (
                <Alert>
                  <AlertDescription>
                    Please select a subject from the dropdown above to view test marks.
                  </AlertDescription>
                </Alert>
              )}
              {selectedClass && selectedSubject && !selectedTest && (
                <Alert>
                  <AlertDescription>
                    Please select a test from the dropdown above to view test marks for the selected class and subject.
                  </AlertDescription>
                </Alert>
              )}

              {/* Enhanced Data Table - Always shown */}
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
                loading={testMarksLoading}
              />
            </div>

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
                  <Loader.Data message="Loading mark..." />
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

      {/* Add Test Marks by Class Dialog */}
      <AddTestMarksByClassDialog
        isOpen={showAddTestMarksDialog}
        onClose={() => setShowAddTestMarksDialog(false)}
        onSuccess={() => {
          // Invalidate and refetch test marks after bulk save
          void queryClient.invalidateQueries({
            queryKey: schoolKeys.testMarks.root(),
          });
          void queryClient.refetchQueries({
            queryKey: schoolKeys.testMarks.root(),
            type: "active",
          });
        }}
      />
    </div>
  );
};

export default TestMarksManagementComponent;

