import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Trash2, Eye, Pencil } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { DatePicker } from '@/common/components/ui/date-picker';
import { Card } from '@/common/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as AlertHeader, AlertDialogTitle } from '@/common/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/common/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from '@/common/components/shared/DataTable';
import type { ActionConfig } from '@/common/components/shared/DataTable/types';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import {
  CollegeClassDropdown,
  CollegeGroupDropdown,
  CollegeSubjectDropdown,
  CollegeTestDropdown,
} from '@/common/components/shared/Dropdowns';
import { ServerCombobox } from '@/common/components/ui/server-combobox';
import {
  useCollegeTestMarksList,
  useCollegeTestMark,
  useCreateCollegeTestMark,
  useUpdateCollegeTestMark,
  useDeleteCollegeTestMark,
} from '@/features/college/hooks';
import { useCollegeEnrollmentsList } from '@/features/college/hooks/use-college-enrollments';
import { useCreateCollegeTestMarksMultipleSubjects } from '@/features/college/hooks/use-college-test-marks';
import {
  useCollegeGroups,
  useCollegeSubjects,
  useCollegeTests,
} from '@/features/college/hooks/use-college-dropdowns';
import { useGrades } from '@/features/general/hooks/useGrades';
import type { CollegeTestMarkMinimalRead, CollegeTestMarksListParams } from '@/features/college/types/test-marks';
import type {
  CollegeEnrollmentWithClassGroupCourseDetails,
  CollegeEnrollmentRead,
} from '@/features/college/types/enrollments';
import type { CollegeSubjectList } from '@/features/college/types/subjects';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn
} from "@/common/utils/factory/columnFactories";

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
    return 'F';
  };
};

const calculatePercentage = (marksObtained: number, maxMarks: number = 100): number => {
  return Math.round((marksObtained / maxMarks) * 100 * 10) / 10; // Round to 1 decimal place
};

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
  onDataChange?: (data: (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[]) => void;
  selectedClass?: number | null;
  setSelectedClass?: (value: number | null) => void;
  selectedGroup?: number | null;
  setSelectedGroup?: (value: number | null) => void;
  selectedSubject?: number | null;
  setSelectedSubject?: (value: number | null) => void;
  selectedTest?: number | null;
  setSelectedTest?: (value: number | null) => void;
}

const TestMarksManagement: React.FC<TestMarksManagementProps> = ({
  onDataChange,
  selectedClass: propSelectedClass,
  setSelectedClass: propSetSelectedClass,
  selectedGroup: propSelectedGroup,
  setSelectedGroup: propSetSelectedGroup,
  selectedSubject: propSelectedSubject,
  setSelectedSubject: propSetSelectedSubject,
  selectedTest: propSelectedTest,
  setSelectedTest: propSetSelectedTest,
}) => {
  // Use props if provided, otherwise use local state (for backward compatibility)
  const [localSelectedClass, setLocalSelectedClass] = useState<number | null>(null);
  const [localSelectedSubject, setLocalSelectedSubject] = useState<number | null>(null);
  const [localSelectedGroup, setLocalSelectedGroup] = useState<number | null>(null);
  const [localSelectedTest, setLocalSelectedTest] = useState<number | null>(null);

  const selectedClass = propSelectedClass ?? localSelectedClass;
  const setSelectedClass = propSetSelectedClass ?? setLocalSelectedClass;
  const selectedSubject = propSelectedSubject ?? localSelectedSubject;
  const setSelectedSubject = propSetSelectedSubject ?? setLocalSelectedSubject;
  const selectedGroup = propSelectedGroup ?? localSelectedGroup;
  const setSelectedGroup = propSetSelectedGroup ?? setLocalSelectedGroup;
  const selectedTest = propSelectedTest ?? localSelectedTest;
  const setSelectedTest = propSetSelectedTest ?? setLocalSelectedTest;

  // Dialog states
  const [showTestMarkDialog, setShowTestMarkDialog] = useState(false);
  const [editingTestMark, setEditingTestMark] = useState<CollegeTestMarkMinimalRead | null>(null);
  const [showViewTestMarkDialog, setShowViewTestMarkDialog] = useState(false);
  const [viewingTestMarkId, setViewingTestMarkId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('single');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [page_size] = useState(50); // For enrollments

  // API hooks
  const { data: groupsData } = useCollegeGroups(selectedClass || undefined);
  const { data: subjectsData } = useCollegeSubjects(selectedGroup || 0);
  const { data: testsData } = useCollegeTests();

  // Get grades from API endpoint
  const { grades } = useGrades();

  // Create calculateGrade function using grades from API
  const calculateGrade = useMemo(() => createCalculateGradeFunction(grades), [grades]);

  // Get enrollments filtered by class and group
  // ✅ FIX: Reduced page size from 1000 to 50 to prevent UI freezes
  const enrollmentsParams = useMemo(() => {
    if (!selectedClass || !selectedGroup) return undefined;
    return {
      class_id: selectedClass,
      group_id: selectedGroup,
      page: 1,
      page_size: 50, // ✅ CRITICAL FIX: Reduced from 100 to 50 for optimal performance
    };
  }, [selectedClass, selectedGroup]);

  const { data: enrollmentsData } = useCollegeEnrollmentsList(enrollmentsParams);

  // Flat enrollments list from API
  const enrollments = useMemo(() => {
    const list = enrollmentsData?.enrollments ?? [];
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map((e) => ({
      ...e,
      class_name: e.class_name ?? '',
      group_name: e.group_name ?? '',
    }));
  }, [enrollmentsData]);

  // Get groups for lookup maps (for filtering)
  const groups = groupsData?.items || [];
  const subjects = subjectsData?.items || [];
  const tests = testsData?.items || [];

  // Reset dependent dropdowns when class changes
  useEffect(() => {
    setSelectedGroup(null);
    setSelectedSubject(null);
    setSelectedTest(null);
    setPage(1);
  }, [selectedClass, setSelectedGroup, setSelectedSubject, setSelectedTest]);

  // Single test mark view data (enabled only when an id is set)
  const viewQuery = useCollegeTestMark(viewingTestMarkId);
  const viewedTestMark = viewQuery.data || null;
  const viewTestLoading = viewQuery.isLoading;
  const viewTestError = viewQuery.error;

  // Test marks hooks - require class_id, group_id, test_id, and subject_id
  const testMarksQuery = useMemo((): CollegeTestMarksListParams | undefined => {
    // All parameters are required: class_id, group_id, test_id, subject_id
    if (!selectedClass || !selectedGroup || !selectedTest || !selectedSubject) {
      return undefined;
    }

    const query: CollegeTestMarksListParams = {
      class_id: selectedClass,
      group_id: selectedGroup,
      test_id: selectedTest,
      subject_id: selectedSubject,
      page,
      page_size: pageSize,
    };

    return query;
  }, [selectedClass, selectedGroup, selectedTest, selectedSubject, page, pageSize]);

  const { data: testMarksData, isLoading: testMarksLoading, error: testMarksError } = useCollegeTestMarksList(testMarksQuery);
  const createTestMarkMutation = useCreateCollegeTestMark();
  const updateTestMarkMutation = useUpdateCollegeTestMark();
  const deleteTestMarkMutation = useDeleteCollegeTestMark();
  const createMultipleSubjectsMutation = useCreateCollegeTestMarksMultipleSubjects();

  // Single subject form
  const testMarkForm = useForm({
    resolver: zodResolver(testMarkFormSchema),
    defaultValues: {
      enrollment_id: '',
      test_id: '',
      subject_id: '',
      marks_obtained: '',
      remarks: '',
    },
  });

  // Multiple subjects form
  const multipleTestSubjectsForm = useForm({
    resolver: zodResolver(multipleTestSubjectsFormSchema),
    defaultValues: {
      enrollment_id: '',
      test_id: '',
      subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: multipleTestSubjectsForm.control,
    name: 'subjects',
  });

  // Single subject form submission handler
  const handleTestMarkSubmit = useCallback((values: z.infer<typeof testMarkFormSchema>) => {
    const markData = {
      enrollment_id: parseInt(values.enrollment_id),
      test_id: parseInt(values.test_id),
      subject_id: parseInt(values.subject_id),
      marks_obtained: parseFloat(values.marks_obtained),
      remarks: values.remarks || '',
    };

    if (editingTestMark) {
      // Backend expects only marks_obtained and remarks for update
      updateTestMarkMutation.mutate({
        markId: editingTestMark.mark_id,
        payload: {
          marks_obtained: markData.marks_obtained,
          remarks: markData.remarks,
        }
      });
    } else {
      // Create still sends full payload; backend will compute percentage/grade
      createTestMarkMutation.mutate({
        enrollment_id: markData.enrollment_id,
        test_id: markData.test_id,
        subject_id: markData.subject_id,
        marks_obtained: markData.marks_obtained,
        remarks: markData.remarks,
      });
    }

    testMarkForm.reset();
    setEditingTestMark(null);
    setShowTestMarkDialog(false);
  }, [editingTestMark, updateTestMarkMutation, createTestMarkMutation, testMarkForm]);

  // Multiple subjects form submission handler
  const handleMultipleTestSubjectsSubmit = useCallback(async (values: z.infer<typeof multipleTestSubjectsFormSchema>) => {
    const selectedEnrollment = enrollments.find((e) => e.enrollment_id?.toString() === values.enrollment_id);

    const payload = {
      enrollment_id: parseInt(values.enrollment_id),
      test_id: parseInt(values.test_id),
      subjects: values.subjects.map((subj) => ({
        subject_id: parseInt(subj.subject_id),
        marks_obtained: parseFloat(subj.marks_obtained),
        remarks: subj.remarks || null,
        subject_name: subjects.find((s: CollegeSubjectList) => s.subject_id === parseInt(subj.subject_id))?.subject_name || null,
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
  }, [enrollments, subjects, createMultipleSubjectsMutation, multipleTestSubjectsForm]);

  const handleEditTestMark = useCallback((mark: CollegeTestMarkMinimalRead & { test_id?: number; subject_id?: number; percentage?: number | null; grade?: string | null; conducted_at?: string | null; remarks?: string | null; }) => {
    setActiveTab('single');
    setEditingTestMark(mark);
    testMarkForm.reset({
      enrollment_id: mark.enrollment_id.toString(),
      test_id: mark.test_id ? String(mark.test_id) : '',
      subject_id: mark.subject_id ? String(mark.subject_id) : '',
      marks_obtained: (mark.marks_obtained ?? 0).toString(),
      remarks: mark.remarks || '',
    });
    setShowTestMarkDialog(true);
  }, [testMarkForm]);

  const addSubjectRow = useCallback(() => {
    append({ subject_id: '', marks_obtained: '', remarks: '' });
  }, [append]);

  const handleDeleteTestMark = useCallback((markId: number) => {
    setConfirmDeleteId(markId);
  }, []);

  const handleViewTestMark = useCallback((markId: number) => {
    setViewingTestMarkId(markId);
    setShowViewTestMarkDialog(true);
  }, []);

  // Process and filter data - flatten nested response structure: tests -> subjects -> students
  const flattenedMarks = useMemo(() => {
    if (!testMarksData) {
      return [] as (CollegeTestMarkMinimalRead & {
        test_name?: string;
        subject_name?: string;
        test_id?: number;
        subject_id?: number;
      })[];
    }

    // Ensure we have an array - handle different response structures
    let dataArray: any[] = [];
    const raw: unknown = testMarksData;
    if (Array.isArray(raw)) {
      dataArray = raw;
    } else if (raw && typeof raw === 'object') {
      // Handle wrapped responses
      const wrapped = raw as any;
      if (Array.isArray(wrapped.data)) {
        dataArray = wrapped.data;
      } else if (Array.isArray(wrapped.items)) {
        dataArray = wrapped.items;
      } else if (Array.isArray(wrapped.results)) {
        dataArray = wrapped.results;
      } else {
        // If it's an object but not an array, return empty
        console.warn('testMarksData is not an array or array-wrapped object:', raw);
        return [] as (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[];
      }
    } else {
      console.warn('testMarksData is not a valid type:', typeof raw, raw);
      return [] as (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[];
    }

    if (dataArray.length > 0) {
      const flattened: (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[] = [];

      // Check if data has nested structure: tests -> subjects -> students
      const firstItem = dataArray[0];
      const hasNestedStructure =
        firstItem &&
        typeof firstItem === 'object' &&
        'subjects' in firstItem &&
        Array.isArray((firstItem as { subjects?: unknown }).subjects);

      if (hasNestedStructure) {
        // Handle nested structure: tests -> subjects -> students
        dataArray.forEach((test: unknown) => {
          if (
            test &&
            typeof test === 'object' &&
            'test_id' in test &&
            'test_name' in test &&
            'subjects' in test &&
            Array.isArray((test as { subjects?: unknown }).subjects)
          ) {
            const testTyped = test as {
              test_id: number;
              test_name: string;
              subjects: Array<{
                subject_id: number;
                subject_name: string;
                students: Array<{
                  mark_id: number;
                  enrollment_id: number;
                  student_name: string;
                  roll_number: string;
                  admission_no: string;
                  class_name: string;
                  group_name: string;
                  marks_obtained: number | null;
                  percentage: number | null;
                  grade: string | null;
                  remarks: string | null;
                  conducted_at: string | null;
                }> | null;
              }> | null;
            };

            if (testTyped.subjects && Array.isArray(testTyped.subjects)) {
              testTyped.subjects.forEach((subject) => {
                if (subject && subject.students && Array.isArray(subject.students)) {
                  subject.students.forEach((student) => {
                    flattened.push({
                      mark_id: student.mark_id,
                      enrollment_id: student.enrollment_id,
                      student_name: student.student_name,
                      roll_number: student.roll_number,
                      admission_no: student.admission_no,
                      class_name: student.class_name,
                      group_name: student.group_name,
                      marks_obtained: student.marks_obtained,
                      percentage: student.percentage,
                      grade: student.grade,
                      remarks: student.remarks,
                      conducted_at: student.conducted_at,
                      test_name: testTyped.test_name,
                      subject_name: subject.subject_name,
                      test_id: testTyped.test_id,
                      subject_id: subject.subject_id,
                    });
                  });
                }
              });
            }
          }
        });

        return flattened;
      }

      // Check if data has flat structure with subjects directly (old format)
      const hasFlatSubjectStructure = dataArray.some(
        (item) =>
          item &&
          typeof item === 'object' &&
          'students' in item &&
          'test_name' in item &&
          'subject_name' in item
      );

      if (hasFlatSubjectStructure) {
        // Flatten grouped data: iterate through groups and extract students
        dataArray.forEach((group: unknown) => {
          if (
            group &&
            typeof group === 'object' &&
            'students' in group &&
            'test_name' in group &&
            'subject_name' in group &&
            'test_id' in group &&
            'subject_id' in group
          ) {
            const groupTyped = group as {
              test_name: string;
              subject_name: string;
              test_id: number;
              subject_id: number;
              students: CollegeTestMarkMinimalRead[] | null;
            };

            // Handle null or empty students array
            if (groupTyped.students && Array.isArray(groupTyped.students) && groupTyped.students.length > 0) {
              groupTyped.students.forEach((student: CollegeTestMarkMinimalRead) => {
                flattened.push({
                  ...student,
                  test_name: groupTyped.test_name,
                  subject_name: groupTyped.subject_name,
                  test_id: groupTyped.test_id,
                  subject_id: groupTyped.subject_id,
                });
              });
            }
          }
        });

        return flattened;
      }

      // If data is already flat, ensure it has the required fields
      return testMarksData
        .filter((mark: unknown): mark is Record<string, unknown> =>
          mark !== null &&
          typeof mark === 'object' &&
          ('mark_id' in mark || 'test_mark_id' in mark) &&
          'enrollment_id' in mark
        )
        .map((markObj: unknown) => {
          const obj = markObj as unknown as Record<string, unknown>;
          return {
            mark_id: Number(obj.mark_id || obj.test_mark_id || 0),
            enrollment_id: Number(obj.enrollment_id),
            student_name: String(obj.student_name || ''),
            roll_number: String(obj.roll_number || ''),
            admission_no: String(obj.admission_no || ''),
            class_name: String(obj.class_name || ''),
            group_name: String(obj.group_name || ''),
            marks_obtained: typeof obj.marks_obtained === 'number' ? obj.marks_obtained : null,
            percentage: typeof obj.percentage === 'number' ? obj.percentage : null,
            grade: typeof obj.grade === 'string' ? obj.grade : null,
            remarks: typeof obj.remarks === 'string' ? obj.remarks : null,
            conducted_at: typeof obj.conducted_at === 'string' ? obj.conducted_at : null,
            test_name: String(obj.test_name || ''),
            subject_name: String(obj.subject_name || ''),
            test_id: obj.test_id ? Number(obj.test_id) : undefined,
            subject_id: obj.subject_id ? Number(obj.subject_id) : undefined,
          } as CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number };
        });
    }

    return [] as (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[];
  }, [testMarksData]);

  const totalCount = useMemo(() => {
    const raw = testMarksData as { data?: unknown[]; total_count?: number } | any[] | undefined;
    if (Array.isArray(raw)) return raw.length;
    return raw?.total_count ?? 0;
  }, [testMarksData]);

  const testMarks = flattenedMarks;

  // Notify parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(testMarks);
    }
  }, [testMarks, onDataChange]);



  // Table columns for test marks using column factories
  const testMarkColumns: ColumnDef<CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; max_marks?: number }>[] = useMemo(() => {
    // Grade colors mapping
    const gradeColors = {
      'A+': 'bg-green-600',
      'A': 'bg-green-500',
      'B+': 'bg-blue-500',
      'B': 'bg-blue-400',
      'C+': 'bg-yellow-500',
      'C': 'bg-yellow-400',
      'D': 'bg-orange-500',
      'F': 'bg-red-500',
    };

    return [
      createStudentColumn<CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string }>("student_name", "roll_number", "group_name", { header: "Student" }),
      createSubjectColumn<CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string }>("subject_name", "test_name", { header: "Subject" }),
      createMarksColumn<CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; max_marks?: number }>("marks_obtained", "max_marks", "percentage", { header: "Marks" }),
      createGradeColumn<CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string }>("grade", gradeColors, { header: "Grade" }),
      createTestDateColumn<CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string }>("conducted_at", { header: "Test Date" })
    ];
  }, []);

  type TestMarkRow = CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; max_marks?: number };
  // Actions for DataTable V2 (View, Edit, Delete)
  const testMarkActions = useMemo<ActionConfig<TestMarkRow>[]>(() => [
    { id: 'view', label: 'View', icon: Eye, variant: 'ghost', onClick: (row) => handleViewTestMark(row.mark_id) },
    { id: 'edit', label: 'Edit', icon: Pencil, variant: 'outline', onClick: handleEditTestMark },
    { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive', onClick: (row) => handleDeleteTestMark(row.mark_id) },
  ], [handleViewTestMark, handleEditTestMark, handleDeleteTestMark]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex gap-3">
              <Dialog open={showTestMarkDialog} onOpenChange={(open) => {
                if (!open) {
                  setActiveTab('single');
                  testMarkForm.reset();
                  multipleTestSubjectsForm.reset({
                    enrollment_id: '',
                    test_id: '',
                    subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
                  });
                  setEditingTestMark(null);
                }
                setShowTestMarkDialog(open);
              }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
                    <DialogTitle>{editingTestMark ? 'Edit Test Mark' : 'Add New Test Mark'}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                    {!editingTestMark ? (
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="single">Single Subject</TabsTrigger>
                          <TabsTrigger value="multiple">Multiple Subjects</TabsTrigger>
                        </TabsList>

                        <TabsContent value="single" className="mt-4">
                          <Form {...testMarkForm}>
                            <form onSubmit={(e) => { void testMarkForm.handleSubmit(handleTestMarkSubmit)(e); }} className="space-y-4">
                              <FormField
                                control={testMarkForm.control}
                                name="enrollment_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Student</FormLabel>
                                    <FormControl>
                                      <ServerCombobox<any>
                                        items={enrollments}
                                        value={field.value}
                                        onSelect={field.onChange}
                                        disabled={!!editingTestMark}
                                        placeholder="Select student"
                                        searchPlaceholder="Search students..."
                                        emptyText={enrollments.length ? "No matching students" : "No students found"}
                                        valueKey="enrollment_id"
                                        labelKey={(item) =>
                                          `${item.student_name} (${item.admission_no || "No admission no"})`
                                        }
                                        width="w-full"
                                      />
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
                                    // Convert form string value to number for dropdown
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
                                          <CollegeTestDropdown
                                            value={numValue}
                                            onChange={(value) => {
                                              // Convert number back to string for form
                                              if (value !== null && value !== undefined) {
                                                field.onChange(value.toString());
                                              } else {
                                                field.onChange('');
                                              }
                                            }}
                                            disabled={!!editingTestMark}
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
                                    // Convert form string value to number for dropdown
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
                                          <CollegeSubjectDropdown
                                            groupId={selectedGroup || 0}
                                            value={numValue}
                                            onChange={(value) => {
                                              // Convert number back to string for form
                                              if (value !== null && value !== undefined) {
                                                field.onChange(value.toString());
                                              } else {
                                                field.onChange('');
                                              }
                                            }}
                                            disabled={!!editingTestMark || !selectedGroup || selectedGroup <= 0}
                                            placeholder={!selectedGroup || selectedGroup <= 0 ? "Select group first" : "Select subject"}
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
                                        id="test-mark-obtained"
                                        type="number"
                                        placeholder="18"
                                        {...field}
                                        autoComplete="off"
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
                                      <Input id="test-mark-remarks" placeholder="Additional comments..." {...field} autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveTab('single');
                                    testMarkForm.reset();
                                    multipleTestSubjectsForm.reset({
                                      enrollment_id: '',
                                      test_id: '',
                                      subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
                                    });
                                    setEditingTestMark(null);
                                    setShowTestMarkDialog(false);
                                  }}
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
                              onSubmit={(e) => {
                                e.preventDefault();
                                void multipleTestSubjectsForm.handleSubmit(handleMultipleTestSubjectsSubmit)(e);
                              }}
                              className="space-y-4"
                            >
                              <FormField
                                control={multipleTestSubjectsForm.control}
                                name="enrollment_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Student</FormLabel>
                                    <FormControl>
                                      <ServerCombobox<any>
                                        items={enrollments}
                                        value={field.value}
                                        onSelect={field.onChange}
                                        placeholder="Select student"
                                        searchPlaceholder="Search students..."
                                        emptyText={enrollments.length ? "No matching students" : "No students found"}
                                        valueKey="enrollment_id"
                                        labelKey={(item) =>
                                          `${item.student_name} (${item.admission_no || "No admission no"})`
                                        }
                                        width="w-full"
                                      />
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
                                        <CollegeTestDropdown
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
                                              <CollegeSubjectDropdown
                                                groupId={selectedGroup || 0}
                                                value={numValue}
                                                onChange={(value) => {
                                                  if (value !== null && value !== undefined) {
                                                    field.onChange(value.toString());
                                                  } else {
                                                    field.onChange('');
                                                  }
                                                }}
                                                disabled={!selectedGroup || selectedGroup <= 0}
                                                placeholder={!selectedGroup || selectedGroup <= 0 ? "Select group first" : "Select subject"}
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
                                  onClick={() => {
                                    setActiveTab('single');
                                    testMarkForm.reset();
                                    multipleTestSubjectsForm.reset({
                                      enrollment_id: '',
                                      test_id: '',
                                      subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
                                    });
                                    setEditingTestMark(null);
                                    setShowTestMarkDialog(false);
                                  }}
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
                        <form onSubmit={(e) => { void testMarkForm.handleSubmit(handleTestMarkSubmit)(e); }} className="space-y-4">
                          <FormField
                            control={testMarkForm.control}
                            name="enrollment_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Student</FormLabel>
                                <FormControl>
                                  <ServerCombobox<any>
                                    items={enrollments}
                                    value={field.value}
                                    onSelect={field.onChange}
                                    disabled={true}
                                    placeholder="Select student"
                                    searchPlaceholder="Search students..."
                                    emptyText={enrollments.length ? "No matching students" : "No students found"}
                                    valueKey="enrollment_id"
                                    labelKey={(enrollment) => {
                                      const displayParts = [
                                        enrollment.student_name,
                                        enrollment.class_name || "",
                                        enrollment.group_name || "",
                                      ].filter(Boolean);
                                      const rollNumber = enrollment.roll_number
                                        ? ` (Roll: ${enrollment.roll_number})`
                                        : "";
                                      return `${displayParts.join(" - ")}${rollNumber}`;
                                    }}
                                    width="w-full"
                                  />
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
                                      <CollegeTestDropdown
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
                                      <CollegeSubjectDropdown
                                        groupId={selectedGroup || 0}
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
                                  <Input placeholder="Additional comments..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                testMarkForm.reset();
                                setEditingTestMark(null);
                                setShowTestMarkDialog(false);
                              }}
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
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>


          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Unified Filter Controls */}
            <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              {/* Required Filters - Order: Class, Group, Test, Subject (as per mandatory parameters) */}
              <div className="flex items-center gap-2">
                <label htmlFor="test-mgmt-class" className="text-sm font-medium">Class:</label>
                <CollegeClassDropdown
                  id="test-mgmt-class"
                  value={selectedClass}
                  onChange={(value) => setSelectedClass(value)}
                  placeholder="Select class"
                  emptyValue
                  emptyValueLabel="Select class"
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="test-mgmt-group" className="text-sm font-medium">Group:</label>
                <CollegeGroupDropdown
                  id="test-mgmt-group"
                  classId={selectedClass || 0}
                  value={selectedGroup}
                  onChange={(value) => setSelectedGroup(value)}
                  disabled={!selectedClass}
                  placeholder={selectedClass ? "Select group" : "Select class first"}
                  emptyValue
                  emptyValueLabel={selectedClass ? "Select group" : "Select class first"}
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="test-mgmt-test" className="text-sm font-medium">Test:</label>
                <CollegeTestDropdown
                  id="test-mgmt-test"
                  value={selectedTest}
                  onChange={(value) => setSelectedTest(value)}
                  placeholder={selectedGroup ? "Select test" : "Select group first"}
                  emptyValue
                  emptyValueLabel={selectedGroup ? "Select test" : "Select group first"}
                  className="w-40"
                  disabled={!selectedGroup}
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="test-mgmt-subject" className="text-sm font-medium">Subject:</label>
                <CollegeSubjectDropdown
                  id="test-mgmt-subject"
                  groupId={selectedGroup || 0}
                  value={selectedSubject}
                  onChange={(value) => setSelectedSubject(value)}
                  placeholder={selectedGroup ? "Select subject" : "Select group first"}
                  emptyValue
                  emptyValueLabel={selectedGroup ? "Select subject" : "Select group first"}
                  className="w-40"
                  disabled={!selectedGroup}
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="space-y-3">
              {/* Filter Selection Alerts */}
              {!selectedClass && (
                <Alert>
                  <AlertDescription>
                    Please select a class, group, test, and subject from the dropdowns above to view test marks.
                  </AlertDescription>
                </Alert>
              )}
              {selectedClass && !selectedGroup && (
                <Alert>
                  <AlertDescription>
                    Please select a group from the dropdown above to view test marks.
                  </AlertDescription>
                </Alert>
              )}
              {selectedClass && selectedGroup && !selectedSubject && (
                <Alert>
                  <AlertDescription>
                    Please select a subject from the dropdown above to view test marks.
                  </AlertDescription>
                </Alert>
              )}
              {selectedClass && selectedGroup && selectedSubject && !selectedTest && (
                <Alert>
                  <AlertDescription>
                    Please select a test from the dropdown above to view test marks.
                  </AlertDescription>
                </Alert>
              )}

              {/* DataTable V2 */}
              <DataTable<TestMarkRow>
                data={testMarks}
                title="Test Marks"
                searchKey="student_name"
                searchPlaceholder="Search students..."
                columns={testMarkColumns}
                loading={testMarksLoading}
                onAdd={() => setShowTestMarkDialog(true)}
                addButtonText="Add Test Mark"
                export={{ enabled: true, filename: "test-marks" }}
                actions={testMarkActions}
                actionsHeader="Actions"
                emptyMessage="No test marks found"
                pagination="server"
                totalCount={totalCount}
                currentPage={page}
                pageSize={pageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </div>

            {/* View Test Mark Dialog */}
            <Dialog
              open={showViewTestMarkDialog}
              onOpenChange={(open) => {
                setShowViewTestMarkDialog(open);
                if (!open) {
                  setViewingTestMarkId(null);
                }
              }}
            >
              <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
                  <DialogTitle>Test Mark Details</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                  {!viewingTestMarkId ? (
                    <div className="p-6 text-center text-slate-600">No mark selected.</div>
                  ) : viewTestLoading ? (
                    <Loader.Data message="Loading mark..." />
                  ) : viewTestError ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="text-red-600 font-semibold">Failed to load mark details</div>
                      <div className="text-sm text-red-500">
                        {viewTestError instanceof Error ? viewTestError.message : 'Unknown error occurred'}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        The test mark may not exist or you may not have permission to view it.
                      </div>
                    </div>
                  ) : viewedTestMark ? (
                    <div className="space-y-4 p-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-slate-500">Student Name</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.student_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Admission No</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.admission_no}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Roll Number</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.roll_number}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Class</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.class_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Group</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.group_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Test</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.test_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Subject</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.subject_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Marks Obtained</div>
                          <div className="font-semibold text-slate-900">{viewedTestMark.marks_obtained ?? 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Percentage</div>
                          <div className="font-semibold text-slate-900">{viewedTestMark.percentage ?? 0}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Grade</div>
                          <div className="font-semibold text-slate-900">{viewedTestMark.grade ?? 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Conducted At</div>
                          <div className="font-medium text-slate-900">{viewedTestMark.conducted_at ? new Date(viewedTestMark.conducted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</div>
                        </div>
                      </div>
                      {viewedTestMark.remarks && (
                        <div>
                          <div className="text-xs text-slate-500">Remarks</div>
                          <div className="text-slate-800">{viewedTestMark.remarks}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-600">No details found.</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
      {/* Confirm Delete Test Mark */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <AlertDialogContent>
          <AlertHeader>
            <AlertDialogTitle>Delete Test Mark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test mark? This action cannot be undone.
            </AlertDialogDescription>
          </AlertHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (confirmDeleteId) deleteTestMarkMutation.mutate(confirmDeleteId); setConfirmDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestMarksManagement;
