
import React, { useState, useEffect, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  FileSpreadsheet,
  FileText,
  GraduationCap,
  CreditCard,
  ArrowLeft,
  Loader2
} from "lucide-react";
import {
  useSchoolAdmissionById,
} from "@/features/school/hooks";
import { toast } from "@/common/hooks/use-toast";
import {
  exportSingleAdmissionToExcel,
  exportSchoolAdmissionFormToPDF,
} from "@/common/utils/export/admissionsExport";
import type { SchoolAdmissionDetails } from "@/features/school/types/admissions";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { handleSchoolPayByAdmissionWithIncomeId } from "@/core/api/api-school";
import { getReceiptNoFromResponse } from "@/core/api/payment-types";
import { batchInvalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";
import { openReceiptInNewTab } from "@/common/utils/payment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/common/components/ui/dialog";
import { ReceiptPreviewModal } from "@/common/components/shared";

// --- Shared Components (Extracted from AdmissionsList) ---

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


// --- Main Page Component ---
const AdmissionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id) : null;

  const { data: selectedAdmission, isLoading } = useSchoolAdmissionById(studentId);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- Handlers ---

  const handleBack = () => {
    navigate(-1);
  };

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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
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

      const { blobUrl, paymentData } = paymentResponse;

      setShowPaymentDialog(false);
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

      // Invalidate queries
      const keysToInvalidate: any[] = [["school", "admissions"]];
      if (studentId) {
        keysToInvalidate.push(["school", "admissions", studentId]);
      }
      batchInvalidateAndRefetch(keysToInvalidate);
    } catch (error: any) {
      console.error("Payment failed:", error);
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
  }, [selectedAdmission, studentId]);

  const handleCloseReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      try {
        URL.revokeObjectURL(receiptBlobUrl);
      } catch (e) {
        // Ignore
      }
      setReceiptBlobUrl(null);
    }

    if (studentId) {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(
          () => {
            batchInvalidateAndRefetch([["school", "admissions", studentId]]);
          },
          { timeout: 1000 }
        );
      } else {
        setTimeout(() => {
          batchInvalidateAndRefetch([["school", "admissions", studentId]]);
        }, 500);
      }
    }
  }, [studentId, receiptBlobUrl]);

  if (isLoading) {
    return <Loader.Data message="Loading admission details..." />;
  }

  if (!selectedAdmission) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <h2 className="text-2xl font-bold mb-4">Admission Not Found</h2>
        <Button onClick={handleBack}>Back to AdmissionsList</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto p-6 max-w-7xl animate-in fade-in duration-500">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admission Details</h1>
            <p className="text-sm text-muted-foreground">
              Complete admission information for {selectedAdmission.student_name}
            </p>
          </div>
        </div>
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
      </div>

      {/* Content */}
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

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Confirm payment of admission fee for {selectedAdmission.student_name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center bg-muted p-4 rounded-md">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold">₹{selectedAdmission.admission_fee}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={isProcessingPayment}>
                Cancel
            </Button>
            <Button onClick={handleProcessPayment} disabled={isProcessingPayment}>
                {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl || ""}
      />
    </div>
  );
};

export default AdmissionDetailsPage;
