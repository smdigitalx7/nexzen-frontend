import { useState, useMemo, memo, useCallback } from 'react';
import { Users, Save, X, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/common/components/ui/form';
import { Input } from '@/common/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { DatePicker } from '@/common/components/ui/date-picker';
import { EnhancedDataTable, ServerSidePagination } from '@/common/components/shared';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import { 
  createAvatarColumn, 
  createTextColumn,
  createBadgeColumn
} from '@/common/utils/factory/columnFactories';
import { useSchoolStudentsList, useUpdateSchoolStudent, useSchoolStudent } from '@/features/school/hooks';
import type { SchoolStudentRead, SchoolStudentFullDetails } from '@/features/school/types';
import { useAuthStore } from '@/core/auth/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@/common/components/ui/badge';
import { useTabEnabled } from '@/common/hooks/use-tab-navigation';

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
            <FormControl>
              <DatePicker
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Select date of birth"
              />
            </FormControl>
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
            <FormControl>
              <DatePicker
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Select admission date"
              />
            </FormControl>
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
  // ✅ OPTIMIZATION: Check if this tab is active before fetching
  // Note: StudentsTab might be used in different contexts, so we check for common tab names
  // If used in StudentManagement, it's not in the tabs array, so this component might not be rendered
  // But if it's used elsewhere with a "students" tab, we gate it properly
  const isStudentsTabActive = useTabEnabled("students", "enrollments");
  const isEnrollmentsTabActive = useTabEnabled("enrollments", "enrollments");
  // ✅ OPTIMIZATION: Only fetch if any relevant tab is active (covers different contexts)
  const isTabActive = isStudentsTabActive || isEnrollmentsTabActive;

  // State management
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [viewStudentId, setViewStudentId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  // ✅ FIX: Add refreshKey to force table refresh after updates
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Hooks
  const { currentBranch } = useAuthStore();
  // ✅ OPTIMIZATION: Only fetch when tab is active
  const { data: studentsResp, isLoading, error } = useSchoolStudentsList({ 
    page: currentPage, 
    page_size: pageSize,
    enabled: isTabActive, // ✅ Only fetch when relevant tab is active
  });
  const { data: viewStudentData, isLoading: isViewLoading } = useSchoolStudent(viewStudentId);
  const updateStudentMutation = useUpdateSchoolStudent(selectedStudent?.student_id || 0);

  // ✅ FIX: Remove memoization or add dataUpdatedAt to detect changes
  // Use dataUpdatedAt to ensure we detect when React Query refetches
  const students = useMemo(() => studentsResp?.data ?? [], [
    studentsResp?.data,
    studentsResp?.dataUpdatedAt, // ✅ Add timestamp to detect refetches
  ]);

  // Form setup
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialFormValues,
  });

  // Memoized handlers
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
      await updateStudentMutation.mutateAsync(data as any);
      setIsEditDialogOpen(false);
      form.reset();
      // ✅ FIX: Increment refreshKey to force table refresh
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      // Error toast is handled by mutation hook
    }
  }, [updateStudentMutation, form]);

  // Memoized dialog close handlers
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
        <Loader.Table rows={10} columns={5} />
      ) : error ? (
        <Card><CardContent className="py-8 text-center text-red-600">Error loading students</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <EnhancedDataTable
            data={students}
            columns={columns}
            title="Students"
            searchKey="student_name"
            exportable={true}
            selectable={true}
            showActions={true}
            actionButtonGroups={actionButtonGroups}
            actionColumnHeader="Actions"
            showActionLabels={true}
            refreshKey={refreshKey}
            enableClientSidePagination={false}
          />
          {/* ✅ Server-side pagination controls */}
          {studentsResp && (
            <ServerSidePagination
              currentPage={currentPage}
              totalPages={studentsResp.total_pages || 1}
              totalCount={studentsResp.total_count || students.length}
              pageSize={pageSize}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setCurrentPage(1);
              }}
              isLoading={isLoading}
            />
          )}
        </div>
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
                    {updateStudentMutation.isPending ? (
                      <>
                        <Loader.Button size="sm" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />Update Student
                      </>
                    )}
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
