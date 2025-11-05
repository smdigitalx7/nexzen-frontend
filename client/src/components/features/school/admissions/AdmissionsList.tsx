import React, { useState, useMemo, useCallback, memo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader as UIDialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileSpreadsheet,
  FileText,
  GraduationCap,
} from "lucide-react";
import {
  useSchoolAdmissions,
  useSchoolAdmissionById,
} from "@/lib/hooks/school";
import { toast } from "@/hooks/use-toast";
import {
  exportAdmissionsToExcel,
  exportSingleAdmissionToExcel,
  exportSchoolAdmissionFormToPDF,
} from "@/lib/utils/export/admissionsExport";
import type { SchoolAdmissionDetails, SchoolAdmissionListItem } from "@/lib/types/school/admissions";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { CircleSpinner } from "@/components/ui/loading";

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


// Memoized header card component
const HeaderCard = memo(({ admission }: { admission: SchoolAdmissionDetails }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
    <div className="grid grid-cols-4 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Admission No</p>
        <p className="text-lg font-bold text-blue-600">
          {admission.admission_no}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Admission Date</p>
        <p className="font-semibold">{admission.admission_date}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Academic Year</p>
        <p className="font-semibold">{admission.academic_year}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Status</p>
        <Badge variant="secondary" className="text-sm">
          {admission.status}
        </Badge>
      </div>
    </div>
  </div>
));

HeaderCard.displayName = "HeaderCard";

// Memoized student information component
const StudentInfo = memo(({ admission }: { admission: SchoolAdmissionDetails }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <GraduationCap className="h-5 w-5" />
      Student Information
    </h3>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Student Name</p>
        <p className="font-medium">{admission.student_name}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Gender</p>
        <p className="font-medium">{admission.gender}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Date of Birth</p>
        <p className="font-medium">{admission.dob}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Class</p>
        <Badge variant="outline" className="text-sm">
          {admission.class_name}
        </Badge>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Branch</p>
        <p className="font-medium">{admission.branch_name}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Referred By</p>
        <p className="font-medium">{admission.referred_by_name}</p>
      </div>
    </div>
  </div>
));

StudentInfo.displayName = "StudentInfo";

// Memoized parent information component
const ParentInfo = memo(({ admission }: { admission: SchoolAdmissionDetails }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-lg font-semibold mb-4">Parent/Guardian Information</h3>
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <h4 className="font-semibold text-blue-600">Father/Guardian</h4>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{admission.father_or_guardian_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aadhar Number</p>
            <p className="font-mono text-sm">{admission.father_or_guardian_aadhar_no}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mobile</p>
            <p className="font-medium">{admission.father_or_guardian_mobile}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium">{admission.father_or_guardian_occupation}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold text-pink-600">Mother/Guardian</h4>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{admission.mother_or_guardian_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aadhar Number</p>
            <p className="font-mono text-sm">{admission.mother_or_guardian_aadhar_no}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mobile</p>
            <p className="font-medium">{admission.mother_or_guardian_mobile}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium">{admission.mother_or_guardian_occupation}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ParentInfo.displayName = "ParentInfo";

// Memoized address information component
const AddressInfo = memo(({ admission }: { admission: SchoolAdmissionDetails }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-lg font-semibold mb-4">Address Information</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Present Address</p>
        <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
          {admission.present_address}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Permanent Address</p>
        <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
          {admission.permanent_address}
        </p>
      </div>
    </div>
  </div>
));

AddressInfo.displayName = "AddressInfo";

// Memoized fee structure component
const FeeStructure = memo(({ admission }: { admission: SchoolAdmissionDetails }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-sm">Fee Type</th>
            <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
            <th className="text-right py-3 px-4 font-semibold text-sm">Concession</th>
            <th className="text-right py-3 px-4 font-semibold text-sm">Payable</th>
            <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="py-3 px-4 font-medium">Admission Fee</td>
            <td className="text-right py-3 px-4">₹{admission.admission_fee}</td>
            <td className="text-right py-3 px-4 text-muted-foreground">-</td>
            <td className="text-right py-3 px-4 font-semibold">₹{admission.admission_fee}</td>
            <td className="text-center py-3 px-4">
              <StatusBadge status={admission.admission_fee_paid} />
            </td>
          </tr>
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="py-3 px-4 font-medium">Tuition Fee</td>
            <td className="text-right py-3 px-4">₹{admission.tuition_fee}</td>
            <td className="text-right py-3 px-4">
              {admission.tuition_concession ? (
                <span className="text-orange-600 font-semibold">
                  -₹{admission.tuition_concession}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
            <td className="text-right py-3 px-4 font-semibold text-blue-600">
              ₹{admission.payable_tuition_fee}
            </td>
            <td className="text-center py-3 px-4">
              <Badge variant="outline">Pending</Badge>
            </td>
          </tr>
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="py-3 px-4 font-medium">Book Fee</td>
            <td className="text-right py-3 px-4">₹{admission.book_fee}</td>
            <td className="text-right py-3 px-4 text-muted-foreground">-</td>
            <td className="text-right py-3 px-4 font-semibold text-purple-600">
              ₹{admission.book_fee}
            </td>
            <td className="text-center py-3 px-4">
              <Badge variant="outline">Pending</Badge>
            </td>
          </tr>
          {admission.transport_required === "YES" && (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="py-3 px-4 font-medium">Transport Fee</td>
              <td className="text-right py-3 px-4">₹{admission.transport_fee}</td>
              <td className="text-right py-3 px-4">
                {admission.transport_concession && admission.transport_concession !== "0.00" ? (
                  <span className="text-orange-600 font-semibold">
                    -₹{admission.transport_concession}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="text-right py-3 px-4 font-semibold text-orange-600">
                ₹{admission.payable_transport_fee}
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
));

FeeStructure.displayName = "FeeStructure";

// Memoized transport information component
const TransportInfo = memo(({ admission }: { admission: SchoolAdmissionDetails }) => {
  if (admission.transport_required !== "YES") return null;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Transport Information</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Route</p>
          <p className="font-medium">{admission.route_ || "Not Assigned"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Distance Slab</p>
          <p className="font-medium">{admission.slab || "Not Assigned"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Transport Required</p>
          <Badge variant="secondary">YES</Badge>
        </div>
      </div>
    </div>
  );
});

TransportInfo.displayName = "TransportInfo";

// Memoized siblings information component
const SiblingsInfo = memo(({ admission }: { admission: SchoolAdmissionDetails }) => {
  if (!admission.siblings || admission.siblings.length === 0) return null;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Siblings Information</h3>
      <div className="space-y-3">
        {admission.siblings.map((sibling, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <div className="flex-1">
              <p className="font-medium">{sibling.name}</p>
              <p className="text-sm text-muted-foreground">
                {sibling.class_name} • {sibling.where}
              </p>
            </div>
            <Badge variant="outline">{sibling.gender}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
});

SiblingsInfo.displayName = "SiblingsInfo";

// Memoized dialog header component
const DialogHeader = memo(({ 
  admission, 
  onExportSingle, 
  onExportPDF 
}: { 
  admission: SchoolAdmissionDetails;
  onExportSingle: (admission: SchoolAdmissionDetails) => void;
  onExportPDF: (admission: SchoolAdmissionDetails) => void;
}) => (
  <UIDialogHeader>
    <DialogTitle>Admission Details</DialogTitle>
    <DialogDescription className="flex items-center justify-between">
      <span>Complete admission information for student</span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onExportSingle(admission)}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
        <Button
          size="sm"
          onClick={() => onExportPDF(admission)}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
      </div>
    </DialogDescription>
  </UIDialogHeader>
));

DialogHeader.displayName = "DialogHeader";

const AdmissionsListComponent = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: admissions = [], isLoading } = useSchoolAdmissions();
  const { data: selectedAdmission, isLoading: isLoadingAdmission } = useSchoolAdmissionById(selectedStudentId);

  // Memoized handlers
  const handleViewDetails = useCallback((admission: SchoolAdmissionListItem) => {
    setSelectedStudentId(admission.student_id);
    setShowDetailsDialog(true);
  }, []);

  const handleExportAll = useCallback(async () => {
    try {
      await exportAdmissionsToExcel(admissions, "School_Admissions");
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

  const handleExportSingle = useCallback(async (admission: SchoolAdmissionDetails) => {
    try {
      await exportSingleAdmissionToExcel(admission);
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

  const handleExportPDF = useCallback(async (admission: SchoolAdmissionDetails) => {
    try {
      await exportSchoolAdmissionFormToPDF(admission);
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
      onClick: (row: SchoolAdmissionListItem) => handleViewDetails(row),
    },
  ], [handleViewDetails]);

  // Column definitions for the enhanced table
  const columns: ColumnDef<SchoolAdmissionListItem>[] = useMemo(() => [
    {
      accessorKey: "admission_no",
      header: "Admission No",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("admission_no")}</span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => <span>{row.getValue("student_name")}</span>,
    },
    {
      accessorKey: "class_name",
      header: "Class",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("class_name")}</Badge>
      ),
    },
    {
      accessorKey: "admission_date",
      header: "Admission Date",
      cell: ({ row }) => <span>{row.getValue("admission_date")}</span>,
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
        <span className="text-sm font-mono">{row.getValue("payable_tuition_fee")}</span>
      ),
    },
    {
      accessorKey: "payable_transport_fee",
      header: "Transport Fee",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.getValue("payable_transport_fee")}</span>
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
        loading={isLoading}
        exportable={true}
        onExport={handleExportAll}
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
          {isLoadingAdmission ? (
            <div className="flex items-center justify-center py-12">
              <CircleSpinner size="lg" message="Loading admission details..." />
            </div>
          ) : selectedAdmission ? (
            <>
              <DialogHeader
                admission={selectedAdmission}
                onExportSingle={handleExportSingle}
                onExportPDF={handleExportPDF}
              />
            <div className="space-y-6">
                <HeaderCard admission={selectedAdmission} />
                <StudentInfo admission={selectedAdmission} />
                <ParentInfo admission={selectedAdmission} />
                <AddressInfo admission={selectedAdmission} />
                <FeeStructure admission={selectedAdmission} />
                <TransportInfo admission={selectedAdmission} />
                <SiblingsInfo admission={selectedAdmission} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const AdmissionsList = AdmissionsListComponent;
export default AdmissionsListComponent;
