import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/common/components/ui/badge";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { DataTable } from "@/common/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import {
  ClipboardList,
  BarChart3,
  Users,
  BookOpen,
  Search,
  AlertCircle,
} from "lucide-react";
import { useTestMarksReport } from "@/features/college/hooks";
import type { CollegeStudentReport } from "@/features/college/types";
import {
  useCollegeClasses,
  useCollegeGroups,
  useCollegeSubjects,
  useCollegeTests,
  useCollegeCourses,
} from "@/features/college/hooks/use-college-dropdowns";
import { cn } from "@/common/utils";

const getGradeStyles = (grade: string | null) => {
  if (!grade) return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
  const g = grade.toUpperCase();
  if (g.includes("A+") || g === "O") return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (g.startsWith("A")) return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
  if (g.startsWith("B")) return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
  if (g.startsWith("C")) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
};

export const TestMarksReport = () => {
  const [classId, setClassId] = useState<number | null>(null);
  const [testId, setTestId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  const { data: classesData, isLoading: classesLoading } = useCollegeClasses({ enabled: true });
  const { data: groupsData, isLoading: groupsLoading } = useCollegeGroups(classId || 0, { enabled: !!classId });
  const { data: coursesData, isLoading: coursesLoading } = useCollegeCourses(groupId || 0, { enabled: !!groupId });
  const { data: subjectsData, isLoading: subjectsLoading } = useCollegeSubjects(groupId || 0, { enabled: !!groupId });
  const { data: testsData, isLoading: testsLoading } = useCollegeTests({ enabled: true });

  const { data, isLoading, error } = useTestMarksReport(
    classId && testId && groupId && courseId
      ? {
          class_id: classId,
          test_id: testId,
          group_id: groupId,
          course_id: courseId,
          subject_id: subjectId || undefined,
        }
      : undefined
  );

  useEffect(() => {
    setGroupId(null);
    setCourseId(null);
    setSubjectId(null);
    setTestId(null);
  }, [classId]);

  useEffect(() => {
    setCourseId(null);
    setSubjectId(null);
  }, [groupId]);

  const tableData = useMemo(() => data?.students || [], [data]);

  const columns = useMemo<ColumnDef<CollegeStudentReport>[]>(() => {
    const baseColumns: ColumnDef<CollegeStudentReport>[] = [
      {
        id: "student_profile",
        header: "Student",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 py-1">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
              <Users className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{row.original.name}</p>
              <p className="text-xs text-slate-500">Roll: {row.original.roll_no}</p>
            </div>
          </div>
        ),
      },
    ];

    if (data?.subject_wise_overall_marks && Array.isArray(data.subject_wise_overall_marks)) {
      data.subject_wise_overall_marks.forEach((subject) => {
        baseColumns.push({
          id: `subject_${subject.subject_name}`,
          header: subject.subject_name,
          cell: ({ row }) => {
            const mark = row.original.subjects.find((s) => s.subject_name === subject.subject_name);
            if (!mark) return <span className="text-slate-400">—</span>;
            return <span className="font-medium text-slate-800">{mark.marks}</span>;
          },
        });
      });
    }

    baseColumns.push(
      {
        accessorKey: "overall_total_marks",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.overall_total_marks}</span>
        ),
      },
      {
        accessorKey: "overall_percentage",
        header: "Percentage",
        cell: ({ row }) => {
          const val = row.original.overall_percentage;
          const percentage = typeof val === "number" ? val : Number.parseFloat(String(val)) || 0;
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold">{percentage.toFixed(1)}%</span>
              {row.original.overall_grade && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getGradeStyles(row.original.overall_grade).bg,
                    getGradeStyles(row.original.overall_grade).text,
                    getGradeStyles(row.original.overall_grade).border
                  )}
                >
                  {row.original.overall_grade}
                </Badge>
              )}
            </div>
          );
        },
      }
    );

    return baseColumns;
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Test Marks Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate comprehensive test marks reports
          </p>
        </div>
      </div>

      {/* Filters - same style as School */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap mb-1.5 block">
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
                  setGroupId(null);
                  setCourseId(null);
                }
              }}
              valueKey="class_id"
              labelKey="class_name"
              placeholder="Select Class"
              isLoading={classesLoading}
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap mb-1.5 block">
              Group <span className="text-red-500">*</span>
            </label>
            <ServerCombobox
              items={groupsData?.items || []}
              value={groupId?.toString() || ""}
              onSelect={(val) => setGroupId(val ? Number(val) : null)}
              valueKey="group_id"
              labelKey="group_name"
              placeholder="Select Group"
              isLoading={groupsLoading}
              disabled={!classId}
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap mb-1.5 block">
              Course <span className="text-red-500">*</span>
            </label>
            <ServerCombobox
              items={coursesData?.items || []}
              value={courseId?.toString() || ""}
              onSelect={(val) => setCourseId(val ? Number(val) : null)}
              valueKey="course_id"
              labelKey="course_name"
              placeholder="Select Course"
              isLoading={coursesLoading}
              disabled={!groupId}
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap mb-1.5 block">
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
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap mb-1.5 block">
              Subject <span className="text-xs text-slate-500">(Optional)</span>
            </label>
            <ServerCombobox
              items={subjectsData?.items || []}
              value={subjectId?.toString() || ""}
              onSelect={(val) => setSubjectId(val ? Number(val) : null)}
              valueKey="subject_id"
              labelKey="subject_name"
              placeholder="All Subjects"
              isLoading={subjectsLoading}
              disabled={!groupId}
            />
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div className="text-red-600 text-sm">
            {(error as Error)?.message ||
              "Failed to load test marks report. Please try again."}
          </div>
        </div>
      )}

      {/* Report Content */}
      {isLoading ? (
        <Loader.Data message="Loading test marks report..." />
      ) : data ? (
        <>
          {/* Report Header Info - same as School */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {data.test_name}
                </h3>
                <p className="text-sm text-slate-600">
                  Class: {data.class_name} | Max Marks: {data.max_marks}
                </p>
              </div>
            </div>

            {/* Subject-wise Statistics - same as School */}
            {data.subject_wise_overall_marks?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Subject-wise Statistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.subject_wise_overall_marks.map((subject, index) => {
                    const percentage =
                      typeof subject.average_percentage === "number"
                        ? subject.average_percentage
                        : Number.parseFloat(String(subject.average_percentage)) || 0;
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
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                            {subject.subject_name}
                          </h5>
                        </div>
                        <div className="space-y-1.5">
                          <div
                            className={`flex items-center justify-between px-2 py-1 rounded-md border ${getPercentageColor(percentage)}`}
                          >
                            <span className="text-xs font-medium">Average</span>
                            <span className="text-sm font-bold">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-100">
                            <span>Total Marks</span>
                            <span className="font-semibold text-slate-900">
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
              searchKey="name"
              searchPlaceholder="Search by student name..."
              loading={isLoading}
              className=""
              export={{ enabled: true, filename: `test_report_${data.test_name}` }}
            />
          </motion.div>
        </>
      ) : classId && testId && groupId && courseId ? (
        <div className="text-center py-12 text-slate-500">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p>No test marks data available for the selected filters</p>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p>Please select Class, Group, Course and Test to generate the report</p>
        </div>
      )}
    </div>
  );
};
