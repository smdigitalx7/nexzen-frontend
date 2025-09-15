import { useState } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Eye, Users, Calendar, Trophy, BookOpen, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { EnhancedDataTable } from '@/components/EnhancedDataTable';
import { useAuthStore } from '@/store/authStore';

// Student ID generation utilities
const generateBranchCode = (branchName: string, branchType: string): string => {
  if (branchType === 'school') {
    if (branchName.includes('Nexzen')) return 'NZN';
    return 'SCH'; // Default school code
  } else if (branchType === 'college') {
    if (branchName.includes('Velocity')) return 'VLC';
    return 'CLG'; // Default college code
  }
  return 'GEN'; // Generic code
};

const generateAcademicYear = (): string => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Academic year starts from April (month 3)
  let startYear, endYear;
  if (currentMonth >= 3) { // April onwards
    startYear = currentYear;
    endYear = currentYear + 1;
  } else { // January to March
    startYear = currentYear - 1;
    endYear = currentYear;
  }
  
  return `${startYear.toString().slice(-2)}${endYear.toString().slice(-2)}`;
};

const generateStudentId = (branchCode: string, academicYear: string, sequenceNumber: number): string => {
  const paddedNumber = sequenceNumber.toString().padStart(3, '0');
  return `${branchCode}/${academicYear}/${paddedNumber}`;
};

// Mock student data with standardized Student ID format - TODO: remove mock functionality  
const baseMockStudents = [
  {
    student_name: 'Aarav Sharma',
    father_name: 'Rajesh Sharma',
    mother_name: 'Priya Sharma',
    gender: 'Male',
    dob: '2010-05-15',
    class: 'Class 8A',
    father_mobile: '+91-9876543210',
    attendance_rate: 92,
    fee_status: 'Paid',
    transport: 'Route 3',
    is_active: true,
    branch_name: 'Nexzen School',
    branch_type: 'school' as const,
    admission_year: 2020
  },
  {
    student_name: 'Ananya Patel',
    father_name: 'Suresh Patel',
    mother_name: 'Kavitha Patel',
    gender: 'Female',
    dob: '2011-03-22',
    class: 'Class 7B',
    father_mobile: '+91-9876543211',
    attendance_rate: 88,
    fee_status: 'Pending',
    transport: 'Route 1',
    is_active: true,
    branch_name: 'Nexzen School',
    branch_type: 'school' as const,
    admission_year: 2019
  },
  {
    student_name: 'Arjun Krishnan',
    father_name: 'Vivek Krishnan',
    mother_name: 'Lakshmi Krishnan',
    gender: 'Male',
    dob: '2012-01-10',
    class: 'Class 6A',
    father_mobile: '+91-9876543212',
    attendance_rate: 95,
    fee_status: 'Paid',
    transport: 'Route 2',
    is_active: true,
    branch_name: 'Nexzen School',
    branch_type: 'school' as const,
    admission_year: 2021
  },
  {
    student_name: 'Ishika Reddy',
    father_name: 'Ravi Reddy',
    mother_name: 'Sunitha Reddy',
    gender: 'Female',
    dob: '2010-12-05',
    class: 'Class 8B',
    father_mobile: '+91-9876543213',
    attendance_rate: 85,
    fee_status: 'Overdue',
    transport: 'Route 1',
    is_active: true,
    branch_name: 'Nexzen School',
    branch_type: 'school' as const,
    admission_year: 2020
  },
  {
    student_name: 'Rohan Kumar',
    father_name: 'Amit Kumar',
    mother_name: 'Sonia Kumar',
    gender: 'Male',
    dob: '2005-08-20',
    class: 'BSc Computer Science - Year 2',
    father_mobile: '+91-9876543214',
    attendance_rate: 89,
    fee_status: 'Paid',
    transport: 'None',
    is_active: true,
    branch_name: 'Velocity College',
    branch_type: 'college' as const,
    admission_year: 2022
  },
  {
    student_name: 'Priya Verma',
    father_name: 'Sunil Verma',
    mother_name: 'Kavita Verma',
    gender: 'Female',
    dob: '2006-02-14',
    class: 'BCA - Year 1',
    father_mobile: '+91-9876543215',
    attendance_rate: 91,
    fee_status: 'Paid',
    transport: 'None',
    is_active: true,
    branch_name: 'Velocity College',
    branch_type: 'college' as const,
    admission_year: 2024
  }
];

// Generate mock students with proper Student IDs
const generateMockStudents = () => {
  // Group students by branch and academic year for proper sequencing
  const groupedStudents: { [key: string]: typeof baseMockStudents } = {};
  
  baseMockStudents.forEach(student => {
    const branchCode = generateBranchCode(student.branch_name, student.branch_type);
    // Derive academic year from admission year instead of current date
    const academicYear = `${student.admission_year.toString().slice(-2)}${(student.admission_year + 1).toString().slice(-2)}`;
    const key = `${branchCode}-${academicYear}`;
    
    if (!groupedStudents[key]) {
      groupedStudents[key] = [];
    }
    groupedStudents[key].push(student);
  });
  
  // Generate IDs with proper per-branch-year sequencing
  const studentsWithIds: any[] = [];
  let globalId = 1;
  
  Object.keys(groupedStudents).forEach(key => {
    const [branchCode, academicYear] = key.split('-');
    
    groupedStudents[key].forEach((student, branchIndex) => {
      const sequenceNumber = branchIndex + 1; // Per-branch-year sequence
      
      studentsWithIds.push({
        ...student,
        student_id: globalId.toString(),
        student_code: generateStudentId(branchCode, academicYear, sequenceNumber),
        admission_no: `${branchCode}${student.admission_year}${sequenceNumber.toString().padStart(3, '0')}`,
      });
      
      globalId++;
    });
  });
  
  return studentsWithIds;
};

const mockStudents = generateMockStudents();

const StudentManagement = () => {
  const { currentBranch } = useAuthStore();
  const [allStudents] = useState(mockStudents);
  
  // Filter students based on current branch
  const students = allStudents.filter(student => 
    currentBranch ? student.branch_name === currentBranch.branch_name : true
  );

  const getGenderColor = (gender: string) => {
    return gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
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

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'student_code',
      header: 'Student ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <IdCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-mono font-semibold text-slate-900">{row.original.student_code}</div>
            <div className="text-xs text-slate-500">ID: {row.original.student_id}</div>
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
              {row.original.class}
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
      accessorKey: 'father_name',
      header: 'Father Name',
      cell: ({ row }) => (
        <span title={row.original.father_name}>
          {truncateText(row.original.father_name)}
        </span>
      ),
    },
    {
      accessorKey: 'class',
      header: 'Class',
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => (
        <Badge className={getGenderColor(row.original.gender)}>
          {row.original.gender}
        </Badge>
      ),
    },
    {
      accessorKey: 'attendance_rate',
      header: 'Attendance',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.attendance_rate} className="w-16 h-2" />
          <span className="text-sm">{row.original.attendance_rate}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'fee_status',
      header: 'Fee Status',
      cell: ({ row }) => (
        <Badge className={getFeeStatusColor(row.original.fee_status)}>
          {row.original.fee_status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover-elevate">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover-elevate">
            <Edit className="h-4 w-4" />
          </Button>
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
      title: 'Average Attendance',
      value: `${Math.round(students.reduce((acc, s) => acc + s.attendance_rate, 0) / students.length)}%`,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Fee Collected',
      value: `${students.filter(s => s.fee_status === 'Paid').length}/${students.length}`,
      icon: Trophy,
      color: 'text-purple-600'
    },
    {
      title: 'Active Classes',
      value: new Set(students.map(s => s.class)).size.toString(),
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
              <span className="text-xs text-slate-500">
                Student ID Format: {generateBranchCode(currentBranch.branch_name, currentBranch.branch_type)}/{generateAcademicYear()}/XXX
              </span>
            </div>
          )}
        </div>
        <Button className="hover-elevate" data-testid="button-add-student">
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
      <EnhancedDataTable
        data={students}
        columns={columns}
        title="Students"
        searchKey="student_name"
        exportable={true}
        selectable={true}
      />
    </motion.div>
  );
};

export default StudentManagement;