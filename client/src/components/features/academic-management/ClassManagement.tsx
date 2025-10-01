import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, BookOpen, Clock, MapPin, Edit, Trash2, Search, Filter, Download, Upload, Calendar, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { useClasses, useCreateClass, useUpdateClass } from '@/lib/hooks/useSchool';
import { useAcademicYears } from '@/lib/hooks/useAcademicYear';

// UI row shape used by the table; we will map backend data into this shape
type UIClassRow = {
  class_id: number;
  class_name: string;
  section: string;
  grade: string;
  academic_year: string;
  class_teacher: string;
  room_number: string;
  capacity: number;
  current_strength: number;
  subjects: string[];
  timetable_set: boolean;
  status: string;
  created_at: string;
};

const classFormSchema = z.object({
  class_name: z.string().min(1, "Class name is required"),
});

const ClassesManagement = () => {
  const { data: backendClasses = [], isLoading: classesLoading } = useClasses();
  const { data: academicYears = [], isLoading: academicYearsLoading } = useAcademicYears();
  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass();
  const [classes, setClasses] = useState<UIClassRow[]>([]);
  // When backend classes load, map them into UI rows (fill non-backend fields with defaults)
  useEffect(() => {
    console.log('🔍 ClassManagement: useEffect triggered');
    console.log('🔍 ClassManagement: classesLoading:', classesLoading);
    console.log('🔍 ClassManagement: academicYearsLoading:', academicYearsLoading);
    console.log('🔍 ClassManagement: backendClasses:', backendClasses);
    console.log('🔍 ClassManagement: academicYears:', academicYears);
    
    // Don't process if data is still loading
    if (classesLoading || academicYearsLoading) return;
    
    const mapped: UIClassRow[] = backendClasses.map((c) => {
      // Find the current active academic year or use the first available
      const currentAcademicYear = academicYears?.find(ay => ay.is_active) || academicYears?.[0];
      console.log('🔍 ClassManagement: currentAcademicYear:', currentAcademicYear);
      return {
        class_id: c.class_id,
        class_name: c.class_name,
        section: '-',
        grade: '-',
        academic_year: currentAcademicYear?.year_name || '2024-25',
        class_teacher: '-',
        room_number: '-',
        capacity: 0,
        current_strength: 0,
        subjects: [],
        timetable_set: false,
        status: 'active',
        created_at: new Date().toISOString().slice(0,10),
      };
    });
    console.log('🔍 ClassManagement: mapped classes:', mapped);
    setClasses(mapped);
  }, [backendClasses, academicYears, classesLoading, academicYearsLoading]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_name: '',
    },
  });

  // Filtered data based on search and filters
  const filteredData = useMemo(() => {
    return classes.filter(classItem => {
      const matchesSearch = 
        classItem.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.class_teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.room_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGrade = selectedGrade === 'all' || classItem.grade === selectedGrade;
      const matchesStatus = selectedStatus === 'all' || classItem.status === selectedStatus;
      
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [classes, searchQuery, selectedGrade, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCapacityStatus = (current: number, capacity: number) => {
    if (!capacity || capacity <= 0) return { color: 'text-gray-600', status: 'N/A' };
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { color: 'text-red-600', status: 'Full' };
    if (percentage >= 80) return { color: 'text-yellow-600', status: 'Near Full' };
    return { color: 'text-green-600', status: 'Available' };
  };

  const columns: ColumnDef<UIClassRow>[] = [
    {
      accessorKey: 'class_name',
      header: 'Class Name',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{getValue<string>()}</div>
            <div className="text-sm text-slate-500">Grade {row.original.grade} - Section {row.original.section}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'class_teacher',
      header: 'Class Teacher',
      cell: ({ getValue }) => {
        const value = getValue<string>() || '-';
        const initials = value.trim() ? value.split(' ').map(n => n[0]).join('') : '-';
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <span className="font-medium text-slate-700">{value}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'room_number',
      header: 'Room',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <Badge variant="outline" className="font-mono">{getValue<string>()}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'current_strength',
      header: 'Students',
      cell: ({ getValue, row }) => {
        const value = getValue<number>() || 0;
        const capacity = row.original.capacity || 0;
        const capacityStatus = getCapacityStatus(value, capacity);
        return (
          <div className="text-center">
            <div className="font-semibold">{value}/{capacity}</div>
            <div className={`text-xs ${capacityStatus.color}`}>{capacityStatus.status}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'subjects',
      header: 'Subjects',
      cell: ({ getValue }) => {
        const value = (getValue<string[]>() || []);
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {value.slice(0, 3).map((subject, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {value.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'timetable_set',
      header: 'Timetable',
      cell: ({ getValue }) => {
        const value = !!getValue<boolean>();
        return (
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Set</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Pending</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue<string>() === 'active' ? 'default' : 'destructive'}>
          {getValue<string>()}
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
            size="icon"
            onClick={() => {
              setEditingClass(row.original);
              form.reset({
                class_name: row.original.class_name,
              });
              setShowAddDialog(true);
            }}
            className="hover-elevate"
            data-testid={`button-edit-class-${row.original.class_id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClass(row.original.class_id)}
            className="hover-elevate text-red-600 hover:text-red-700"
            data-testid={`button-delete-class-${row.original.class_id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    if (editingClass) {
      // Backend only supports updating class_name
      updateClassMutation.mutate({ id: editingClass.class_id, payload: { class_name: values.class_name } });
      toast({ title: "Class Updated", description: `${values.class_name} has been updated successfully.` });
      // Optimistic local update for UI-only fields
      setClasses(classes.map(c => c.class_id === editingClass.class_id ? {
        ...c,
        class_name: values.class_name,
      } : c));
    } else {
      // Create on backend (only class_name required)
      createClassMutation.mutate({ class_name: values.class_name });
      toast({ title: "Class Added", description: `${values.class_name} has been added successfully.` });
      // Append optimistic UI row until refetch updates from backend
      setClasses([
        ...classes,
        {
          class_id: Date.now(),
          class_name: values.class_name,
          section: '-',
          grade: '-',
          academic_year: academicYears?.find(ay => ay.is_active)?.year_name || academicYears?.[0]?.year_name || '2024-25',
          class_teacher: '-',
          room_number: '-',
          capacity: 0,
          current_strength: 0,
          subjects: [],
          timetable_set: false,
          status: 'active',
          created_at: new Date().toISOString().split('T')[0],
        },
      ]);
    }

    form.reset();
    setEditingClass(null);
    setShowAddDialog(false);
  };

  const handleDeleteClass = (classId: number) => {
    setClasses(classes.filter(c => c.class_id !== classId));
    toast({
      title: "Class Deleted", 
      description: "The class has been deleted successfully.",
      variant: "destructive",
    });
    console.log('Class deleted:', classId);
  };

  const handleExport = () => {
    console.log('Exporting classes data');
    toast({
      title: "Export Started",
      description: "Classes data is being exported to CSV.",
    });
  };

  const summary = useMemo(() => {
    const totalStudents = classes.reduce((sum, c) => sum + c.current_strength, 0);
    const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    const occupancyRate = totalCapacity > 0 ? ((totalStudents / totalCapacity) * 100).toFixed(1) : '0';
    
    return {
      totalClasses: classes.length,
      activeClasses: classes.filter(c => c.status === 'active').length,
      totalStudents,
      totalCapacity,
      occupancyRate,
      pendingTimetables: classes.filter(c => !c.timetable_set).length,
    };
  }, [classes]);

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
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Classes Management</h1>
              <p className="text-slate-600 mt-1">Manage school classes, sections, and assignments</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="hover-elevate"
                data-testid="button-export-classes"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="hover-elevate" data-testid="button-add-class">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="class_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Grade 10-A" {...field} data-testid="input-class-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Simplified form per backend: only Class Name is required */}
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            form.reset();
                            setEditingClass(null);
                            setShowAddDialog(false);
                          }}
                          data-testid="button-cancel-class"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="button-save-class">
                          {editingClass ? 'Update' : 'Add'} Class
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Classes</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.totalClasses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Classes</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.activeClasses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.totalCapacity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.occupancyRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending Timetables</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.pendingTimetables}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search classes, teachers, or rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-classes"
              />
            </div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-filter-grade">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                  <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[120px]" data-testid="select-filter-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {classesLoading || academicYearsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-600">Loading classes and academic years...</p>
                </div>
              </div>
            ) : (
              <EnhancedDataTable
                data={filteredData}
                columns={columns as any}
                exportable={true}
                title="Classes"
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClassesManagement;
