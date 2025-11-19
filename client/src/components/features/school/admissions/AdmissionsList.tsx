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
  CreditCard,
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
import { EnhancedDataTable, ServerSidePagination } from "@/components/shared";
import { Loader } from "@/components/ui/ProfessionalLoader";
import { ReceiptPreviewModal } from "@/components/shared";
import { handleSchoolPayByAdmissionWithIncomeId } from "@/lib/api-school";
import { batchInvalidateAndRefetch } from "@/lib/hooks/common/useGlobalRefetch";

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
const FeeStructure = memo(({ 
  admission, 
  onPayAdmissionFee 
}: { 
  admission: SchoolAdmissionDetails;
  onPayAdmissionFee?: (e?: React.MouseEvent) => void;
}) => {
  const isPending = admission.admission_fee_paid === "PENDING";

  return (
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
              {isPending && onPayAdmissionFee && (
                <th className="text-center py-3 px-4 font-semibold text-sm">Action</th>
              )}
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
              {isPending && onPayAdmissionFee && (
                <td className="text-center py-3 px-4">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPayAdmissionFee(e);
                    }}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay Admission Fee
                  </Button>
                </td>
              )}
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
  );
});

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
    <DialogDescription>
      Complete admission information for student
    </DialogDescription>
    <div className="flex gap-2 justify-end mt-2">
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
  </UIDialogHeader>
));

DialogHeader.displayName = "DialogHeader";

const AdmissionsListComponent = () => {
  // ✅ Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: admissionsResp, isLoading } = useSchoolAdmissions({ page: currentPage, page_size: pageSize });
  // ✅ FIX: Handle multiple response formats:
  // 1. Direct array: [{...}, {...}]
  // 2. Object with 'admissions' property: {admissions: [...], total_pages: ...}
  // 3. Object with 'data' property: {data: [...], total_pages: ...}
  const admissions = useMemo(() => {
    if (!admissionsResp) return [];
    // Check if response is a direct array
    if (Array.isArray(admissionsResp)) {
      return admissionsResp;
    }
    // Check for 'admissions' property (API might return this)
    if ('admissions' in admissionsResp && Array.isArray(admissionsResp.admissions)) {
      return admissionsResp.admissions;
    }
    // Check for 'data' property
    if ('data' in admissionsResp && Array.isArray(admissionsResp.data)) {
      return admissionsResp.data;
    }
    return [];
  }, [admissionsResp]);
  
  // ✅ FIX: Extract pagination metadata - handle both direct array and paginated object
  const paginationMeta = useMemo(() => {
    if (!admissionsResp) return { total_pages: 1, total_count: 0, current_page: 1, page_size: pageSize };
    // If response is a direct array, calculate pagination from array length
    if (Array.isArray(admissionsResp)) {
      return {
        total_pages: Math.ceil(admissionsResp.length / pageSize) || 1,
        total_count: admissionsResp.length,
        current_page: currentPage,
        page_size: pageSize,
      };
    }
    // If response is an object with pagination metadata
    return {
      total_pages: admissionsResp.total_pages ?? 1,
      total_count: admissionsResp.total_count ?? admissions.length,
      current_page: admissionsResp.current_page ?? currentPage,
      page_size: admissionsResp.page_size ?? pageSize,
    };
  }, [admissionsResp, admissions.length, currentPage, pageSize]);
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
        variant: "success",
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
        variant: "success",
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
        variant: "success",
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

  const handlePayAdmissionFee = useCallback((e?: React.MouseEvent) => {
    // Prevent event propagation to avoid closing parent dialog
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (selectedAdmission) {
      setShowPaymentDialog(true);
    }
  }, [selectedAdmission]);

  const handleProcessPayment = useCallback(async () => {
    if (!selectedAdmission) return;

    const admissionFee = parseFloat(selectedAdmission.admission_fee?.toString() || "0");
    if (admissionFee <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Admission fee amount is invalid",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const paymentResponse = await handleSchoolPayByAdmissionWithIncomeId(
        selectedAdmission.admission_no,
        {
          details: [
            {
              purpose: "ADMISSION_FEE",
              paid_amount: admissionFee,
              payment_method: "CASH",
            },
          ],
          remarks: "Admission fee payment",
        }
      );

      const { blobUrl } = paymentResponse;

      if (blobUrl) {
        setReceiptBlobUrl(blobUrl);
        // Close payment dialog immediately
        setShowPaymentDialog(false);
        // Open receipt modal after ensuring payment dialog is fully closed and unmounted
        // Use requestAnimationFrame to ensure DOM updates are complete
        requestAnimationFrame(() => {
          setTimeout(() => {
            setShowReceiptModal(true);
          }, 200);
        });
      } else {
        // If no blob URL, still close the payment dialog
        setShowPaymentDialog(false);
      }

      toast({
        title: "Payment Successful",
        description: "Admission fee payment processed successfully",
        variant: "success",
      });

      // ✅ FIX: Batch invalidate queries to prevent UI freeze
      const keysToInvalidate: any[] = [["school", "admissions"]];
      if (selectedStudentId) {
        keysToInvalidate.push(["school", "admissions", selectedStudentId]);
      }
      batchInvalidateAndRefetch(keysToInvalidate);
    } catch (error: any) {
      console.error("Payment failed:", error);
      // Close payment dialog even on error
      setShowPaymentDialog(false);
      toast({
        title: "Payment Failed",
        description:
          error?.message ||
          "Failed to process admission fee payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAdmission, selectedStudentId]);

  const handleCloseReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    setReceiptBlobUrl(null);
    // ✅ FIX: Batch invalidate queries to prevent UI freeze
    if (selectedStudentId) {
      batchInvalidateAndRefetch([["school", "admissions", selectedStudentId]]);
    }
  }, [selectedStudentId]);

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
      <div className="space-y-4">
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
          enableClientSidePagination={false}
        />
        {/* ✅ Server-side pagination controls */}
        {admissionsResp && (
          <ServerSidePagination
            currentPage={paginationMeta.current_page}
            totalPages={paginationMeta.total_pages}
            totalCount={paginationMeta.total_count}
            pageSize={paginationMeta.page_size}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Admission Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onOpenChange={(open) => {
          // Prevent closing if payment dialog or receipt modal is open
          if (!open && !showPaymentDialog && !showReceiptModal) {
            setShowDetailsDialog(false);
          }
        }}
        modal={true}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide" style={{ zIndex: 9999 }}>
          {isLoadingAdmission ? (
            <Loader.Data message="Loading admission details..." />
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
                <FeeStructure 
                  admission={selectedAdmission} 
                  onPayAdmissionFee={handlePayAdmissionFee}
                />
                <TransportInfo admission={selectedAdmission} />
                <SiblingsInfo admission={selectedAdmission} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={showPaymentDialog && !showReceiptModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowPaymentDialog(false);
          }
        }}
        modal={true}
      >
        <DialogContent style={{ zIndex: 10000 }}>
          <UIDialogHeader>
            <DialogTitle>Pay Admission Fee</DialogTitle>
            <DialogDescription>
              Process admission fee payment for {selectedAdmission?.admission_no}
            </DialogDescription>
          </UIDialogHeader>

          <div className="space-y-4">
            {selectedAdmission && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Admission Fee:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{parseFloat(selectedAdmission.admission_fee?.toString() || "0").toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Student: {selectedAdmission.student_name}
                  </p>
                </div>

                <Button
                  onClick={handleProcessPayment}
                  className="w-full"
                  size="lg"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Process Payment & Print Receipt
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl}
      />
    </div>
  );
};

export const AdmissionsList = AdmissionsListComponent;
export default AdmissionsListComponent;
