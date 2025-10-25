import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/shared/FormDialog';
import { useSchoolClasses, useSchoolSections, useSchoolSubjects, useSchoolExams } from '@/lib/hooks/school/use-school-dropdowns';
import { useSchoolStudentsList } from '@/lib/hooks/school/use-school-students';
import type { ExamMarkWithDetails } from '@/lib/types/school/exam-marks';

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

interface AddExamMarkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingExamMark?: ExamMarkWithDetails | null;
  selectedClass?: string;
}

const AddExamMarkForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingExamMark = null,
  selectedClass = ''
}: AddExamMarkFormProps) => {
  // API hooks
  const { data: classesData } = useSchoolClasses();
  const { data: sectionsData } = useSchoolSections(selectedClass ? parseInt(selectedClass) : 0);
  const { data: subjectsData } = useSchoolSubjects(selectedClass ? parseInt(selectedClass) : 0);
  const { data: studentsData } = useSchoolStudentsList();
  const { data: examsData, isLoading: examsLoading, error: examsError } = useSchoolExams();

  // Extract items from response data
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  const subjects = subjectsData?.items || [];
  const students = studentsData?.data || [];
  const exams = examsData?.items || [];

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

  // Reset form when dialog opens/closes or editing changes
  useEffect(() => {
    if (isOpen) {
      if (editingExamMark) {
        examMarkForm.reset({
          enrollment_id: editingExamMark.enrollment_id.toString(),
          exam_id: editingExamMark.exam_id?.toString() || '',
          subject_id: editingExamMark.subject_id?.toString() || '',
          marks_obtained: editingExamMark.marks_obtained?.toString() || '0',
          percentage: editingExamMark.percentage?.toString() || '0',
          grade: editingExamMark.grade || '',
          conducted_at: editingExamMark.conducted_at || '',
          remarks: editingExamMark.remarks || '',
        });
      } else {
        examMarkForm.reset({
          enrollment_id: '',
          exam_id: '',
          subject_id: '',
          marks_obtained: '',
          percentage: '',
          grade: '',
          conducted_at: '',
          remarks: '',
        });
      }
    }
  }, [isOpen, editingExamMark, examMarkForm]);

  // Form submission handler
  const handleSubmit = (values: any) => {
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

    onSubmit(markData);
    examMarkForm.reset();
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    examMarkForm.reset();
    onClose();
  };

  // Get form errors for FormDialog - convert FieldErrors to Record<string, string>
  const formErrors = Object.keys(examMarkForm.formState.errors).length > 0 
    ? Object.fromEntries(
        Object.entries(examMarkForm.formState.errors).map(([key, error]) => [
          key, 
          error?.message || 'Invalid value'
        ])
      )
    : {};
  const hasErrors = Object.keys(formErrors).length > 0;

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={onClose}
      title={editingExamMark ? 'Edit Exam Mark' : 'Add New Exam Mark'}
      onSave={examMarkForm.handleSubmit(handleSubmit)}
      onCancel={handleCancel}
      saveText={editingExamMark ? 'Update Exam Mark' : 'Add Exam Mark'}
      cancelText="Cancel"
      size="LARGE"
      errors={hasErrors ? formErrors : undefined}
      showErrors={hasErrors}
    >
      <Form {...examMarkForm}>
        <form className="space-y-4">
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
                        {students.map((student: any) => (
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
                          {examsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading exams...
                            </SelectItem>
                          ) : examsError ? (
                            <SelectItem value="error" disabled>
                              Error loading exams
                            </SelectItem>
                          ) : exams.length === 0 ? (
                            <SelectItem value="no-exams" disabled>
                              No exams available
                            </SelectItem>
                          ) : (
                            exams.map((exam: any) => (
                              <SelectItem key={exam.exam_id} value={exam.exam_id?.toString() || ''}>
                                {exam.exam_name}
                              </SelectItem>
                            ))
                          )}
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
                          {subjects.map((subject) => (
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
            
        </form>
      </Form>
    </FormDialog>
  );
};

export default AddExamMarkForm;
