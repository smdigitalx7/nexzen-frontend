import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  GraduationCap,
  Download,
  BarChart3,
} from "lucide-react";
import { useExamMarksReport } from "@/lib/hooks/college";
import type { CollegeStudentReport } from "@/lib/types/college";
import {
  CollegeClassDropdown,
  CollegeExamDropdown,
  CollegeSubjectDropdown,
  CollegeGroupDropdown,
} from "@/components/shared/Dropdowns/College";
import { cn } from "@/lib/utils";

// Helper function to get grade color
const getGradeColor = (grade: string | null): string => {
  if (!grade) return "bg-gray-100 text-gray-700";
  const gradeUpper = grade.toUpperCase();
  if (gradeUpper.includes("A+") || gradeUpper === "A+") {
    return "bg-green-100 text-green-700 border-green-300";
  }
  if (gradeUpper.startsWith("A")) {
    return "bg-blue-100 text-blue-700 border-blue-300";
  }
  if (gradeUpper.startsWith("B")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  }
  if (gradeUpper.startsWith("C")) {
    return "bg-orange-100 text-orange-700 border-orange-300";
  }
  return "bg-red-100 text-red-700 border-red-300";
};

export const ExamMarksReport = () => {
  const [classId, setClassId] = useState<number | null>(null);
  const [examId, setExamId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);

  const { data, isLoading, error } = useExamMarksReport(
    classId && examId && groupId
      ? {
          class_id: classId,
          exam_id: examId,
          group_id: groupId,
          subject_id: subjectId || undefined,
        }
      : undefined
  );

  const handleExport = () => {
    // TODO: Implement PDF export
    console.log("Export to PDF");
  };

  // Prepare table data
  const tableData = useMemo(() => {
    if (!data?.students) return [];
    return data.students;
  }, [data]);

  // Create dynamic columns based on subjects
  const columns = useMemo<ColumnDef<CollegeStudentReport>[]>(() => {
    const baseColumns: ColumnDef<CollegeStudentReport>[] = [
      {
        id: "roll_no",
        header: "Roll No",
        accessorKey: "roll_no",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.roll_no}
          </span>
        ),
      },
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
    ];

    // Add subject columns
    if (data?.students && data.students.length > 0) {
      const subjects = data.students[0].subjects;
      subjects.forEach((subject) => {
        baseColumns.push({
          id: `subject_${subject.subject_name}`,
          header: subject.subject_name,
          cell: ({ row }) => {
            const subjectMark = row.original.subjects.find(
              (s) => s.subject_name === subject.subject_name
            );
            const marks = subjectMark?.marks || "NO RECORD";
            const isNoRecord = marks === "NO RECORD";
            return (
              <span
                className={cn(
                  "font-medium",
                  isNoRecord && "text-gray-400 italic"
                )}
              >
                {marks}
              </span>
            );
          },
        });
      });
    }

    // Add total and percentage columns
    baseColumns.push(
      {
        id: "overall_total_marks",
        header: "Total",
        cell: ({ row }) => {
          const total = typeof row.original.overall_total_marks === 'number' 
            ? row.original.overall_total_marks 
            : parseFloat(String(row.original.overall_total_marks)) || 0;
          return (
            <span className="font-semibold">
              {total}
            </span>
          );
        },
      },
      {
        id: "overall_percentage",
        header: "Percentage",
        cell: ({ row }) => {
          const percentage = typeof row.original.overall_percentage === 'number' 
            ? row.original.overall_percentage 
            : parseFloat(String(row.original.overall_percentage)) || 0;
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {percentage.toFixed(1)}%
              </span>
              {row.original.overall_grade && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getGradeColor(row.original.overall_grade)
                  )}
                >
                  {row.original.overall_grade}
                </Badge>
              )}
            </div>
          );
        },
      },
    );

    return baseColumns;
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Exam Marks Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Generate comprehensive exam marks reports
            </p>
          </div>
        </div>
        {data && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Class <span className="text-red-500">*</span>
            </label>
            <div className="flex-1">
              <CollegeClassDropdown
                value={classId}
                onChange={(value) => {
                  setClassId(value);
                  if (!value) {
                    setExamId(null);
                    setSubjectId(null);
                    setGroupId(null);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Group <span className="text-red-500">*</span>
            </label>
            <div className="flex-1">
              {classId ? (
                <CollegeGroupDropdown
                  value={groupId}
                  onChange={(value) => {
                    setGroupId(value);
                    if (!value) {
                      setSubjectId(null);
                    }
                  }}
                  classId={classId}
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400 text-sm">
                  Select class first
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Exam <span className="text-red-500">*</span>
            </label>
            <div className="flex-1">
              <CollegeExamDropdown
                value={examId}
                onChange={setExamId}
                disabled={!classId || !groupId}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Subject <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="flex-1">
              {groupId ? (
                <CollegeSubjectDropdown
                  value={subjectId}
                  onChange={setSubjectId}
                  groupId={groupId}
                />
              ) : (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400 text-sm">
                  Select group first
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm">
            Failed to load exam marks report. Please try again.
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : data ? (
        <>
          {/* Report Header Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {data.exam_name}
                </h3>
                <p className="text-sm text-gray-600">
                  Class: {data.class_name} | Max Marks: {data.max_marks}
                </p>
              </div>
            </div>

            {/* Subject-wise Statistics */}
            {data.subject_wise_overall_marks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Subject-wise Statistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.subject_wise_overall_marks.map((subject, index) => {
                    const percentage = typeof subject.average_percentage === 'number' 
                      ? subject.average_percentage 
                      : parseFloat(String(subject.average_percentage)) || 0;
                    const getPercentageColor = (pct: number) => {
                      if (pct >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
                      if (pct >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
                      if (pct >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
                      if (pct >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
                      return "text-red-600 bg-red-50 border-red-200";
                    };
                    const overallMarks = typeof subject.overall_marks === 'number' 
                      ? subject.overall_marks 
                      : parseFloat(String(subject.overall_marks)) || 0;
                    return (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900 text-sm leading-tight">
                            {subject.subject_name}
                          </h5>
                        </div>
                        <div className="space-y-1.5">
                          {subject.average_percentage !== null && (
                            <div className={`flex items-center justify-between px-2 py-1 rounded-md border ${getPercentageColor(percentage)}`}>
                              <span className="text-xs font-medium">Average</span>
                              <span className="text-sm font-bold">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-600 bg-white px-2 py-1 rounded-md">
                            <span>Total Marks</span>
                            <span className="font-semibold text-gray-900">
                              {overallMarks}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <EnhancedDataTable
              data={tableData}
              columns={columns}
              title="Student Marks"
              searchKey="name"
              searchPlaceholder="Search by student name..."
              exportable={true}
              loading={isLoading}
            />
          </motion.div>
        </>
      ) : classId && examId && groupId ? (
        <div className="text-center py-12 text-gray-500">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No exam marks data available for the selected filters</p>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Please select Class, Group, and Exam to generate the report</p>
        </div>
      )}
    </div>
  );
};

