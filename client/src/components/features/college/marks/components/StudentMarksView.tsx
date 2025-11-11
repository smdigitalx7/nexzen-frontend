import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User,
  GraduationCap,
  FileText,
  Download,
  BookOpen,
  TrendingUp,
  Calendar,
  Hash,
  Award,
  CheckCircle2,
  XCircle,
  Percent,
} from "lucide-react";
import { useStudentMarks } from "@/lib/hooks/college";
import type { SubjectMarksDetail } from "@/lib/types/college";
import { cn } from "@/lib/utils";

interface StudentMarksViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admissionNo: string | null;
}

// Helper function to get grade color
const getGradeColor = (grade: string | null): string => {
  if (!grade) return "bg-gray-100 text-gray-700 border-gray-300";
  const gradeUpper = grade.toUpperCase();
  if (gradeUpper.includes("A+") || gradeUpper === "A+") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (gradeUpper.startsWith("A")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (gradeUpper.startsWith("B")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (gradeUpper.startsWith("C")) {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }
  return "bg-red-50 text-red-700 border-red-200";
};

// Helper function to get percentage color
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return "text-emerald-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-amber-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};

// Helper function to calculate overall marks for a subject
const calculateSubjectOverall = (subject: SubjectMarksDetail) => {
  const examTotal = subject.exam_marks.reduce(
    (sum, exam) => sum + exam.marks_obtained,
    0
  );
  const examMax = subject.exam_marks.reduce(
    (sum, exam) => sum + exam.max_marks,
    0
  );
  const testTotal = subject.test_marks.reduce(
    (sum, test) => sum + test.marks_obtained,
    0
  );
  const testMax = subject.test_marks.reduce(
    (sum, test) => sum + test.max_marks,
    0
  );
  const totalObtained = examTotal + testTotal;
  const totalMax = examMax + testMax;
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  return { totalObtained, totalMax, percentage };
};

export const StudentMarksView = ({
  open,
  onOpenChange,
  admissionNo,
}: StudentMarksViewProps) => {
  const { data, isLoading, error } = useStudentMarks(admissionNo);

  // Show all subjects with all marks
  const subjects = useMemo(() => {
    if (!data?.subjects) return [];
    return data.subjects;
  }, [data]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (!data?.subjects || subjects.length === 0) return null;
    const allOveralls = subjects.map(calculateSubjectOverall);
    const totalPercentage = allOveralls.reduce((sum, o) => sum + o.percentage, 0) / allOveralls.length;
    const totalObtained = allOveralls.reduce((sum, o) => sum + o.totalObtained, 0);
    const totalMax = allOveralls.reduce((sum, o) => sum + o.totalMax, 0);
    return {
      averagePercentage: totalPercentage,
      totalObtained,
      totalMax,
      totalSubjects: subjects.length,
    };
  }, [data, subjects]);

  const handleExport = () => {
    // TODO: Implement PDF export
    console.log("Export to PDF");
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Marks</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-red-600">
            Failed to load student marks. Please try again.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm border border-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Student Marks Report
                </DialogTitle>
                {data && (
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-600">
                    <User className="h-3 w-3" />
                    <span>{data.student_details.student_name}</span>
                    <span className="text-gray-300">•</span>
                    <span>
                      {data.student_details.class_name}
                      {data.student_details.group_name && ` - ${data.student_details.group_name}`}
                      {data.student_details.course_name && ` (${data.student_details.course_name})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pr-8">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 h-8">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loading />
            </div>
          ) : !data ? (
            <div className="text-center py-20 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No marks data available</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {/* Student Info Card and Overall Performance Card - Side by Side */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Student Info Card - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm flex-1 min-w-0"
                >
                  <div className="flex items-center flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-blue-100">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Admission No</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {data.student_details.admission_no}
                        </div>
                      </div>
                    </div>
                    {data.student_details.roll_number && (
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-green-100">
                          <Hash className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Roll Number</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {data.student_details.roll_number}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-orange-100">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Academic Year</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {data.student_details.academic_year}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Overall Statistics Card */}
                {overallStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg p-3 text-white shadow-lg flex-shrink-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-indigo-100">Overall Performance</span>
                        <span className="text-lg font-bold">
                          {overallStats.averagePercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-indigo-100">
                          {overallStats.totalObtained} / {overallStats.totalMax} marks • {overallStats.totalSubjects} subjects
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Subjects List - Grid Layout with Accordions */}
              {subjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">No marks data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subjects.map((subject, index) => {
                    const overall = calculateSubjectOverall(subject);
                    const isPass = overall.percentage >= 60;
                    
                    return (
                      <motion.div
                        key={subject.subject_name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value={subject.subject_name} className="border-0">
                            {/* Subject Header - Always Visible */}
                            <AccordionTrigger className="px-5 py-4 hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-blue-100">
                                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                                  </div>
                                  <div className="text-left">
                                    <h3 className="text-base font-bold text-gray-900">
                                      {subject.subject_name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-xs text-gray-500">
                                        {subject.exam_marks.length} Exam{subject.exam_marks.length !== 1 ? 's' : ''}
                                      </span>
                                      <span className="text-xs text-gray-300">•</span>
                                      <span className="text-xs text-gray-500">
                                        {subject.test_marks.length} Test{subject.test_marks.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className={cn("text-base font-bold", getPercentageColor(overall.percentage))}>
                                      {overall.percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {overall.totalObtained}/{overall.totalMax}
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "p-1 rounded",
                                    isPass ? "bg-emerald-100" : "bg-red-100"
                                  )}>
                                    {isPass ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    ) : (
                                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            
                            {/* Overall Summary - Always Visible */}
                            <div className="px-5 py-3 border-b border-gray-200 bg-blue-50/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs font-semibold text-gray-900">Overall</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-gray-900">
                                      {overall.totalObtained}
                                      <span className="text-[10px] font-normal text-gray-500">/{overall.totalMax}</span>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "text-xs font-bold px-1.5 py-0.5 rounded",
                                    overall.percentage >= 60 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                  )}>
                                    {overall.percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <AccordionContent className="px-5 pb-4">
                              <div className="space-y-3 pt-2">
                                {/* Exams Section */}
                                {subject.exam_marks.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="p-1 rounded bg-purple-100">
                                        <GraduationCap className="h-4 w-4 text-purple-600" />
                                      </div>
                                      <h4 className="text-sm font-semibold text-gray-900">
                                        Exams
                                      </h4>
                                      <Badge variant="outline" className="ml-auto text-xs px-2 py-0.5 h-5">
                                        {subject.exam_marks.length}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      {subject.exam_marks.map((exam, examIndex) => {
                                  const examPercentage = (exam.marks_obtained / exam.max_marks) * 100;
                                  const isPass = examPercentage >= 60;
                                  return (
                                        <div
                                          key={examIndex}
                                          className="bg-gray-50 rounded p-3.5 border border-gray-200"
                                        >
                                          <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <div className={cn(
                                                  "w-1.5 h-1.5 rounded-full",
                                                  isPass ? "bg-emerald-500" : "bg-red-500"
                                                )} />
                                                <div className="text-sm font-semibold text-gray-900 truncate">
                                                  {exam.exam_name}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                              <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">
                                                  {exam.marks_obtained}
                                                  <span className="text-xs font-normal text-gray-500">/{exam.max_marks}</span>
                                                </div>
                                                <div className={cn(
                                                  "text-xs font-medium",
                                                  getPercentageColor(examPercentage)
                                                )}>
                                                  {examPercentage.toFixed(1)}%
                                                </div>
                                              </div>
                                              {exam.grade && (
                                                <Badge
                                                  variant="outline"
                                                  className={cn(
                                                    "text-xs font-semibold px-2 py-0.5 h-5",
                                                    getGradeColor(exam.grade)
                                                  )}
                                                >
                                                  {exam.grade}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    </div>
                                  </div>
                                )}

                                {/* Tests Section */}
                                {subject.test_marks.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="p-1 rounded bg-green-100">
                                        <FileText className="h-4 w-4 text-green-600" />
                                      </div>
                                      <h4 className="text-sm font-semibold text-gray-900">
                                        Tests
                                      </h4>
                                      <Badge variant="outline" className="ml-auto text-xs px-2 py-0.5 h-5">
                                        {subject.test_marks.length}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      {subject.test_marks.map((test, testIndex) => {
                                  const testPercentage = (test.marks_obtained / test.max_marks) * 100;
                                  const isPass = testPercentage >= 60;
                                  return (
                                        <div
                                          key={testIndex}
                                          className="bg-gray-50 rounded p-3.5 border border-gray-200"
                                        >
                                          <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <div className={cn(
                                                  "w-1.5 h-1.5 rounded-full",
                                                  isPass ? "bg-emerald-500" : "bg-red-500"
                                                )} />
                                                <div className="text-sm font-semibold text-gray-900 truncate">
                                                  {test.test_name}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                              <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">
                                                  {test.marks_obtained}
                                                  <span className="text-xs font-normal text-gray-500">/{test.max_marks}</span>
                                                </div>
                                                <div className={cn(
                                                  "text-xs font-medium",
                                                  getPercentageColor(testPercentage)
                                                )}>
                                                  {testPercentage.toFixed(1)}%
                                                </div>
                                              </div>
                                              {test.grade && (
                                                <Badge
                                                  variant="outline"
                                                  className={cn(
                                                    "text-xs font-semibold px-2 py-0.5 h-5",
                                                    getGradeColor(test.grade)
                                                  )}
                                                >
                                                  {test.grade}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

