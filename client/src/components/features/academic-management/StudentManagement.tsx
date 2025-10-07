import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Eye, Users, Calendar, Trophy, BookOpen, IdCard, Trash2, Save, X, User, Phone, MapPin, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedDataTable } from '@/components/shared';
import {
  createAvatarColumn,
  createTextColumn,
  createBadgeColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";
import { useAuthStore } from '@/store/authStore';
import { useStudents, useDeleteStudent, useCreateStudent, useUpdateStudent, useStudent, useEnrollments, useCreateEnrollment, useUpdateEnrollment } from '@/lib/hooks/useSchool';
import { useStudentTransport, useCreateStudentTransport } from '@/lib/hooks/useStudentTransport';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const studentFormSchema = z.object({
  student_name: z.string().min(1, "Student name is required").max(255, "Name too long"),
  aadhar_no: z.string().optional().refine((val) => !val || /^\d{12}$/.test(val), "Aadhar must be 12 digits"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dob: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date"),
  father_name: z.string().optional(),
  father_aadhar_no: z.string().optional().refine((val) => !val || /^\d{12}$/.test(val), "Father Aadhar must be 12 digits"),
  father_mobile: z.string().optional().refine((val) => !val || /^\+?\d{10,12}$/.test(val), "Invalid mobile number"),
  father_occupation: z.string().optional(),
  mother_name: z.string().optional(),
  mother_aadhar_no: z.string().optional().refine((val) => !val || /^\d{12}$/.test(val), "Mother Aadhar must be 12 digits"),
  mother_mobile: z.string().optional().refine((val) => !val || /^\+?\d{10,12}$/.test(val), "Invalid mobile number"),
  mother_occupation: z.string().optional(),
  present_address: z.string().optional(),
  permanent_address: z.string().optional(),
  admission_date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date"),
  status: z.enum(["ACTIVE", "INACTIVE", "DROPPED_OUT", "ABSCONDED"]).optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

const StudentManagement = () => {
  const { currentBranch } = useAuthStore();
  const { data: students = [], isLoading, error } = useStudents();
  const deleteStudentMutation = useDeleteStudent();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  
  // Page-level tabs state & queries (Enrollments, Transport)
  const [pageEnrollmentQuery, setPageEnrollmentQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ class_id: '', section_id: '', admission_no: '' });
  const [pageTransportQuery, setPageTransportQuery] = useState<{ class_id: number | ''; section_id?: number | '' }>({ class_id: '', section_id: '' });
  const pageEnrollmentsResult = useEnrollments(
    pageEnrollmentQuery.class_id ? { class_id: Number(pageEnrollmentQuery.class_id), section_id: pageEnrollmentQuery.section_id ? Number(pageEnrollmentQuery.section_id) : undefined, admission_no: pageEnrollmentQuery.admission_no || undefined } : { class_id: 0 }
  );
  const pageTransportResult = useStudentTransport(
    pageTransportQuery.class_id ? { class_id: Number(pageTransportQuery.class_id), section_id: pageTransportQuery.section_id ? Number(pageTransportQuery.section_id) : undefined } : { class_id: 0 }
  );

  // Create Enrollment form state
  const createEnrollment = useCreateEnrollment();
  const updateEnrollment = useUpdateEnrollment();
  const [newEnrollment, setNewEnrollment] = useState<{
    student_id: number | '';
    class_id: number | '';
    section_id: number | '';
    roll_number: string;
    enrollment_date: string;
    is_active: boolean;
  }>({ student_id: '', class_id: '', section_id: '', roll_number: '', enrollment_date: '', is_active: true });
  const [isCreateEnrollmentOpen, setIsCreateEnrollmentOpen] = useState(false);

  const handleCreateEnrollment = async () => {
    if (newEnrollment.student_id === '' || newEnrollment.class_id === '' || newEnrollment.section_id === '' || !newEnrollment.roll_number) return;
    await createEnrollment.mutateAsync({
      student_id: Number(newEnrollment.student_id),
      class_id: Number(newEnrollment.class_id),
      section_id: Number(newEnrollment.section_id),
      roll_number: newEnrollment.roll_number,
      enrollment_date: newEnrollment.enrollment_date || null,
      is_active: newEnrollment.is_active,
    } as any);
    setNewEnrollment({ student_id: '', class_id: '', section_id: '', roll_number: '', enrollment_date: '', is_active: true });
    setIsCreateEnrollmentOpen(false);
  };

  // Update Enrollment state
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [editEnrollment, setEditEnrollment] = useState<{ section_id: number | ''; roll_number: string; enrollment_date: string; is_active: boolean }>({ section_id: '', roll_number: '', enrollment_date: '', is_active: true });
  const [isEditEnrollmentOpen, setIsEditEnrollmentOpen] = useState(false);
  const startEditEnrollment = (en: any) => {
    setSelectedEnrollment(en);
    setEditEnrollment({
      section_id: en.section_id ?? '',
      roll_number: en.roll_number ?? '',
      enrollment_date: en.enrollment_date ?? '',
      is_active: true,
    });
    setIsEditEnrollmentOpen(true);
  };
  const handleUpdateEnrollment = async () => {
    if (!selectedEnrollment || pageEnrollmentQuery.class_id === '' || selectedEnrollment.enrollment_id == null) return;
    await updateEnrollment.mutateAsync({
      class_id: Number(pageEnrollmentQuery.class_id),
      id: Number(selectedEnrollment.enrollment_id),
      payload: {
        section_id: editEnrollment.section_id === '' ? undefined : Number(editEnrollment.section_id),
        roll_number: editEnrollment.roll_number || undefined,
        enrollment_date: editEnrollment.enrollment_date || undefined,
        is_active: editEnrollment.is_active,
      },
    } as any);
    setSelectedEnrollment(null);
    setIsEditEnrollmentOpen(false);
  };

  // Dialog states
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch detailed student data when viewing
  const { data: detailedStudent, isLoading: isDetailedStudentLoading } = useStudent(selectedStudentId || 0);

  // Local state for tabs data fetch (requires class_id per backend contract)
  const [enrollmentQuery, setEnrollmentQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ class_id: '', section_id: '', admission_no: '' });
  const [transportQuery, setTransportQuery] = useState<{ class_id: number | ''; section_id?: number | '' }>({ class_id: '', section_id: '' });

  const enrollmentsResult = useEnrollments(
    enrollmentQuery.class_id ? { class_id: Number(enrollmentQuery.class_id), section_id: enrollmentQuery.section_id ? Number(enrollmentQuery.section_id) : undefined, admission_no: enrollmentQuery.admission_no || undefined } : { class_id: 0 }
  );
  const transportResult = useStudentTransport(
    transportQuery.class_id ? { class_id: Number(transportQuery.class_id), section_id: transportQuery.section_id ? Number(transportQuery.section_id) : undefined } : { class_id: 0 }
  );
  
  // Create Transport Assignment state
  const createStudentTransport = useCreateStudentTransport();
  const [isCreateTransportOpen, setIsCreateTransportOpen] = useState(false);
  const [newTransportAssignment, setNewTransportAssignment] = useState<{
    enrollment_id: number | '';
    bus_route_id: number | '';
    slab_id: number | '';
    pickup_point: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
  }>({ enrollment_id: '', bus_route_id: '', slab_id: '', pickup_point: '', start_date: '', end_date: '', is_active: true });

  const handleCreateTransport = async () => {
    if (
      newTransportAssignment.enrollment_id === '' ||
      newTransportAssignment.bus_route_id === '' ||
      newTransportAssignment.slab_id === '' ||
      !newTransportAssignment.start_date
    ) return;
    await createStudentTransport.mutateAsync({
      enrollment_id: Number(newTransportAssignment.enrollment_id),
      bus_route_id: Number(newTransportAssignment.bus_route_id),
      slab_id: Number(newTransportAssignment.slab_id),
      pickup_point: newTransportAssignment.pickup_point || null as any,
      start_date: newTransportAssignment.start_date,
      end_date: newTransportAssignment.end_date || null,
      is_active: newTransportAssignment.is_active,
    } as any);
    setNewTransportAssignment({ enrollment_id: '', bus_route_id: '', slab_id: '', pickup_point: '', start_date: '', end_date: '', is_active: true });
    setIsCreateTransportOpen(false);
  };
  
  // Form setup
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      student_name: "",
      aadhar_no: "",
      gender: undefined,
      dob: "",
      father_name: "",
      father_aadhar_no: "",
      father_mobile: "",
      father_occupation: "",
      mother_name: "",
      mother_aadhar_no: "",
      mother_mobile: "",
      mother_occupation: "",
      present_address: "",
      permanent_address: "",
      admission_date: "",
      status: "ACTIVE",
    },
  });

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'bg-blue-100 text-blue-800';
      case 'FEMALE': return 'bg-pink-100 text-pink-800';
      case 'OTHER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Action handlers
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setSelectedStudentId(student.student_id);
    setIsViewDialogOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    // Populate form with student data
    form.reset({
      student_name: student.student_name || "",
      aadhar_no: student.aadhar_no || "",
      gender: student.gender || undefined,
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : "",
      father_name: student.father_name || "",
      father_aadhar_no: student.father_aadhar_no || "",
      father_mobile: student.father_mobile || "",
      father_occupation: student.father_occupation || "",
      mother_name: student.mother_name || "",
      mother_aadhar_no: student.mother_aadhar_no || "",
      mother_mobile: student.mother_mobile || "",
      mother_occupation: student.mother_occupation || "",
      present_address: student.present_address || "",
      permanent_address: student.permanent_address || "",
      admission_date: student.admission_date ? new Date(student.admission_date).toISOString().split('T')[0] : "",
      status: student.status || "ACTIVE",
    });
    setIsEditDialogOpen(true);
  };

  const handleAddStudent = () => {
    form.reset();
    setSelectedStudent(null);
    setIsAddDialogOpen(true);
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await deleteStudentMutation.mutateAsync(studentId);
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
      console.error('Delete student error:', error);
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (selectedStudent) {
        // Update existing student
        await updateStudentMutation.mutateAsync({
          id: selectedStudent.student_id,
          payload: data,
        });
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
        setIsEditDialogOpen(false);
      } else {
        // Create new student
        await createStudentMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Student created successfully",
        });
        setIsAddDialogOpen(false);
      }
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: selectedStudent ? "Failed to update student" : "Failed to create student",
        variant: "destructive",
      });
      console.error('Student operation error:', error);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    createTextColumn<any>('student_id', { header: 'Student ID', className: 'font-mono font-semibold text-slate-900' }),
    createAvatarColumn<any>('student_name', 'gender', { header: 'Student Details' }),
    createTextColumn<any>('admission_no', { header: 'Admission No.', className: 'font-mono text-sm' }),
    createTextColumn<any>('father_mobile', { header: 'Father Mobile', fallback: 'N/A' }),
    createTextColumn<any>('mother_mobile', { header: 'Mother Mobile', fallback: 'N/A' }),
    createBadgeColumn<any>('gender', { header: 'Gender', variant: 'outline', fallback: 'N/A' }),
    createBadgeColumn<any>('status', { header: 'Status', variant: 'outline', fallback: 'N/A' }),
    createActionColumn<any>([
      createViewAction((row) => handleViewStudent(row)),
      createEditAction((row) => handleEditStudent(row)),
      createDeleteAction((row) => handleDeleteStudent(row.student_id))
    ])
  ], [handleViewStudent, handleEditStudent, handleDeleteStudent]);

  const statsCards = [
    {
      title: 'Total Students',
      value: students.length.toString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Students',
      value: students.filter((s: any) => s.status === 'ACTIVE').length.toString(),
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Male Students',
      value: students.filter((s: any) => s.gender === 'MALE').length.toString(),
      icon: Trophy,
      color: 'text-purple-600'
    },
    {
      title: 'Female Students',
      value: students.filter((s: any) => s.gender === 'FEMALE').length.toString(),
      icon: BookOpen,
      color: 'text-orange-600'
    }
  ];

  const [activePageTab, setActivePageTab] = useState<string>('students');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage student records, attendance, and academic progress
          </p>
          {currentBranch && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {currentBranch.branch_name} • {currentBranch.branch_type.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activePageTab === 'enrollments' && (
            <Button className="hover-elevate" onClick={() => setIsCreateEnrollmentOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Enrollment
            </Button>
          )}
          {activePageTab === 'transport' && (
            <Button className="hover-elevate" onClick={() => setIsCreateTransportOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Transport
            </Button>
          )}
          {activePageTab === 'students' && (
            <Button className="hover-elevate" data-testid="button-add-student" onClick={handleAddStudent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards (only on Students tab) */}
      {activePageTab === 'students' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Page-level Tabs */}
      <Tabs value={activePageTab} onValueChange={setActivePageTab} className="space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <IdCard className="w-4 h-4 mr-2" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="transport">
            <MapPin className="w-4 h-4 mr-2" />
            Transport
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-600">Loading students...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-sm text-red-600">Error loading students: {error.message}</p>
                </div>
              </CardContent>
            </Card>
          ) : students.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No students found</h3>
                  <p className="text-slate-500 mb-4">Get started by adding your first student.</p>
                  <Button className="gap-2" onClick={handleAddStudent}>
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EnhancedDataTable
              data={students}
              columns={columns}
              title="Students"
              searchKey="student_name"
              exportable={true}
              selectable={true}
            />
          )}
        </TabsContent>

        <TabsContent value="enrollments">
            <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Class ID</label>
                <Input
                  type="number"
                  placeholder="Enter class ID"
                  value={pageEnrollmentQuery.class_id}
                  onChange={(e) => setPageEnrollmentQuery((q) => ({ ...q, class_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
                <Input
                  type="number"
                  placeholder="Enter section ID"
                  value={pageEnrollmentQuery.section_id ?? ''}
                  onChange={(e) => setPageEnrollmentQuery((q) => ({ ...q, section_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Admission No (optional)</label>
                <Input
                  placeholder="Admission no"
                  value={pageEnrollmentQuery.admission_no ?? ''}
                  onChange={(e) => setPageEnrollmentQuery((q) => ({ ...q, admission_no: e.target.value }))}
                />
              </div>
            </div>

            {pageEnrollmentQuery.class_id === '' ? (
              <div className="text-sm text-slate-600">Enter a class ID to load enrollments.</div>
            ) : pageEnrollmentsResult.isLoading ? (
              <div className="text-sm text-slate-600">Loading enrollments...</div>
            ) : pageEnrollmentsResult.isError ? (
              <div className="text-sm text-red-600">Failed to load enrollments</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(pageEnrollmentsResult.data) && pageEnrollmentsResult.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-600">
                            <th className="py-2 pr-4">Enrollment ID</th>
                            <th className="py-2 pr-4">Admission No</th>
                            <th className="py-2 pr-4">Student</th>
                            <th className="py-2 pr-4">Roll No</th>
                            <th className="py-2 pr-4">Section</th>
                            <th className="py-2 pr-4">Date</th>
                            <th className="py-2 pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageEnrollmentsResult.data.map((en: any) => (
                            <tr key={en.enrollment_id} className="border-t">
                              <td className="py-2 pr-4 font-mono">{en.enrollment_id}</td>
                              <td className="py-2 pr-4">{en.admission_no}</td>
                              <td className="py-2 pr-4">{en.student_name}</td>
                              <td className="py-2 pr-4">{en.roll_number}</td>
                              <td className="py-2 pr-4">{en.section_name}</td>
                              <td className="py-2 pr-4">{en.enrollment_date || '-'}</td>
                              <td className="py-2 pr-4">
                                <Button variant="outline" size="sm" onClick={() => startEditEnrollment(en)}>Edit</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">No enrollments found.</div>
                  )}
                </CardContent>
              </Card>
            )}

            <Dialog
              open={isEditEnrollmentOpen}
              onOpenChange={(open) => {
                setIsEditEnrollmentOpen(open);
                if (!open) {
                  setSelectedEnrollment(null);
                }
              }}
            >
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit Enrollment{selectedEnrollment ? ` #${selectedEnrollment.enrollment_id}` : ''}</DialogTitle>
                  <DialogDescription>
                    Update enrollment details for the selected student.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-enrollment-section">Section ID</Label>
                    <Input
                      id="edit-enrollment-section"
                      type="number"
                      value={editEnrollment.section_id}
                      onChange={(e) => setEditEnrollment((v) => ({ ...v, section_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-enrollment-roll">Roll Number</Label>
                    <Input
                      id="edit-enrollment-roll"
                      value={editEnrollment.roll_number}
                      onChange={(e) => setEditEnrollment((v) => ({ ...v, roll_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-enrollment-date">Enrollment Date</Label>
                    <Input
                      id="edit-enrollment-date"
                      type="date"
                      value={editEnrollment.enrollment_date}
                      onChange={(e) => setEditEnrollment((v) => ({ ...v, enrollment_date: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="edit-enrollment-active"
                      checked={editEnrollment.is_active}
                      onCheckedChange={(checked) => setEditEnrollment((v) => ({ ...v, is_active: Boolean(checked) }))}
                    />
                    <Label htmlFor="edit-enrollment-active">Active</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditEnrollmentOpen(false);
                      setSelectedEnrollment(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button disabled={updateEnrollment.isPending} onClick={handleUpdateEnrollment}>
                    {updateEnrollment.isPending ? 'Updating...' : 'Update Enrollment'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isCreateEnrollmentOpen}
              onOpenChange={(open) => {
                setIsCreateEnrollmentOpen(open);
                if (!open) {
                  setNewEnrollment({ student_id: '', class_id: '', section_id: '', roll_number: '', enrollment_date: '', is_active: true });
                }
              }}
            >
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create Enrollment</DialogTitle>
                  <DialogDescription>
                    Provide details to create a new enrollment.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create-enrollment-student">Student ID</Label>
                    <Input
                      id="create-enrollment-student"
                      type="number"
                      placeholder="student_id"
                      value={newEnrollment.student_id}
                      onChange={(e) => setNewEnrollment((v) => ({ ...v, student_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-enrollment-class">Class ID</Label>
                    <Input
                      id="create-enrollment-class"
                      type="number"
                      placeholder="class_id"
                      value={newEnrollment.class_id}
                      onChange={(e) => setNewEnrollment((v) => ({ ...v, class_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-enrollment-section">Section ID</Label>
                    <Input
                      id="create-enrollment-section"
                      type="number"
                      placeholder="section_id"
                      value={newEnrollment.section_id}
                      onChange={(e) => setNewEnrollment((v) => ({ ...v, section_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-enrollment-roll">Roll Number</Label>
                    <Input
                      id="create-enrollment-roll"
                      placeholder="roll_number"
                      value={newEnrollment.roll_number}
                      onChange={(e) => setNewEnrollment((v) => ({ ...v, roll_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-enrollment-date">Enrollment Date</Label>
                    <Input
                      id="create-enrollment-date"
                      type="date"
                      value={newEnrollment.enrollment_date}
                      onChange={(e) => setNewEnrollment((v) => ({ ...v, enrollment_date: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="create-enrollment-active"
                      checked={newEnrollment.is_active}
                      onCheckedChange={(checked) => setNewEnrollment((v) => ({ ...v, is_active: Boolean(checked) }))}
                    />
                    <Label htmlFor="create-enrollment-active">Active</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateEnrollmentOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button disabled={createEnrollment.isPending} onClick={handleCreateEnrollment}>
                    {createEnrollment.isPending ? 'Creating...' : 'Create Enrollment'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="transport">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Class ID</label>
                <Input
                  type="number"
                  placeholder="Enter class ID"
                  value={pageTransportQuery.class_id}
                  onChange={(e) => setPageTransportQuery((q) => ({ ...q, class_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
                <Input
                  type="number"
                  placeholder="Enter section ID"
                  value={pageTransportQuery.section_id ?? ''}
                  onChange={(e) => setPageTransportQuery((q) => ({ ...q, section_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                />
              </div>
            </div>

            {pageTransportQuery.class_id === '' ? (
              <div className="text-sm text-slate-600">Enter a class ID to load transport assignments.</div>
            ) : pageTransportResult.isLoading ? (
              <div className="text-sm text-slate-600">Loading transport assignments...</div>
            ) : pageTransportResult.isError ? (
              <div className="text-sm text-red-600">Failed to load transport assignments</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transport Assignments (Grouped by Route)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(pageTransportResult.data) && pageTransportResult.data.length > 0 ? (
                    pageTransportResult.data.map((route) => (
                      <div key={route.bus_route_id} className="border rounded-md">
                        <div className="px-4 py-2 font-medium bg-slate-50">{route.route_name}</div>
                        <div className="overflow-x-auto p-2">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-slate-600">
                                <th className="py-2 pr-4">Admission No</th>
                                <th className="py-2 pr-4">Student</th>
                                <th className="py-2 pr-4">Roll No</th>
                                <th className="py-2 pr-4">Section</th>
                                <th className="py-2 pr-4">Slab</th>
                                <th className="py-2 pr-4">Pickup</th>
                              </tr>
                            </thead>
                            <tbody>
                              {route.students.map((s) => (
                                <tr key={s.transport_assignment_id} className="border-t">
                                  <td className="py-2 pr-4">{s.admission_no}</td>
                                  <td className="py-2 pr-4">{s.student_name}</td>
                                  <td className="py-2 pr-4">{s.roll_number}</td>
                                  <td className="py-2 pr-4">{s.section_name}</td>
                                  <td className="py-2 pr-4">{s.slab_name || '-'}</td>
                                  <td className="py-2 pr-4">{s.pickup_point || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-600">No transport assignments found.</div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setSelectedStudentId(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedStudent?.student_name}
            </DialogDescription>
          </DialogHeader>
          {isDetailedStudentLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-slate-600">Loading student details...</p>
              </div>
            </div>
          ) : detailedStudent ? (
            <div className="space-y-6">
              {/* Student Header */}
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {detailedStudent.student_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">{detailedStudent.student_name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-slate-600 font-medium">ID: {detailedStudent.student_id}</p>
                    <p className="text-slate-600 font-medium">Admission: {detailedStudent.admission_no}</p>
                    <Badge className={getGenderColor(detailedStudent.gender || 'Unknown')}>
                      {detailedStudent.gender || 'N/A'}
                    </Badge>
                    <Badge className={getFeeStatusColor(detailedStudent.status || 'Unknown')}>
                      {detailedStudent.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="profile" className="space-y-4 w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="enrollments">
                    <IdCard className="w-4 h-4 mr-2" />
                    Enrollments
                  </TabsTrigger>
                  <TabsTrigger value="transport">
                    <MapPin className="w-4 h-4 mr-2" />
                    Transport
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  {/* Personal Information */}
                  <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Date of Birth
                      </label>
                      <p className="text-sm text-slate-900">
                        {detailedStudent.dob ? new Date(detailedStudent.dob).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Aadhar Number
                      </label>
                      <p className="text-sm text-slate-900">{detailedStudent.aadhar_no || 'N/A'}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Present Address
                      </label>
                      <p className="text-sm text-slate-900">{detailedStudent.present_address || 'N/A'}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Permanent Address
                      </label>
                      <p className="text-sm text-slate-900">{detailedStudent.permanent_address || 'N/A'}</p>
                    </div>
                  </div>
                  </CardContent>
                </Card>

                  {/* Parent Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Father Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Name</label>
                      <p className="text-sm text-slate-900">{detailedStudent.father_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Mobile
                      </label>
                      <p className="text-sm text-slate-900">{detailedStudent.father_mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Occupation</label>
                      <p className="text-sm text-slate-900">{detailedStudent.father_occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Aadhar</label>
                      <p className="text-sm text-slate-900">{detailedStudent.father_aadhar_no || 'N/A'}</p>
                    </div>
                      </CardContent>
                    </Card>

                    <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mother Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Name</label>
                      <p className="text-sm text-slate-900">{detailedStudent.mother_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Mobile
                      </label>
                      <p className="text-sm text-slate-900">{detailedStudent.mother_mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Occupation</label>
                      <p className="text-sm text-slate-900">{detailedStudent.mother_occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Aadhar</label>
                      <p className="text-sm text-slate-900">{detailedStudent.mother_aadhar_no || 'N/A'}</p>
                    </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Information */}
                  <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Admission Date</label>
                      <p className="text-sm text-slate-900">
                        {detailedStudent.admission_date ? new Date(detailedStudent.admission_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Created</label>
                      <p className="text-sm text-slate-900">
                        {detailedStudent.created_at ? new Date(detailedStudent.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Last Updated</label>
                      <p className="text-sm text-slate-900">
                        {detailedStudent.updated_at ? new Date(detailedStudent.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    </div>
                  </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="enrollments">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Class ID</label>
                        <Input
                          type="number"
                          placeholder="Enter class ID"
                          value={enrollmentQuery.class_id}
                          onChange={(e) => setEnrollmentQuery((q) => ({ ...q, class_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
                        <Input
                          type="number"
                          placeholder="Enter section ID"
                          value={enrollmentQuery.section_id ?? ''}
                          onChange={(e) => setEnrollmentQuery((q) => ({ ...q, section_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Admission No (optional)</label>
                        <Input
                          placeholder="Admission no"
                          value={enrollmentQuery.admission_no ?? detailedStudent.admission_no}
                          onChange={(e) => setEnrollmentQuery((q) => ({ ...q, admission_no: e.target.value }))}
                        />
                      </div>
                    </div>

                    {enrollmentQuery.class_id === '' ? (
                      <div className="text-sm text-slate-600">Enter a class ID to load enrollments.</div>
                    ) : enrollmentsResult.isLoading ? (
                      <div className="text-sm text-slate-600">Loading enrollments...</div>
                    ) : enrollmentsResult.isError ? (
                      <div className="text-sm text-red-600">Failed to load enrollments</div>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {Array.isArray(enrollmentsResult.data) && enrollmentsResult.data.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left text-slate-600">
                                    <th className="py-2 pr-4">Enrollment ID</th>
                                    <th className="py-2 pr-4">Admission No</th>
                                    <th className="py-2 pr-4">Student</th>
                                    <th className="py-2 pr-4">Roll No</th>
                                    <th className="py-2 pr-4">Section</th>
                                    <th className="py-2 pr-4">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {enrollmentsResult.data.map((en: any) => (
                                    <tr key={en.enrollment_id} className="border-t">
                                      <td className="py-2 pr-4 font-mono">{en.enrollment_id}</td>
                                      <td className="py-2 pr-4">{en.admission_no}</td>
                                      <td className="py-2 pr-4">{en.student_name}</td>
                                      <td className="py-2 pr-4">{en.roll_number}</td>
                                      <td className="py-2 pr-4">{en.section_name}</td>
                                      <td className="py-2 pr-4">{en.enrollment_date || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-600">No enrollments found.</div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="transport">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Class ID</label>
                        <Input
                          type="number"
                          placeholder="Enter class ID"
                          value={transportQuery.class_id}
                          onChange={(e) => setTransportQuery((q) => ({ ...q, class_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
                        <Input
                          type="number"
                          placeholder="Enter section ID"
                          value={transportQuery.section_id ?? ''}
                          onChange={(e) => setTransportQuery((q) => ({ ...q, section_id: e.target.value === '' ? '' : Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    {transportQuery.class_id === '' ? (
                      <div className="text-sm text-slate-600">Enter a class ID to load transport assignments.</div>
                    ) : transportResult.isLoading ? (
                      <div className="text-sm text-slate-600">Loading transport assignments...</div>
                    ) : transportResult.isError ? (
                      <div className="text-sm text-red-600">Failed to load transport assignments</div>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Transport Assignments (Grouped by Route)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Array.isArray(transportResult.data) && transportResult.data.length > 0 ? (
                            transportResult.data.map((route) => (
                              <div key={route.bus_route_id} className="border rounded-md">
                                <div className="px-4 py-2 font-medium bg-slate-50">{route.route_name}</div>
                                <div className="overflow-x-auto p-2">
                                  <table className="min-w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-slate-600">
                                        <th className="py-2 pr-4">Admission No</th>
                                        <th className="py-2 pr-4">Student</th>
                                        <th className="py-2 pr-4">Roll No</th>
                                        <th className="py-2 pr-4">Section</th>
                                        <th className="py-2 pr-4">Slab</th>
                                        <th className="py-2 pr-4">Pickup</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {route.students.map((s) => (
                                        <tr key={s.transport_assignment_id} className="border-t">
                                          <td className="py-2 pr-4">{s.admission_no}</td>
                                          <td className="py-2 pr-4">{s.student_name}</td>
                                          <td className="py-2 pr-4">{s.roll_number}</td>
                                          <td className="py-2 pr-4">{s.section_name}</td>
                                          <td className="py-2 pr-4">{s.slab_name || '-'}</td>
                                          <td className="py-2 pr-4">{s.pickup_point || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-slate-600">No transport assignments found.</div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-sm text-red-600">Failed to load student details</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Transport Dialog */}
      <Dialog
        open={isCreateTransportOpen}
        onOpenChange={(open) => {
          setIsCreateTransportOpen(open);
          if (!open) {
            setNewTransportAssignment({ enrollment_id: '', bus_route_id: '', slab_id: '', pickup_point: '', start_date: '', end_date: '', is_active: true });
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Student Transport</DialogTitle>
            <DialogDescription>
              Assign a student to a bus route and slab.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-transport-enrollment">Enrollment ID</Label>
              <Input
                id="create-transport-enrollment"
                type="number"
                placeholder="enrollment_id"
                value={newTransportAssignment.enrollment_id}
                onChange={(e) => setNewTransportAssignment((v) => ({ ...v, enrollment_id: e.target.value === '' ? '' : Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="create-transport-route">Bus Route ID</Label>
              <Input
                id="create-transport-route"
                type="number"
                placeholder="bus_route_id"
                value={newTransportAssignment.bus_route_id}
                onChange={(e) => setNewTransportAssignment((v) => ({ ...v, bus_route_id: e.target.value === '' ? '' : Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="create-transport-slab">Slab ID</Label>
              <Input
                id="create-transport-slab"
                type="number"
                placeholder="slab_id"
                value={newTransportAssignment.slab_id}
                onChange={(e) => setNewTransportAssignment((v) => ({ ...v, slab_id: e.target.value === '' ? '' : Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="create-transport-pickup">Pickup Point</Label>
              <Input
                id="create-transport-pickup"
                placeholder="pickup point (optional)"
                value={newTransportAssignment.pickup_point}
                onChange={(e) => setNewTransportAssignment((v) => ({ ...v, pickup_point: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="create-transport-start">Start Date</Label>
              <Input
                id="create-transport-start"
                type="date"
                value={newTransportAssignment.start_date}
                onChange={(e) => setNewTransportAssignment((v) => ({ ...v, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="create-transport-end">End Date</Label>
              <Input
                id="create-transport-end"
                type="date"
                value={newTransportAssignment.end_date}
                onChange={(e) => setNewTransportAssignment((v) => ({ ...v, end_date: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="create-transport-active"
                checked={newTransportAssignment.is_active}
                onCheckedChange={(checked) => setNewTransportAssignment((v) => ({ ...v, is_active: Boolean(checked) }))}
              />
              <Label htmlFor="create-transport-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTransportOpen(false)}>Cancel</Button>
            <Button disabled={createStudentTransport.isPending} onClick={handleCreateTransport}>
              {createStudentTransport.isPending ? 'Creating...' : 'Create Transport'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Student
            </DialogTitle>
            <DialogDescription>
              Update information for {selectedStudent?.student_name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="student_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter student name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aadhar_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhar Number</FormLabel>
                          <FormControl>
                            <Input placeholder="12-digit Aadhar number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="admission_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="DROPPED_OUT">Dropped Out</SelectItem>
                              <SelectItem value="ABSCONDED">Absconded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="present_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Present Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter present address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanent_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Permanent Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter permanent address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateStudentMutation.isPending}
                >
                  {updateStudentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Student
                    </>
                  )}
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
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Student
            </DialogTitle>
            <DialogDescription>
              Create a new student record with complete information
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="student_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter student name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aadhar_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhar Number</FormLabel>
                          <FormControl>
                            <Input placeholder="12-digit Aadhar number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="admission_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="DROPPED_OUT">Dropped Out</SelectItem>
                              <SelectItem value="ABSCONDED">Absconded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="present_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Present Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter present address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanent_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Permanent Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter permanent address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Father Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Father Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="father_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter father's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="father_mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father Mobile</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter father's mobile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="father_occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter father's occupation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="father_aadhar_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father Aadhar</FormLabel>
                          <FormControl>
                            <Input placeholder="12-digit Aadhar number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mother Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Mother Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mother_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mother's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mother_mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother Mobile</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mother's mobile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mother_occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mother's occupation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mother_aadhar_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother Aadhar</FormLabel>
                          <FormControl>
                            <Input placeholder="12-digit Aadhar number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Student
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default StudentManagement;