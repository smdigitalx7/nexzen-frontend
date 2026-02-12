import { Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AcademicSummaryProps {
  data: {
    academic: {
      total_exams: number;
      upcoming_exams: number;
      completed_exams: number;
      average_pass_rate: string;
    };
    attendance: {
      average_attendance_rate: string;
    };
  };
}

export const AcademicSummary = ({ data }: AcademicSummaryProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div
        className="lg:col-span-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
        onClick={() => navigate("/school/academic")}
      >
        <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <Award className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Academic Performance
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Exams overview</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-violet-200/60 bg-violet-500/5 p-4 dark:border-violet-800/40 dark:bg-violet-500/10">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-violet-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {data.academic.total_exams}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Upcoming</p>
              <p className="text-base font-semibold text-violet-600 dark:text-violet-400">
                {data.academic.upcoming_exams}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
              <p className="text-sm font-medium text-foreground">
                {data.academic.completed_exams}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="lg:col-span-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Attendance</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student attendance metrics
          </p>
        </div>
        <div className="p-6">
          <div className="rounded-xl border border-teal-200/60 bg-teal-500/5 p-6 dark:border-teal-800/40 dark:bg-teal-500/10">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-teal-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rate</p>
                <p className="text-3xl font-bold text-teal-700 dark:text-teal-400 mt-1">
                  {parseFloat(data.attendance.average_attendance_rate).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
