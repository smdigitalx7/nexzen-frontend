import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Separator } from "@/common/components/ui/separator";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  User,
  GraduationCap,
  FileText,
  BookOpen,
  TrendingUp,
  Calendar,
  Hash,
  BarChart3,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { useStudentPerformance } from "@/features/school/hooks";
import { cn } from "@/common/utils";
import { exportStudentPerformanceToExcel, exportStudentPerformanceToPDF } from "@/common/utils/export/student-performance-export";
import { useToast } from "@/common/hooks/use-toast";

interface StudentPerformanceViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: number | null;
}

// Helper function to get percentage color
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-yellow-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};

// Helper function to get progress bar color
const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 90) return "bg-green-500";
  if (percentage >= 80) return "bg-blue-500";
  if (percentage >= 70) return "bg-yellow-500";
  if (percentage >= 60) return "bg-orange-500";
  return "bg-red-500";
};

export const StudentPerformanceView = ({
  open,
  onOpenChange,
  enrollmentId,
}: StudentPerformanceViewProps) => {
  const { data, isLoading, error } = useStudentPerformance(enrollmentId);
  const { toast } = useToast();

  const handleExportExcel = async () => {
    if (!data) {
      toast({
        title: "No data available",
        description: "Please wait for the performance data to load.",
        variant: "destructive",
      });
      return;
    }

    try {
      const studentName = data.student_details.student_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await exportStudentPerformanceToExcel(data, `student-performance-${studentName}`);
      toast({
        title: "Export successful",
        variant: "success",
        description: "Student performance has been exported to Excel.",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export failed",
        description: "Failed to export performance to Excel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    if (!data) {
      toast({
        title: "No data available",
        description: "Please wait for the performance data to load.",
        variant: "destructive",
      });
      return;
    }

    try {
      const studentName = data.student_details.student_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await exportStudentPerformanceToPDF(data, `student-performance-${studentName}`);
      toast({
        title: "Export successful",
        variant: "success",
        description: "Student performance has been exported to PDF.",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Export failed",
        description: "Failed to export performance to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate overall statistics
  const overallStats = data
    ? {
        totalExams: data.subjects.reduce(
          (sum, s) => sum + s.total_exams,
          0
        ),
        totalTests: data.subjects.reduce(
          (sum, s) => sum + s.total_tests,
          0
        ),
        overallPercentage:
          data.subjects.reduce((sum, s) => sum + s.percentage, 0) /
          data.subjects.length,
      }
    : null;

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Performance</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-red-600">
            Failed to load student performance. Please try again.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] flex flex-col p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-slate-100">
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <div>Student Performance</div>
                {data && (
                  <div className="text-sm font-normal text-slate-500">
                    {data.student_details.student_name}
                  </div>
                )}
              </div>
            </DialogTitle>
            <div className="flex gap-2 pr-8">
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

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          {isLoading ? (
            <Loader.Data message="Loading student performance data..." />
          ) : !data ? (
            <div className="text-center py-12 text-slate-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>No performance data available</p>
            </div>
          ) : (
            <>
              {/* Student Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-xs text-slate-500">Admission No</div>
                      <div className="font-medium">
                        {data.student_details.admission_no}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-xs text-slate-500">Class</div>
                      <div className="font-medium">
                        {data.student_details.class_name}
                        {data.student_details.section_name &&
                          ` - ${data.student_details.section_name}`}
                      </div>
                    </div>
                  </div>
                  {data.student_details.roll_number && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="text-xs text-slate-500">Roll Number</div>
                        <div className="font-medium">
                          {data.student_details.roll_number}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-xs text-slate-500">Academic Year</div>
                      <div className="font-medium">
                        {data.student_details.academic_year}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Summary Statistics Cards */}
              {overallStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <GraduationCap className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Total Exams</div>
                        <div className="text-2xl font-bold text-slate-900">
                          {overallStats.totalExams}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Total Tests</div>
                        <div className="text-2xl font-bold text-slate-900">
                          {overallStats.totalTests}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <TrendingUp className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Overall %</div>
                        <div
                          className={cn(
                            "text-2xl font-bold",
                            getPercentageColor(overallStats.overallPercentage)
                          )}
                        >
                          {overallStats.overallPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Subject Performance List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Subject Performance
                </h3>
                {data.subjects.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p>No performance data available</p>
                  </div>
                ) : (
                  data.subjects.map((subject, index) => (
                    <motion.div
                      key={subject.subject_name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-slate-600" />
                          <h4 className="text-lg font-semibold text-slate-900">
                            {subject.subject_name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div
                            className={cn(
                              "text-2xl font-bold",
                              getPercentageColor(subject.percentage)
                            )}
                          >
                            {subject.percentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-500">
                            {subject.total_marks_obtained}/
                            {subject.total_max_marks} marks
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-slate-500">Exams</div>
                          <div className="text-lg font-semibold text-slate-900">
                            {subject.total_exams}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Tests</div>
                          <div className="text-lg font-semibold text-slate-900">
                            {subject.total_tests}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">
                            Total Assessments
                          </div>
                          <div className="text-lg font-semibold text-slate-900">
                            {subject.total_assessments}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            Performance
                          </span>
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              getPercentageColor(subject.percentage)
                            )}
                          >
                            {subject.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              getProgressBarColor(subject.percentage)
                            )}
                            style={{
                              width: `${Math.min(subject.percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

