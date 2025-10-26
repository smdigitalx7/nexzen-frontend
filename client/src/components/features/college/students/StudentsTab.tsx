import { useState, useMemo } from 'react';
import { Users, Plus, Save, X, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedDataTable } from '@/components/shared';
import { 
  createAvatarColumn,
  createTextColumn,
  createBadgeColumn
} from '@/lib/utils/columnFactories';
import { useCollegeStudentsList, useDeleteCollegeStudent, useCreateCollegeStudent, useUpdateCollegeStudent } from '@/lib/hooks/college/use-college-students';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CollegeStudentFullDetails, CollegeStudentRead } from '@/lib/types/college/students';

const studentFormSchema = z.object({
  student_name: z.string().min(1, 'Student name is required').max(255, 'Name too long'),
  aadhar_no: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dob: z.string().optional(),
  father_name: z.string().optional(),
  father_aadhar_no: z.string().optional(),
  father_or_guardian_mobile: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_name: z.string().optional(),
  mother_aadhar_no: z.string().optional(),
  mother_or_guardian_mobile: z.string().optional(),
  mother_occupation: z.string().optional(),
  present_address: z.string().optional(),
  permanent_address: z.string().optional(),
  admission_date: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALUMNI']).optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export const StudentsTab = () => {
  const { currentBranch } = useAuthStore();
  const { data: studentsResp, isLoading, error } = useCollegeStudentsList({ page: 1, pageSize: 50 });
  const students: CollegeStudentRead[] = studentsResp?.data ?? [];
  const deleteStudentMutation = useDeleteCollegeStudent();
  const createStudentMutation = useCreateCollegeStudent();
  const [selectedStudent, setSelectedStudent] = useState<CollegeStudentFullDetails | null>(null);
  const updateStudentMutation = useUpdateCollegeStudent(selectedStudent?.student_id || 0);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      student_name: '',
      aadhar_no: '',
      gender: undefined,
      dob: '',
      father_name: '',
      father_aadhar_no: '',
      father_or_guardian_mobile: '',
      father_occupation: '',
      mother_name: '',
      mother_aadhar_no: '',
      mother_or_guardian_mobile: '',
      mother_occupation: '',
      present_address: '',
      permanent_address: '',
      admission_date: '',
      status: 'ACTIVE',
    },
  });

  const handleAddStudent = () => {
    form.reset();
    setSelectedStudent(null);
    setIsAddDialogOpen(true);
  };

  const handleEditStudent = (student: CollegeStudentRead) => {
    setSelectedStudent(student as unknown as CollegeStudentFullDetails);
    const gender = student.gender;
    const genderValue = gender === 'MALE' || gender === 'FEMALE' || gender === 'OTHER' ? gender : undefined;
    const status = student.status;
    const statusValue = status === 'ACTIVE' || status === 'INACTIVE' || status === 'ALUMNI' ? status : 'ACTIVE';
    form.reset({
      student_name: student.student_name || '',
      aadhar_no: student.aadhar_no || '',
      gender: genderValue,
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      father_name: student.father_name || '',
      father_or_guardian_mobile: student.father_or_guardian_mobile || '',
      mother_name: student.mother_name || '',
      mother_or_guardian_mobile: student.mother_or_guardian_mobile || '',
      present_address: student.present_address || '',
      admission_date: student.admission_date ? new Date(student.admission_date).toISOString().split('T')[0] : '',
      status: statusValue,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await deleteStudentMutation.mutateAsync(studentId);
      // Toast handled by mutation hook
    } catch (error: any) {
      // Error toast is handled by mutation hook
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (selectedStudent) {
        await updateStudentMutation.mutateAsync(data as any);
        setIsEditDialogOpen(false);
      } else {
        await createStudentMutation.mutateAsync(data as any);
        setIsAddDialogOpen(false);
      }
      form.reset();
    } catch (error: any) {
      // Error toast is handled by mutation hook
    }
  };

  const columns = useMemo(() => [
    createTextColumn<CollegeStudentRead>('admission_no', { header: 'Admission No.'}),
    createAvatarColumn<CollegeStudentRead>('student_name', 'gender', { header: 'Student Details' }),
    createTextColumn<CollegeStudentRead>('father_or_guardian_mobile', { header: 'Father/Guardian Mobile', fallback: 'N/A' }),
    createTextColumn<CollegeStudentRead>('mother_or_guardian_mobile', { header: 'Mother/Guardian Mobile', fallback: 'N/A' }),
    createBadgeColumn<CollegeStudentRead>('gender', { header: 'Gender', variant: 'outline', fallback: 'N/A' }),
    createBadgeColumn<CollegeStudentRead>('status', { header: 'Status', variant: 'outline', fallback: 'N/A' })
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (row: CollegeStudentRead) => handleEditStudent(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: CollegeStudentRead) => handleDeleteStudent(row.student_id)
    }
  ], []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Card><CardContent className="py-8 text-center">Loading students...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="py-8 text-center text-red-600">Error loading students</CardContent></Card>
      ) : (
        <EnhancedDataTable
          data={students}
          columns={columns}
          title="Students"
          searchKey="student_name"
          exportable={true}
          selectable={true}
          onAdd={handleAddStudent}
          addButtonText="Add Student"
          showActions={true}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          showActionLabels={true}
        />
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">Edit Student</DialogTitle>
            <DialogDescription>Update information for {selectedStudent?.student_name}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="student_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name *</FormLabel>
                        <FormControl><Input placeholder="Enter student name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="aadhar_no" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number</FormLabel>
                        <FormControl><Input placeholder="12-digit Aadhar number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dob" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />Cancel
                </Button>
                <Button type="submit" disabled={updateStudentMutation.isPending}>
                  {updateStudentMutation.isPending ? 'Updating...' : (<><Save className="h-4 w-4 mr-2" />Update Student</>)}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">Add New Student</DialogTitle>
            <DialogDescription>Create a new student record</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="student_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name *</FormLabel>
                        <FormControl><Input placeholder="Enter student name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="aadhar_no" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number</FormLabel>
                        <FormControl><Input placeholder="12-digit Aadhar number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />Cancel
                </Button>
                <Button type="submit" disabled={createStudentMutation.isPending}>
                  {createStudentMutation.isPending ? 'Creating...' : (<><Save className="h-4 w-4 mr-2" />Create Student</>)}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsTab;


