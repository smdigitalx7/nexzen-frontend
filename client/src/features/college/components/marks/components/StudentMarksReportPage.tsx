import { useMemo } from "react";
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
  FileText,
  BookOpen,
  Calendar,
  Hash,
  Award,
  FileSpreadsheet,
  FileDown,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useStudentMarks } from "@/features/college/hooks/use-student-marks";
import type { SubjectMarksDetail } from "@/features/college/types/student-marks";
import { cn } from "@/common/utils";
import { exportStudentMarksToExcel, exportStudentMarksToPDF } from "@/common/utils/export/student-marks-export";
import { useToast } from "@/common/hooks/use-toast";

interface StudentMarksReportPageProps {
  admissionNo: string;
  studentName: string;
  onBack: () => void;
}

const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return "text-emerald-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-amber-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};

const calculateSubjectOverall = (subject: SubjectMarksDetail) => {
  const examTotal = subject.exam_marks.reduce((sum, exam) => sum + exam.marks_obtained, 0);
  const examMax = subject.exam_marks.reduce((sum, exam) => sum + exam.max_marks, 0);
  const testTotal = subject.test_marks.reduce((sum, test) => sum + test.marks_obtained, 0);
  const testMax = subject.test_marks.reduce((sum, test) => sum + test.max_marks, 0);
  const totalObtained = examTotal + testTotal;
  const totalMax = examMax + testMax;
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  return { totalObtained, totalMax, percentage };
};

type MarksRow = {
  subject: string;
  type: "Exam" | "Test";
  assessment: string;
  maxMarks: number;
  obtained: number;
  percentage: number;
  grade: string | null;
};

export const StudentMarksReportPage = ({
  admissionNo,
  studentName,
  onBack,
}: StudentMarksReportPageProps) => {
  const { data, isLoading, error } = useStudentMarks(admissionNo);
  const { toast } = useToast();

  const subjects = useMemo(() => data?.subjects ?? [], [data]);

  const rows = useMemo((): MarksRow[] => {
    const out: MarksRow[] = [];
    subjects.forEach((subject) => {
      subject.exam_marks.forEach((exam) => {
        out.push({
          subject: subject.subject_name,
          type: "Exam",
          assessment: exam.exam_name,
          maxMarks: exam.max_marks,
          obtained: exam.marks_obtained,
          percentage: exam.percentage,
          grade: exam.grade ?? null,
        });
      });
      subject.test_marks.forEach((test) => {
        out.push({
          subject: subject.subject_name,
          type: "Test",
          assessment: test.test_name,
          maxMarks: test.max_marks,
          obtained: test.marks_obtained,
          percentage: test.percentage,
          grade: test.grade ?? null,
        });
      });
    });
    return out;
  }, [subjects]);

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
      toast({ title: "No data available", description: "Please wait for the marks data to load.", variant: "destructive" });
      return;
    }
    try {
      const name = data.student_details.student_name.replaceAll(/[^a-z0-9]/gi, "_").toLowerCase();
      await exportStudentMarksToExcel(data, `student-marks-${name}`);
      toast({ title: "Export successful", variant: "success", description: "Student marks have been exported to Excel." });
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      toast({ title: "Export failed", description: "Failed to export marks to Excel. Please try again.", variant: "destructive" });
    }
  };

  const handleExportPDF = () => {
    if (!data) {
      toast({ title: "No data available", description: "Please wait for the marks data to load.", variant: "destructive" });
      return;
    }
    try {
      const name = data.student_details.student_name.replaceAll(/[^a-z0-9]/gi, "_").toLowerCase();
      exportStudentMarksToPDF(data, `student-marks-${name}`);
      toast({ title: "Export successful", variant: "success", description: "Student marks have been exported to PDF." });
    } catch (err) {
      console.error("Error exporting to PDF:", err);
      toast({ title: "Export failed", description: "Failed to export marks to PDF. Please try again.", variant: "destructive" });
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load student marks. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-100 shrink-0">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900 truncate">Student Marks Report</h1>
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
        <Loader.Data message="Loading student marks data..." />
      ) : !data ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-500">No marks data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center flex-wrap gap-6 flex-1">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Admission No</div>
                    <div className="text-sm font-medium">{data.student_details.admission_no}</div>
                  </div>
                </div>
                {data.student_details.roll_number && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Roll Number</div>
                      <div className="text-sm font-medium">{data.student_details.roll_number}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Academic Year</div>
                    <div className="text-sm font-medium">{data.student_details.academic_year}</div>
                  </div>
                </div>
              </div>
              {overallStats && (
                <div className="flex items-center gap-4 pl-6 border-l lg:border-t-0 border-t border-slate-200 pt-4 lg:pt-0">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-500 mb-1">Overall</div>
                    <span className={cn("text-2xl font-bold", getPercentageColor(overallStats.averagePercentage))}>
                      {overallStats.averagePercentage.toFixed(1)}%
                    </span>
                    <div className="text-xs text-slate-500 mt-1">
                      {overallStats.totalObtained} / {overallStats.totalMax} marks · {overallStats.totalSubjects} subjects
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-500">No marks data available</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <Table bordered>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Assessment</TableHead>
                    <TableHead className="font-semibold text-right">Max</TableHead>
                    <TableHead className="font-semibold text-right">Obtained</TableHead>
                    <TableHead className="font-semibold text-right">%</TableHead>
                    <TableHead className="font-semibold">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={`${row.subject}-${row.type}-${row.assessment}-${idx}`}>
                      <TableCell className="font-medium">{row.subject}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.assessment}</TableCell>
                      <TableCell className="text-right">{row.maxMarks}</TableCell>
                      <TableCell className="text-right">{row.obtained}</TableCell>
                      <TableCell className={cn("text-right font-medium", getPercentageColor(row.percentage))}>
                        {row.percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell>{row.grade ?? "–"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
