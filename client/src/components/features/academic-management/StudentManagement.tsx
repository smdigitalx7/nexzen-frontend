import { useState } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Eye, Users, Calendar, Trophy, BookOpen, IdCard, Trash2, Save, X, User, Phone, MapPin, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedDataTable } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { useStudents, useDeleteStudent, useCreateStudent, useUpdateStudent, useStudent } from '@/lib/hooks/useSchool';
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
  
  // Dialog states
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch detailed student data when viewing
  const { data: detailedStudent, isLoading: isDetailedStudentLoading } = useStudent(selectedStudentId || 0);
  
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'student_id',
      header: 'Student ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <IdCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-mono font-semibold text-slate-900">ID: {row.original.student_id}</div>
            <div className="text-xs text-slate-500">{row.original.admission_no}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'student_name',
      header: 'Student Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {row.original.student_name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium" title={row.original.student_name}>
              {truncateText(row.original.student_name)}
            </span>
            <div className="text-xs text-slate-500">
              {row.original.gender || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'admission_no',
      header: 'Admission No.',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.admission_no}</span>
      ),
    },
    {
      accessorKey: 'father_mobile',
      header: 'Father Mobile',
      cell: ({ row }) => (
        <span title={row.original.father_mobile}>
          {row.original.father_mobile || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'mother_mobile',
      header: 'Mother Mobile',
      cell: ({ row }) => (
        <span title={row.original.mother_mobile}>
          {row.original.mother_mobile || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => (
        <Badge className={getGenderColor(row.original.gender || 'Unknown')}>
          {row.original.gender || 'N/A'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getFeeStatusColor(row.original.status || 'Unknown')}>
          {row.original.status || 'N/A'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover-elevate"
            onClick={() => handleViewStudent(row.original)}
            title="View Student"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover-elevate"
            onClick={() => handleEditStudent(row.original)}
            title="Edit Student"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover-elevate text-red-600 hover:text-red-700"
                title="Delete Student"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {row.original.student_name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteStudent(row.original.student_id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

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
        <Button className="hover-elevate" data-testid="button-add-student" onClick={handleAddStudent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
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

      {/* Students Table */}
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