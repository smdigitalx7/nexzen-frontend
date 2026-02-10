import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, BookOpen, Clock, MapPin, Pencil, Trash2, Search, Filter, Download, Upload, Calendar, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/common/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/common/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from '@/common/components/shared/DataTable';
import type { ActionConfig } from '@/common/components/shared/DataTable/types';
import { useSearchFilters, useTableFilters } from '@/common/hooks';
import type { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/common/hooks/use-toast';
import { useCollegeClasses, useCreateCollegeClass, useUpdateCollegeClass } from '@/features/college/hooks';
import { useAcademicYears } from '@/features/general/hooks';
import type { CollegeClassResponse } from '@/features/college/types';
import {
  createClassNameColumn,
  createTeacherColumn,
  createRoomColumn,
  createCapacityColumn,
  createSubjectsColumn,
  createBooleanStatusColumn,
  createBadgeColumn
} from "@/common/utils/factory/columnFactories";

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
  class_order: number;
  created_at: string;
};

const classFormSchema = z.object({
  class_name: z.string().min(1, "Class name is required"),
  class_order: z.coerce.number().int().min(1, "Class order must be at least 1"),
});

const ClassesManagement = () => {
  const { data: backendClasses = [], isLoading: classesLoading } = useCollegeClasses({ enabled: true });
  const { data: academicYears = [], isLoading: academicYearsLoading } = useAcademicYears();
  const [editingClass, setEditingClass] = useState<any>(null);
  const createClassMutation = useCreateCollegeClass();
  const updateClassMutation = useUpdateCollegeClass(editingClass?.class_id ?? 0);
  const [classes, setClasses] = useState<UIClassRow[]>([]);
  // When backend classes load, map them into UI rows (fill non-backend fields with defaults)
  useEffect(() => {
    
    // Don't process if data is still loading
    if (classesLoading || academicYearsLoading) return;
    
    const mapped: UIClassRow[] = backendClasses.map((c: CollegeClassResponse) => {
      // Find the current active academic year or use the first available
      const currentAcademicYear = academicYears?.find((ay: any) => ay.is_active) || academicYears?.[0];
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
        class_order: c.class_order,
        created_at: new Date().toISOString().slice(0,10),
      };
    });
    setClasses(mapped);
  }, [backendClasses, academicYears, classesLoading, academicYearsLoading]);

  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_name: '',
      class_order: 1,
    },
  });

  // Shared search over class fields
  const { searchTerm, setSearchTerm, filteredItems: searchFiltered } = useSearchFilters<UIClassRow>(
    classes,
    { keys: ['class_name', 'class_teacher', 'room_number'] as any }
  );

  // Shared select filters for grade and status (grade optional UI field)
  const { setFilter, filteredItems: filteredData } = useTableFilters<UIClassRow>(
    searchFiltered,
    [
      { key: 'grade' as keyof UIClassRow, value: selectedGrade },
      { key: 'status' as keyof UIClassRow, value: selectedStatus },
    ]
  );

  
  const handleDeleteClass = (classId: number) => {
    setClasses(classes.filter(c => c.class_id !== classId));
    toast({
      title: "Class Deleted", 
      description: "The class has been deleted successfully.",
      variant: "destructive",
    });
  };

  const columns: ColumnDef<UIClassRow>[] = useMemo(() => [
    createClassNameColumn<UIClassRow>("class_name", "grade", "section", GraduationCap, { header: "Class Name" }),
    createTeacherColumn<UIClassRow>("class_teacher", { header: "Class Teacher" }),
    createRoomColumn<UIClassRow>("room_number", MapPin, { header: "Room" }),
    createCapacityColumn<UIClassRow>("current_strength", "capacity", { header: "Students" }),
    createSubjectsColumn<UIClassRow>("subjects", { header: "Subjects" }),
    createBooleanStatusColumn<UIClassRow>(
      "timetable_set",
      CheckCircle2,
      AlertCircle,
      "Set",
      "Pending",
      "text-green-600",
      "text-yellow-600",
      { header: "Timetable" }
    ),
    createBadgeColumn<UIClassRow>("status", { 
      header: "Status",
      variant: "outline"
    }),
    {
      id: "class_order",
      header: "Order",
      accessorKey: "class_order",
      cell: ({ row }: any) => <span>{row.original.class_order}</span>
    }
  ], [setEditingClass, form, setShowAddDialog, handleDeleteClass]);

  // Actions for DataTable V2 (Edit, Delete)
  const actions = useMemo<ActionConfig<UIClassRow>[]>(() => [
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      variant: 'outline',
      onClick: (row) => {
        setEditingClass(row);
        form.reset({ 
          class_name: row.class_name,
          class_order: row.class_order,
        });
        setShowAddDialog(true);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => handleDeleteClass(row.class_id),
    },
  ], [form, handleDeleteClass]);

  const handleSubmit = (values: any) => {
    if (editingClass) {
      // Backend only supports updating class_name and class_order
      updateClassMutation.mutate({ 
        class_name: values.class_name,
        class_order: values.class_order,
      }, {
        onSuccess: () => {
          toast({ title: "Class Updated", description: `${values.class_name} has been updated successfully.`, variant: "success" });
          // Optimistic local update for UI-only fields
          setClasses(classes.map(c => c.class_id === editingClass.class_id ? {
            ...c,
            class_name: values.class_name,
            class_order: values.class_order,
          } : c));
          form.reset();
          setEditingClass(null);
          setShowAddDialog(false);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while updating the class.';
          toast({
            title: "Update Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
    } else {
      // Create on backend
      createClassMutation.mutate({ 
        class_name: values.class_name,
        class_order: values.class_order,
      }, {
        onSuccess: () => {
          toast({ title: "Class Added", description: `${values.class_name} has been added successfully.`, variant: "success" });
          // Append optimistic UI row until refetch updates from backend
          setClasses([
            ...classes,
            {
              class_id: Date.now(),
              class_name: values.class_name,
              class_order: values.class_order,
              section: '-',
              grade: '-',
              academic_year: academicYears?.find((ay: any) => ay.is_active)?.year_name || academicYears?.[0]?.year_name || '2024-25',
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
          form.reset();
          setEditingClass(null);
          setShowAddDialog(false);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while creating the class.';
          toast({
            title: "Creation Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
    }
  };

  

  const handleExport = () => {
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
      <div className="flex-1 overflow-auto scrollbar-hide">
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
                      <FormField
                        control={form.control}
                        name="class_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Order</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="e.g., 10" {...field} data-testid="input-class-order" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Simplified form per backend: Class Name and Class Order are required */}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-classes"
              />
            </div>
            <Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v); setFilter('grade', v); }}>
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
            <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setFilter('status', v); }}>
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
            <DataTable<UIClassRow>
              data={filteredData}
              columns={columns}
              title="Classes"
              loading={classesLoading || academicYearsLoading}
              export={{ enabled: true, filename: "classes" }}
              actions={actions}
              actionsHeader="Actions"
              emptyMessage="No classes found"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClassesManagement;
