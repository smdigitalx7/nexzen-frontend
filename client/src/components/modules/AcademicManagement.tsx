import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  Award,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  School,
  Building2,
  Calculator,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";

// Mock data for academic management
const mockAcademicYears = [
  {
    id: 1,
    year_name: "2024-25",
    start_date: "2024-04-01",
    end_date: "2025-03-31",
    active: true,
    branch_type: "school",
    students_count: 1250,
    teachers_count: 45,
  },
  {
    id: 2,
    year_name: "2024-26",
    start_date: "2024-04-01",
    end_date: "2026-03-31",
    active: true,
    branch_type: "college",
    students_count: 320,
    teachers_count: 18,
  },
];

const mockClasses = [
  {
    id: 1,
    class_name: "Class 8",
    academic_year_id: 1,
    academic_year: "2024-25",
    branch_type: "school",
    sections_count: 3,
    students_count: 105,
    subjects_count: 6,
    active: true,
  },
  {
    id: 2,
    class_name: "Class 9",
    academic_year_id: 1,
    academic_year: "2024-25",
    branch_type: "school",
    sections_count: 2,
    students_count: 78,
    subjects_count: 7,
    active: true,
  },
  {
    id: 3,
    class_name: "1st Year MPC",
    academic_year_id: 2,
    academic_year: "2024-26",
    branch_type: "college",
    sections_count: 2,
    students_count: 45,
    subjects_count: 5,
    active: true,
  },
];

const mockSubjects = [
  {
    id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH001",
    class_range: "6-10",
    branch_type: "school",
    teacher_id: "EMP001",
    teacher_name: "Dr. Rajesh Kumar",
    max_marks: 100,
    pass_marks: 35,
    active: true,
  },
  {
    id: 2,
    subject_name: "Physics",
    subject_code: "PHY001",
    class_range: "9-10",
    branch_type: "school",
    teacher_id: "EMP002",
    teacher_name: "Prof. Suresh Patel",
    max_marks: 100,
    pass_marks: 35,
    active: true,
  },
  {
    id: 3,
    subject_name: "Mathematics",
    subject_code: "MATH101",
    class_range: "1st-2nd Year",
    branch_type: "college",
    teacher_id: "EMP010",
    teacher_name: "Dr. Vikram Singh",
    max_marks: 100,
    pass_marks: 40,
    active: true,
  },
];

const mockExams = [
  {
    id: 1,
    exam_name: "Half Yearly Exam",
    exam_type: "Formal",
    academic_year_id: 1,
    academic_year: "2024-25",
    class_range: "6-10",
    start_date: "2024-10-15",
    end_date: "2024-10-25",
    pass_marks: 35,
    max_marks: 100,
    status: "completed",
    students_count: 450,
  },
  {
    id: 2,
    exam_name: "Unit Test 1",
    exam_type: "Test",
    academic_year_id: 1,
    academic_year: "2024-25",
    class_range: "6-10",
    start_date: "2024-08-15",
    end_date: "2024-08-20",
    pass_marks: 40,
    max_marks: 50,
    status: "completed",
    students_count: 450,
  },
  {
    id: 3,
    exam_name: "Mid Term Exam",
    exam_type: "Formal",
    academic_year_id: 2,
    academic_year: "2024-26",
    class_range: "1st-2nd Year",
    start_date: "2024-11-01",
    end_date: "2024-11-10",
    pass_marks: 40,
    max_marks: 100,
    status: "scheduled",
    students_count: 320,
  },
];

const mockTeacherAssignments = [
  {
    id: 1,
    teacher_id: "EMP001",
    teacher_name: "Dr. Rajesh Kumar",
    subject_id: 1,
    subject_name: "Mathematics",
    class_id: 1,
    class_name: "Class 8",
    section_name: "A",
    academic_year_id: 1,
    academic_year: "2024-25",
    active: true,
    students_count: 35,
  },
  {
    id: 2,
    teacher_id: "EMP002",
    teacher_name: "Prof. Suresh Patel",
    subject_id: 2,
    subject_name: "Physics",
    class_id: 2,
    class_name: "Class 9",
    section_name: "A",
    academic_year_id: 1,
    academic_year: "2024-25",
    active: true,
    students_count: 38,
  },
  {
    id: 3,
    teacher_id: "EMP010",
    teacher_name: "Dr. Vikram Singh",
    subject_id: 3,
    subject_name: "Mathematics",
    class_id: 3,
    class_name: "1st Year MPC",
    section_name: "A",
    academic_year_id: 2,
    academic_year: "2024-26",
    active: true,
    students_count: 25,
  },
];

const mockStudentMarks = [
  {
    id: 1,
    student_id: "STU2024156",
    student_name: "Priya Patel",
    exam_id: 1,
    exam_name: "Half Yearly Exam",
    subject_id: 1,
    subject_name: "Mathematics",
    marks_obtained: 85,
    max_marks: 100,
    percentage: 85,
    grade: "A",
    status: "Present",
    exam_date: "2024-10-20",
  },
  {
    id: 2,
    student_id: "STU2024157",
    student_name: "Arjun Sharma",
    exam_id: 1,
    exam_name: "Half Yearly Exam",
    subject_id: 1,
    subject_name: "Mathematics",
    marks_obtained: 72,
    max_marks: 100,
    percentage: 72,
    grade: "B",
    status: "Present",
    exam_date: "2024-10-20",
  },
  {
    id: 3,
    student_id: "STU2024158",
    student_name: "Sneha Reddy",
    exam_id: 3,
    exam_name: "Mid Term Exam",
    subject_id: 3,
    subject_name: "Mathematics",
    marks_obtained: 92,
    max_marks: 100,
    percentage: 92,
    grade: "A+",
    status: "Present",
    exam_date: "2024-11-05",
  },
];

const AcademicManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const [academicYears, setAcademicYears] = useState(mockAcademicYears);
  const [classes, setClasses] = useState(mockClasses);
  const [subjects, setSubjects] = useState(mockSubjects);
  const [exams, setExams] = useState(mockExams);
  const [teacherAssignments, setTeacherAssignments] = useState(
    mockTeacherAssignments
  );
  const [studentMarks, setStudentMarks] = useState(mockStudentMarks);
  const [activeTab, setActiveTab] = useState("years");
  const [isAddAcademicYearOpen, setIsAddAcademicYearOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchType, setSelectedBranchType] = useState("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [uploadResult, setUploadResult] = useState<string>("");
  const [newAcademicYear, setNewAcademicYear] = useState({
    year_name: "",
    start_date: "",
    end_date: "",
    branch_type: currentBranch?.branch_type || "school",
  });
  const [newSubject, setNewSubject] = useState({
    subject_name: "",
    subject_code: "",
    class_range: "",
    teacher_id: "",
    max_marks: "",
    pass_marks: "",
  });
  const [newExam, setNewExam] = useState({
    exam_name: "",
    exam_type: "",
    academic_year_id: "",
    class_range: "",
    start_date: "",
    end_date: "",
    pass_marks: "",
    max_marks: "",
  });

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800 border-green-200";
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "D":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "F":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ongoing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAddAcademicYear = () => {
    const newId = Math.max(...academicYears.map((y) => y.id)) + 1;
    const academicYear = {
      id: newId,
      ...newAcademicYear,
      active: true,
      students_count: 0,
      teachers_count: 0,
    };

    setAcademicYears([...academicYears, academicYear]);
    setNewAcademicYear({
      year_name: "",
      start_date: "",
      end_date: "",
      branch_type: currentBranch?.branch_type || "school",
    });
    setIsAddAcademicYearOpen(false);
  };

  const handleAddSubject = () => {
    const newId = Math.max(...subjects.map((s) => s.id)) + 1;
    const subject = {
      id: newId,
      ...newSubject,
      branch_type: currentBranch?.branch_type || "school",
      teacher_name: "New Teacher", // This would be fetched from employee data
      active: true,
    };

    setSubjects([...subjects, subject]);
    setNewSubject({
      subject_name: "",
      subject_code: "",
      class_range: "",
      teacher_id: "",
      max_marks: "",
      pass_marks: "",
    });
    setIsAddSubjectOpen(false);
  };

  const handleAddExam = () => {
    const newId = Math.max(...exams.map((e) => e.id)) + 1;
    const academicYear = academicYears.find(
      (y) => y.id === parseInt(newExam.academic_year_id)
    );
    const exam = {
      id: newId,
      ...newExam,
      academic_year: academicYear?.year_name || "",
      status: "scheduled",
      students_count: 0,
    };

    setExams([...exams, exam]);
    setNewExam({
      exam_name: "",
      exam_type: "",
      academic_year_id: "",
      class_range: "",
      start_date: "",
      end_date: "",
      pass_marks: "",
      max_marks: "",
    });
    setIsAddExamOpen(false);
  };

  const filteredAcademicYears = academicYears.filter(
    (year) =>
      year.year_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBranchType === "all" || year.branch_type === selectedBranchType)
  );

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBranchType === "all" ||
        subject.branch_type === selectedBranchType)
  );

  const filteredExams = exams.filter(
    (exam) =>
      exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBranchType === "all" ||
        exam.academic_year_id ===
          academicYears.find((y) => y.branch_type === selectedBranchType)?.id)
  );

  const totalStudents = academicYears.reduce(
    (sum, year) => sum + year.students_count,
    0
  );
  const totalTeachers = academicYears.reduce(
    (sum, year) => sum + year.teachers_count,
    0
  );
  const activeExams = exams.filter(
    (exam) => exam.status === "scheduled" || exam.status === "ongoing"
  ).length;
  const completedExams = exams.filter(
    (exam) => exam.status === "completed"
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Academic Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive academic structure and performance management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentBranch?.branch_type === "school" ? (
              <School className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Academic Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all academic years
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalTeachers}
            </div>
            <p className="text-xs text-muted-foreground">Teaching staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {activeExams}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled/Ongoing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Exams
            </CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {completedExams}
            </div>
            <p className="text-xs text-muted-foreground">
              Finished assessments
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="years">Academic Years</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="marks">Student Marks</TabsTrigger>
            <TabsTrigger value="sections">Section Mapping</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* Academic Years Tab */}
          <TabsContent value="years" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search academic years..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={selectedBranchType}
                  onValueChange={setSelectedBranchType}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Branch Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">
                  {filteredAcademicYears.length} Years
                </Badge>
              </div>
              <Dialog
                open={isAddAcademicYearOpen}
                onOpenChange={setIsAddAcademicYearOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Academic Year
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Academic Year</DialogTitle>
                    <DialogDescription>
                      Create a new academic year for planning and organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="year_name">Academic Year</Label>
                      <Input
                        id="year_name"
                        value={newAcademicYear.year_name}
                        onChange={(e) =>
                          setNewAcademicYear({
                            ...newAcademicYear,
                            year_name: e.target.value,
                          })
                        }
                        placeholder="2024-25"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newAcademicYear.start_date}
                          onChange={(e) =>
                            setNewAcademicYear({
                              ...newAcademicYear,
                              start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newAcademicYear.end_date}
                          onChange={(e) =>
                            setNewAcademicYear({
                              ...newAcademicYear,
                              end_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="branch_type">Branch Type</Label>
                      <Select
                        value={newAcademicYear.branch_type}
                        onValueChange={(value) =>
                          setNewAcademicYear({
                            ...newAcademicYear,
                            branch_type: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddAcademicYearOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddAcademicYear}>
                      Add Academic Year
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAcademicYears.map((year, index) => (
                <motion.div
                  key={year.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {year.year_name}
                            </CardTitle>
                            <CardDescription className="capitalize">
                              {year.branch_type}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={year.active ? "default" : "secondary"}>
                          {year.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Start Date:</span>
                          <span className="font-medium">
                            {new Date(year.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>End Date:</span>
                          <span className="font-medium">
                            {new Date(year.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Students:</span>
                          <span className="font-medium text-blue-600">
                            {year.students_count}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Teachers:</span>
                          <span className="font-medium text-green-600">
                            {year.teachers_count}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    classes.filter((c) =>
                      c.class_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Classes
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes
                .filter((c) =>
                  c.class_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {classItem.class_name}
                              </CardTitle>
                              <CardDescription>
                                {classItem.academic_year}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={classItem.active ? "default" : "secondary"}
                          >
                            {classItem.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Sections:</span>
                            <span className="font-medium">
                              {classItem.sections_count}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Students:</span>
                            <span className="font-medium text-blue-600">
                              {classItem.students_count}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Subjects:</span>
                            <span className="font-medium text-green-600">
                              {classItem.subjects_count}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Type:</span>
                            <span className="font-medium capitalize">
                              {classItem.branch_type}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={selectedBranchType}
                  onValueChange={setSelectedBranchType}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Branch Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">
                  {filteredSubjects.length} Subjects
                </Badge>
              </div>
              <Dialog
                open={isAddSubjectOpen}
                onOpenChange={setIsAddSubjectOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                    <DialogDescription>
                      Create a new subject with teacher assignment
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subject_name">Subject Name</Label>
                        <Input
                          id="subject_name"
                          value={newSubject.subject_name}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              subject_name: e.target.value,
                            })
                          }
                          placeholder="Mathematics"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject_code">Subject Code</Label>
                        <Input
                          id="subject_code"
                          value={newSubject.subject_code}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              subject_code: e.target.value,
                            })
                          }
                          placeholder="MATH001"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="class_range">Class Range</Label>
                      <Input
                        id="class_range"
                        value={newSubject.class_range}
                        onChange={(e) =>
                          setNewSubject({
                            ...newSubject,
                            class_range: e.target.value,
                          })
                        }
                        placeholder="6-10 or 1st-2nd Year"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacher_id">Teacher ID</Label>
                      <Input
                        id="teacher_id"
                        value={newSubject.teacher_id}
                        onChange={(e) =>
                          setNewSubject({
                            ...newSubject,
                            teacher_id: e.target.value,
                          })
                        }
                        placeholder="EMP001"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max_marks">Max Marks</Label>
                        <Input
                          id="max_marks"
                          type="number"
                          value={newSubject.max_marks}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              max_marks: e.target.value,
                            })
                          }
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pass_marks">Pass Marks</Label>
                        <Input
                          id="pass_marks"
                          type="number"
                          value={newSubject.pass_marks}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              pass_marks: e.target.value,
                            })
                          }
                          placeholder="35"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSubjectOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubject}>Add Subject</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Class Range</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">
                      {subject.subject_name}
                    </TableCell>
                    <TableCell>{subject.subject_code}</TableCell>
                    <TableCell>{subject.class_range}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subject.teacher_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subject.teacher_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Max: {subject.max_marks}</div>
                        <div>Pass: {subject.pass_marks}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {subject.branch_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={selectedBranchType}
                  onValueChange={setSelectedBranchType}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Branch Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">{filteredExams.length} Exams</Badge>
              </div>
              <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Exam
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Exam</DialogTitle>
                    <DialogDescription>
                      Schedule a new examination or test
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="exam_name">Exam Name</Label>
                        <Input
                          id="exam_name"
                          value={newExam.exam_name}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              exam_name: e.target.value,
                            })
                          }
                          placeholder="Half Yearly Exam"
                        />
                      </div>
                      <div>
                        <Label htmlFor="exam_type">Exam Type</Label>
                        <Select
                          value={newExam.exam_type}
                          onValueChange={(value) =>
                            setNewExam({ ...newExam, exam_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Formal">Formal Exam</SelectItem>
                            <SelectItem value="Test">Test</SelectItem>
                            <SelectItem value="Quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="academic_year_id">Academic Year</Label>
                      <Select
                        value={newExam.academic_year_id}
                        onValueChange={(value) =>
                          setNewExam({ ...newExam, academic_year_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem
                              key={year.id}
                              value={year.id.toString()}
                            >
                              {year.year_name} - {year.branch_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="class_range">Class Range</Label>
                      <Input
                        id="class_range"
                        value={newExam.class_range}
                        onChange={(e) =>
                          setNewExam({
                            ...newExam,
                            class_range: e.target.value,
                          })
                        }
                        placeholder="6-10 or 1st-2nd Year"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newExam.start_date}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newExam.end_date}
                          onChange={(e) =>
                            setNewExam({ ...newExam, end_date: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max_marks">Max Marks</Label>
                        <Input
                          id="max_marks"
                          type="number"
                          value={newExam.max_marks}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              max_marks: e.target.value,
                            })
                          }
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pass_marks">Pass Marks</Label>
                        <Input
                          id="pass_marks"
                          type="number"
                          value={newExam.pass_marks}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              pass_marks: e.target.value,
                            })
                          }
                          placeholder="35"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddExamOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddExam}>Add Exam</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {exam.exam_name}
                            </CardTitle>
                            <CardDescription>{exam.exam_type}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Academic Year:</span>
                          <span className="font-medium">
                            {exam.academic_year}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Class Range:</span>
                          <span className="font-medium">
                            {exam.class_range}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {new Date(exam.start_date).toLocaleDateString()} -{" "}
                            {new Date(exam.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Students:</span>
                          <span className="font-medium text-blue-600">
                            {exam.students_count}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Marks:</span>
                          <span className="font-medium">
                            {exam.pass_marks}/{exam.max_marks}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Student Marks Tab */}
          <TabsContent value="marks" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search student marks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    studentMarks.filter(
                      (m) =>
                        m.student_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        m.exam_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        m.subject_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Records
                </Badge>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentMarks
                  .filter(
                    (m) =>
                      m.student_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      m.exam_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      m.subject_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((mark) => (
                    <TableRow key={mark.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mark.student_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {mark.student_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mark.exam_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(mark.exam_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{mark.subject_name}</TableCell>
                      <TableCell>
                        <div className="font-bold">
                          {mark.marks_obtained}/{mark.max_marks}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-blue-600">
                          {mark.percentage}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(mark.grade)}>
                          {mark.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{mark.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Section Mapping Tab */}
          <TabsContent value="sections" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={y.year_name}>
                      {y.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.class_name}>
                      {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Apply Filters</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Section Mapping</CardTitle>
                <CardDescription>
                  Assign or change sections mid-year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Button variant="outline">Assign Selected to A</Button>
                  <Button variant="outline">Assign Selected to B</Button>
                  <Button variant="outline">Assign Selected to C</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Current Section</TableHead>
                      <TableHead>Change To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentMarks.slice(0, 10).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.student_name}</TableCell>
                        <TableCell>{classes[0]?.class_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">A</Badge>
                        </TableCell>
                        <TableCell>
                          <Select>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enrollment Tracking Tab */}
          <TabsContent value="enrollment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-muted-foreground">
                    Awaiting admission
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Non-Converted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">5</div>
                  <p className="text-sm text-muted-foreground">
                    Follow-up required
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Dropouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">2</div>
                  <p className="text-sm text-muted-foreground">With remarks</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Enrollment List</CardTitle>
                <CardDescription>Reservations and status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reservation</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: "RSV24250001",
                        name: "Aarav S.",
                        status: "Pending",
                        remarks: "Docs awaited",
                      },
                      {
                        id: "RSV24250002",
                        name: "Divya M.",
                        status: "Dropout",
                        remarks: "Moved city",
                      },
                    ].map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.id}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.status === "Dropout"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.remarks}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CSV Upload</CardTitle>
                <CardDescription>
                  Upload monthly attendance (columns: student_id,date,status)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () =>
                      setUploadResult("Upload processed successfully (mock)");
                    reader.readAsText(file);
                  }}
                />
                {uploadResult && (
                  <p className="text-sm text-green-600 mt-2">{uploadResult}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Entry</CardTitle>
                <CardDescription>
                  Mark attendance for selected month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {studentMarks.slice(0, 6).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border rounded p-2 text-sm"
                    >
                      <span>{s.student_name}</span>
                      <Select>
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="P">Present</SelectItem>
                          <SelectItem value="A">Absent</SelectItem>
                          <SelectItem value="L">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Validation: Only P/A/L allowed. Duplicates ignored. (mock)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AcademicManagement;
