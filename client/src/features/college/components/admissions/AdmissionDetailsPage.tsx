import React, { useState, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  FileSpreadsheet,
  FileText,
  GraduationCap,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { useCollegeAdmissionById } from "@/features/college/hooks";
import { toast } from "@/common/hooks/use-toast";
import {
  exportSingleAdmissionToExcel,
  exportCollegeAdmissionFormToPDF,
} from "@/common/utils/export/admissionsExport";
import type { CollegeAdmissionDetails } from "@/features/college/types/admissions";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { handleCollegePayByStudentWithIncomeId } from "@/core/api/api-college";
import { getReceiptNoFromResponse } from "@/core/api/payment-types";
import { batchInvalidateQueriesSelective } from "@/common/hooks/useGlobalRefetch";
import { collegeKeys } from "@/features/college/hooks/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { openReceiptInNewTab } from "@/common/utils/payment";

// --- Small memoized view components (simplified from school version) ---

const HeaderCard = memo(({ admission }: { admission: CollegeAdmissionDetails }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
    <div className="grid grid-cols-4 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Admission No</p>
        <p className="text-lg font-bold text-blue-600">
          {admission.admission_no || "N/A"}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Admission Date</p>
        <p className="font-semibold">{admission.admission_date || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Academic Year</p>
        <p className="font-semibold">{admission.academic_year || "N/A"}</p>
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

const StudentInfo = memo(({ admission }: { admission: CollegeAdmissionDetails }) => (
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
        <p className="font-medium">{admission.gender || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Date of Birth</p>
        <p className="font-medium">{admission.dob || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Group</p>
        <Badge variant="outline" className="text-sm">
          {admission.group_name || "N/A"}
        </Badge>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Course</p>
        <Badge variant="outline" className="text-sm">
          {admission.course_name || "N/A"}
        </Badge>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Branch</p>
        <p className="font-medium">{admission.branch_name}</p>
      </div>
    </div>
  </div>
));

StudentInfo.displayName = "StudentInfo";

const ParentInfo = memo(({ admission }: { admission: CollegeAdmissionDetails }) => (
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
            <p className="font-mono text-sm">
              {admission.father_or_guardian_aadhar_no}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mobile</p>
            <p className="font-medium">{admission.father_or_guardian_mobile}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium">
              {admission.father_or_guardian_occupation}
            </p>
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
            <p className="font-mono text-sm">
              {admission.mother_or_guardian_aadhar_no}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mobile</p>
            <p className="font-medium">{admission.mother_or_guardian_mobile}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium">
              {admission.mother_or_guardian_occupation}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ParentInfo.displayName = "ParentInfo";

const AddressInfo = memo(({ admission }: { admission: CollegeAdmissionDetails }) => (
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

const FeeStructure = memo(
  ({ admission }: { admission: CollegeAdmissionDetails }) => {
    const tuitionConcession = admission.tuition_concession || 0;
    const tuitionFee = admission.total_tuition_fee || 0;
    const payableTuition = admission.payable_tuition_fee || "0.00";

    return (
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
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-4 font-medium">Admission Fee</td>
                <td className="text-right py-3 px-4">
                  ₹{admission.admission_fee ?? 0}
                </td>
                <td className="text-right py-3 px-4 text-muted-foreground">-</td>
                <td className="text-right py-3 px-4 font-semibold">
                  ₹{admission.admission_fee ?? 0}
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-4 font-medium">Tuition Fee</td>
                <td className="text-right py-3 px-4">₹{tuitionFee}</td>
                <td className="text-right py-3 px-4">
                  {tuitionConcession ? (
                    <span className="text-orange-600 font-semibold">
                      -₹{tuitionConcession}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="text-right py-3 px-4 font-semibold text-blue-600">
                  ₹{payableTuition}
                </td>
              </tr>
              {admission.book_fee != null && (
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-medium">Book Fee</td>
                  <td className="text-right py-3 px-4">
                    ₹{admission.book_fee ?? 0}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    -
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-purple-600">
                    ₹{admission.book_fee ?? 0}
                  </td>
                </tr>
              )}
              {admission.transport_required === "YES" && (
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-medium">Transport Fee</td>
                  <td className="text-right py-3 px-4">
                    ₹{admission.transport_fee}
                  </td>
                  <td className="text-right py-3 px-4">
                    {admission.transport_concession &&
                    admission.transport_concession !== "0.00" ? (
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
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

FeeStructure.displayName = "FeeStructure";

const TransportInfo = memo(
  ({ admission }: { admission: CollegeAdmissionDetails }) => {
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
  }
);

TransportInfo.displayName = "TransportInfo";

const SiblingsInfo = memo(
  ({ admission }: { admission: CollegeAdmissionDetails }) => {
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
  }
);

SiblingsInfo.displayName = "SiblingsInfo";

// --- Main Page Component ---

const CollegeAdmissionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id, 10) : null;

  const queryClient = useQueryClient();
  const { data: selectedAdmission, isLoading } = useCollegeAdmissionById(
    studentId
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleExportSingle = useCallback(
    async (admission: CollegeAdmissionDetails) => {
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
          description:
            error?.message || "Failed to export admission to Excel",
          variant: "destructive",
        });
      }
    },
    []
  );

  const handleExportPDF = useCallback(
    async (admission: CollegeAdmissionDetails) => {
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
          description:
            error?.message || "Failed to generate admission form PDF",
          variant: "destructive",
        });
      }
    },
    []
  );

  const handlePayAdmissionFee = useCallback(async () => {
    const admission = selectedAdmission;
    if (!admission) return;

    if (studentId == null || studentId === 0) {
      toast({
        title: "Payment Error",
        description: "Student ID is required for payment.",
        variant: "destructive",
      });
      return;
    }

    const admissionFee = parseFloat(
      admission.admission_fee?.toString() || "0"
    );
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
      const paymentResponse = await handleCollegePayByStudentWithIncomeId(
        studentId,
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

      if (blobUrl) {
        openReceiptInNewTab(
          blobUrl,
          getReceiptNoFromResponse(paymentData)
        );
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

      // Invalidate and refetch admissions queries so list is updated when user goes back
      requestAnimationFrame(() => {
        queryClient.invalidateQueries({
          queryKey: collegeKeys.admissions.root(),
          exact: false,
          refetchType: "none",
        });
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: collegeKeys.admissions.root(),
            exact: false,
          });
        }, 400);
      });
      batchInvalidateQueriesSelective(
        [["college", "admissions"]],
        { refetchType: "none", delay: 0 }
      );
    } catch (error: any) {
      console.error("Payment failed:", error);
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
  }, [selectedAdmission, studentId, queryClient]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader.Data message="Loading admission details..." />
      </div>
    );
  }

  if (!selectedAdmission) {
    return (
      <div className="p-8">
        <Button
          variant="outline"
          className="mb-4 flex items-center gap-2"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admissions
        </Button>
        <p className="text-red-600">
          Admission not found or failed to load details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">College Admission Details</h1>
            <p className="text-muted-foreground">
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
            variant="outline"
            onClick={() => handleExportPDF(selectedAdmission)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          {selectedAdmission.admission_fee_paid === "PENDING" && (
            <Button
              size="sm"
              onClick={handlePayAdmissionFee}
              disabled={isProcessingPayment}
              className="flex items-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <Loader.Spinner className="h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay Admission Fee
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <HeaderCard admission={selectedAdmission} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentInfo admission={selectedAdmission} />
        <ParentInfo admission={selectedAdmission} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddressInfo admission={selectedAdmission} />
        <TransportInfo admission={selectedAdmission} />
      </div>

      <FeeStructure admission={selectedAdmission} />

      <SiblingsInfo admission={selectedAdmission} />
    </div>
  );
};

export default CollegeAdmissionDetailsPage;

