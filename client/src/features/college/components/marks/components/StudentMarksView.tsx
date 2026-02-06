import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/common/components/ui/accordion";
import {
  User,
  GraduationCap,
  FileText,
  BookOpen,
  TrendingUp,
  Calendar,
  Hash,
  Award,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { useStudentMarks } from "@/features/college/hooks";
import type { SubjectMarksDetail } from "@/features/college/types";
import { cn } from "@/common/utils";
import { exportStudentMarksToExcel, exportStudentMarksToPDF } from "@/common/utils/export/student-marks-export";
import { useToast } from "@/common/hooks/use-toast";

interface StudentMarksViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admissionNo: string | null;
}

// Helper function to get grade color (same as School)
const getGradeColor = (grade: string | null): string => {
  if (!grade) return "bg-slate-100 text-slate-700 border-slate-300";
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
  const { toast } = useToast();

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

  const handleExportExcel = async () => {
    if (!data) {
      toast({
        title: "No data available",
        description: "Please wait for the marks data to load.",
        variant: "destructive",
      });
      return;
    }

    try {
      const studentName = data.student_details.student_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await exportStudentMarksToExcel(data, `student-marks-${studentName}`);
      toast({
        title: "Export successful",
        variant: "success",
        description: "Student marks have been exported to Excel.",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export failed",
        description: "Failed to export marks to Excel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    if (!data) {
      toast({
        title: "No data available",
        description: "Please wait for the marks data to load.",
        variant: "destructive",
      });
      return;
    }

    try {
      const studentName = data.student_details.student_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      exportStudentMarksToPDF(data, `student-marks-${studentName}`);
      toast({
        title: "Export successful",
        variant: "success",
        description: "Student marks have been exported to PDF.",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Export failed",
        description: "Failed to export marks to PDF. Please try again.",
        variant: "destructive",
      });
    }
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
      <DialogContent 
        className="max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {/* Header - same structure as School */}
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Student Marks Report
                </DialogTitle>
                {data && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    <span>{data.student_details.student_name}</span>
                    <span>•</span>
                    <span>
                      {data.student_details.class_name}
                      {data.student_details.group_name && ` - ${data.student_details.group_name}`}
                      {data.student_details.course_name && ` (${data.student_details.course_name})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2" 
                disabled={!data || isLoading}
                onClick={handleExportExcel}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2" 
                disabled={!data || isLoading}
                onClick={handleExportPDF}
              >
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <Loader.Data message="Loading student marks data..." />
          ) : !data ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">No marks data available</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {/* Combined Student Info and Overall Performance Card - same as School */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center flex-wrap gap-6 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Admission No</div>
                        <div className="text-sm font-medium">
                          {data.student_details.admission_no}
                        </div>
                      </div>
                    </div>
                    {data.student_details.roll_number && (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                          <Hash className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">Roll Number</div>
                          <div className="text-sm font-medium">
                            {data.student_details.roll_number}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Academic Year</div>
                        <div className="text-sm font-medium">
                          {data.student_details.academic_year}
                        </div>
                      </div>
                    </div>
                  </div>
                  {overallStats && (
                    <div className="flex items-center gap-4 pl-6 border-l lg:border-l lg:border-t-0 border-t border-slate-200 pt-4 lg:pt-0">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-500 mb-1">
                          Overall Performance
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={cn("text-2xl font-bold", getPercentageColor(overallStats.averagePercentage))}>
                            {overallStats.averagePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {overallStats.totalObtained} / {overallStats.totalMax} marks • {overallStats.totalSubjects} subjects
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subjects List - same as School */}
              {subjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No marks data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjects.map((subject) => {
                    const overall = calculateSubjectOverall(subject);
                    const isPass = overall.percentage >= 60;
                    return (
                      <div
                        key={subject.subject_name}
                        className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                      >
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value={subject.subject_name} className="border-0">
                            <AccordionTrigger className="px-5 py-4 hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-2">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-slate-500" />
                                  </div>
                                  <div className="text-left">
                                    <h3 className="text-sm font-semibold">
                                      {subject.subject_name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-xs text-slate-500">
                                        {subject.exam_marks.length} Exam{subject.exam_marks.length !== 1 ? "s" : ""}
                                      </span>
                                      <span>•</span>
                                      <span className="text-xs text-slate-500">
                                        {subject.test_marks.length} Test{subject.test_marks.length !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className={cn("text-base font-semibold", getPercentageColor(overall.percentage))}>
                                      {overall.percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {overall.totalObtained}/{overall.totalMax}
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center",
                                    isPass ? "bg-emerald-500/10" : "bg-red-500/10"
                                  )}>
                                    {isPass ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                                  <span className="text-xs font-medium">Overall</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className="text-xs font-semibold">
                                      {overall.totalObtained}
                                      <span className="text-[10px] font-normal text-slate-500">/{overall.totalMax}</span>
                                    </div>
                                  </div>
                                  <Badge
                                    variant={overall.percentage >= 60 ? "default" : "destructive"}
                                    className="text-xs px-2 py-0 h-5"
                                  >
                                    {overall.percentage.toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <AccordionContent className="px-5 pb-4">
                              <div className="space-y-4 pt-3">
                                {subject.exam_marks.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center">
                                        <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                                      </div>
                                      <h4 className="text-sm font-medium">Exams</h4>
                                      <Badge variant="secondary" className="ml-auto text-xs px-2 py-0 h-5">
                                        {subject.exam_marks.length}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      {subject.exam_marks.map((exam, examIndex) => {
                                        const examPercentage = (exam.marks_obtained / exam.max_marks) * 100;
                                        const examPass = examPercentage >= 60;
                                        return (
                                          <div
                                            key={examIndex}
                                            className="bg-slate-50 rounded-md p-3 border border-slate-200"
                                          >
                                            <div className="flex items-center justify-between gap-3">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    examPass ? "bg-emerald-500" : "bg-red-500"
                                                  )} />
                                                  <div className="text-sm font-medium truncate">
                                                    {exam.exam_name}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="text-right">
                                                  <div className="text-sm font-semibold">
                                                    {exam.marks_obtained}
                                                    <span className="text-xs font-normal text-slate-500">/{exam.max_marks}</span>
                                                  </div>
                                                  <div className={cn("text-xs font-medium", getPercentageColor(examPercentage))}>
                                                    {examPercentage.toFixed(1)}%
                                                  </div>
                                                </div>
                                                {exam.grade && (
                                                  <Badge variant="outline" className={cn("text-xs font-medium px-2 py-0 h-5", getGradeColor(exam.grade))}>
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
                                {subject.test_marks.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center">
                                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                                      </div>
                                      <h4 className="text-sm font-medium">Tests</h4>
                                      <Badge variant="secondary" className="ml-auto text-xs px-2 py-0 h-5">
                                        {subject.test_marks.length}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      {subject.test_marks.map((test, testIndex) => {
                                        const testPercentage = (test.marks_obtained / test.max_marks) * 100;
                                        const testPass = testPercentage >= 60;
                                        return (
                                          <div
                                            key={testIndex}
                                            className="bg-slate-50 rounded-md p-3 border border-slate-200"
                                          >
                                            <div className="flex items-center justify-between gap-3">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    testPass ? "bg-emerald-500" : "bg-red-500"
                                                  )} />
                                                  <div className="text-sm font-medium truncate">
                                                    {test.test_name}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="text-right">
                                                  <div className="text-sm font-semibold">
                                                    {test.marks_obtained}
                                                    <span className="text-xs font-normal text-slate-500">/{test.max_marks}</span>
                                                  </div>
                                                  <div className={cn("text-xs font-medium", getPercentageColor(testPercentage))}>
                                                    {testPercentage.toFixed(1)}%
                                                  </div>
                                                </div>
                                                {test.grade && (
                                                  <Badge variant="outline" className={cn("text-xs font-medium px-2 py-0 h-5", getGradeColor(test.grade))}>
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
                      </div>
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

