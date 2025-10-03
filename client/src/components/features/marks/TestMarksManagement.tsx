import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Search, Download, Edit, Trash2, FileText, Calculator, Award, BarChart3, Target, ClipboardList } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as AlertHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import { 
  useTestMarks,
  useCreateTestMark,
  useUpdateTestMark,
  useDeleteTestMark
} from '@/lib/hooks/useTestMarks';
import { useClasses, useStudents, useSubjects } from '@/lib/hooks/useSchool';
import { useAcademicData } from '@/lib/hooks/academic/useAcademicData';
import type { TestMarkWithDetails } from '@/lib/types/test-marks';

// Utility functions for grade calculation
const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};

const calculatePercentage = (marksObtained: number, maxMarks: number = 100): number => {
  return Math.round((marksObtained / maxMarks) * 100 * 10) / 10; // Round to 1 decimal place
};

const testMarkFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  test_id: z.string().min(1, "Test is required"),
  subject_id: z.string().min(1, "Subject is required"),
  marks_obtained: z.string().min(1, "Marks obtained is required"),
  percentage: z.string().min(1, "Percentage is required"),
  grade: z.string().min(1, "Grade is required"),
  conducted_at: z.string().min(1, "Test date is required"),
  remarks: z.string().optional(),
});

const TestMarksManagement = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Dialog states
  const [showTestMarkDialog, setShowTestMarkDialog] = useState(false);
  const [editingTestMark, setEditingTestMark] = useState<TestMarkWithDetails | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // API hooks
  const { data: classes = [] } = useClasses();

  // Auto-select first class when available
  if (!selectedClass && classes.length > 0) {
    setSelectedClass(classes[0].class_id.toString());
  }
  const { data: students = [] } = useStudents();
  const { data: subjects = [] } = useSubjects();
  const { tests = [] } = useAcademicData();

  // Test marks hooks - only fetch when class is selected
  const { data: testMarksData, isLoading: testMarksLoading, error: testMarksError } = useTestMarks(
    selectedClass ? {
      class_id: parseInt(selectedClass),
      subject_id: selectedSubject !== 'all' ? parseInt(selectedSubject) : undefined,
    } : undefined
  );
  const createTestMarkMutation = useCreateTestMark();
  const updateTestMarkMutation = useUpdateTestMark();
  const deleteTestMarkMutation = useDeleteTestMark();

  // Form
  const testMarkForm = useForm({
    resolver: zodResolver(testMarkFormSchema),
    defaultValues: {
      enrollment_id: '',
      test_id: '',
      subject_id: '',
      marks_obtained: '',
      percentage: '',
      grade: '',
      conducted_at: '',
      remarks: '',
    },
  });

  // Form handling functions
  const handleTestMarkSubmit = (values: any) => {
    const markData = {
      enrollment_id: parseInt(values.enrollment_id),
      test_id: parseInt(values.test_id),
      subject_id: parseInt(values.subject_id),
      marks_obtained: parseFloat(values.marks_obtained),
      percentage: parseFloat(values.percentage),
      grade: values.grade,
      conducted_at: values.conducted_at,
      remarks: values.remarks || '',
    };

    if (editingTestMark) {
      updateTestMarkMutation.mutate({
        id: editingTestMark.test_mark_id,
        data: {
          marks_obtained: markData.marks_obtained,
          percentage: markData.percentage,
          grade: markData.grade,
          remarks: markData.remarks,
          conducted_at: markData.conducted_at,
        },
      });
    } else {
      createTestMarkMutation.mutate(markData);
    }

    testMarkForm.reset();
    setEditingTestMark(null);
    setShowTestMarkDialog(false);
  };

  const handleEditTestMark = (mark: TestMarkWithDetails) => {
    setEditingTestMark(mark);
    testMarkForm.reset({
      enrollment_id: mark.enrollment_id.toString(),
      test_id: mark.test_id?.toString() || '',
      subject_id: mark.subject_id?.toString() || '',
      marks_obtained: mark.marks_obtained?.toString() || '0',
      percentage: mark.percentage?.toString() || '0',
      grade: mark.grade || '',
      conducted_at: mark.conducted_at || '',
      remarks: mark.remarks || '',
    });
    setShowTestMarkDialog(true);
  };

  const handleDeleteTestMark = (markId: number) => {
    setConfirmDeleteId(markId);
  };

  // Process and filter data - flatten grouped response from backend
  const testMarks = useMemo(() => {
    if (!testMarksData) return [];
    
    // Flatten the grouped response into individual marks
    const flattenedMarks: TestMarkWithDetails[] = [];
    testMarksData.forEach(group => {
      if (group.students) {
        group.students.forEach(student => {
          flattenedMarks.push({
            ...student,
            test_name: group.test_name,
            subject_name: group.subject_name,
            test_date: group.conducted_at,
            test_id: group.test_id,
            subject_id: group.subject_id,
          });
        });
      }
    });
    
    return flattenedMarks.filter(mark => {
      const matchesSearch = 
        mark.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mark.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mark.roll_number?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [testMarksData, searchQuery]);

  // Statistics calculations
  const testStatistics = useMemo(() => {
    const totalMarks = testMarks.length;
    const avgPercentage = testMarks.length > 0 ? 
      testMarks.reduce((sum, mark) => sum + (mark.percentage || 0), 0) / testMarks.length : 0;
    
    const passCount = testMarks.filter(mark => (mark.percentage || 0) >= 35).length;
    const passPercentage = totalMarks > 0 ? (passCount / totalMarks * 100).toFixed(1) : '0';
    
    const gradeDistribution = testMarks.reduce((acc, mark) => {
      const grade = mark.grade || 'F';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPerformers = testMarks
      .slice()
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 3);

    return {
      totalMarks,
      avgPercentage: avgPercentage.toFixed(1),
      passCount,
      passPercentage,
      gradeDistribution,
      topPerformers,
    };
  }, [testMarks]);

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

  // Table columns for test marks
  const testMarkColumns: ColumnDef<TestMarkWithDetails>[] = [
    {
      accessorKey: 'student_name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {row.original.student_name?.split(' ').map(n => n[0]).join('') || 'N/A'}
            </span>
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.original.student_name || 'N/A'}</div>
            <div className="text-sm text-slate-500">{row.original.roll_number || 'N/A'} • {row.original.section_name || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'subject_name',
      header: 'Subject',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-900">{row.original.subject_name || 'N/A'}</div>
          <div className="text-sm text-slate-500">{row.original.test_name || 'N/A'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'marks_obtained',
      header: 'Marks',
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-bold text-lg text-slate-900">
            {row.original.marks_obtained || 0}/{row.original.max_marks || 100}
          </div>
          <div className="text-sm text-slate-500">{row.original.percentage || 0}%</div>
        </div>
      ),
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }) => (
        <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold text-white ${getGradeColor(row.original.grade || 'F')}`}>
          {row.original.grade || 'F'}
        </div>
      ),
    },
    {
      accessorKey: 'conducted_at',
      header: 'Test Date',
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {row.original.conducted_at ? new Date(row.original.conducted_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : 'N/A'}
        </div>
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
            onClick={() => handleEditTestMark(row.original)}
            className="hover-elevate"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteTestMark(row.original.test_mark_id)}
            className="hover-elevate text-red-600 hover:text-red-700"
            aria-label="Delete test mark"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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
              <h1 className="text-3xl font-bold text-slate-900">Test Marks Management</h1>
              <p className="text-slate-600 mt-1">Track test results and academic performance</p>
              {!selectedClass && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Select a class from the dropdown below to view test marks data.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="hover-elevate"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={showTestMarkDialog} onOpenChange={setShowTestMarkDialog}>
                <DialogTrigger asChild>
                  <Button className="hover-elevate" >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Add Test Marks
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingTestMark ? 'Edit Test Mark' : 'Add New Test Mark'}</DialogTitle>
                </DialogHeader>
                <Form {...testMarkForm}>
                  <form onSubmit={testMarkForm.handleSubmit(handleTestMarkSubmit)} className="space-y-4">
                    <FormField
                      control={testMarkForm.control}
                      name="enrollment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingTestMark}>
                                <FormControl>
                              <SelectTrigger >
                                <SelectValue placeholder="Select student" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                              {students.map((student: any) => (
                                <SelectItem key={student.student_id} value={student.student_id.toString()}>
                                  {student.student_name} ({student.admission_no})
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
                        control={testMarkForm.control}
                        name="test_id"
                          render={({ field }) => (
                            <FormItem>
                            <FormLabel>Test</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingTestMark}>
                              <FormControl>
                                <SelectTrigger >
                                  <SelectValue placeholder="Select test" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tests.map((test: any) => (
                                  <SelectItem key={test.id} value={test.id.toString()}>
                                    {test.test_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                        control={testMarkForm.control}
                        name="subject_id"
                          render={({ field }) => (
                            <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingTestMark}>
                              <FormControl>
                                <SelectTrigger >
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjects.map((subject: any) => (
                                  <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                                    {subject.subject_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                      control={testMarkForm.control}
                      name="marks_obtained"
                        render={({ field }) => (
                          <FormItem>
                          <FormLabel>Marks Obtained</FormLabel>
                            <FormControl>
                            <Input 
                              type="number" 
                              placeholder="18" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                                
                                // Auto-calculate percentage and grade
                                if (value && !isNaN(Number(value))) {
                                  const marks = Number(value);
                                  const percentage = calculatePercentage(marks);
                                  const grade = calculateGrade(percentage);
                                  
                                  testMarkForm.setValue('percentage', percentage.toString());
                                  testMarkForm.setValue('grade', grade);
                                }
                              }}
                            />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={testMarkForm.control}
                          name="percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Percentage</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="90.0" step="0.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={testMarkForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C+">C+</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                  <SelectItem value="D">D</SelectItem>
                                  <SelectItem value="F">F</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={testMarkForm.control}
                        name="conducted_at"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                      control={testMarkForm.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks (Optional)</FormLabel>
                            <FormControl>
                            <Input placeholder="Additional comments..." {...field} />
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
                          testMarkForm.reset();
                          setEditingTestMark(null);
                          setShowTestMarkDialog(false);
                        }}
                        >
                          Cancel
                        </Button>
                      <Button type="submit" >
                        {editingTestMark ? 'Update' : 'Add'} Test Mark
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
                    <p className="text-sm font-medium text-slate-600">Total Test Marks</p>
                    <p className="text-2xl font-bold text-slate-900">{testStatistics.totalMarks}</p>
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
                    <p className="text-2xl font-bold text-slate-900">{testStatistics.avgPercentage}%</p>
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
                    <p className="text-2xl font-bold text-slate-900">{testStatistics.passPercentage}%</p>
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
                    <p className="text-2xl font-bold text-slate-900">{testStatistics.topPerformers[0]?.percentage || 0}%</p>
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
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[150px]" >
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-[150px]" >
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Table */}
            {!selectedClass ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Select a Class</h3>
                    <p className="text-slate-600 mt-1">
                      Please select a class from the dropdown above to view test marks.
                    </p>
                  </div>
                </div>
              </Card>
            ) : testMarksLoading ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600">Loading test marks...</p>
                </div>
              </Card>
            ) : testMarksError ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Error Loading Data</h3>
                    <p className="text-slate-600 mt-1">
                      {testMarksError?.message || 'Failed to load test marks. Please try again.'}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
            <EnhancedDataTable
                data={testMarks}
                columns={testMarkColumns}
              exportable={true}
            />
            )}
          </motion.div>
        </div>
      </div>
      {/* Confirm Delete Test Mark */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <AlertDialogContent>
          <AlertHeader>
            <AlertDialogTitle>Delete Test Mark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test mark? This action cannot be undone.
            </AlertDialogDescription>
          </AlertHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (confirmDeleteId) deleteTestMarkMutation.mutate(confirmDeleteId); setConfirmDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestMarksManagement;
