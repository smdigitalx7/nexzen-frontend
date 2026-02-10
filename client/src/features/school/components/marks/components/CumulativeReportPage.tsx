import { useState, useEffect } from "react";
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
  Calendar,
  Hash,
  Award,
  ArrowLeft,
  AlertCircle,
  Building2,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/common/hooks/use-toast";
import { StudentReportsService } from "@/features/school/services/student-reports.service";
import type { CumulativeReportResponse } from "@/features/school/types/student-reports";
import { cn } from "@/common/utils";

interface CumulativeReportPageProps {
  enrollmentId: number;
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

export const CumulativeReportPage = ({
  enrollmentId,
  studentName,
  onBack,
}: CumulativeReportPageProps) => {
  const { toast } = useToast();
  const [report, setReport] = useState<CumulativeReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await StudentReportsService.getCumulativeReport(enrollmentId);
        if (data.success) {
          setReport(data);
        } else {
          setError(data.message || "Failed to load report");
        }
      } catch (err: any) {
        console.error("Error fetching cumulative report:", err);
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (enrollmentId) {
      fetchReport();
    }
  }, [enrollmentId]);

  if (loading) {
     return <Loader.Data message="Loading cumulative report..." />;
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Failed to load student report. Please try again."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { student, attendance, exams, subjects, final_overall_percentage, final_overall_grade } = report;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
      {/* Header & Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Cumulative Report</h1>
            <p className="text-sm text-slate-500">Comprehensive scholastic performance</p>
          </div>
        </div>
        {/* Placeholder for Export Buttons if needed */}
      </div>

      {/* Student Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex items-start gap-4">
                 <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User className="h-8 w-8" />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-slate-900">{student.student_name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5" />
                            Roll: {student.roll_number || "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Class: {student.class_name} - {student.section_name}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            Branch ID: {student.branch_id}
                        </span>
                         <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Year ID: {student.academic_year_id}
                        </span>
                    </div>
                 </div>
            </div>

            {/* Overall Performance Badge */}
             <div className="flex flex-col items-end justify-center min-w-[150px] bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Overall Grade</div>
                <div className={cn("text-3xl font-bold", getPercentageColor(final_overall_percentage))}>
                    {final_overall_grade}
                </div>
                 <div className="text-sm font-medium text-slate-600 mt-1">
                    {final_overall_percentage.toFixed(2)}%
                </div>
            </div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
         <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-slate-500" />
                 <h3 className="font-semibold text-slate-900">Attendance Summary</h3>
            </div>
             <div className="text-sm font-medium">
                Overall: <span className={cn(getPercentageColor(attendance.attendance_percentage))}>{attendance.attendance_percentage.toFixed(1)}%</span>
            </div>
         </div>
         <div className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
                 <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="text-sm text-slate-500">Total Working Days</div>
                     <div className="text-xl font-bold text-slate-900">{attendance.total_working_days}</div>
                 </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                     <div className="text-sm text-emerald-600">Present Days</div>
                     <div className="text-xl font-bold text-emerald-700">{attendance.present_days}</div>
                 </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                     <div className="text-sm text-red-600">Absent Days</div>
                     <div className="text-xl font-bold text-red-700">{attendance.absent_days}</div>
                 </div>
             </div>
             
             {/* Monthly Attendance Table - Optional, can be collapsible if too long */}
             {attendance.monthly.length > 0 && (
                 <div className="relative overflow-x-auto rounded-lg border border-slate-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Month/Year</TableHead>
                                <TableHead className="text-center">Working Days</TableHead>
                                <TableHead className="text-center">Present</TableHead>
                                <TableHead className="text-center">Absent</TableHead>
                                <TableHead className="text-right">%</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendance.monthly.map((m, idx) => (
                                <TableRow key={`${m.attendance_year}-${m.attendance_month}-${idx}`}>
                                    <TableCell className="font-medium">{m.attendance_month}/{m.attendance_year}</TableCell>
                                    <TableCell className="text-center">{m.total_working_days}</TableCell>
                                    <TableCell className="text-center text-emerald-600">{m.present_days}</TableCell>
                                    <TableCell className="text-center text-red-600">{m.absent_days}</TableCell>
                                    <TableCell className={cn("text-right font-medium", getPercentageColor(m.attendance_percentage))}>
                                        {m.attendance_percentage.toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", 
                                            m.status === "Average" ? "bg-red-100 text-red-700" : 
                                            m.status === "Good" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700")}>
                                            {m.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
             )}
         </div>
      </div>

       {/* Scholastic Performance (Subjects & Exams) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
         <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
             <Award className="h-5 w-5 text-slate-500" />
             <h3 className="font-semibold text-slate-900">Scholastic Performance</h3>
         </div>
         <div className="p-6">
            <div className="relative overflow-x-auto rounded-lg border border-slate-200 max-h-[600px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-100 border-b border-slate-200">
                            <TableHead className="w-[200px] font-bold text-slate-900 bg-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Subject</TableHead>
                            {exams.map((exam) => (
                                <TableHead key={exam.exam_id} className="text-center border-l bg-slate-50 min-w-[120px]">
                                    <div className="flex flex-col items-center">
                                        <span className="font-semibold text-slate-900">{exam.exam_name}</span>
                                        <span className="text-xs font-normal text-slate-500">
                                            (Max: {exam.total_max_marks}) <br/>
                                            Wt: {exam.weight_percentage}%
                                        </span>
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-center font-bold text-slate-900 bg-slate-100 border-l min-w-[120px]">
                                Total <br/> <span className="text-xs font-normal">(100%)</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjects.map((subject) => (
                            <TableRow key={subject.subject_id} className="hover:bg-slate-50/50">
                                <TableCell className="font-semibold text-slate-800 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    {subject.subject_name}
                                </TableCell>
                                {exams.map((exam) => {
                                    const examData = subject.exams.find(e => e.exam_id === exam.exam_id);
                                    return (
                                        <TableCell key={`${subject.subject_id}-${exam.exam_id}`} className="text-center border-l bg-slate-50/30">
                                            {examData ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-medium text-slate-900">{examData.marks_obtained}</span>
                                                    <span className={cn("text-xs", getPercentageColor(examData.exam_percentage))}>
                                                        {examData.exam_percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </TableCell>
                                    )
                                })}
                                <TableCell className="text-center font-bold border-l bg-slate-50">
                                    <div className="flex flex-col items-center">
                                        <span className={cn("text-lg", getPercentageColor(subject.subject_percentage))}>
                                            {subject.subject_percentage.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Grade: {subject.subject_grade}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
         </div>
      </div>
    </div>
  );
};
