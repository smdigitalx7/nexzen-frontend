import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Search, AlertCircle, FileText, BarChart3, User, Hash } from "lucide-react";
import { useCollegeEnrollmentByAdmission } from "@/features/college/hooks";
import { StudentPerformanceReportPage } from "./StudentPerformanceReportPage";
import { StudentMarksReportPage } from "./StudentMarksReportPage";
import { cn } from "@/common/utils";

export type StudentReportType = "performance" | "marks" | null;

export const StudentReportView = () => {
  const [searchValue, setSearchValue] = useState("");
  const [reportType, setReportType] = useState<StudentReportType>(null);

  const { data: enrollmentData, isLoading, error } = useCollegeEnrollmentByAdmission(
    searchValue.trim() || null
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSelectReport = (type: "performance" | "marks") => {
    if (enrollmentData?.admission_no) {
      setReportType(type);
    }
  };

  const handleBackToSearch = () => {
    setReportType(null);
  };

  if (reportType === "performance" && enrollmentData?.admission_no) {
    return (
      <StudentPerformanceReportPage
        admissionNo={enrollmentData.admission_no}
        studentName={enrollmentData.student_name}
        onBack={handleBackToSearch}
      />
    );
  }

  if (reportType === "marks" && enrollmentData?.admission_no) {
    return (
      <StudentMarksReportPage
        admissionNo={enrollmentData.admission_no}
        studentName={enrollmentData.student_name}
        onBack={handleBackToSearch}
      />
    );
  }

  return (
    <div className="w-full max-w-full">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Student Report</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Enter admission number to view performance or marks report
          </p>
        </div>

        {/* Search */}
        <div className="px-6 py-5">
          <label htmlFor="admission-search" className="block text-sm font-medium text-slate-700 mb-2">
            Admission number
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Input
              id="admission-search"
              placeholder="e.g. ABC12345678"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 w-full h-11 bg-white"
              aria-label="Admission number"
            />
            <Button
              onClick={() => {}}
              disabled={!searchValue.trim() || isLoading}
              className="h-11 px-5 bg-slate-800 hover:bg-slate-900 text-white shrink-0"
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

        {error && (
          <div className="px-6 pb-5">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No student found for this admission number. Please check and try again.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {enrollmentData && !reportType && !error && (
          <>
            <div className="mx-6 h-px bg-slate-100" />
            <div className="px-6 py-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-900">{enrollmentData.student_name}</span>
                </span>
                {enrollmentData.roll_number && (
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <Hash className="h-3.5 w-3.5 text-slate-400" />
                    Roll {enrollmentData.roll_number}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 mb-3">Choose report</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectReport("performance")}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-colors",
                    "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100",
                    "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-slate-700">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">Performance</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      Overview and subject-wise performance
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectReport("marks")}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-colors",
                    "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100",
                    "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-slate-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">Marks</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      Detailed exam and test marks
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
