import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as AlertHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import { 
  useCollegeExamMarksList, 
  useCollegeExamMark,
  useCreateCollegeExamMark, 
  useUpdateCollegeExamMark, 
  useDeleteCollegeExamMark,
  useCollegeClasses,
  useCollegeStudentsList,
  useCollegeSubjects,
  useCollegeGroups,
  useCollegeCourses,
} from '@/lib/hooks/college';
import { useCollegeExams } from '@/lib/hooks/college/use-college-dropdowns';
import type { CollegeExamMarkMinimalRead, CollegeExamMarksListParams } from '@/lib/types/college/exam-marks';
import type { CollegeMarksData } from '@/lib/hooks/college/use-college-marks-statistics';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
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

const examMarkFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  exam_id: z.string().min(1, "Exam is required"),
  subject_id: z.string().min(1, "Subject is required"),
  marks_obtained: z.string().min(1, "Marks obtained is required"),
  percentage: z.string().min(1, "Percentage is required"),
  grade: z.string().min(1, "Grade is required"),
  conducted_at: z.string().min(1, "Exam date is required"),
  remarks: z.string().optional(),
});

interface ExamMarksManagementProps {
  onDataChange?: (data: CollegeMarksData[]) => void;
}

const ExamMarksManagement: React.FC<ExamMarksManagementProps> = ({ onDataChange }) => {
  // State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');
  
  // Dialog states
  const [showExamMarkDialog, setShowExamMarkDialog] = useState(false);
  const [editingExamMark, setEditingExamMark] = useState<ExamMarkRow | null>(null);
  const [showViewExamMarkDialog, setShowViewExamMarkDialog] = useState(false);
  const [viewingExamMarkId, setViewingExamMarkId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // API hooks
  const { data: classes = [] } = useCollegeClasses();

  // Auto-select first class when available
  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].class_id.toString());
    }
  }, [selectedClass, classes]);
  const { data: studentsData } = useCollegeStudentsList();
  const students = studentsData?.data || [];
  const { data: subjects = [] } = useCollegeSubjects();
  const { data: examsData } = useCollegeExams();
  const exams = examsData?.items || [];
  const { data: groups = [] } = useCollegeGroups();
  const { data: courses = [] } = useCollegeCourses();

  // Single exam mark view data (enabled only when an id is set)
  const viewQuery = useCollegeExamMark(viewingExamMarkId || 0);
  const viewedExamMark = viewingExamMarkId ? viewQuery.data : null;
  const viewExamLoading = viewingExamMarkId ? viewQuery.isLoading : false;
  const viewExamError = viewingExamMarkId ? viewQuery.error : null;

  // Exam marks hooks - only fetch when class is selected and groups are loaded
  const examMarksQuery = useMemo((): CollegeExamMarksListParams | undefined => {
    if (!selectedClass || isNaN(parseInt(selectedClass)) || groups.length === 0) {
      return undefined;
    }
    
    // Determine group_id to use
    let groupId: number;
    if (selectedGroup !== 'all' && !isNaN(parseInt(selectedGroup))) {
      groupId = parseInt(selectedGroup);
    } else if (groups[0]?.group_id) {
      // Use the first group as default when 'all' is selected
      groupId = groups[0].group_id;
    } else {
      // No valid group_id available
      return undefined;
    }
    
    const query: CollegeExamMarksListParams = {
      class_id: parseInt(selectedClass),
      group_id: groupId,
    };
    
    if (selectedSubject !== 'all' && !isNaN(parseInt(selectedSubject))) {
      query.subject_id = parseInt(selectedSubject);
    }
    if (selectedExam !== 'all' && !isNaN(parseInt(selectedExam))) {
      query.exam_id = parseInt(selectedExam);
    }
    
    return query;
  }, [selectedClass, selectedSubject, selectedGroup, selectedExam, groups]);

  const { data: examMarksData, isLoading: examMarksLoading, error: examMarksError } = useCollegeExamMarksList(examMarksQuery);
  const createExamMarkMutation = useCreateCollegeExamMark();
  const updateExamMarkMutation = useUpdateCollegeExamMark(editingExamMark?.mark_id || 0);
  const deleteExamMarkMutation = useDeleteCollegeExamMark();

  // Form
  const examMarkForm = useForm({
    resolver: zodResolver(examMarkFormSchema),
    defaultValues: {
      enrollment_id: '',
      exam_id: '',
      subject_id: '',
      marks_obtained: '',
      percentage: '',
      grade: '',
      conducted_at: '',
      remarks: '',
    },
  });

  // Form handling functions
  const handleExamMarkSubmit = useCallback((values: z.infer<typeof examMarkFormSchema>) => {
    const markData = {
      enrollment_id: parseInt(values.enrollment_id),
      exam_id: parseInt(values.exam_id),
      subject_id: parseInt(values.subject_id),
      marks_obtained: parseFloat(values.marks_obtained),
      percentage: parseFloat(values.percentage),
      grade: values.grade,
      conducted_at: values.conducted_at,
      remarks: values.remarks || '',
    };

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

    examMarkForm.reset();
    setEditingExamMark(null);
    setShowExamMarkDialog(false);
  }, [editingExamMark, updateExamMarkMutation, createExamMarkMutation, examMarkForm]);

  const handleEditExamMark = useCallback((mark: ExamMarkRow) => {
    setEditingExamMark(mark);
    examMarkForm.reset({
      enrollment_id: mark.enrollment_id.toString(),
      exam_id: mark.exam_id ? String(mark.exam_id) : '',
      subject_id: mark.subject_id ? String(mark.subject_id) : '',
      marks_obtained: (mark.marks_obtained ?? 0).toString(),
      percentage: (mark.percentage ?? 0).toString(),
      grade: mark.grade || '',
      conducted_at: mark.conducted_at || '',
      remarks: mark.remarks || '',
    });
    setShowExamMarkDialog(true);
  }, [examMarkForm]);

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
                  student_name: string;
                  roll_number: string;
                  marks_obtained: number | null;
                  percentage: number | null;
                  grade: string | null;
                  remarks: string | null;
                  conducted_at: string | null;
                  section_name?: string;
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
                      student_name: student.student_name,
                      roll_number: student.roll_number,
                      section_name: student.section_name || '',
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
            student_name: String(obj.student_name || ''),
            roll_number: String(obj.roll_number || ''),
            section_name: String(obj.section_name || ''),
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
      createStudentColumn<ExamMarkRow>("student_name", "roll_number", "section_name", { header: "Student" }),
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
              <Dialog open={showExamMarkDialog} onOpenChange={setShowExamMarkDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
                    <DialogTitle>{editingExamMark ? 'Edit Exam Mark' : 'Add New Exam Mark'}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
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
                                  {students.map((student: { student_id?: number; student_name?: string; admission_no?: string }) => (
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
                          control={examMarkForm.control}
                          name="exam_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exam</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!!editingExamMark}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select exam" />
                                  </SelectTrigger>
                                  <SelectContent>
                                  {exams.map((exam: { exam_id?: number; id?: number; exam_name?: string }) => (
                                    <SelectItem key={exam.exam_id || exam.id} value={(exam.exam_id || exam.id)?.toString() || ''}>
                                      {exam.exam_name}
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
                          control={examMarkForm.control}
                          name="subject_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!!editingExamMark}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                                  {subjects.map((subject: { subject_id?: number; subject_name?: string }) => (
                                    <SelectItem key={subject.subject_id} value={subject.subject_id?.toString() || ''}>
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
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);
                                  
                                  // Auto-calculate percentage and grade
                                  if (value && !isNaN(Number(value))) {
                                    const marks = Number(value);
                                    const percentage = calculatePercentage(marks);
                                    const grade = calculateGrade(percentage);
                                    
                                    examMarkForm.setValue('percentage', percentage.toString());
                                    examMarkForm.setValue('grade', grade);
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
                          control={examMarkForm.control}
                          name="percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Percentage</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="85.5" step="0.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={examMarkForm.control}
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
                        control={examMarkForm.control}
                        name="conducted_at"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Select exam date"
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
                        <Button type="submit" >
                          {editingExamMark ? 'Update' : 'Add'} Exam Mark
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
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[150px]" >
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: { class_id?: number; class_name?: string }) => (
                    <SelectItem key={cls.class_id} value={cls.class_id?.toString() || ''}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full sm:w-[150px]" >
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((g: { group_id?: number; group_name?: string }) => (
                    <SelectItem key={g.group_id} value={g.group_id?.toString() || ''}>
                      {g.group_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[150px]" >
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((c: { course_id?: number; course_name?: string }) => (
                    <SelectItem key={c.course_id} value={c.course_id?.toString() || ''}>
                      {c.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-[150px]" >
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject: { subject_id?: number; subject_name?: string }) => (
                    <SelectItem key={subject.subject_id} value={subject.subject_id?.toString() || ''}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="w-full sm:w-[150px]" >
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {exams.map((exam: { exam_id?: number; exam_name?: string }) => (
                    <SelectItem key={exam.exam_id} value={exam.exam_id?.toString() || ''}>
                      {exam.exam_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Table */}
            {!selectedClass ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Select a Class</h3>
                    <p className="text-slate-600 mt-1">
                      Please select a class from the dropdown above to view exam marks.
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
                        <div className="text-xs text-slate-500">Class / Section</div>
                        <div className="font-medium text-slate-900">{viewedExamMark.class_name} • {viewedExamMark.section_name}</div>
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
