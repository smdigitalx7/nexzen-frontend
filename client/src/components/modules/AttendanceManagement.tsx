import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Users, Check, X, Filter, Download, BookOpen, Clock, TrendingUp, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDataTable } from '@/components/EnhancedDataTable';
import { useToast } from '@/hooks/use-toast';

// Mock data for attendance
const mockAttendanceData = [
  {
    attendance_id: 1,
    student_id: 1,
    student_name: "John Smith",
    class_id: 1,
    class_name: "Grade 10-A",
    date: "2024-01-15",
    status: "present",
    marked_by: "Mrs. Sarah Wilson",
    marked_at: "09:15:00",
    subject: "Mathematics",
  },
  {
    attendance_id: 2,
    student_id: 2,
    student_name: "Emma Johnson",
    class_id: 1,
    class_name: "Grade 10-A",
    date: "2024-01-15",
    status: "absent",
    marked_by: "Mrs. Sarah Wilson", 
    marked_at: "09:15:00",
    subject: "Mathematics",
  },
  {
    attendance_id: 3,
    student_id: 3,
    student_name: "Michael Brown",
    class_id: 1,
    class_name: "Grade 10-A",
    date: "2024-01-15",
    status: "late",
    marked_by: "Mrs. Sarah Wilson",
    marked_at: "09:15:00",
    subject: "Mathematics",
  },
];

const mockStudentsData = [
  { student_id: 1, student_name: "John Smith", roll_number: "10A001", class_name: "Grade 10-A" },
  { student_id: 2, student_name: "Emma Johnson", roll_number: "10A002", class_name: "Grade 10-A" },
  { student_id: 3, student_name: "Michael Brown", roll_number: "10A003", class_name: "Grade 10-A" },
  { student_id: 4, student_name: "Sarah Davis", roll_number: "10A004", class_name: "Grade 10-A" },
  { student_id: 5, student_name: "James Wilson", roll_number: "10A005", class_name: "Grade 10-A" },
];

const AttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState(mockAttendanceData);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activeTab, setActiveTab] = useState('mark');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

  // Mock class data for the dropdown
  const classes = [
    { id: '1', name: 'Grade 10-A', students: 32 },
    { id: '2', name: 'Grade 9-B', students: 28 },
    { id: '3', name: 'Grade 8-A', students: 30 },
  ];

  const subjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check className="h-4 w-4" />;
      case 'absent': return <X className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Mark attendance for a student
  const markAttendance = (studentId: number, status: string) => {
    // Validate that concrete selections are made
    if (selectedClass === 'all') {
      toast({
        title: "Error",
        description: "Please select a specific class before marking attendance",
        variant: "destructive",
      });
      return;
    }

    if (selectedSubject === 'all') {
      toast({
        title: "Error", 
        description: "Please select a specific subject before marking attendance",
        variant: "destructive",
      });
      return;
    }

    const existingRecord = attendanceRecords.find(r => 
      r.student_id === studentId && 
      r.date === selectedDate?.toISOString().split('T')[0]
    );

    const student = mockStudentsData.find(s => s.student_id === studentId);
    
    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(attendanceRecords.map(r =>
        r.attendance_id === existingRecord.attendance_id
          ? { ...r, status, marked_at: new Date().toLocaleTimeString() }
          : r
      ));
    } else {
      // Create new record with concrete values
      const newRecord = {
        attendance_id: Date.now(),
        student_id: studentId,
        student_name: student?.student_name || '',
        class_id: parseInt(selectedClass),
        class_name: student?.class_name || '',
        date: selectedDate?.toISOString().split('T')[0] || '',
        status,
        marked_by: "Current User",
        marked_at: new Date().toLocaleTimeString(),
        subject: selectedSubject,
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }

    toast({
      title: "Attendance Marked",
      description: `${student?.student_name} marked as ${status}`,
    });
  };

  // Get attendance status for a student on selected date
  const getStudentAttendanceStatus = (studentId: number) => {
    const record = attendanceRecords.find(r => 
      r.student_id === studentId && 
      r.date === selectedDate?.toISOString().split('T')[0]
    );
    return record?.status || 'unmarked';
  };

  // Filtered attendance data for reports
  const filteredAttendanceData = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesClass = selectedClass === 'all' || record.class_id.toString() === selectedClass;
      const matchesSubject = selectedSubject === 'all' || record.subject === selectedSubject;
      const matchesSearch = record.student_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSubject && matchesSearch;
    });
  }, [attendanceRecords, selectedClass, selectedSubject, searchQuery]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    
    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      presentPercentage: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : '0',
      absentPercentage: totalRecords > 0 ? ((absentCount / totalRecords) * 100).toFixed(1) : '0',
    };
  }, [attendanceRecords]);

  const attendanceColumns = [
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
            <div className="text-sm text-slate-500">{row.class_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
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
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="font-medium">
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(value)}`}>
          {getStatusIcon(value)}
          <span className="capitalize">{value}</span>
        </div>
      ),
    },
    {
      key: 'marked_by',
      header: 'Marked By',
      sortable: true,
    },
    {
      key: 'marked_at',
      header: 'Time',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-slate-600 font-mono">
          {value}
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
              <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
              <p className="text-slate-600 mt-1">Track and manage student attendance with calendar view</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => console.log('Export attendance data')}
                variant="outline"
                className="hover-elevate"
                data-testid="button-export-attendance"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Present</p>
                    <p className="text-2xl font-bold text-slate-900">{attendanceStats.presentCount}</p>
                    <p className="text-xs text-green-600">{attendanceStats.presentPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <X className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Absent</p>
                    <p className="text-2xl font-bold text-slate-900">{attendanceStats.absentCount}</p>
                    <p className="text-xs text-red-600">{attendanceStats.absentPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Late</p>
                    <p className="text-2xl font-bold text-slate-900">{attendanceStats.lateCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Records</p>
                    <p className="text-2xl font-bold text-slate-900">{attendanceStats.totalRecords}</p>
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
                <TabsTrigger value="mark" data-testid="tab-mark-attendance">Mark Attendance</TabsTrigger>
                <TabsTrigger value="calendar" data-testid="tab-calendar-view">Calendar View</TabsTrigger>
                <TabsTrigger value="reports" data-testid="tab-attendance-reports">Reports</TabsTrigger>
              </TabsList>

              {/* Mark Attendance Tab */}
              <TabsContent value="mark" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Filters and Controls */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Attendance Controls</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Select Date</label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                            data-testid="calendar-attendance-date"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Class</label>
                          <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger data-testid="select-attendance-class">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Classes</SelectItem>
                              {classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name} ({cls.students} students)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Subject</label>
                          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger data-testid="select-attendance-subject">
                              <SelectValue placeholder="Select subject" />
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
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Student List */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Student Attendance - {selectedDate?.toDateString() || 'Select Date'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockStudentsData.map(student => {
                            const currentStatus = getStudentAttendanceStatus(student.student_id);
                            return (
                              <motion.div
                                key={student.student_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-white">
                                      {student.student_name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900">{student.student_name}</div>
                                    <div className="text-sm text-slate-500">Roll: {student.roll_number}</div>
                                  </div>
                                  {currentStatus !== 'unmarked' && (
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                                      {getStatusIcon(currentStatus)}
                                      <span className="capitalize">{currentStatus}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={currentStatus === 'present' ? 'default' : 'outline'}
                                    onClick={() => markAttendance(student.student_id, 'present')}
                                    className="hover-elevate"
                                    data-testid={`button-present-${student.student_id}`}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
                                    onClick={() => markAttendance(student.student_id, 'absent')}
                                    className="hover-elevate"
                                    data-testid={`button-absent-${student.student_id}`}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Absent
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={currentStatus === 'late' ? 'secondary' : 'outline'}
                                    onClick={() => markAttendance(student.student_id, 'late')}
                                    className="hover-elevate"
                                    data-testid={`button-late-${student.student_id}`}
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Late
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Calendar View Tab */}
              <TabsContent value="calendar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Calendar</CardTitle>
                    <p className="text-sm text-slate-600">View attendance patterns across dates</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                        data-testid="button-prev-month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h3 className="text-lg font-semibold">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                        data-testid="button-next-month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center py-8 text-slate-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Calendar view with attendance heatmap will be displayed here</p>
                      <p className="text-sm mt-2">Shows attendance percentage for each day</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-attendance"
                    />
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-report-class">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-report-subject">
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
                </div>

                {/* Data Table */}
                <EnhancedDataTable
                  data={filteredAttendanceData}
                  columns={attendanceColumns}
                  searchable={false}
                  exportable={true}
                  filename="attendance-report"
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;