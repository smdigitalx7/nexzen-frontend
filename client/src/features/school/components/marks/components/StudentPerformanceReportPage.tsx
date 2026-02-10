import { motion } from "framer-motion";
import { Button } from "@/common/components/ui/button";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
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
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useStudentPerformance } from "@/features/school/hooks";
import { cn } from "@/common/utils";
import { exportStudentPerformanceToExcel, exportStudentPerformanceToPDF } from "@/common/utils/export/student-performance-export";
import { useToast } from "@/common/hooks/use-toast";

interface StudentPerformanceReportPageProps {
  enrollmentId: number;
  studentName: string;
  onBack: () => void;
}

const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-yellow-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};

export const StudentPerformanceReportPage = ({
  enrollmentId,
  studentName,
  onBack,
}: StudentPerformanceReportPageProps) => {
  const { data, isLoading, error } = useStudentPerformance(enrollmentId);
  const { toast } = useToast();

  const handleExportExcel = async () => {
    if (!data) {
      toast({ title: "No data available", description: "Please wait for the performance data to load.", variant: "destructive" });
      return;
    }
    try {
      const name = data.student_details.student_name.replaceAll(/[^a-z0-9]/gi, "_").toLowerCase();
      await exportStudentPerformanceToExcel(data, `student-performance-${name}`);
      toast({ title: "Export successful", variant: "success", description: "Student performance has been exported to Excel." });
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      toast({ title: "Export failed", description: "Failed to export performance to Excel. Please try again.", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    if (!data) {
      toast({ title: "No data available", description: "Please wait for the performance data to load.", variant: "destructive" });
      return;
    }
    try {
      const name = data.student_details.student_name.replaceAll(/[^a-z0-9]/gi, "_").toLowerCase();
      await exportStudentPerformanceToPDF(data, `student-performance-${name}`);
      toast({ title: "Export successful", variant: "success", description: "Student performance has been exported to PDF." });
    } catch (err) {
      console.error("Error exporting to PDF:", err);
      toast({ title: "Export failed", description: "Failed to export performance to PDF. Please try again.", variant: "destructive" });
    }
  };

  const overallStats = data
    ? {
        totalExams: data.subjects.reduce((sum, s) => sum + s.total_exams, 0),
        totalTests: data.subjects.reduce((sum, s) => sum + s.total_tests, 0),
        overallPercentage: data.subjects.reduce((sum, s) => sum + s.percentage, 0) / data.subjects.length,
      }
    : null;

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load student performance. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header: Back | Title | Excel | PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-100 shrink-0">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900 truncate">Student Performance</h1>
              <p className="text-sm text-slate-500 truncate">{data?.student_details?.student_name ?? studentName}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2" disabled={!data || isLoading} onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled={!data || isLoading} onClick={handleExportPDF}>
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loader.Data message="Loading student performance data..." />
      ) : data ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500">Admission No</div>
                  <div className="font-medium">{data.student_details.admission_no}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500">Class</div>
                  <div className="font-medium">
                    {data.student_details.class_name}
                    {data.student_details.section_name && ` - ${data.student_details.section_name}`}
                  </div>
                </div>
              </div>
              {data.student_details.roll_number && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500">Roll Number</div>
                    <div className="font-medium">{data.student_details.roll_number}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500">Academic Year</div>
                  <div className="font-medium">{data.student_details.academic_year}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {overallStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <GraduationCap className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Total Exams</div>
                    <div className="text-2xl font-bold text-slate-900">{overallStats.totalExams}</div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Total Tests</div>
                    <div className="text-2xl font-bold text-slate-900">{overallStats.totalTests}</div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <TrendingUp className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Overall %</div>
                    <div className={cn("text-2xl font-bold", getPercentageColor(overallStats.overallPercentage))}>
                      {overallStats.overallPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Subject Performance</h2>
            {data.subjects.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-xl">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p>No performance data available</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <Table bordered>
                  <TableHeader>
                    <TableRow className="bg-slate-100 hover:bg-slate-100">
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="font-semibold text-right">Exams</TableHead>
                      <TableHead className="font-semibold text-right">Tests</TableHead>
                      <TableHead className="font-semibold text-right">Assessments</TableHead>
                      <TableHead className="font-semibold text-right">Obtained</TableHead>
                      <TableHead className="font-semibold text-right">Max</TableHead>
                      <TableHead className="font-semibold text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.subjects.map((subject) => (
                      <TableRow key={subject.subject_name}>
                        <TableCell className="font-medium">{subject.subject_name}</TableCell>
                        <TableCell className="text-right">{subject.total_exams}</TableCell>
                        <TableCell className="text-right">{subject.total_tests}</TableCell>
                        <TableCell className="text-right">{subject.total_assessments}</TableCell>
                        <TableCell className="text-right">{subject.total_marks_obtained}</TableCell>
                        <TableCell className="text-right">{subject.total_max_marks}</TableCell>
                        <TableCell className={cn("text-right font-medium", getPercentageColor(subject.percentage))}>
                          {subject.percentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-xl">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p>No performance data available</p>
        </div>
      )}
    </div>
  );
};
