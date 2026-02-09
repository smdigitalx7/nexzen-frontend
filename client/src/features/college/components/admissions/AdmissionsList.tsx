import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { batchInvalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/common/components/ui/alert";
import {
  FileSpreadsheet,
  FileText,
  GraduationCap,
  CreditCard,
  AlertCircle,
  Search,
  Eye,
} from "lucide-react";
import { ReceiptPreviewModal } from "@/common/components/shared";
import { handleCollegePayByAdmissionWithIncomeId } from "@/core/api/api-college";
import { getReceiptNoFromResponse } from "@/core/api/payment-types";
import { openReceiptInNewTab } from "@/common/utils/payment";
import { DataTable } from "@/common/components/shared/DataTable";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import {
  useCollegeAdmissions,
  useCollegeAdmissionById,
} from "@/features/college/hooks";
import { toast } from "@/common/hooks/use-toast";
import {
  exportAdmissionsToExcel,
  exportSingleAdmissionToExcel,
  exportCollegeAdmissionFormToPDF,
} from "@/common/utils/export/admissionsExport";
import type { CollegeAdmissionDetails, CollegeAdmissionListItem } from "@/features/college/types/admissions";

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
  // Server-side pagination (minimum page size 25)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { data: admissionsResp, isLoading } = useCollegeAdmissions({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
  });
  const admissions = useMemo(() => admissionsResp?.data ?? [], [admissionsResp?.data]);
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

  const handleExportSingle = useCallback(async (admission: CollegeAdmissionDetails) => {
    try {
      await exportSingleAdmissionToExcel(admission as any);
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

  const handleExportPDF = useCallback(async (admission: CollegeAdmissionDetails) => {
    try {
      await exportCollegeAdmissionFormToPDF(admission);
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

  const handlePayAdmissionFee = useCallback(() => {
    if (selectedAdmission) {
      // Clear any previous errors
      setPaymentError(null);
      // Close details dialog before opening payment dialog to avoid modal stacking
      setShowDetailsDialog(false);
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setShowPaymentDialog(true);
      }, 100);
    }
  }, [selectedAdmission]);

  const handleProcessPayment = useCallback(async () => {
    if (!selectedAdmission) return;

    // Clear any previous errors
    setPaymentError(null);

    const admissionFee = parseFloat(selectedAdmission.admission_fee?.toString() || "0");
    if (admissionFee <= 0) {
      setPaymentError("Admission fee amount is invalid. Please check the fee amount.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const paymentResponse = await handleCollegePayByAdmissionWithIncomeId(
        selectedAdmission.admission_no || "",
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

      const { blobUrl, paymentData } = paymentResponse;

      setShowPaymentDialog(false);
      setShowDetailsDialog(false);
      setPaymentError(null);
      if (blobUrl) {
        openReceiptInNewTab(blobUrl, getReceiptNoFromResponse(paymentData));
        toast({
          title: "Payment successful",
          description: "Receipt opened in new tab.",
          variant: "success",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Admission fee payment processed successfully",
          variant: "success",
        });
      }

      // ✅ FIX: Batch invalidate queries to prevent UI freeze
      const keysToInvalidate: any[] = [["college", "admissions"]];
      if (selectedStudentId) {
        keysToInvalidate.push(["college", "admissions", selectedStudentId]);
      }
      batchInvalidateAndRefetch(keysToInvalidate);
    } catch (error: any) {
      console.error("Payment failed:", error);
      // Show error in the dialog instead of toast
      setPaymentError(
        error?.message ||
        "Failed to process admission fee payment. Please try again."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAdmission, selectedStudentId]);

  const handleCloseReceiptModal = useCallback(() => {
    // ✅ CRITICAL FIX: Close modal state immediately
    setShowReceiptModal(false);
    
    // ✅ CRITICAL FIX: Clean up blob URL immediately (synchronous)
    if (receiptBlobUrl) {
      try {
        URL.revokeObjectURL(receiptBlobUrl);
      } catch (e) {
        // Ignore errors during cleanup
      }
      setReceiptBlobUrl(null);
    }

    // ✅ CRITICAL FIX: Defer query invalidation to prevent UI blocking
    if (selectedStudentId) {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(
          () => {
            batchInvalidateAndRefetch([["college", "admissions", selectedStudentId]]);
          },
          { timeout: 1000 }
        );
      } else {
        setTimeout(() => {
          batchInvalidateAndRefetch([["college", "admissions", selectedStudentId]]);
        }, 500);
      }
    }
  }, [selectedStudentId, receiptBlobUrl]);

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions: ActionConfig<CollegeAdmissionListItem>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row) => handleViewDetails(row),
      showLabel: true,
    },
  ], [handleViewDetails]);

  // Column definitions
  const columns: ColumnDef<CollegeAdmissionListItem>[] = useMemo(() => [
    {
      accessorKey: "admission_no",
      header: "Admission No",
      cell: ({ row }) => (
        <span className="font-medium text-blue-600 truncate block max-w-[120px]">
          {row.getValue("admission_no") || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => <span className="font-semibold">{row.getValue("student_name")}</span>,
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
          <div className="max-w-[200px] truncate">
            <Badge variant="outline" className="bg-slate-50">{groupCourse}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "admission_date",
      header: "Admission Date",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("admission_date") || "N/A"}</span>,
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
        <span className="text-sm font-mono font-medium">
          ₹{(row.getValue("payable_tuition_fee") || 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "payable_transport_fee",
      header: "Transport Fee",
      cell: ({ row }) => (
        <span className="text-sm font-mono font-medium text-orange-600">
          ₹{(row.getValue("payable_transport_fee") || 0).toLocaleString()}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <DataTable
        data={admissions}
        columns={columns}
        title="Student Admissions"
        loading={isLoading}
        pagination="server"
        totalCount={admissionsResp?.total_count || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[25, 50, 100]}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        showSearch={false}
        searchPlaceholder="Search by admission no or student name..."
        toolbarLeftContent={
          <div className="w-full sm:flex-1 min-w-0">
            <Input
              placeholder="Search by admission no or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full"
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        }
        actions={actions}
        export={{
          enabled: true,
          filename: "college_admissions",
          onExport: handleExportAll,
        }}
      />

      {/* Admission Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0" style={{ zIndex: 10000 }}>
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle>Admission Details</DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>Complete admission information for student</span>
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
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
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
                        {selectedAdmission.admission_fee_paid === "PENDING" && (
                          <th className="text-center py-3 px-4 font-semibold text-sm">
                            Action
                          </th>
                        )}
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
                        {selectedAdmission.admission_fee_paid === "PENDING" && (
                          <td className="text-center py-3 px-4">
                            <Button
                              size="sm"
                              onClick={handlePayAdmissionFee}
                              className="flex items-center gap-2"
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay Admission Fee
                            </Button>
                          </td>
                        )}
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Group Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.group_fee || selectedAdmission.total_tuition_fee || 0}
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
                      {selectedAdmission.course_fee && selectedAdmission.course_fee > 0 && (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-medium">Course Fee</td>
                          <td className="text-right py-3 px-4">
                            ₹{selectedAdmission.course_fee}
                          </td>
                          <td className="text-right py-3 px-4 text-muted-foreground">
                            -
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-blue-600">
                            ₹{selectedAdmission.course_fee}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline">Pending</Badge>
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Book Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.book_fee || 0}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          -
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-purple-600">
                          ₹{selectedAdmission.book_fee || 0}
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
                            ₹{parseFloat(selectedAdmission.transport_fee || "0") || 0}
                          </td>
                          <td className="text-right py-3 px-4">
                            {selectedAdmission.transport_concession &&
                            selectedAdmission.transport_concession !== "0.00" ? (
                              <span className="text-orange-600 font-semibold">
                                -₹{selectedAdmission.transport_concession}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-orange-600">
                            ₹{selectedAdmission.payable_transport_fee || "0"}
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
            </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={showPaymentDialog} 
        onOpenChange={(open) => {
          setShowPaymentDialog(open);
          // Clear error when dialog closes
          if (!open) {
            setPaymentError(null);
          }
        }}
      >
        <DialogContent style={{ zIndex: 10001 }}>
          <DialogHeader>
            <DialogTitle>Pay Admission Fee</DialogTitle>
            <DialogDescription>
              Process admission fee payment for {selectedAdmission?.admission_no}
            </DialogDescription>
          </DialogHeader>

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

                {/* Error Alert */}
                {paymentError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Payment Error</AlertTitle>
                    <AlertDescription>{paymentError}</AlertDescription>
                  </Alert>
                )}

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

export default AdmissionsList;
