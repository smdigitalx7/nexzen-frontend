import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {  ClipboardList} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Card    } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as AlertHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import { LoadingStates } from '@/components/ui/loading';
import {
  CollegeClassDropdown,
  CollegeGroupDropdown,
  CollegeSubjectDropdown,
  CollegeTestDropdown,
} from '@/components/shared/Dropdowns';
import { 
  useCollegeTestMarksList,
  useCollegeTestMark,
  useCreateCollegeTestMark,
  useUpdateCollegeTestMark,
  useDeleteCollegeTestMark,
  useCollegeStudentsList,
} from '@/lib/hooks/college';
import {
  useCollegeGroups,
  useCollegeSubjects,
  useCollegeTests,
} from '@/lib/hooks/college/use-college-dropdowns';
import type { CollegeTestMarkMinimalRead, CollegeTestMarksListParams } from '@/lib/types/college/test-marks';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn
} from "@/lib/utils/factory/columnFactories";

// Utility functions for grade calculation
const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};

const calculatePercentage = (marksObtained: number, maxMarks: number = 100): number => {
  return Math.round((marksObtained / maxMarks) * 100 * 10) / 10; // Round to 1 decimal place
};

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
  onDataChange?: (data: (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[]) => void;
}

const TestMarksManagement: React.FC<TestMarksManagementProps> = ({ onDataChange }) => {
  // State - using IDs for dropdowns
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  
  // Dialog states
  const [showTestMarkDialog, setShowTestMarkDialog] = useState(false);
  const [editingTestMark, setEditingTestMark] = useState<CollegeTestMarkMinimalRead | null>(null);
  const [showViewTestMarkDialog, setShowViewTestMarkDialog] = useState(false);
  const [viewingTestMarkId, setViewingTestMarkId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // API hooks
  const { data: studentsData } = useCollegeStudentsList();
  const students = studentsData?.data || [];
  const { data: groupsData } = useCollegeGroups(selectedClass || undefined);
  const { data: subjectsData } = useCollegeSubjects(selectedGroup || 0);
  const { data: testsData } = useCollegeTests();

  // Get groups for lookup maps (for filtering)
  const groups = groupsData?.items || [];
  const subjects = subjectsData?.items || [];
  const tests = testsData?.items || [];

  // Reset dependent dropdowns when class changes
  useEffect(() => {
    setSelectedGroup(null);
    setSelectedSubject(null);
    setSelectedTest(null);
  }, [selectedClass]);

  // Single test mark view data (enabled only when an id is set)
  const viewQuery = useCollegeTestMark(viewingTestMarkId);
  const viewedTestMark = viewQuery.data || null;
  const viewTestLoading = viewQuery.isLoading;
  const viewTestError = viewQuery.error;

  // Test marks hooks - only fetch when both class and group are explicitly selected
  const testMarksQuery = useMemo((): CollegeTestMarksListParams | undefined => {
    // Both class_id and group_id are required
    if (!selectedClass || !selectedGroup) {
      return undefined;
    }
    
    const query: CollegeTestMarksListParams = {
      class_id: selectedClass,
      group_id: selectedGroup,
    };
    
    if (selectedTest !== null && selectedTest !== undefined) {
      query.test_id = selectedTest;
    }
    if (selectedSubject !== null && selectedSubject !== undefined) {
      query.subject_id = selectedSubject;
    }
    
    return query;
  }, [selectedClass, selectedGroup, selectedTest, selectedSubject]);

  const { data: testMarksData, isLoading: testMarksLoading, error: testMarksError } = useCollegeTestMarksList(testMarksQuery);
  const createTestMarkMutation = useCreateCollegeTestMark();
  const updateTestMarkMutation = useUpdateCollegeTestMark(editingTestMark?.mark_id || 0);
  const deleteTestMarkMutation = useDeleteCollegeTestMark();

  // Form
  const testMarkForm = useForm({
    resolver: zodResolver(testMarkFormSchema),
    defaultValues: {
      enrollment_id: '',
      test_id: '',
      subject_id: '',
      marks_obtained: '',
      percentage: '',
      grade: '',
      conducted_at: '',
      remarks: '',
    },
  });

  // Form handling functions
  const handleTestMarkSubmit = useCallback((values: z.infer<typeof testMarkFormSchema>) => {
    const markData = {
      enrollment_id: parseInt(values.enrollment_id),
      test_id: parseInt(values.test_id),
      subject_id: parseInt(values.subject_id),
      marks_obtained: parseFloat(values.marks_obtained),
      percentage: parseFloat(values.percentage),
      grade: values.grade,
      conducted_at: values.conducted_at,
      remarks: values.remarks || '',
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
  }, [editingTestMark, updateTestMarkMutation, createTestMarkMutation, testMarkForm]);

  const handleEditTestMark = useCallback((mark: CollegeTestMarkMinimalRead & { test_id?: number; subject_id?: number; percentage?: number | null; grade?: string | null; conducted_at?: string | null; remarks?: string | null; }) => {
    setEditingTestMark(mark);
    testMarkForm.reset({
      enrollment_id: mark.enrollment_id.toString(),
      test_id: mark.test_id ? String(mark.test_id) : '',
      subject_id: mark.subject_id ? String(mark.subject_id) : '',
      marks_obtained: (mark.marks_obtained ?? 0).toString(),
      percentage: (mark.percentage ?? 0).toString(),
      grade: mark.grade || '',
      conducted_at: mark.conducted_at || '',
      remarks: mark.remarks || '',
    });
    setShowTestMarkDialog(true);
  }, [testMarkForm]);

  const handleDeleteTestMark = useCallback((markId: number) => {
    setConfirmDeleteId(markId);
  }, []);

  const handleViewTestMark = useCallback((markId: number) => {
    setViewingTestMarkId(markId);
    setShowViewTestMarkDialog(true);
  }, []);

  // Process and filter data - flatten nested response structure: tests -> subjects -> students
  const flattenedMarks = useMemo(() => {
    if (!testMarksData) return [] as (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[];
    
    if (Array.isArray(testMarksData) && testMarksData.length > 0) {
      const flattened: (CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; test_id?: number; subject_id?: number })[] = [];
      
      // Check if data has nested structure: tests -> subjects -> students
      const firstItem = testMarksData[0];
      const hasNestedStructure = 
        firstItem &&
        typeof firstItem === 'object' &&
        'subjects' in firstItem &&
        Array.isArray((firstItem as { subjects?: unknown }).subjects);

      if (hasNestedStructure) {
        // Handle nested structure: tests -> subjects -> students
        testMarksData.forEach((test: unknown) => {
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
      const hasFlatSubjectStructure = testMarksData.some(
        (item) =>
          item &&
          typeof item === 'object' &&
          'students' in item &&
          'test_name' in item &&
          'subject_name' in item
      );

      if (hasFlatSubjectStructure) {
        // Flatten grouped data: iterate through groups and extract students
        testMarksData.forEach((group: unknown) => {
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
        .map((markObj) => {
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

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; max_marks?: number }) => handleViewTestMark(row.mark_id)
    },
    {
      type: 'edit' as const,
      onClick: (row: CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; max_marks?: number }) => handleEditTestMark(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: CollegeTestMarkMinimalRead & { test_name?: string; subject_name?: string; max_marks?: number }) => handleDeleteTestMark(row.mark_id)
    }
  ], [handleViewTestMark, handleEditTestMark, handleDeleteTestMark]);

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
              <Dialog open={showTestMarkDialog} onOpenChange={setShowTestMarkDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
                    <DialogTitle>{editingTestMark ? 'Edit Test Mark' : 'Add New Test Mark'}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                    <Form {...testMarkForm}>
                      <form onSubmit={(e) => { void testMarkForm.handleSubmit(handleTestMarkSubmit)(e); }} className="space-y-4">
                    <FormField
                      control={testMarkForm.control}
                      name="enrollment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!!editingTestMark}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select student" />
                                  </SelectTrigger>
                                  <SelectContent>
                              {students.map((student: { student_id?: number; student_name: string; admission_no: string }) => (
                                  <SelectItem key={student.student_id} value={student.student_id?.toString() || ''}>
                                  {student.student_name} ({student.admission_no})
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
                              type="number" 
                              placeholder="18" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                                
                                // Auto-calculate percentage and grade
                                if (value && !isNaN(Number(value))) {
                                  const marks = Number(value);
                                  const percentage = calculatePercentage(marks);
                                  const grade = calculateGrade(percentage);
                                  
                                  testMarkForm.setValue('percentage', percentage.toString());
                                  testMarkForm.setValue('grade', grade);
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
                                <Input type="number" placeholder="90.0" step="0.1" {...field} />
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
                                <Select onValueChange={field.onChange} value={field.value}>
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
                              <DatePicker
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Select test date"
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
                      <Button type="submit" >
                        {editingTestMark ? 'Update' : 'Add'} Test Mark
                        </Button>
                      </div>
                    </form>
                  </Form>
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
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <CollegeClassDropdown
                value={selectedClass}
                onChange={setSelectedClass}
                placeholder="Select Class"
                className="w-full sm:w-[150px]"
              />
              <CollegeGroupDropdown
                classId={selectedClass || undefined}
                value={selectedGroup}
                onChange={setSelectedGroup}
                placeholder="All Groups"
                className="w-full sm:w-[150px]"
                emptyValue
                emptyValueLabel="All Groups"
              />
              <CollegeSubjectDropdown
                groupId={selectedGroup || 0}
                value={selectedSubject}
                onChange={setSelectedSubject}
                placeholder="All Subjects"
                className="w-full sm:w-[150px]"
                emptyValue
                emptyValueLabel="All Subjects"
              />
              <CollegeTestDropdown
                value={selectedTest}
                onChange={setSelectedTest}
                placeholder="All Tests"
                className="w-full sm:w-[150px]"
                emptyValue
                emptyValueLabel="All Tests"
              />
            </div>

            {/* Data Table */}
            {!selectedClass || !selectedGroup ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {!selectedClass ? 'Select a Class' : 'Select a Group'}
                    </h3>
                    <p className="text-slate-600 mt-1">
                      {!selectedClass 
                        ? 'Please select a class and group from the dropdowns above to view test marks.'
                        : 'Please select a group from the dropdown above to view test marks.'}
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
                    <h3 className="text-lg font-semibold text-slate-900">Error Loading Data</h3>
                    <p className="text-slate-600 mt-1">
                      {testMarksError?.message || 'Failed to load test marks. Please try again.'}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (testMarks.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">No Test Marks Found</h3>
                    <p className="text-slate-600 mt-1">Try changing filters or ensure marks are recorded for this class.</p>
                  </div>
                </div>
              </Card>
            ) : (
              <EnhancedDataTable
                data={testMarks}
                title="Test Marks"
                searchKey="student_name"
                searchPlaceholder="Search students..."
                columns={testMarkColumns}
                onAdd={() => setShowTestMarkDialog(true)}
                addButtonText="Add Test Mark"
                exportable={true}
                showActions={true}
                actionButtonGroups={actionButtonGroups}
                actionColumnHeader="Actions"
                showActionLabels={false}
              />
            ))}

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
                    <div className="p-6 text-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-slate-600">Loading mark...</p>
                    </div>
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
