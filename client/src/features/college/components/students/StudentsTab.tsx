import { useEffect, useState, useMemo } from 'react';
import { Save, X, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/common/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/common/components/ui/form';
import { Input } from '@/common/components/ui/input';
import { SmartSelect } from '@/common/components/ui/smart-select';
import { DatePicker } from '@/common/components/ui/date-picker';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';
import { Badge } from '@/common/components/ui/badge';
import { Avatar, AvatarFallback } from '@/common/components/ui/avatar';
import { useCollegeStudentsList, useDeleteCollegeStudent, useUpdateCollegeStudent } from '@/features/college/hooks';
import { useAuthStore } from '@/core/auth/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CollegeStudentFullDetails, CollegeStudentRead } from '@/features/college/types/students';
import { ColumnDef } from '@tanstack/react-table';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data: studentsResp, isLoading } = useCollegeStudentsList({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
  });
  
  const students: CollegeStudentRead[] = useMemo(() => {
    if (!studentsResp) return [];
    if (Array.isArray(studentsResp)) return studentsResp;
    return studentsResp.data ?? [];
  }, [studentsResp]);
  const deleteStudentMutation = useDeleteCollegeStudent();
  const [selectedStudent, setSelectedStudent] = useState<CollegeStudentFullDetails | null>(null);
  const updateStudentMutation = useUpdateCollegeStudent(selectedStudent?.student_id || 0);
  const [refreshKey, setRefreshKey] = useState(0);

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
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error(error);
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      await updateStudentMutation.mutateAsync(data as any);
      setIsEditDialogOpen(false);
      form.reset();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error(error);
    }
  };

  const actions: ActionConfig<CollegeStudentRead>[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (row) => handleEditStudent(row),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => handleDeleteStudent(row.student_id),
    }
  ], []);

  const columns: ColumnDef<CollegeStudentRead>[] = useMemo(() => [
    {
      accessorKey: 'admission_no',
      header: 'Admission No.',
      cell: ({ row }) => <span className="font-semibold text-blue-600">{row.getValue('admission_no')}</span>
    },
    {
      accessorKey: 'student_name',
      header: 'Student Details',
      cell: ({ row }) => {
        const name = row.getValue('student_name') as string;
        const gender = row.original.gender;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarFallback className={gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}>
                {name?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{name}</span>
              <span className="text-xs text-muted-foreground capitalize">{gender?.toLowerCase()}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'father_or_guardian_mobile',
      header: 'Mobile',
      cell: ({ row }) => <span>{(row.getValue('father_or_guardian_mobile') as string) || 'N/A'}</span>
    },
    {
      accessorKey: 'present_address',
      header: 'Address',
      cell: ({ row }) => {
        const address = row.getValue('present_address') as string;
        return (
          <div className="max-w-[200px] truncate text-muted-foreground" title={address}>
            {address || 'N/A'}
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = status === 'ACTIVE' ? 'secondary' : status === 'INACTIVE' ? 'destructive' : 'outline';
        return (
          <Badge variant={variant} className={status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
            {status}
          </Badge>
        );
      }
    }
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students (name or admission no)…"
            className="pl-9 h-10 shadow-sm"
          />
        </div>
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="h-10">
            Clear
          </Button>
        )}
      </div>

      <DataTable
        key={`students-table-${refreshKey}`}
        data={students}
        columns={columns}
        actions={actions}
        title="Students List"
        loading={isLoading}
        pagination="server"
        totalCount={
          Array.isArray(studentsResp)
            ? studentsResp.length
            : studentsResp?.total_count || 0
        }
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        export={{
          enabled: true,
          filename: 'students_list',
        }}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">Edit Student</DialogTitle>
            <DialogDescription>Update information for <span className="font-semibold text-primary">{selectedStudent?.student_name}</span></DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border-none shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
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
                          <FormControl>
                            <SmartSelect
                              items={[
                                { value: "MALE", label: "Male" },
                                { value: "FEMALE", label: "Female" },
                                { value: "OTHER", label: "Other" },
                              ]}
                              value={field.value || ''}
                              onSelect={field.onChange}
                              placeholder="Select gender"
                              radioLayout="horizontal"
                            />
                          </FormControl>
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
                <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background pb-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateStudentMutation.isPending} className="min-w-[140px]">
                    {updateStudentMutation.isPending ? (
                      <>
                        <Loader.Button size="sm" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsTab;
