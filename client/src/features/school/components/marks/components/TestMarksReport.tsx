import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/common/components/ui/badge";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { DataTable } from "@/common/components/shared/DataTable";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { ColumnDef } from "@tanstack/react-table";
import {
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { useTestMarksReport } from "@/features/school/hooks";
import type { SchoolStudentReport } from "@/features/school/types";
import {
  useSchoolClasses,
  useSchoolSections,
  useSchoolSubjects,
  useSchoolTests,
} from "@/features/school/hooks/use-school-dropdowns";
import { cn } from "@/common/utils";

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

export const TestMarksReport = () => {
  const [classId, setClassId] = useState<number | null>(null);
  const [testId, setTestId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);

  // Fetch dropdown data
  const { data: classesData, isLoading: classesLoading } = useSchoolClasses();
  const { data: testsData, isLoading: testsLoading } = useSchoolTests();
  const { data: sectionsData, isLoading: sectionsLoading } = useSchoolSections(classId || 0);
  const { data: subjectsData, isLoading: subjectsLoading } = useSchoolSubjects(classId || 0);

  const { data, isLoading, error } = useTestMarksReport(
    classId && testId
      ? {
          class_id: classId,
          test_id: testId,
          subject_id: subjectId || undefined,
          section_id: sectionId || undefined,
        }
      : undefined
  );

  // Prepare table data
  const tableData = useMemo(() => {
    if (!data?.students) return [];
    return data.students;
  }, [data]);

  // Create dynamic columns based on subjects
  const columns = useMemo<ColumnDef<SchoolStudentReport>[]>(() => {
    const baseColumns: ColumnDef<SchoolStudentReport>[] = [
      {
        id: "roll_no",
        header: "Roll No / Section",
        accessorKey: "roll_no",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.roll_no}
            {row.original.section_name && ` / ${row.original.section_name}`}
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
        cell: ({ row }) => (
          <span className="font-semibold">
            {row.original.overall_total_marks}
          </span>
        ),
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">Test Marks Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Generate comprehensive test marks reports
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-1.5 block">
              Class <span className="text-red-500">*</span>
            </label>
            <ServerCombobox
              items={classesData?.items || []}
              value={classId?.toString() || ""}
              onSelect={(val) => {
                setClassId(val ? Number(val) : null);
                if (!val) {
                  setTestId(null);
                  setSubjectId(null);
                  setSectionId(null);
                }
              }}
              valueKey="class_id"
              labelKey="class_name"
              placeholder="Select Class"
              isLoading={classesLoading}
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-1.5 block">
              Test <span className="text-red-500">*</span>
            </label>
            <ServerCombobox
              items={testsData?.items || []}
              value={testId?.toString() || ""}
              onSelect={(val) => setTestId(val ? Number(val) : null)}
              valueKey="test_id"
              labelKey="test_name"
              placeholder="Select Test"
              isLoading={testsLoading}
              disabled={!classId}
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-1.5 block">
              Section <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <ServerCombobox
              items={sectionsData?.items || []}
              value={sectionId?.toString() || ""}
              onSelect={(val) => setSectionId(val ? Number(val) : null)}
              valueKey="section_id"
              labelKey="section_name"
              placeholder="Select Section"
              isLoading={sectionsLoading}
              disabled={!classId}
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-1.5 block">
              Subject <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <ServerCombobox
              items={subjectsData?.items || []}
              value={subjectId?.toString() || ""}
              onSelect={(val) => setSubjectId(val ? Number(val) : null)}
              valueKey="subject_id"
              labelKey="subject_name"
              placeholder="Select Subject"
              isLoading={subjectsLoading}
              disabled={!classId}
            />
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm">
            {(error as any)?.response?.data?.detail || 
             (error as any)?.response?.data?.message || 
             (error as any)?.message || 
             "Failed to load test marks report. Please try again."}
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader.Data message="Loading test marks report..." />
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
                  {data.test_name}
                </h3>
                <p className="text-sm text-gray-600">
                  Class: {data.class_name} | Max Marks: {data.max_marks}
                </p>
              </div>
            </div>

            {/* Subject-wise Statistics */}
            {data.subject_wise_overall_marks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
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
                              {subject.overall_marks}
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
            <DataTable
              data={tableData}
              columns={columns}
              title="Student Marks"
              showSearch={true}
              searchKey="name"
              searchPlaceholder="Search by student name..."
              loading={isLoading}
              export={{ enabled: true }}
              className=""
            />
          </motion.div>
        </>
      ) : classId && testId ? (
        <div className="text-center py-12 text-gray-500">
          <p>No test marks data available for the selected filters</p>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>Please select Class and Test to generate the report</p>
        </div>
      )}
    </div>
  );
};
