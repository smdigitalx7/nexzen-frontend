import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Trophy, TrendingUp, TrendingDown, Search, Filter, Download, Edit, Eye, FileText, Calculator, Award, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';

// Mock data for marks
const mockMarksData = [
  {
    mark_id: 1,
    student_id: 1,
    student_name: "John Smith",
    roll_number: "10A001",
    class_name: "Grade 10-A",
    subject: "Mathematics",
    exam_type: "Mid-term",
    total_marks: 100,
    obtained_marks: 85,
    percentage: 85,
    grade: "A",
    exam_date: "2024-01-15",
    teacher: "Mrs. Sarah Wilson",
    remarks: "Excellent performance",
  },
  {
    mark_id: 2,
    student_id: 2,
    student_name: "Emma Johnson",
    roll_number: "10A002",
    class_name: "Grade 10-A",
    subject: "Mathematics", 
    exam_type: "Mid-term",
    total_marks: 100,
    obtained_marks: 92,
    percentage: 92,
    grade: "A+",
    exam_date: "2024-01-15",
    teacher: "Mrs. Sarah Wilson",
    remarks: "Outstanding work",
  },
  {
    mark_id: 3,
    student_id: 3,
    student_name: "Michael Brown",
    roll_number: "10A003", 
    class_name: "Grade 10-A",
    subject: "English",
    exam_type: "Final",
    total_marks: 100,
    obtained_marks: 78,
    percentage: 78,
    grade: "B+",
    exam_date: "2024-01-20",
    teacher: "Mr. David Chen",
    remarks: "Good improvement",
  },
];

const markFormSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  subject: z.string().min(1, "Subject is required"),
  exam_type: z.string().min(1, "Exam type is required"),
  total_marks: z.string().min(1, "Total marks is required"),
  obtained_marks: z.string().min(1, "Obtained marks is required"),
  exam_date: z.string().min(1, "Exam date is required"),
  remarks: z.string().optional(),
});

const MarksManagement = () => {
  const [marks, setMarks] = useState(mockMarksData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMark, setEditingMark] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('marks');
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(markFormSchema),
    defaultValues: {
      student_id: '',
      subject: '',
      exam_type: '',
      total_marks: '',
      obtained_marks: '',
      exam_date: '',
      remarks: '',
    },
  });

  // Mock data for dropdowns
  const classes = [
    { id: '1', name: 'Grade 10-A' },
    { id: '2', name: 'Grade 9-B' },
    { id: '3', name: 'Grade 8-A' },
  ];

  const subjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'
  ];

  const examTypes = [
    'Weekly Test', 'Monthly Test', 'Mid-term', 'Final', 'Assignment', 'Project'
  ];

  const students = [
    { id: '1', name: 'John Smith', roll: '10A001' },
    { id: '2', name: 'Emma Johnson', roll: '10A002' },
    { id: '3', name: 'Michael Brown', roll: '10A003' },
  ];

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 75) return 'B+';
    if (percentage >= 65) return 'B';
    if (percentage >= 55) return 'C+';
    if (percentage >= 45) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return marks.filter(mark => {
      const matchesSearch = 
        mark.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mark.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mark.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = selectedClass === 'all' || mark.class_name.includes(selectedClass);
      const matchesSubject = selectedSubject === 'all' || mark.subject === selectedSubject;
      const matchesExamType = selectedExamType === 'all' || mark.exam_type === selectedExamType;
      
      return matchesSearch && matchesClass && matchesSubject && matchesExamType;
    });
  }, [marks, searchQuery, selectedClass, selectedSubject, selectedExamType]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalMarks = marks.length;
    const avgPercentage = marks.length > 0 ? 
      marks.reduce((sum, mark) => sum + mark.percentage, 0) / marks.length : 0;
    
    const passCount = marks.filter(mark => mark.percentage >= 35).length;
    const passPercentage = totalMarks > 0 ? (passCount / totalMarks * 100).toFixed(1) : '0';
    
    const gradeDistribution = marks.reduce((acc, mark) => {
      acc[mark.grade] = (acc[mark.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPerformers = marks
      .slice()
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    return {
      totalMarks,
      avgPercentage: avgPercentage.toFixed(1),
      passCount,
      passPercentage,
      gradeDistribution,
      topPerformers,
    };
  }, [marks]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-600';
      case 'A': return 'bg-green-500';
      case 'B+': return 'bg-blue-500';
      case 'B': return 'bg-blue-400';
      case 'C+': return 'bg-yellow-500';
      case 'C': return 'bg-yellow-400';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const columns = [
    {
      key: 'student_name',
      header: 'Student',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {value.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-semibold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{row.roll_number} • {row.class_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{row.exam_type}</div>
        </div>
      ),
    },
    {
      key: 'obtained_marks',
      header: 'Marks',
      sortable: true,
      render: (value: number, row: any) => (
        <div className="text-center">
          <div className="font-bold text-lg text-slate-900">
            {value}/{row.total_marks}
          </div>
          <div className="text-sm text-slate-500">{row.percentage}%</div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${getGradeColor(value)} flex items-center justify-center`}>
            <span className="text-xs font-bold text-white">{value}</span>
          </div>
          <Badge 
            variant={value === 'F' ? 'destructive' : value.includes('A') ? 'default' : 'secondary'}
            className="font-medium"
          >
            {value}
          </Badge>
        </div>
      ),
    },
    {
      key: 'exam_date',
      header: 'Exam Date',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium">
          {new Date(value).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-slate-600">{value}</div>
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
              setEditingMark(row);
              form.reset({
                student_id: row.student_id.toString(),
                subject: row.subject,
                exam_type: row.exam_type,
                total_marks: row.total_marks.toString(),
                obtained_marks: row.obtained_marks.toString(),
                exam_date: row.exam_date,
                remarks: row.remarks || '',
              });
              setShowAddDialog(true);
            }}
            className="hover-elevate"
            data-testid={`button-edit-mark-${row.mark_id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover-elevate"
            data-testid={`button-view-mark-${row.mark_id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    const percentage = (parseInt(values.obtained_marks) / parseInt(values.total_marks)) * 100;
    const grade = calculateGrade(percentage);
    
    const markData = {
      mark_id: editingMark ? editingMark.mark_id : Date.now(),
      student_id: parseInt(values.student_id),
      student_name: students.find(s => s.id === values.student_id)?.name || '',
      roll_number: students.find(s => s.id === values.student_id)?.roll || '',
      class_name: "Grade 10-A", // This would come from student data
      subject: values.subject,
      exam_type: values.exam_type,
      total_marks: parseInt(values.total_marks),
      obtained_marks: parseInt(values.obtained_marks),
      percentage: Math.round(percentage * 100) / 100,
      grade,
      exam_date: values.exam_date,
      teacher: "Current Teacher",
      remarks: values.remarks || '',
    };

    if (editingMark) {
      setMarks(marks.map(m => m.mark_id === editingMark.mark_id ? markData : m));
      toast({
        title: "Marks Updated",
        description: `Marks updated for ${markData.student_name}`,
      });
    } else {
      setMarks([...marks, markData]);
      toast({
        title: "Marks Added", 
        description: `Marks added for ${markData.student_name}`,
      });
    }

    form.reset();
    setEditingMark(null);
    setShowAddDialog(false);
    console.log(editingMark ? 'Marks updated:' : 'Marks added:', values);
  };

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
              <h1 className="text-3xl font-bold text-slate-900">Marks & Grades Management</h1>
              <p className="text-slate-600 mt-1">Track exam results and academic performance</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => console.log('Export marks data')}
                variant="outline"
                className="hover-elevate"
                data-testid="button-export-marks"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="hover-elevate" data-testid="button-add-marks">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Marks
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingMark ? 'Edit Marks' : 'Add New Marks'}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="student_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-student">
                                  <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {students.map(student => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.name} ({student.roll})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-subject">
                                    <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subjects.map(subject => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="exam_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exam Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-exam-type">
                                    <SelectValue placeholder="Select exam type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {examTypes.map(type => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="total_marks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Marks</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="100" {...field} data-testid="input-total-marks" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="obtained_marks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Obtained Marks</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="85" {...field} data-testid="input-obtained-marks" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="exam_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-exam-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Additional comments..." {...field} data-testid="input-remarks" />
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
                            setEditingMark(null);
                            setShowAddDialog(false);
                          }}
                          data-testid="button-cancel-marks"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="button-save-marks">
                          {editingMark ? 'Update' : 'Add'} Marks
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Exams</p>
                    <p className="text-2xl font-bold text-slate-900">{statistics.totalMarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg Score</p>
                    <p className="text-2xl font-bold text-slate-900">{statistics.avgPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pass Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{statistics.passPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Top Score</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {statistics.topPerformers[0]?.percentage || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="marks" data-testid="tab-marks">All Marks</TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports" data-testid="tab-reports">Grade Reports</TabsTrigger>
              </TabsList>

              {/* All Marks Tab */}
              <TabsContent value="marks" className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search students, subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-marks"
                    />
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-filter-class">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.name}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-filter-subject">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-filter-exam-type">
                      <SelectValue placeholder="All Exam Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {examTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Table */}
                <EnhancedDataTable
                  data={filteredData}
                  columns={columns}
                  /* searchable prop not supported on EnhancedDataTable in types */
                  exportable={true}
                />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Grade Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(statistics.gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded ${getGradeColor(grade)} flex items-center justify-center`}>
                                <span className="text-xs font-bold text-white">{grade}</span>
                              </div>
                              <span className="font-medium">Grade {grade}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{count}</span>
                              <div className="w-20 h-2 bg-slate-200 rounded-full">
                                <div 
                                  className={`h-2 rounded-full ${getGradeColor(grade)}`}
                                  style={{ width: `${(count / statistics.totalMarks) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Top Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statistics.topPerformers.map((performer, index) => (
                          <div key={performer.mark_id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{performer.student_name}</div>
                              <div className="text-sm text-slate-500">{performer.subject} • {performer.exam_type}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{performer.percentage}%</div>
                              <div className="text-sm text-slate-500">{performer.grade}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Detailed grade reports and progress charts will be displayed here</p>
                  <p className="text-sm mt-2">Generate custom reports for individual students or classes</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarksManagement;