import React, { useState, useMemo, useCallback, memo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileSpreadsheet,
  FileText,
  Download,
  GraduationCap,
} from "lucide-react";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import {
  useCollegeAdmissions,
  useCollegeAdmissionById,
} from "@/lib/hooks/college";
import { toast } from "@/hooks/use-toast";
import {
  exportAdmissionsToExcel,
  exportSingleAdmissionToExcel,
  exportAdmissionFormToPDF,
} from "@/lib/utils/export/admissionsExport";
import type { CollegeAdmissionDetails, CollegeAdmissionListItem } from "@/lib/types/college/admissions";

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const getStatusBadgeVariant = (status: string) => {
    if (status === "PAID") return "secondary";
    if (status === "PENDING") return "default";
    return "destructive";
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

const AdmissionsList = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: admissions = [], isLoading } = useCollegeAdmissions();
  const { data: selectedAdmission } = useCollegeAdmissionById(selectedStudentId);

  // Memoized handlers
  const handleViewDetails = useCallback((admission: CollegeAdmissionListItem) => {
    setSelectedStudentId(admission.student_id);
    setShowDetailsDialog(true);
  }, []);

  const handleExportAll = useCallback(async () => {
    try {
      await exportAdmissionsToExcel(admissions as any, "College_Admissions");
      toast({
        title: "Export Successful",
        description: `Exported ${admissions.length} admissions to Excel`,
      });
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: error?.message || "Failed to export admissions to Excel",
        variant: "destructive",
      });
    }
  }, [admissions]);

  const handleExportSingle = useCallback(async (admission: CollegeAdmissionDetails) => {
    try {
      await exportSingleAdmissionToExcel(admission as any);
      toast({
        title: "Export Successful",
        description: `Exported admission ${admission.admission_no} to Excel`,
      });
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: error?.message || "Failed to export admission to Excel",
        variant: "destructive",
      });
    }
  }, []);

  const handleExportPDF = useCallback(async (admission: CollegeAdmissionDetails) => {
    try {
      await exportAdmissionFormToPDF(admission as any);
      toast({
        title: "PDF Generated",
        description: `Admission form for ${admission.admission_no} downloaded`,
      });
    } catch (error: any) {
      console.error("PDF export failed:", error);
      toast({
        title: "PDF Export Failed",
        description: error?.message || "Failed to generate admission form PDF",
        variant: "destructive",
      });
    }
  }, []);

  // Memoized action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: "view" as const,
      onClick: (row: CollegeAdmissionListItem) => handleViewDetails(row),
    },
  ], [handleViewDetails]);

  // Column definitions for the enhanced table
  const columns: ColumnDef<CollegeAdmissionListItem>[] = useMemo(() => [
    {
      accessorKey: "admission_no",
      header: "Admission No",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("admission_no") || "N/A"}</span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => <span>{row.getValue("student_name")}</span>,
    },
    {
      accessorKey: "group_course",
      header: "Group/Course",
      cell: ({ row }) => {
        const admission = row.original;
        const groupName = admission.group_name ? String(admission.group_name).trim() : null;
        const courseName = admission.course_name ? String(admission.course_name).trim() : null;
        
        let groupCourse = "-";
        if (groupName && courseName) {
          groupCourse = `${groupName} - ${courseName}`;
        } else if (groupName) {
          groupCourse = groupName;
        } else if (courseName) {
          groupCourse = courseName;
        }
        
        return (
          <div className="max-w-[150px] truncate">
            <Badge variant="outline">{groupCourse}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "admission_date",
      header: "Admission Date",
      cell: ({ row }) => <span>{row.getValue("admission_date") || "N/A"}</span>,
    },
    {
      accessorKey: "admission_fee_paid",
      header: "Admission Fee",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("admission_fee_paid")} />
      ),
    },
    {
      accessorKey: "payable_tuition_fee",
      header: "Tuition Fee",
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.getValue("payable_tuition_fee") || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "payable_transport_fee",
      header: "Transport Fee",
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.getValue("payable_transport_fee") || "N/A"}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        data={admissions}
        columns={columns}
        title="Student Admissions"
        searchKey="student_name"
        searchPlaceholder="Search by name, admission number..."
        exportable={true}
        onExport={handleExportAll}
        loading={isLoading}
        showSearch={true}
        enableDebounce={true}
        debounceDelay={300}
        highlightSearchResults={true}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
        className="w-full"
      />

      {/* Admission Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Admission Details</span>
              {selectedAdmission && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSingle(selectedAdmission)}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleExportPDF(selectedAdmission)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Complete admission information for student
            </DialogDescription>
          </DialogHeader>

          {selectedAdmission && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Admission No
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedAdmission.admission_no || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Admission Date
                    </p>
                    <p className="font-semibold">
                      {selectedAdmission.admission_date || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Academic Year
                    </p>
                    <p className="font-semibold">
                      {selectedAdmission.academic_year || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="secondary" className="text-sm">
                      {selectedAdmission.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Student Name
                    </p>
                    <p className="font-medium">
                      {selectedAdmission.student_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{selectedAdmission.gender || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">{selectedAdmission.dob || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Group</p>
                    <Badge variant="outline" className="text-sm">
                      {selectedAdmission.group_name || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <Badge variant="outline" className="text-sm">
                      {selectedAdmission.course_name || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">
                      {selectedAdmission.branch_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Referred By</p>
                    <p className="font-medium">
                      {selectedAdmission.referred_by_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600">
                      Father/Guardian
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {selectedAdmission.father_or_guardian_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Aadhar Number
                        </p>
                        <p className="font-mono text-sm">
                          {selectedAdmission.father_or_guardian_aadhar_no || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mobile</p>
                        <p className="font-medium">
                          {selectedAdmission.father_or_guardian_mobile || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Occupation
                        </p>
                        <p className="font-medium">
                          {selectedAdmission.father_or_guardian_occupation || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-pink-600">
                      Mother/Guardian
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {selectedAdmission.mother_or_guardian_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Aadhar Number
                        </p>
                        <p className="font-mono text-sm">
                          {selectedAdmission.mother_or_guardian_aadhar_no || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mobile</p>
                        <p className="font-medium">
                          {selectedAdmission.mother_or_guardian_mobile || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Occupation
                        </p>
                        <p className="font-medium">
                          {selectedAdmission.mother_or_guardian_occupation || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Address Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Present Address
                    </p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {selectedAdmission.present_address || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Permanent Address
                    </p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {selectedAdmission.permanent_address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee Structure */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">
                          Fee Type
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Amount
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Concession
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Payable
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Admission Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.admission_fee || 0}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          -
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{selectedAdmission.admission_fee || 0}
                        </td>
                        <td className="text-center py-3 px-4">
                          <StatusBadge status={selectedAdmission.admission_fee_paid} />
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Tuition Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.total_tuition_fee || 0}
                        </td>
                        <td className="text-right py-3 px-4">
                          {selectedAdmission.tuition_concession ? (
                            <span className="text-orange-600 font-semibold">
                              -₹{selectedAdmission.tuition_concession}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-blue-600">
                          ₹{selectedAdmission.payable_tuition_fee || "0"}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline">Pending</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Course Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.total_tuition_fee || 0}
                        </td>
                        <td className="text-right py-3 px-4">
                          {selectedAdmission.tuition_concession ? (
                            <span className="text-orange-600 font-semibold">
                              -₹{selectedAdmission.tuition_concession}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-blue-600">
                          ₹{selectedAdmission.payable_tuition_fee || "0"}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline">Pending</Badge>
                        </td>
                      </tr>
                      {selectedAdmission.transport_required === "YES" && (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-medium">
                            Transport Fee
                          </td>
                          <td className="text-right py-3 px-4">
                            ₹{selectedAdmission.transport_fee}
                          </td>
                          <td className="text-right py-3 px-4">
                            {selectedAdmission.transport_concession &&
                            selectedAdmission.transport_concession !==
                              "0.00" ? (
                              <span className="text-orange-600 font-semibold">
                                -₹{selectedAdmission.transport_concession}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-orange-600">
                            ₹{selectedAdmission.payable_transport_fee}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline">Pending</Badge>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transport Information */}
              {selectedAdmission.transport_required === "YES" && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Transport Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Route</p>
                      <p className="font-medium">
                        {selectedAdmission.route_ || "Not Assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Distance Slab
                      </p>
                      <p className="font-medium">
                        {selectedAdmission.slab || "Not Assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Transport Required
                      </p>
                      <Badge variant="secondary">YES</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Academic Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Group</p>
                    <Badge variant="outline" className="text-sm">
                      {selectedAdmission.group_name}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <Badge variant="outline" className="text-sm">
                      {selectedAdmission.course_name}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Year</p>
                    <Badge variant="outline" className="text-sm">
                      {selectedAdmission.academic_year || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedAdmission && handleExportSingle(selectedAdmission)
                  }
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Excel
                </Button>
                <Button
                  onClick={() =>
                    selectedAdmission && handleExportPDF(selectedAdmission)
                  }
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Admission Form (PDF)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdmissionsList;
