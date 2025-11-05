import { useState, useMemo, memo, useCallback } from 'react';
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
} from '@/lib/utils/factory/columnFactories';
import { useSchoolStudentsList, useCreateSchoolStudent, useUpdateSchoolStudent, useSchoolStudent } from '@/lib/hooks/school';
import type { SchoolStudentRead, SchoolStudentFullDetails } from '@/lib/types/school';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@/components/ui/badge';

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
  status: z.enum(['ACTIVE', 'INACTIVE', 'DROPPED_OUT', 'ABSCONDED']).optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

// Initial form values - moved outside component for better performance
const initialFormValues: StudentFormData = {
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
};

// Memoized form section components
const PersonalInfoSection = memo(({ form }: { form: any }) => (
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
));

PersonalInfoSection.displayName = "PersonalInfoSection";

const ParentInfoSection = memo(({ form }: { form: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">Parent Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={form.control} name="father_name" render={({ field }) => (
          <FormItem>
            <FormLabel>Father Name</FormLabel>
            <FormControl><Input placeholder="Enter father's name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="father_aadhar_no" render={({ field }) => (
          <FormItem>
            <FormLabel>Father Aadhar Number</FormLabel>
            <FormControl><Input placeholder="12-digit Aadhar number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="father_or_guardian_mobile" render={({ field }) => (
          <FormItem>
            <FormLabel>Father/Guardian Mobile</FormLabel>
            <FormControl><Input placeholder="Enter mobile number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="father_occupation" render={({ field }) => (
          <FormItem>
            <FormLabel>Father Occupation</FormLabel>
            <FormControl><Input placeholder="Enter occupation" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="mother_name" render={({ field }) => (
          <FormItem>
            <FormLabel>Mother Name</FormLabel>
            <FormControl><Input placeholder="Enter mother's name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="mother_aadhar_no" render={({ field }) => (
          <FormItem>
            <FormLabel>Mother Aadhar Number</FormLabel>
            <FormControl><Input placeholder="12-digit Aadhar number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="mother_or_guardian_mobile" render={({ field }) => (
          <FormItem>
            <FormLabel>Mother/Guardian Mobile</FormLabel>
            <FormControl><Input placeholder="Enter mobile number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="mother_occupation" render={({ field }) => (
          <FormItem>
            <FormLabel>Mother Occupation</FormLabel>
            <FormControl><Input placeholder="Enter occupation" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </CardContent>
  </Card>
));

ParentInfoSection.displayName = "ParentInfoSection";

const AddressInfoSection = memo(({ form }: { form: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">Address Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <FormField control={form.control} name="present_address" render={({ field }) => (
          <FormItem>
            <FormLabel>Present Address</FormLabel>
            <FormControl><Input placeholder="Enter present address" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="permanent_address" render={({ field }) => (
          <FormItem>
            <FormLabel>Permanent Address</FormLabel>
            <FormControl><Input placeholder="Enter permanent address" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </CardContent>
  </Card>
));

AddressInfoSection.displayName = "AddressInfoSection";

const AdmissionInfoSection = memo(({ form }: { form: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">Admission Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={form.control} name="admission_date" render={({ field }) => (
          <FormItem>
            <FormLabel>Admission Date</FormLabel>
            <FormControl><Input type="date" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DROPPED_OUT">Dropped Out</SelectItem>
                <SelectItem value="ABSCONDED">Absconded</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </CardContent>
  </Card>
));

AdmissionInfoSection.displayName = "AdmissionInfoSection";

const StudentsTabComponent = () => {
  // State management
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [viewStudentId, setViewStudentId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Hooks
  const { currentBranch } = useAuthStore();
  const { data: studentsResp, isLoading, error } = useSchoolStudentsList({ page: 1, page_size: 50 });
  const { data: viewStudentData, isLoading: isViewLoading } = useSchoolStudent(viewStudentId);
  const createStudentMutation = useCreateSchoolStudent();
  const updateStudentMutation = useUpdateSchoolStudent(selectedStudent?.student_id || 0);

  // Memoized students data
  const students = useMemo(() => studentsResp?.data ?? [], [studentsResp?.data]);

  // Form setup
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialFormValues,
  });

  // Memoized handlers
  const handleAddStudent = useCallback(() => {
    form.reset();
    setSelectedStudent(null);
    setIsAddDialogOpen(true);
  }, [form]);

  const handleEditStudent = useCallback((student: SchoolStudentFullDetails) => {
    setSelectedStudent(student);
    const gender = student.gender;
    const genderValue = gender === 'MALE' || gender === 'FEMALE' || gender === 'OTHER' ? gender : undefined;
    const status = student.status;
    const statusValue = status === 'ACTIVE' || status === 'INACTIVE' || status === 'DROPPED_OUT' || status === 'ABSCONDED' ? status : 'ACTIVE';
    form.reset({
      student_name: student.student_name || '',
      aadhar_no: student.aadhar_no || '',
      gender: genderValue,
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      father_name: student.father_name || '',
      father_aadhar_no: student.father_aadhar_no || '',
      father_or_guardian_mobile: student.father_or_guardian_mobile || '',
      father_occupation: student.father_occupation || '',
      mother_name: student.mother_name || '',
      mother_aadhar_no: student.mother_aadhar_no || '',
      mother_or_guardian_mobile: student.mother_or_guardian_mobile || '',
      mother_occupation: student.mother_occupation || '',
      present_address: student.present_address || '',
      permanent_address: student.permanent_address || '',
      admission_date: student.admission_date ? new Date(student.admission_date).toISOString().split('T')[0] : '',
      status: statusValue,
    });
    setIsEditDialogOpen(true);
  }, [form]);

  const onSubmit = useCallback(async (data: StudentFormData) => {
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
  }, [selectedStudent, updateStudentMutation, createStudentMutation, form]);

  // Memoized dialog close handlers
  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    form.reset();
  }, [form]);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedStudent(null);
  }, []);

  // Memoized columns definition
  const columns = useMemo(() => [
    createTextColumn<SchoolStudentRead>('admission_no', { header: 'Admission No.' }),
    createAvatarColumn<SchoolStudentRead>('student_name', 'gender', { header: 'Student Details' }),
    createTextColumn<SchoolStudentRead>('father_or_guardian_mobile', { header: 'Father/Guardian Mobile', fallback: 'N/A' }),
    createTextColumn<SchoolStudentRead>('present_address', { header: 'Present Address', fallback: 'N/A' }),
    createBadgeColumn<SchoolStudentRead>('status', { header: 'Status', variant: 'outline', fallback: 'N/A' })
  ], []);

  // View handler
  const handleViewStudent = useCallback((student: SchoolStudentRead) => {
    setViewStudentId(student.student_id);
    setIsViewDialogOpen(true);
  }, []);

  // Memoized action button groups
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: SchoolStudentRead) => handleViewStudent(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: SchoolStudentRead) => handleEditStudent(row)
    }
  ], [handleViewStudent, handleEditStudent]);

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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2">Edit Student</DialogTitle>
            <DialogDescription>Update information for {selectedStudent?.student_name}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <PersonalInfoSection form={form} />
                <ParentInfoSection form={form} />
                <AddressInfoSection form={form} />
                <AdmissionInfoSection form={form} />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeEditDialog}>
                    <X className="h-4 w-4 mr-2" />Cancel
                  </Button>
                  <Button type="submit" disabled={updateStudentMutation.isPending}>
                    {updateStudentMutation.isPending ? 'Updating...' : (<><Save className="h-4 w-4 mr-2" />Update Student</>)}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2">Add New Student</DialogTitle>
            <DialogDescription>Create a new student record</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <PersonalInfoSection form={form} />
                <ParentInfoSection form={form} />
                <AddressInfoSection form={form} />
                <AdmissionInfoSection form={form} />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeAddDialog}>
                    <X className="h-4 w-4 mr-2" />Cancel
                  </Button>
                  <Button type="submit" disabled={createStudentMutation.isPending}>
                    {createStudentMutation.isPending ? 'Creating...' : (<><Save className="h-4 w-4 mr-2" />Create Student</>)}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2">Student Details</DialogTitle>
            <DialogDescription>View complete student information</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
            {isViewLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-600">Loading student details...</p>
                </div>
              </div>
            ) : viewStudentData ? (
              <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Student Name:</span>
                      <p className="text-slate-900">{viewStudentData.student_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Admission No:</span>
                      <p className="text-slate-900">{viewStudentData.admission_no || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Aadhar Number:</span>
                      <p className="text-slate-900">{viewStudentData.aadhar_no || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Gender:</span>
                      <p className="text-slate-900">{viewStudentData.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Date of Birth:</span>
                      <p className="text-slate-900">{viewStudentData.dob ? new Date(viewStudentData.dob).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Status:</span>
                      <Badge variant="outline">{viewStudentData.status || 'N/A'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Parent Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Father Name:</span>
                      <p className="text-slate-900">{viewStudentData.father_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Father Aadhar:</span>
                      <p className="text-slate-900">{viewStudentData.father_aadhar_no || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Father/Guardian Mobile:</span>
                      <p className="text-slate-900">{viewStudentData.father_or_guardian_mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Father Occupation:</span>
                      <p className="text-slate-900">{viewStudentData.father_occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Mother Name:</span>
                      <p className="text-slate-900">{viewStudentData.mother_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Mother Aadhar:</span>
                      <p className="text-slate-900">{viewStudentData.mother_aadhar_no || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Mother/Guardian Mobile:</span>
                      <p className="text-slate-900">{viewStudentData.mother_or_guardian_mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Mother Occupation:</span>
                      <p className="text-slate-900">{viewStudentData.mother_occupation || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Present Address:</span>
                    <p className="text-slate-900">{viewStudentData.present_address || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Permanent Address:</span>
                    <p className="text-slate-900">{viewStudentData.permanent_address || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Admission Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Admission Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Admission Date:</span>
                      <p className="text-slate-900">{viewStudentData.admission_date ? new Date(viewStudentData.admission_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-red-600">
                <p>Failed to load student details.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const StudentsTab = StudentsTabComponent;
export default StudentsTabComponent;
