import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as AlertHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import { 
  useSchoolExamMarksList, 
  useSchoolExamMark,
  useCreateSchoolExamMark, 
  useUpdateSchoolExamMark, 
  useDeleteSchoolExamMark
} from '@/lib/hooks/school/use-school-exam-marks';
import { useSchoolClasses, useSchoolSections, useSchoolSubjects } from '@/lib/hooks/school/use-school-dropdowns';
import { useSchoolStudentsList } from '@/lib/hooks/school/use-school-students';
import { useSchoolExams } from '@/lib/hooks/school/use-school-exams-tests';
import type { ExamMarkWithDetails } from '@/lib/types/school/exam-marks';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

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
  onDataChange?: (data: any[]) => void;
}

const ExamMarksManagement = ({ onDataChange }: ExamMarksManagementProps) => {
  // State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  
  // Dialog states
  const [showExamMarkDialog, setShowExamMarkDialog] = useState(false);
  const [editingExamMark, setEditingExamMark] = useState<ExamMarkWithDetails | null>(null);
  const [showViewExamMarkDialog, setShowViewExamMarkDialog] = useState(false);
  const [viewingExamMarkId, setViewingExamMarkId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // API hooks
  const { data: classesData, isLoading: classesLoading, error: classesError } = useSchoolClasses();
  const { data: sectionsData, isLoading: sectionsLoading, error: sectionsError } = useSchoolSections(selectedClass ? parseInt(selectedClass) : 0);
  const { data: subjectsData, isLoading: subjectsLoading, error: subjectsError } = useSchoolSubjects(selectedClass ? parseInt(selectedClass) : 0);
  const { data: studentsData } = useSchoolStudentsList();
  const students = studentsData?.data || [];
  const { data: examsData } = useSchoolExams();

  // Extract items from response data
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  const subjects = subjectsData?.items || [];
  const exams = examsData || [];


  // Auto-select first class when available
  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].class_id.toString());
    }
  }, [selectedClass, classes]);

  // Reset section and subject when class changes
  useEffect(() => {
    setSelectedSection('all');
    setSelectedSubject('all');
  }, [selectedClass]);

  // Single exam mark view data (enabled only when an id is set)
  const viewQuery = useSchoolExamMark(viewingExamMarkId || 0);
  const viewedExamMark = viewingExamMarkId ? viewQuery.data : null;
  const viewExamLoading = viewingExamMarkId ? viewQuery.isLoading : false;
  const viewExamError = viewingExamMarkId ? viewQuery.error : null;

  // Exam marks hooks - only fetch when class is selected
  const examMarksQuery = useMemo(() => {
    if (!selectedClass || isNaN(parseInt(selectedClass))) {
      return undefined;
    }
    
    // Only fetch by class, let EnhancedDataTable handle other filters
    const query: any = {
      class_id: parseInt(selectedClass),
    };
    
    return query;
  }, [selectedClass]);

  const { data: examMarksData, isLoading: examMarksLoading, error: examMarksError } = useSchoolExamMarksList(examMarksQuery);
  
  const createExamMarkMutation = useCreateSchoolExamMark();
  const updateExamMarkMutation = useUpdateSchoolExamMark(editingExamMark?.mark_id || 0);
  const deleteExamMarkMutation = useDeleteSchoolExamMark();

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
  const handleExamMarkSubmit = (values: any) => {
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
  };

  const handleEditExamMark = (mark: ExamMarkWithDetails) => {
    setEditingExamMark(mark);
    examMarkForm.reset({
      enrollment_id: mark.enrollment_id.toString(),
      exam_id: mark.exam_id?.toString() || '',
      subject_id: mark.subject_id?.toString() || '',
      marks_obtained: mark.marks_obtained?.toString() || '0',
      percentage: mark.percentage?.toString() || '0',
      grade: mark.grade || '',
      conducted_at: mark.conducted_at || '',
      remarks: mark.remarks || '',
    });
    setShowExamMarkDialog(true);
  };

  const handleDeleteExamMark = (markId: number) => {
    setConfirmDeleteId(markId);
  };

  const handleViewExamMark = (markId: number) => {
    setViewingExamMarkId(markId);
    setShowViewExamMarkDialog(true);
  };

  // Process data - flatten grouped response, then apply shared search filter
  const flattenedMarks = useMemo(() => {
    if (!examMarksData || !Array.isArray(examMarksData)) return [] as ExamMarkWithDetails[];
    const items: ExamMarkWithDetails[] = [];
    examMarksData.forEach(group => {
      if (group && group.students && Array.isArray(group.students)) {
        group.students.forEach(student => {
          items.push({
            ...student,
            exam_name: group.exam_name,
            subject_name: group.subject_name,
            exam_date: group.conducted_at,
            exam_id: group.exam_id,
            subject_id: group.subject_id,
          });
        });
      }
    });
    return items;
  }, [examMarksData]);

  // Apply client-side filtering for section, subject, and grade
  const filteredMarks = useMemo(() => {
    let filtered = flattenedMarks;
    
    // Apply section filter (client-side)
    if (selectedSection !== 'all') {
      filtered = filtered.filter(mark => mark.section_name === selectedSection);
    }
    
    // Apply subject filter (client-side)
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(mark => mark.subject_name === selectedSubject);
    }
    
    // Apply grade filter (client-side)
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(mark => mark.grade === selectedGrade);
    }
    
    return filtered;
  }, [flattenedMarks, selectedSection, selectedSubject, selectedGrade]);

  // Use filtered marks for the table
  const examMarks = filteredMarks;

  // Notify parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(examMarks);
    }
  }, [examMarks, onDataChange]);


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

  // Table columns for exam marks using column factories
  const examMarkColumns: ColumnDef<ExamMarkWithDetails>[] = useMemo(() => [
    createStudentColumn<ExamMarkWithDetails>("student_name", "roll_number", "section_name", { header: "Student" }),
    createSubjectColumn<ExamMarkWithDetails>("subject_name", "exam_name", { header: "Subject" }),
    createMarksColumn<ExamMarkWithDetails>("marks_obtained", "max_marks", "percentage", { header: "Marks" }),
    createGradeColumn<ExamMarkWithDetails>("grade", gradeColors, { header: "Grade" }),
    createTestDateColumn<ExamMarkWithDetails>("conducted_at", { header: "Exam Date" }),
    createActionColumn<ExamMarkWithDetails>([
      createViewAction((row) => handleViewExamMark(row.mark_id)),
      createEditAction((row) => handleEditExamMark(row)),
      createDeleteAction((row) => handleDeleteExamMark(row.mark_id))
    ])
  ], [handleViewExamMark, handleEditExamMark, handleDeleteExamMark]);



  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex gap-3">
              <Dialog open={showExamMarkDialog} onOpenChange={setShowExamMarkDialog}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingExamMark ? 'Edit Exam Mark' : 'Add New Exam Mark'}</DialogTitle>
                  </DialogHeader>
                  <Form {...examMarkForm}>
                    <form onSubmit={examMarkForm.handleSubmit(handleExamMarkSubmit)} className="space-y-4">
                      <FormField
                        control={examMarkForm.control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingExamMark}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {students.map((student: any) => (
                                  <SelectItem key={student.student_id} value={student.student_id?.toString() || ''}>
                                    {student.student_name} ({student.admission_no})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingExamMark}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select exam" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {exams.map((exam) => (
                                    <SelectItem key={exam.exam_id} value={exam.exam_id?.toString() || ''}>
                                      {exam.exam_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingExamMark}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject.subject_id} value={subject.subject_id?.toString() || ''}>
                                      {subject.subject_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select grade" />
                                  </SelectTrigger>
                                </FormControl>
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
                              <Input type="date" {...field} />
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
              <div className="space-y-4">
                {/* Unified Filter Controls */}
                <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Class:</label>
                      <Select value={selectedClass || 'all'} onValueChange={(value) => setSelectedClass(value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {classes.map((cls) => (
                            <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                              {cls.class_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Section:</label>
                      <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="All Sections" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sections</SelectItem>
                          {sections.map((section) => (
                            <SelectItem key={section.section_id} value={section.section_name}>
                              {section.section_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Subject:</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="All Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.subject_id} value={subject.subject_name}>
                              {subject.subject_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Grade:</label>
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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
                  </div>

                <EnhancedDataTable
                  data={examMarks}
                  title="Exam Marks"
                  description="Manage exam marks for students"
                  searchKey={['student_name', 'roll_number', 'class_name', 'section_name', 'exam_name', 'subject_name'] as any}
                  searchPlaceholder="Search students..."
                  columns={examMarkColumns}
                  onAdd={() => setShowExamMarkDialog(true)}
                  addButtonText="Add Exam Mark"
                  exportable={true}
                />
              </div>
            ))}

            {/* View Exam Mark Dialog */}
            <Dialog open={showViewExamMarkDialog} onOpenChange={setShowViewExamMarkDialog}>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Exam Mark Details</DialogTitle>
                </DialogHeader>
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
