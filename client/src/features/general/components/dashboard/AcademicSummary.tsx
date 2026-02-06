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
        className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate("/school/academic")}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Academic Performance
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">Exams and pass rates</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50/50 border border-purple-100">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Total Exams</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {data.academic.total_exams}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Upcoming</p>
              <p className="text-lg font-semibold text-purple-700">
                {data.academic.upcoming_exams}
              </p>
              <p className="text-xs text-slate-500 mt-1">Completed</p>
              <p className="text-sm font-medium text-slate-600">
                {data.academic.completed_exams}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-slate-600">Average Pass Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {parseFloat(data.academic.average_pass_rate).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-slate-900">Attendance</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student attendance metrics
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-6 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-teal-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Average Rate
                </p>
                <p className="text-4xl font-bold text-teal-700 mt-2">
                  {parseFloat(data.attendance.average_attendance_rate).toFixed(
                    1
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
