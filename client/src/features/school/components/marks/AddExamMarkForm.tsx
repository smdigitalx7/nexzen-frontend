import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/common/components/ui/input';
import { Button } from '@/common/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/common/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import { FormDialog } from '@/common/components/shared/FormDialog';
import { SchoolExamDropdown, SchoolSubjectDropdown } from '@/common/components/shared/Dropdowns';
import { useSchoolEnrollmentsList } from '@/features/school/hooks/use-school-enrollments';
import { useSchoolSubjects } from '@/features/school/hooks/use-school-dropdowns';
import { useCreateSchoolExamMarksMultipleSubjects } from '@/features/school/hooks/use-school-exam-marks';
import { useGrades } from '@/features/general/hooks/useGrades';
import { Plus, Trash2 } from 'lucide-react';
import type { ExamMarkWithDetails } from '@/features/school/types/exam-marks';
import type { 
  SchoolEnrollmentWithClassSectionDetails, 
  SchoolEnrollmentRead,
} from '@/features/school/types/enrollments';
import type { SchoolSubjectList } from '@/features/school/types/subjects';
import type { GradeRead } from '@/features/general/types/grades';

// Utility function to calculate grade from percentage using grades from API
const calculateGradeFromPercentage = (percentage: number, grades: GradeRead[]): string => {
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

interface AddExamMarkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { enrollment_id: number; exam_id: number; subject_id: number; marks_obtained: number; remarks: string }) => void;
  editingExamMark?: ExamMarkWithDetails | null;
  selectedClass?: number | null;
  selectedSection?: number | null;
}

const AddExamMarkForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingExamMark = null,
  selectedClass = null,
  selectedSection = null
}: AddExamMarkFormProps) => {
  const [activeTab, setActiveTab] = useState('single');
  
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
  
  // Extract students from enrollments - flatten the grouped response and add class_name
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
  
  // Get classId for subject dropdown
  const classId = selectedClass || 0;
  const { data: subjectsData } = useSchoolSubjects(classId);
  const subjects = subjectsData?.items || [];
  
  // Get grades from API endpoint
  const { grades } = useGrades();
  
  const createMultipleSubjectsMutation = useCreateSchoolExamMarksMultipleSubjects();

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

  // Reset form when dialog opens/closes or editing changes
  useEffect(() => {
    if (isOpen) {
      if (editingExamMark) {
        setActiveTab('single');
        examMarkForm.reset({
          enrollment_id: editingExamMark.enrollment_id.toString(),
          exam_id: editingExamMark.exam_id?.toString() || '',
          subject_id: editingExamMark.subject_id?.toString() || '',
          marks_obtained: editingExamMark.marks_obtained?.toString() || '0',
          remarks: editingExamMark.remarks || '',
        });
      } else {
        setActiveTab('single');
        examMarkForm.reset({
          enrollment_id: '',
          exam_id: '',
          subject_id: '',
          marks_obtained: '',
          remarks: '',
        });
        multipleSubjectsForm.reset({
          enrollment_id: '',
          exam_id: '',
          subjects: [{ subject_id: '', marks_obtained: '', remarks: '' }],
        });
      }
    }
  }, [isOpen, editingExamMark, examMarkForm, multipleSubjectsForm]);

  // Single subject form submission handler
  const handleSubmit = (values: z.infer<typeof examMarkFormSchema>) => {
    const markData = {
      enrollment_id: parseInt(values.enrollment_id),
      exam_id: parseInt(values.exam_id),
      subject_id: parseInt(values.subject_id),
      marks_obtained: parseFloat(values.marks_obtained),
      remarks: values.remarks || '',
    };

    onSubmit(markData);
    examMarkForm.reset();
    onClose();
  };

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
        subject_name: subjects.find((s: SchoolSubjectList) => s.subject_id === parseInt(subj.subject_id))?.subject_name || null,
      })),
      student_name: selectedEnrollment?.student_name || null,
      exam_name: null, // Can be fetched if needed
    };

    try {
      await createMultipleSubjectsMutation.mutateAsync(payload);
      multipleSubjectsForm.reset();
      onClose();
    } catch (error) {
      // Error is handled by mutation hook
    }
  }, [enrollments, subjects, createMultipleSubjectsMutation, multipleSubjectsForm, onClose]);

  // Handle cancel
  const handleCancel = () => {
    examMarkForm.reset();
    multipleSubjectsForm.reset();
    onClose();
  };

  const addSubjectRow = () => {
    append({ subject_id: '', marks_obtained: '', remarks: '' });
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

  const getSaveHandler = () => {
    if (editingExamMark) {
      return examMarkForm.handleSubmit(handleSubmit);
    }
    return activeTab === 'single' 
      ? examMarkForm.handleSubmit(handleSubmit)
      : multipleSubjectsForm.handleSubmit(handleMultipleSubjectsSubmit);
  };

  const getSaveText = () => {
    if (editingExamMark) return 'Update Exam Mark';
    return activeTab === 'single' ? 'Add Exam Mark' : 'Add Exam Marks';
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={onClose}
      title={editingExamMark ? 'Edit Exam Mark' : 'Add New Exam Mark'}
      onSave={getSaveHandler()}
      onCancel={handleCancel}
      saveText={getSaveText()}
      cancelText="Cancel"
      size="LARGE"
      errors={hasErrors ? formErrors : undefined}
      showErrors={hasErrors}
      disabled={createMultipleSubjectsMutation.isPending}
    >
      {!editingExamMark ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Subject</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Subjects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4">
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
                        {enrollments.map((enrollment) => {
                          const displayParts = [
                            enrollment.student_name,
                            enrollment.class_name || '',
                            enrollment.section_name || '',
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
                        <SchoolExamDropdown
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
                        <SchoolSubjectDropdown
                          classId={classId}
                          value={numValue}
                          onChange={(value) => {
                            // Convert number back to string for form
                            if (value !== null && value !== undefined) {
                              field.onChange(value.toString());
                            } else {
                              field.onChange('');
                            }
                          }}
                          disabled={!!editingExamMark || classId <= 0}
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
            
        </form>
      </Form>
          </TabsContent>

          <TabsContent value="multiple" className="mt-4">
            <Form {...multipleSubjectsForm}>
              <form className="space-y-4">
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
                          <SchoolExamDropdown
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
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
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

                        <div className="grid grid-cols-2 gap-4">
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
                                  <Input placeholder="Additional comments..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                    </div>
                  ))}
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      ) : (
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
                        {enrollments.map((enrollment) => {
                          const displayParts = [
                            enrollment.student_name,
                            enrollment.class_name || '',
                            enrollment.section_name || '',
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
                        <SchoolExamDropdown
                          value={numValue}
                          onChange={(value) => {
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
                          disabled={!!editingExamMark || classId <= 0}
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
          </form>
        </Form>
      )}
    </FormDialog>
  );
};

export default AddExamMarkForm;
