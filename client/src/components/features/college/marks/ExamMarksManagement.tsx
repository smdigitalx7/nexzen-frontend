import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as AlertHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import {
  CollegeClassDropdown,
  CollegeGroupDropdown,
  CollegeSubjectDropdown,
  CollegeExamDropdown,
} from '@/components/shared/Dropdowns';
import { 
  useCollegeExamMarksList, 
  useCollegeExamMark,
  useCreateCollegeExamMark, 
  useUpdateCollegeExamMark, 
  useDeleteCollegeExamMark,
} from '@/lib/hooks/college';
import { useCollegeEnrollmentsList } from '@/lib/hooks/college/use-college-enrollments';
import { useCreateCollegeExamMarksMultipleSubjects } from '@/lib/hooks/college/use-college-exam-marks';
import {
  useCollegeGroups,
  useCollegeSubjects,
  useCollegeExams,
} from '@/lib/hooks/college/use-college-dropdowns';
import { useGrades } from '@/lib/hooks/general/useGrades';
import type { CollegeExamMarkMinimalRead, CollegeExamMarksListParams } from '@/lib/types/college/exam-marks';
import type { CollegeMarksData } from '@/lib/hooks/college/use-college-marks-statistics';
import type { 
  CollegeEnrollmentWithClassGroupCourseDetails, 
  CollegeEnrollmentRead,
  CollegeEnrollmentWithStudentDetails 
} from '@/lib/types/college/enrollments';
import type { CollegeSubjectList } from '@/lib/types/college/subjects';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
} from "@/lib/utils/factory/columnFactories";

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

const examMarkFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  exam_id: z.string().min(1, "Exam is required"),
  subject_id: z.string().min(1, "Subject is required"),
  marks_obtained: z.string().min(1, "Marks obtained is required"),
  remarks: z.string().optional(),
});

const multipleSubjectsFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  exam_id: z.string().min(1, "Exam is required"),
  subjects: z.array(z.object({
    subject_id: z.string().min(1, "Subject is required"),
    marks_obtained: z.string().min(1, "Marks obtained is required"),
    remarks: z.string().optional(),
  })).min(1, "At least one subject is required"),
});

interface ExamMarksManagementProps {
  onDataChange?: (data: CollegeMarksData[]) => void;
  selectedClass?: number | null;
  setSelectedClass?: (value: number | null) => void;
  selectedGroup?: number | null;
  setSelectedGroup?: (value: number | null) => void;
  selectedSubject?: number | null;
  setSelectedSubject?: (value: number | null) => void;
  selectedExam?: number | null;
  setSelectedExam?: (value: number | null) => void;
}

const ExamMarksManagement: React.FC<ExamMarksManagementProps> = ({ 
  onDataChange,
  selectedClass: propSelectedClass,
  setSelectedClass: propSetSelectedClass,
  selectedGroup: propSelectedGroup,
  setSelectedGroup: propSetSelectedGroup,
  selectedSubject: propSelectedSubject,
  setSelectedSubject: propSetSelectedSubject,
  selectedExam: propSelectedExam,
  setSelectedExam: propSetSelectedExam,
}) => {
  // Use props if provided, otherwise use local state (for backward compatibility)
  const [localSelectedClass, setLocalSelectedClass] = useState<number | null>(null);
  const [localSelectedSubject, setLocalSelectedSubject] = useState<number | null>(null);
  const [localSelectedGroup, setLocalSelectedGroup] = useState<number | null>(null);
  const [localSelectedExam, setLocalSelectedExam] = useState<number | null>(null);

  const selectedClass = propSelectedClass ?? localSelectedClass;
  const setSelectedClass = propSetSelectedClass ?? setLocalSelectedClass;
  const selectedSubject = propSelectedSubject ?? localSelectedSubject;
  const setSelectedSubject = propSetSelectedSubject ?? setLocalSelectedSubject;
  const selectedGroup = propSelectedGroup ?? localSelectedGroup;
  const setSelectedGroup = propSetSelectedGroup ?? setLocalSelectedGroup;
  const selectedExam = propSelectedExam ?? localSelectedExam;
  const setSelectedExam = propSetSelectedExam ?? setLocalSelectedExam;
  
  // Dialog states
  const [showExamMarkDialog, setShowExamMarkDialog] = useState(false);
  const [editingExamMark, setEditingExamMark] = useState<ExamMarkRow | null>(null);
  const [showViewExamMarkDialog, setShowViewExamMarkDialog] = useState(false);
  const [viewingExamMarkId, setViewingExamMarkId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('single');

  // API hooks
  const { data: groupsData } = useCollegeGroups(selectedClass || undefined);
  const { data: subjectsData } = useCollegeSubjects(selectedGroup || 0);
  const { data: examsData } = useCollegeExams();
  
  // Get grades from API endpoint
  const { grades } = useGrades();
  
  // Create calculateGrade function using grades from API
  const calculateGrade = useMemo(() => createCalculateGradeFunction(grades), [grades]);

  // Get enrollments filtered by class and group
  const enrollmentsParams = useMemo(() => {
    if (!selectedClass || !selectedGroup) return undefined;
    return {
      class_id: selectedClass,
      group_id: selectedGroup,
      page: 1,
      pageSize: 1000,
    };
  }, [selectedClass, selectedGroup]);

  const { data: enrollmentsData } = useCollegeEnrollmentsList(enrollmentsParams);
  
  // Extract enrollments - flatten the grouped response and add class_name, group_name
  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    const allEnrollments: (CollegeEnrollmentRead & { class_name: string; group_name: string })[] = [];
    enrollmentsData.enrollments.forEach((group: CollegeEnrollmentWithClassGroupCourseDetails) => {
      if (group.students && Array.isArray(group.students)) {
        group.students.forEach((student: CollegeEnrollmentRead) => {
          allEnrollments.push({
            ...student,
            class_name: group.class_name || '',
            group_name: group.group_name || '',
          });
        });
      }
    });
    return allEnrollments;
  }, [enrollmentsData]);

  // Get groups for lookup maps (for filtering)
  const groups = groupsData?.items || [];
  const subjects = subjectsData?.items || [];
  const exams = examsData?.items || [];

  // Reset dependent dropdowns when class changes
  useEffect(() => {
    setSelectedGroup(null);
    setSelectedSubject(null);
    setSelectedExam(null);
  }, [selectedClass]);

  // Single exam mark view data (enabled only when an id is set)
  const viewQuery = useCollegeExamMark(viewingExamMarkId || 0);
  const viewedExamMark = viewingExamMarkId ? viewQuery.data : null;
  const viewExamLoading = viewingExamMarkId ? viewQuery.isLoading : false;
  const viewExamError = viewingExamMarkId ? viewQuery.error : null;

  // Exam marks hooks - require class_id, group_id, exam_id, and subject_id
  const examMarksQuery = useMemo((): CollegeExamMarksListParams | undefined => {
    // All parameters are required: class_id, group_id, exam_id, subject_id
    if (!selectedClass || !selectedGroup || !selectedExam || !selectedSubject) {
      return undefined;
    }
    
    const query: CollegeExamMarksListParams = {
      class_id: selectedClass,
      group_id: selectedGroup,
      exam_id: selectedExam,
      subject_id: selectedSubject,
    };
    
    return query;
  }, [selectedClass, selectedGroup, selectedExam, selectedSubject]);

  const { data: examMarksData, isLoading: examMarksLoading, error: examMarksError } = useCollegeExamMarksList(examMarksQuery);
  const createExamMarkMutation = useCreateCollegeExamMark();
  const updateExamMarkMutation = useUpdateCollegeExamMark(editingExamMark?.mark_id || 0);
  const deleteExamMarkMutation = useDeleteCollegeExamMark();
  const createMultipleSubjectsMutation = useCreateCollegeExamMarksMultipleSubjects();

  // Single subject form
  const examMarkForm = useForm({
    resolver: zodResolver(examMarkFormSchema),
    defaultValues: {
      enrollment_id: '',
      exam_id: '',
      subject_id: '',
      marks_obtained: '',
      remarks: '',
    },
  });

  // Multiple subjects form
  const multipleSubjectsForm = useForm({
    resolver: zodResolver(multipleSubjectsFormSchema),
    defaultValues: {
      enrollment_id: '',
      exam_id: '',
      subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: multipleSubjectsForm.control,
    name: 'subjects',
  });

  // Single subject form submission handler
  const handleExamMarkSubmit = useCallback((values: z.infer<typeof examMarkFormSchema>) => {
    const markData = {
      enrollment_id: parseInt(values.enrollment_id),
      exam_id: parseInt(values.exam_id),
      subject_id: parseInt(values.subject_id),
      marks_obtained: parseFloat(values.marks_obtained),
      remarks: values.remarks || '',
    };

    if (editingExamMark) {
      updateExamMarkMutation.mutate({
        marks_obtained: markData.marks_obtained,
        percentage: 0, // Will be calculated by backend
        grade: '', // Will be calculated by backend
        remarks: markData.remarks,
        conducted_at: new Date().toISOString(),
      });
    } else {
      createExamMarkMutation.mutate(markData);
    }

    examMarkForm.reset();
    setEditingExamMark(null);
    setShowExamMarkDialog(false);
  }, [editingExamMark, updateExamMarkMutation, createExamMarkMutation, examMarkForm]);

  // Multiple subjects form submission handler
  const handleMultipleSubjectsSubmit = useCallback(async (values: z.infer<typeof multipleSubjectsFormSchema>) => {
    const selectedEnrollment = enrollments.find((e) => e.enrollment_id?.toString() === values.enrollment_id);
    
    const payload = {
      enrollment_id: parseInt(values.enrollment_id),
      exam_id: parseInt(values.exam_id),
      subjects: values.subjects.map((subj) => ({
        subject_id: parseInt(subj.subject_id),
        marks_obtained: parseFloat(subj.marks_obtained),
        remarks: subj.remarks || null,
        subject_name: subjects.find((s: CollegeSubjectList) => s.subject_id === parseInt(subj.subject_id))?.subject_name || null,
      })),
      student_name: selectedEnrollment?.student_name || null,
      exam_name: null, // Can be fetched if needed
    };

    try {
      await createMultipleSubjectsMutation.mutateAsync(payload);
      multipleSubjectsForm.reset();
      setShowExamMarkDialog(false);
    } catch (error) {
      // Error is handled by mutation hook
    }
  }, [enrollments, subjects, createMultipleSubjectsMutation, multipleSubjectsForm]);

  const handleEditExamMark = useCallback((mark: ExamMarkRow) => {
    setActiveTab('single');
    setEditingExamMark(mark);
    examMarkForm.reset({
      enrollment_id: mark.enrollment_id.toString(),
      exam_id: mark.exam_id ? String(mark.exam_id) : '',
      subject_id: mark.subject_id ? String(mark.subject_id) : '',
      marks_obtained: (mark.marks_obtained ?? 0).toString(),
      remarks: mark.remarks || '',
    });
    setShowExamMarkDialog(true);
  }, [examMarkForm]);

  const addSubjectRow = useCallback(() => {
    append({ subject_id: '', marks_obtained: '', remarks: '' });
  }, [append]);

  const handleDeleteExamMark = useCallback((markId: number) => {
    setConfirmDeleteId(markId);
  }, []);

  const handleViewExamMark = useCallback((markId: number) => {
    setViewingExamMarkId(markId);
    setShowViewExamMarkDialog(true);
  }, []);

  // Process data - flatten nested response structure: exams -> subjects -> students
  type ExamMarkRow = CollegeExamMarkMinimalRead & { exam_name?: string; subject_name?: string; class_name?: string; max_marks?: number; exam_id?: number; subject_id?: number };
  const flattenedMarks = useMemo(() => {
    if (!examMarksData) return [] as ExamMarkRow[];
    
    if (Array.isArray(examMarksData) && examMarksData.length > 0) {
      const flattened: ExamMarkRow[] = [];
      
      // Check if data has nested structure: exams -> subjects -> students
      const firstItem = examMarksData[0];
      const hasNestedStructure = 
        firstItem &&
        typeof firstItem === 'object' &&
        'subjects' in firstItem &&
        Array.isArray((firstItem as { subjects?: unknown }).subjects);

      if (hasNestedStructure) {
        // Handle nested structure: exams -> subjects -> students
        examMarksData.forEach((exam: unknown) => {
          if (
            exam &&
            typeof exam === 'object' &&
            'exam_id' in exam &&
            'exam_name' in exam &&
            'subjects' in exam &&
            Array.isArray((exam as { subjects?: unknown }).subjects)
          ) {
            const examTyped = exam as {
              exam_id: number;
              exam_name: string;
              subjects: Array<{
                subject_id: number;
                subject_name: string;
                students: Array<{
                  mark_id: number;
                  enrollment_id: number;
                  admission_no: string;
                  student_name: string;
                  roll_number: string;
                  marks_obtained: number | null;
                  percentage: number | null;
                  grade: string | null;
                  remarks: string | null;
                  conducted_at: string | null;
                }> | null;
              }> | null;
            };

            if (examTyped.subjects && Array.isArray(examTyped.subjects)) {
              examTyped.subjects.forEach((subject) => {
                if (subject && subject.students && Array.isArray(subject.students)) {
                  subject.students.forEach((student) => {
                    flattened.push({
                      mark_id: student.mark_id,
                      enrollment_id: student.enrollment_id,
                      admission_no: student.admission_no,
                      student_name: student.student_name,
                      roll_number: student.roll_number,
                      marks_obtained: student.marks_obtained,
                      percentage: student.percentage,
                      grade: student.grade,
                      remarks: student.remarks,
                      conducted_at: student.conducted_at,
                      exam_name: examTyped.exam_name,
                      subject_name: subject.subject_name,
                      exam_id: examTyped.exam_id,
                      subject_id: subject.subject_id,
                      class_name: '',
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
      const hasFlatSubjectStructure = examMarksData.some(
        (item) =>
          item &&
          typeof item === 'object' &&
          'students' in item &&
          'exam_name' in item &&
          'subject_name' in item
      );

      if (hasFlatSubjectStructure) {
        // Flatten grouped data: iterate through groups and extract students
        examMarksData.forEach((group: unknown) => {
          if (
            group &&
            typeof group === 'object' &&
            'students' in group &&
            'exam_name' in group &&
            'subject_name' in group &&
            'exam_id' in group &&
            'subject_id' in group
          ) {
            const groupTyped = group as {
              exam_name: string;
              subject_name: string;
              exam_id: number;
              subject_id: number;
              students: CollegeExamMarkMinimalRead[] | null;
            };
            
            // Handle null or empty students array
            if (groupTyped.students && Array.isArray(groupTyped.students) && groupTyped.students.length > 0) {
              groupTyped.students.forEach((student: CollegeExamMarkMinimalRead) => {
                flattened.push({
                  ...student,
                  exam_name: groupTyped.exam_name,
                  subject_name: groupTyped.subject_name,
                  exam_id: groupTyped.exam_id,
                  subject_id: groupTyped.subject_id,
                  class_name: '',
                });
              });
            }
          }
        });
        
        return flattened;
      }
      
      // If data is already flat, ensure it has the required fields
      return examMarksData
        .filter((mark: unknown): mark is Record<string, unknown> => 
          mark !== null && 
          typeof mark === 'object' && 
          'mark_id' in mark && 
          'enrollment_id' in mark
        )
        .map((markObj): ExamMarkRow => {
          const obj = markObj as unknown as Record<string, unknown>;
          return {
            mark_id: Number(obj.mark_id),
            enrollment_id: Number(obj.enrollment_id),
            admission_no: String(obj.admission_no || ''),
            student_name: String(obj.student_name || ''),
            roll_number: String(obj.roll_number || ''),
            marks_obtained: typeof obj.marks_obtained === 'number' ? obj.marks_obtained : null,
            percentage: typeof obj.percentage === 'number' ? obj.percentage : null,
            grade: typeof obj.grade === 'string' ? obj.grade : null,
            remarks: typeof obj.remarks === 'string' ? obj.remarks : null,
            conducted_at: typeof obj.conducted_at === 'string' ? obj.conducted_at : null,
            exam_name: String(obj.exam_name || ''),
            subject_name: String(obj.subject_name || ''),
            exam_id: obj.exam_id ? Number(obj.exam_id) : undefined,
            subject_id: obj.subject_id ? Number(obj.subject_id) : undefined,
            class_name: String(obj.class_name || ''),
          } as ExamMarkRow;
        });
    }
    
    return [] as ExamMarkRow[];
  }, [examMarksData]);

  const examMarks = flattenedMarks;

  // Debug: Log data structure to understand API response
  useEffect(() => {
    if (examMarksData && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Exam Marks Data:', {
        isArray: Array.isArray(examMarksData),
        length: Array.isArray(examMarksData) ? examMarksData.length : 0,
        firstItem: Array.isArray(examMarksData) && examMarksData.length > 0 ? examMarksData[0] : null,
        flattenedCount: examMarks.length,
      });
    }
  }, [examMarksData, examMarks.length]);

  // Notify parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(examMarks);
    }
  }, [examMarks, onDataChange]);


  // Table columns for exam marks using column factories
  const examMarkColumns: ColumnDef<ExamMarkRow>[] = useMemo(() => {
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
      createStudentColumn<ExamMarkRow>("student_name", "roll_number", "admission_no", { header: "Student" }),
      createSubjectColumn<ExamMarkRow>("subject_name", "exam_name", { header: "Subject" }),
      createMarksColumn<ExamMarkRow>("marks_obtained", "max_marks", "percentage", { header: "Marks" }),
      createGradeColumn<ExamMarkRow>("grade", gradeColors, { header: "Grade" }),
      createTestDateColumn<ExamMarkRow>("conducted_at", { header: "Exam Date" }),
    ];
  }, []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: ExamMarkRow) => handleViewExamMark(row.mark_id)
    },
    {
      type: 'edit' as const,
      onClick: (row: ExamMarkRow) => handleEditExamMark(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: ExamMarkRow) => handleDeleteExamMark(row.mark_id)
    }
  ], [handleViewExamMark, handleEditExamMark, handleDeleteExamMark]);

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
            <div className="flex gap-3">
              <Dialog open={showExamMarkDialog} onOpenChange={(open) => {
                if (!open) {
                  setActiveTab('single');
                  examMarkForm.reset();
                  multipleSubjectsForm.reset({
                    enrollment_id: '',
                    exam_id: '',
                    subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
                  });
                  setEditingExamMark(null);
                }
                setShowExamMarkDialog(open);
              }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
                    <DialogTitle>{editingExamMark ? 'Edit Exam Mark' : 'Add New Exam Mark'}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                  {!editingExamMark ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single">Single Subject</TabsTrigger>
                        <TabsTrigger value="multiple">Multiple Subjects</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="single" className="mt-4">
                        <Form {...examMarkForm}>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            void examMarkForm.handleSubmit(handleExamMarkSubmit)(e);
                          }} className="space-y-4">
                      <FormField
                        control={examMarkForm.control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!!editingExamMark}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                  {enrollments.map((enrollment) => {
                                    const displayParts = [
                                      enrollment.student_name,
                                      enrollment.class_name || '',
                                      enrollment.group_name || '',
                                    ].filter(Boolean);
                                    const displayText = displayParts.join(' - ');
                                    const rollNumber = enrollment.roll_number ? ` (Roll: ${enrollment.roll_number})` : '';
                                    return (
                                      <SelectItem key={enrollment.enrollment_id} value={enrollment.enrollment_id?.toString() || ''}>
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
                          control={examMarkForm.control}
                          name="exam_id"
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
                                <FormLabel>Exam</FormLabel>
                                <FormControl>
                                  <CollegeExamDropdown
                                    value={numValue}
                                    onChange={(value) => {
                                      // Convert number back to string for form
                                      if (value !== null && value !== undefined) {
                                        field.onChange(value.toString());
                                      } else {
                                        field.onChange('');
                                      }
                                    }}
                                    disabled={!!editingExamMark}
                                    placeholder="Select exam"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={examMarkForm.control}
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
                                    disabled={!!editingExamMark || !selectedGroup || selectedGroup <= 0}
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
                        control={examMarkForm.control}
                        name="marks_obtained"
                          render={({ field }) => (
                            <FormItem>
                            <FormLabel>Marks Obtained</FormLabel>
                                <FormControl>
                              <Input 
                                type="number" 
                                placeholder="85" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={examMarkForm.control}
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
                                  setActiveTab('single');
                                  examMarkForm.reset();
                                  multipleSubjectsForm.reset({
                                    enrollment_id: '',
                                    exam_id: '',
                                    subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
                                  });
                                  setEditingExamMark(null);
                                  setShowExamMarkDialog(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">
                                Add Exam Mark
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>

                      <TabsContent value="multiple" className="mt-4">
                        <Form {...multipleSubjectsForm}>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void multipleSubjectsForm.handleSubmit(handleMultipleSubjectsSubmit)(e);
                            }}
                            className="space-y-4"
                          >
                            <FormField
                              control={multipleSubjectsForm.control}
                              name="enrollment_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Student</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {enrollments.map((enrollment) => (
                                          <SelectItem key={enrollment.enrollment_id} value={enrollment.enrollment_id?.toString() || ''}>
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
                            <FormField
                              control={multipleSubjectsForm.control}
                              name="exam_id"
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
                                    <FormLabel>Exam</FormLabel>
                                    <FormControl>
                                      <CollegeExamDropdown
                                        value={numValue}
                                        onChange={(value) => {
                                          if (value !== null && value !== undefined) {
                                            field.onChange(value.toString());
                                          } else {
                                            field.onChange('');
                                          }
                                        }}
                                        placeholder="Select exam"
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
                                    control={multipleSubjectsForm.control}
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
                                    control={multipleSubjectsForm.control}
                                    name={`subjects.${index}.marks_obtained`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Marks Obtained</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder="85"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={multipleSubjectsForm.control}
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
                                  examMarkForm.reset();
                                  multipleSubjectsForm.reset({
                                    enrollment_id: '',
                                    exam_id: '',
                                    subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
                                  });
                                  setEditingExamMark(null);
                                  setShowExamMarkDialog(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit"
                                disabled={createMultipleSubjectsMutation.isPending}
                              >
                                {createMultipleSubjectsMutation.isPending ? "Adding..." : "Add Exam Marks"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <Form {...examMarkForm}>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        void examMarkForm.handleSubmit(handleExamMarkSubmit)(e);
                      }} className="space-y-4">
                        <FormField
                          control={examMarkForm.control}
                          name="enrollment_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={true}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select student" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {enrollments.map((enrollment) => (
                                      <SelectItem key={enrollment.enrollment_id} value={enrollment.enrollment_id?.toString() || ''}>
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
                            control={examMarkForm.control}
                            name="exam_id"
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
                                  <FormLabel>Exam</FormLabel>
                                  <FormControl>
                                    <CollegeExamDropdown
                                      value={numValue}
                                      onChange={(value) => {
                                        if (value !== null && value !== undefined) {
                                          field.onChange(value.toString());
                                        } else {
                                          field.onChange('');
                                        }
                                      }}
                                      disabled={true}
                                      placeholder="Select exam"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={examMarkForm.control}
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
                          control={examMarkForm.control}
                          name="marks_obtained"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marks Obtained</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="85" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={examMarkForm.control}
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
                              examMarkForm.reset();
                              setEditingExamMark(null);
                              setShowExamMarkDialog(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            Update Exam Mark
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
            className="space-y-6"
          >
            {/* Unified Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              {/* Required Filters - Order: Class, Group, Exam, Subject (as per mandatory parameters) */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Class:</label>
                <CollegeClassDropdown
                  value={selectedClass}
                  onChange={setSelectedClass}
                  placeholder="Select class"
                  className="w-40"
                  emptyValue
                  emptyValueLabel="Select class"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Group:</label>
                <CollegeGroupDropdown
                  classId={selectedClass || 0}
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  placeholder={selectedClass ? "Select group" : "Select class first"}
                  className="w-40"
                  emptyValue
                  emptyValueLabel={selectedClass ? "Select group" : "Select class first"}
                  disabled={!selectedClass}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Exam:</label>
                <CollegeExamDropdown
                  value={selectedExam}
                  onChange={setSelectedExam}
                  placeholder={selectedClass ? "Select exam" : "Select class first"}
                  className="w-40"
                  emptyValue
                  emptyValueLabel={selectedClass ? "Select exam" : "Select class first"}
                  disabled={!selectedClass}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Subject:</label>
                <CollegeSubjectDropdown
                  groupId={selectedGroup || 0}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder={selectedGroup ? "Select subject" : "Select group first"}
                  className="w-40"
                  emptyValue
                  emptyValueLabel={selectedGroup ? "Select subject" : "Select group first"}
                  disabled={!selectedGroup}
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
                      Select Class, Group, Exam, and Subject
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Please select a class, group, exam, and subject from the dropdowns above to view exam marks.
                    </p>
                  </div>
                </div>
              </Card>
            ) : !selectedGroup ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Select a Group
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Please select a group from the dropdown above to view exam marks.
                    </p>
                  </div>
                </div>
              </Card>
            ) : !selectedSubject ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Select a Subject
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Please select a subject from the dropdown above to view exam marks.
                    </p>
                  </div>
                </div>
              </Card>
            ) : !selectedExam ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Select an Exam
                    </h3>
                    <p className="text-slate-600 mt-1">
                      Please select an exam from the dropdown above to view exam marks.
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
                    <h3 className="text-lg font-semibold text-slate-900">Error Loading Data</h3>
                    <p className="text-slate-600 mt-1">
                      {examMarksError?.message || 'Failed to load exam marks. Please try again.'}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (examMarks.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">No Exam Marks Found</h3>
                    <p className="text-slate-600 mt-1">Try changing filters or ensure marks are recorded for this class.</p>
                  </div>
                </div>
              </Card>
            ) : (
              <EnhancedDataTable
                data={examMarks}
                title="Exam Marks"
                searchKey="student_name"
                searchPlaceholder="Search students..."
                columns={examMarkColumns}
                onAdd={() => setShowExamMarkDialog(true)}
                addButtonText="Add Exam Mark"
                exportable={true}
                showActions={true}
                actionButtonGroups={actionButtonGroups}
                actionColumnHeader="Actions"
                showActionLabels={false}
              />
            ))}

            {/* View Exam Mark Dialog */}
            <Dialog open={showViewExamMarkDialog} onOpenChange={setShowViewExamMarkDialog}>
              <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
                  <DialogTitle>Exam Mark Details</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                  {viewExamLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-600">Loading mark...</p>
                  </div>
                ) : viewExamError ? (
                  <div className="p-6 text-center text-red-600">Failed to load mark details.</div>
                ) : viewedExamMark ? (
                  <div className="space-y-4 p-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Student</div>
                        <div className="font-medium text-slate-900">{viewedExamMark.student_name} ({viewedExamMark.roll_number})</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Class / Group</div>
                        <div className="font-medium text-slate-900">{viewedExamMark.class_name} • {viewedExamMark.group_name || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Exam</div>
                        <div className="font-medium text-slate-900">{viewedExamMark.exam_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Subject</div>
                        <div className="font-medium text-slate-900">{viewedExamMark.subject_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Marks</div>
                        <div className="font-semibold text-slate-900">{viewedExamMark.marks_obtained ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Grade</div>
                        <div className="font-semibold text-slate-900">{viewedExamMark.grade ?? 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Percentage</div>
                        <div className="font-semibold text-slate-900">{viewedExamMark.percentage ?? 0}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="font-medium text-slate-900">{viewedExamMark.conducted_at ? new Date(viewedExamMark.conducted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</div>
                      </div>
                    </div>
                    {viewedExamMark.remarks && (
                      <div>
                        <div className="text-xs text-slate-500">Remarks</div>
                        <div className="text-slate-800">{viewedExamMark.remarks}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-600">No details found.</div>
                )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Confirm Delete Exam Mark */}
            <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
              <AlertDialogContent>
                <AlertHeader>
                  <AlertDialogTitle>Delete Exam Mark</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this exam mark? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (confirmDeleteId) deleteExamMarkMutation.mutate(confirmDeleteId); setConfirmDeleteId(null); }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExamMarksManagement;
