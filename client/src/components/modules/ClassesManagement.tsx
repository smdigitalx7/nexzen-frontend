import { useState, useMemo } from 'react';
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
import { EnhancedDataTable } from '@/components/EnhancedDataTable';
import { useToast } from '@/hooks/use-toast';

// Mock data for classes
const mockClassesData = [
  {
    class_id: 1,
    class_name: "Grade 10-A",
    section: "A",
    grade: "10",
    academic_year: "2024-25",
    class_teacher: "Mrs. Sarah Wilson",
    room_number: "101",
    capacity: 35,
    current_strength: 32,
    subjects: ["Mathematics", "English", "Science", "History", "Geography"],
    timetable_set: true,
    status: "active",
    created_at: "2024-01-15",
  },
  {
    class_id: 2,
    class_name: "Grade 9-B",
    section: "B", 
    grade: "9",
    academic_year: "2024-25",
    class_teacher: "Mr. David Chen",
    room_number: "203",
    capacity: 40,
    current_strength: 38,
    subjects: ["Mathematics", "English", "Science", "Social Studies"],
    timetable_set: true,
    status: "active",
    created_at: "2024-01-15",
  },
  {
    class_id: 3,
    class_name: "Grade 8-A",
    section: "A",
    grade: "8", 
    academic_year: "2024-25",
    class_teacher: "Ms. Jennifer Adams",
    room_number: "150",
    capacity: 30,
    current_strength: 29,
    subjects: ["Mathematics", "English", "Science", "History"],
    timetable_set: false,
    status: "active",
    created_at: "2024-01-20",
  }
];

const classFormSchema = z.object({
  class_name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  grade: z.string().min(1, "Grade is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  class_teacher: z.string().min(1, "Class teacher is required"),
  room_number: z.string().min(1, "Room number is required"),
  capacity: z.string().min(1, "Capacity is required"),
  subjects: z.string().min(1, "At least one subject is required"),
});

const ClassesManagement = () => {
  const [classes, setClasses] = useState(mockClassesData);
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
      section: '',
      grade: '',
      academic_year: '2024-25',
      class_teacher: '',
      room_number: '',
      capacity: '',
      subjects: '',
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
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { color: 'text-red-600', status: 'Full' };
    if (percentage >= 80) return { color: 'text-yellow-600', status: 'Near Full' };
    return { color: 'text-green-600', status: 'Available' };
  };

  const columns = [
    {
      key: 'class_name',
      header: 'Class Name',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">Grade {row.grade} - Section {row.section}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'class_teacher',
      header: 'Class Teacher',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{value.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <span className="font-medium text-slate-700">{value}</span>
        </div>
      ),
    },
    {
      key: 'room_number',
      header: 'Room',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <Badge variant="outline" className="font-mono">{value}</Badge>
        </div>
      ),
    },
    {
      key: 'current_strength',
      header: 'Students',
      sortable: true,
      render: (value: number, row: any) => {
        const capacityStatus = getCapacityStatus(value, row.capacity);
        return (
          <div className="text-center">
            <div className="font-semibold">{value}/{row.capacity}</div>
            <div className={`text-xs ${capacityStatus.color}`}>{capacityStatus.status}</div>
          </div>
        );
      },
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (value: string[]) => (
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
      ),
    },
    {
      key: 'timetable_set',
      header: 'Timetable',
      render: (value: boolean) => (
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
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'destructive'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingClass(row);
              form.reset({
                class_name: row.class_name,
                section: row.section,
                grade: row.grade,
                academic_year: row.academic_year,
                class_teacher: row.class_teacher,
                room_number: row.room_number,
                capacity: row.capacity.toString(),
                subjects: row.subjects.join(', '),
              });
              setShowAddDialog(true);
            }}
            className="hover-elevate"
            data-testid={`button-edit-class-${row.class_id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClass(row.class_id)}
            className="hover-elevate text-red-600 hover:text-red-700"
            data-testid={`button-delete-class-${row.class_id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    const classData = {
      class_id: editingClass ? editingClass.class_id : Date.now(),
      class_name: values.class_name,
      section: values.section,
      grade: values.grade,
      academic_year: values.academic_year,
      class_teacher: values.class_teacher,
      room_number: values.room_number,
      capacity: parseInt(values.capacity),
      current_strength: editingClass ? editingClass.current_strength : 0,
      subjects: values.subjects.split(',').map((s: string) => s.trim()),
      timetable_set: editingClass ? editingClass.timetable_set : false,
      status: 'active',
      created_at: editingClass ? editingClass.created_at : new Date().toISOString().split('T')[0],
    };

    if (editingClass) {
      setClasses(classes.map(c => c.class_id === editingClass.class_id ? classData : c));
      toast({
        title: "Class Updated",
        description: `${values.class_name} has been updated successfully.`,
      });
    } else {
      setClasses([...classes, classData]);
      toast({
        title: "Class Added",
        description: `${values.class_name} has been added successfully.`,
      });
    }

    form.reset();
    setEditingClass(null);
    setShowAddDialog(false);
    console.log(editingClass ? 'Class updated:' : 'Class added:', values.class_name);
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
                      <div className="grid grid-cols-2 gap-4">
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
                          name="section"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section</FormLabel>
                              <FormControl>
                                <Input placeholder="A, B, C..." {...field} data-testid="input-section" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-grade">
                                    <SelectValue placeholder="Select grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                                    <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="academic_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Academic Year</FormLabel>
                              <FormControl>
                                <Input placeholder="2024-25" {...field} data-testid="input-academic-year" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="class_teacher"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class Teacher</FormLabel>
                              <FormControl>
                                <Input placeholder="Teacher name" {...field} data-testid="input-class-teacher" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="room_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Number</FormLabel>
                              <FormControl>
                                <Input placeholder="101, 2A, etc." {...field} data-testid="input-room-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Capacity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="35" {...field} data-testid="input-capacity" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subjects (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Mathematics, English, Science..." {...field} data-testid="input-subjects" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
            <EnhancedDataTable
              data={filteredData}
              columns={columns}
              searchable={false}
              exportable={true}
              filename="classes"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClassesManagement;