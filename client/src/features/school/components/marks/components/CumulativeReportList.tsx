import { useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Button } from "@/common/components/ui/button";
import { AlertCircle, FileText, Search } from "lucide-react";
import { useSchoolEnrollmentsList } from "@/features/school/hooks/use-school-enrollments";
import { useSchoolClasses, useSchoolSections } from "@/features/school/hooks/use-school-dropdowns";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { Input } from "@/common/components/ui/input";
import { useDebounce } from "@/common/hooks/useDebounce";
import type { SchoolEnrollmentWithStudentDetails } from "@/features/school/types";

interface CumulativeReportListProps {
  onSelectStudent: (enrollmentId: number, studentName: string) => void;
}

export const CumulativeReportList = ({
  onSelectStudent,
}: CumulativeReportListProps) => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Memoized class ID for API calls
  const classId = useMemo(() => selectedClass || 0, [selectedClass]);

  // Fetch dropdown data
  const { data: classesData, isLoading: classesLoading } = useSchoolClasses();
  const { data: sectionsData, isLoading: sectionsLoading } = useSchoolSections(classId);

  const { data, isLoading, error } = useSchoolEnrollmentsList({
    class_id: selectedClass ?? 0,
    section_id: selectedSection ?? undefined,
    search: debouncedSearch || undefined,
    page: 1,
    page_size: 100, // Fetch up to 100 students for the list
    enabled: !!selectedClass
  });

  const handleClassChange = useCallback((value: string) => {
    const classId = parseInt(value);
    setSelectedClass(isNaN(classId) ? null : classId);
    setSelectedSection(null); // Reset section when class changes
  }, []);

  const handleSectionChange = useCallback((value: string) => {
    const sectionId = parseInt(value);
    setSelectedSection(isNaN(sectionId) ? null : sectionId);
  }, []);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Class <span className="text-red-500">*</span>
                </label>
                <ServerCombobox
                  items={classesData?.items || []}
                  value={selectedClass?.toString() || ""}
                  onSelect={handleClassChange}
                  valueKey="class_id"
                  labelKey="class_name"
                  placeholder="Select Class"
                  searchPlaceholder="Search classes..."
                  isLoading={classesLoading}
                />
            </div>
            
            <div className="w-full">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Section
                </label>
                <ServerCombobox
                  items={sectionsData?.items || []}
                  value={selectedSection?.toString() || ""}
                  onSelect={handleSectionChange}
                  valueKey="section_id"
                  labelKey="section_name"
                  placeholder="Select Section"
                  searchPlaceholder="Search sections..."
                  isLoading={sectionsLoading}
                  disabled={!selectedClass}
                  emptyText={!selectedClass ? "Select a class first" : "No sections found"}
                />
            </div>

          <div className="w-full">
             <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Search Student
             </label>
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name or roll no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900">Student List</h3>
        </div>

        {!selectedClass ? (
          <div className="p-8 text-center text-slate-500">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p>Please select a class to view students</p>
          </div>
        ) : isLoading ? (
          <div className="p-8">
            <Loader.Data message="Loading students..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>Failed to load students. Please try again.</p>
          </div>
        ) : (data?.enrollments || data?.items || []).length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No students found for the selected criteria.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Admission No</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.enrollments || data?.items || []).map((student: any) => (
                <TableRow key={student.enrollment_id}>
                  <TableCell className="font-medium text-slate-700">
                    {student.roll_number || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {student.student_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {student.admission_no}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 hover:bg-slate-100 hover:text-slate-900"
                      onClick={() =>
                        onSelectStudent(
                          student.enrollment_id,
                          student.student_name
                        )
                      }
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      Generate Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
