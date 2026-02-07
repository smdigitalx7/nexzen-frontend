import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { AlertDescription } from "@/common/components/ui/alert";
import { Search, AlertCircle, FileText, BarChart3, User, Hash } from "lucide-react";
import { useSchoolEnrollmentByAdmission } from "@/features/school/hooks";
import { StudentPerformanceReportPage } from "./StudentPerformanceReportPage";
import { StudentMarksReportPage } from "./StudentMarksReportPage";
import { cn } from "@/common/utils";

export type StudentReportType = "performance" | "marks" | null;

export const StudentReportView = () => {
  const [searchValue, setSearchValue] = useState("");
  const [reportType, setReportType] = useState<StudentReportType>(null);

  const { data: enrollmentData, isLoading, error } = useSchoolEnrollmentByAdmission(
    searchValue.trim() || null
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSelectReport = (type: "performance" | "marks") => {
    if (enrollmentData?.enrollment_id) {
      setReportType(type);
    }
  };

  const handleBackToSearch = () => {
    setReportType(null);
  };

  if (reportType === "performance" && enrollmentData?.enrollment_id) {
    return (
      <StudentPerformanceReportPage
        enrollmentId={enrollmentData.enrollment_id}
        studentName={enrollmentData.student_name}
        onBack={handleBackToSearch}
      />
    );
  }

  if (reportType === "marks" && enrollmentData?.enrollment_id) {
    return (
      <StudentMarksReportPage
        enrollmentId={enrollmentData.enrollment_id}
        studentName={enrollmentData.student_name}
        onBack={handleBackToSearch}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - same as Exam/Test Reports */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Reports</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter admission number to view performance or marks report.
            </p>
          </div>
        </div>
      </div>

      {/* Filters - same card style as Exam/Test */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full min-w-0 sm:w-96">
            <label htmlFor="admission-search" className="text-sm font-medium text-gray-700 whitespace-nowrap mb-1.5 block">
              Admission number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <Input
                id="admission-search"
                placeholder="e.g. ABC12345678"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-w-0 flex-1 h-10 bg-white"
                aria-label="Admission number"
              />
              <Button
                onClick={() => {}}
                disabled={!searchValue.trim() || isLoading}
                className="h-10 px-5 bg-slate-800 hover:bg-slate-900 text-white shrink-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden />
                    <span>Searching</span>
                  </span>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" aria-hidden />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <AlertDescription>
              No student found for this admission number. Please check and try again.
            </AlertDescription>
          </div>
        </div>
      )}

      {enrollmentData && !reportType && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{enrollmentData.student_name}</span>
            </span>
            {enrollmentData.roll_number && (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                Roll {enrollmentData.roll_number}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-700 mb-3">Choose report</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectReport("performance")}
              className={cn(
                "flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-colors",
                "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200/80 text-gray-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">Performance</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Overview and subject-wise performance
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleSelectReport("marks")}
              className={cn(
                "flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-colors",
                "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200/80 text-gray-700">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">Marks</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Detailed exam and test marks
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {!enrollmentData && !error && (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Please enter admission number and search to generate the report.</p>
        </div>
      )}
    </div>
  );
};
