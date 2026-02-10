import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { DatePicker } from "@/common/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/common/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/common/components/ui/sheet";
import {
  UserCheck,
  GraduationCap,
  Edit,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useCollegeReservationsList, useUpdateCollegeReservation, useUpdateCollegeReservationStatus, useCreateCollegeStudent } from "@/features/college/hooks";
import { CollegeReservationsService, CollegeStudentsService } from "@/features/college/services";
import { toast } from "@/common/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ReceiptPreviewModal } from "@/common/components/shared";
import { handleCollegePayByStudentWithIncomeId } from "@/core/api/api-college";
import { getReceiptNoFromResponse } from "@/core/api/payment-types";
import { openReceiptInNewTab } from "@/common/utils/payment";
import { DataTable } from "@/common/components/shared/DataTable";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { startTransition } from "react";
import { collegeKeys } from "@/features/college/hooks/query-keys";

// Use the actual API types instead of custom interface
import type { CollegeReservationMinimalRead, CollegeReservationRead } from "@/features/college/types";

// Helper function to format date from ISO format to YYYY-MM-DD
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  // If date is in ISO format (2025-06-09T00:00:00), extract just the date part
  if (dateString.includes("T")) {
    return dateString.split("T")[0];
  }
  return dateString;
};

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const getStatusVariant = (status: string) => {
    if (status === "CONFIRMED") return "secondary";
    if (status === "PENDING") return "default";
    return "destructive";
  };

  const getStatusClassName = (status: string) => {
    if (status === "CONFIRMED") {
      return "bg-green-500 text-white hover:bg-green-600";
    }
    return "";
  };

  return (
    <Badge
      variant={getStatusVariant(status)}
      className={getStatusClassName(status)}
    >
      {status || "Unknown"}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

// Memoized payment status badge component
const PaymentStatusBadge = memo(
  ({ applicationIncomeId }: { applicationIncomeId?: number | null }) => {
    const isPaid =
      applicationIncomeId !== null && applicationIncomeId !== undefined;
    return (
      <Badge variant={isPaid ? "secondary" : "destructive"} className="text-xs">
        {isPaid ? "✓ Paid" : "Unpaid"}
      </Badge>
    );
  }
);

PaymentStatusBadge.displayName = "PaymentStatusBadge";

// Memoized enroll button component
const EnrollButton = memo(
  ({
    reservationId,
    onEnrollStudent,
  }: {
    reservationId: number;
    onEnrollStudent: (id: number) => void;
  }) => (
    <Button
      size="sm"
      onClick={() => onEnrollStudent(reservationId)}
      className="flex items-center gap-2"
    >
      <UserCheck className="h-4 w-4" />
      Enroll Student
    </Button>
  )
);

EnrollButton.displayName = "EnrollButton";

// Memoized enrolled badge component
const EnrolledBadge = memo(() => (
  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
    <CheckCircle className="h-3 w-3" />
    Enrolled
  </Badge>
));

EnrolledBadge.displayName = "EnrolledBadge";

// Memoized form field component
const FormField = memo(
  ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    rows,
    options,
    isEditMode,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    rows?: number;
    options?: Array<{ value: string; label: string }>;
    isEditMode: boolean;
  }) => (
    <div>
      <Label>{label}</Label>
      {isEditMode ? (
        type === "textarea" ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
          />
        ) : type === "select" ? (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === "date" ? (
          <DatePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder || "Select date"}
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )
      ) : (
        <p className="text-sm font-medium mt-1">{value || "-"}</p>
      )}
    </div>
  )
);

FormField.displayName = "FormField";

// Memoized reservation info component
const ReservationInfo = memo(
  ({ reservation }: { reservation: Reservation }) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Reservation No:
          </span>{" "}
          {reservation.reservation_no}
        </div>
        <div>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Date:
          </span>{" "}
          {formatDate(reservation.reservation_date)}
        </div>
        <div>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Class:
          </span>{" "}
          {reservation.class_name}
        </div>
        <div>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Group:
          </span>{" "}
          {reservation.group_name || "-"}
        </div>
        <div>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Course:
          </span>{" "}
          {reservation.course_name || "-"}
        </div>
        <div>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Status:
          </span>{" "}
          <StatusBadge status={reservation.status} />
        </div>
      </div>
    </div>
  )
);

ReservationInfo.displayName = "ReservationInfo";

// Memoized student info section component
const StudentInfoSection = memo(
  ({
    editForm,
    isEditMode,
    onFieldChange,
  }: {
    editForm: Reservation;
    isEditMode: boolean;
    onFieldChange: (field: string, value: string) => void;
  }) => (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <UserCheck className="h-5 w-5" />
        Student Information
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Student Name"
          value={editForm.student_name}
          onChange={(value) => onFieldChange("student_name", value)}
          isEditMode={isEditMode}
        />
        <FormField
          label="Aadhar Number"
          value={editForm.aadhar_no}
          onChange={(value) => onFieldChange("aadhar_no", value)}
          isEditMode={isEditMode}
        />
        <FormField
          label="Gender"
          value={editForm.gender || ""}
          onChange={(value) => onFieldChange("gender", value)}
          type="select"
          options={[
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
            { value: "OTHER", label: "Other" },
          ]}
          isEditMode={isEditMode}
        />
        <FormField
          label="Date of Birth"
          value={editForm.dob}
          onChange={(value) => onFieldChange("dob", value)}
          type="date"
          isEditMode={isEditMode}
        />
        <FormField
          label="Previous Class"
          value={editForm.previous_class}
          onChange={(value) => onFieldChange("previous_class", value)}
          isEditMode={isEditMode}
        />
        <FormField
          label="Previous School"
          value={editForm.previous_school_details}
          onChange={(value) => onFieldChange("previous_school_details", value)}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  )
);

StudentInfoSection.displayName = "StudentInfoSection";

// Memoized parent info section component
const ParentInfoSection = memo(
  ({
    editForm,
    isEditMode,
    onFieldChange,
  }: {
    editForm: Reservation;
    isEditMode: boolean;
    onFieldChange: (field: string, value: string) => void;
  }) => (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">
        Parent/Guardian Information
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Father/Guardian Name"
          value={editForm.father_or_guardian_name || ""}
          onChange={(value) => onFieldChange("father_or_guardian_name", value)}
          isEditMode={isEditMode}
        />
        <FormField
          label="Father/Guardian Aadhar"
          value={editForm.father_or_guardian_aadhar_no || ""}
          onChange={(value) =>
            onFieldChange("father_or_guardian_aadhar_no", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Father/Guardian Mobile"
          value={editForm.father_or_guardian_mobile || ""}
          onChange={(value) =>
            onFieldChange("father_or_guardian_mobile", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Father/Guardian Occupation"
          value={editForm.father_or_guardian_occupation || ""}
          onChange={(value) =>
            onFieldChange("father_or_guardian_occupation", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Name"
          value={editForm.mother_or_guardian_name || ""}
          onChange={(value) => onFieldChange("mother_or_guardian_name", value)}
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Aadhar"
          value={editForm.mother_or_guardian_aadhar_no || ""}
          onChange={(value) =>
            onFieldChange("mother_or_guardian_aadhar_no", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Mobile"
          value={editForm.mother_or_guardian_mobile || ""}
          onChange={(value) =>
            onFieldChange("mother_or_guardian_mobile", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Occupation"
          value={editForm.mother_or_guardian_occupation || ""}
          onChange={(value) =>
            onFieldChange("mother_or_guardian_occupation", value)
          }
          isEditMode={isEditMode}
        />
      </div>
    </div>
  )
);

ParentInfoSection.displayName = "ParentInfoSection";

// Memoized address info section component
const AddressInfoSection = memo(
  ({
    editForm,
    isEditMode,
    onFieldChange,
  }: {
    editForm: Reservation;
    isEditMode: boolean;
    onFieldChange: (field: string, value: string) => void;
  }) => (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">Address Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          label="Present Address"
          value={editForm.present_address}
          onChange={(value) => onFieldChange("present_address", value)}
          type="textarea"
          rows={2}
          isEditMode={isEditMode}
        />
        <FormField
          label="Permanent Address"
          value={editForm.permanent_address}
          onChange={(value) => onFieldChange("permanent_address", value)}
          type="textarea"
          rows={2}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  )
);

AddressInfoSection.displayName = "AddressInfoSection";

// Memoized fee table row component
const FeeTableRow = memo(
  ({
    feeType,
    amount,
    concession,
    payable,
    status,
    isPaid,
  }: {
    feeType: string;
    amount: number;
    concession: number;
    payable: number;
    status: string;
    isPaid: boolean;
  }) => (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <td className="py-3 px-4 font-medium">{feeType}</td>
      <td className="text-right py-3 px-4 font-semibold">
        ₹{amount.toLocaleString()}
      </td>
      <td className="text-right py-3 px-4">
        {concession > 0 ? (
          <span className="text-orange-600 font-semibold">
            -₹{concession.toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="text-right py-3 px-4 font-semibold text-blue-600">
        ₹{payable.toLocaleString()}
      </td>
      <td className="text-center py-3 px-4">
        <Badge
          variant={isPaid ? "secondary" : "destructive"}
          className="text-xs"
        >
          {isPaid ? "✓ Paid" : status}
        </Badge>
      </td>
    </tr>
  )
);

FeeTableRow.displayName = "FeeTableRow";

// Memoized fee structure component
const FeeStructure = memo(({ editForm }: { editForm: Reservation }) => (
  <div className="border-t pt-4">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <span className="text-lg font-bold">₹</span>
      Fee Structure & Payment Details
    </h3>

    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-800">
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
          <FeeTableRow
            feeType="Application Fee"
            amount={editForm.application_fee}
            concession={0}
            payable={editForm.application_fee}
            status="Unpaid"
            isPaid={!!editForm.application_income_id}
          />
          <FeeTableRow
            feeType="Admission Fee"
            amount={3000}
            concession={0}
            payable={3000}
            status={editForm.admission_income_id ? "Paid" : "Pending"}
            isPaid={!!editForm.admission_income_id}
          />
          <FeeTableRow
            feeType="Group Fee"
            amount={editForm.group_fee || editForm.tuition_fee || 0}
            concession={editForm.tuition_concession || 0}
            payable={(editForm.group_fee || editForm.tuition_fee || 0) - (editForm.tuition_concession || 0)}
            status="Pending"
            isPaid={false}
          />
          {editForm.course_fee && editForm.course_fee > 0 && (
            <FeeTableRow
              feeType="Course Fee"
              amount={editForm.course_fee}
              concession={0}
              payable={editForm.course_fee}
              status="Pending"
              isPaid={false}
            />
          )}
          <FeeTableRow
            feeType="Book Fee"
            amount={editForm.book_fee || 0}
            concession={0}
            payable={editForm.book_fee || 0}
            status="Pending"
            isPaid={false}
          />
          {editForm.transport_required && (
            <FeeTableRow
              feeType="Transport Fee"
              amount={editForm.transport_fee || 0}
              concession={editForm.transport_concession || 0}
              payable={(editForm.transport_fee || 0) - (editForm.transport_concession || 0)}
              status="Pending"
              isPaid={false}
            />
          )}
        </tbody>
      </table>
    </div>

    {editForm.concession_lock && (
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
        <div className="text-red-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-red-900 dark:text-red-100">
            Fee Structure Locked
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Tuition and Transport fees (including concessions) are locked and
            cannot be modified.
          </p>
        </div>
      </div>
    )}
  </div>
));

FeeStructure.displayName = "FeeStructure";

// Memoized admission fee section component
const AdmissionFeeSection = memo(
  ({
    editForm,
    admissionFee,
    onAdmissionFeeChange,
  }: {
    editForm: Reservation;
    admissionFee: number;
    onAdmissionFeeChange: (fee: number) => void;
  }) => (
    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <Label className="text-base font-semibold text-green-900 dark:text-green-100">
            {editForm.admission_income_id
              ? "Admission Fee Status"
              : "Admission Fee to Collect Now"}
          </Label>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {editForm.admission_income_id
              ? "Admission fee has already been paid"
              : "This is a one-time payment required during enrollment"}
          </p>
        </div>
      </div>
      {editForm.admission_income_id ? (
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-lg border-2 border-green-400">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-lg font-bold text-green-600">
              Admission Fee Paid
            </p>
            <p className="text-sm text-muted-foreground">
              Payment has been successfully processed
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="number"
              value={admissionFee}
              onChange={(e) => onAdmissionFeeChange(Number(e.target.value))}
              placeholder="Enter admission fee"
              className="text-xl font-bold h-12 bg-white dark:bg-slate-950 border-green-300 focus:border-green-500"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Default Amount</p>
            <p className="text-lg font-bold text-green-600">₹3,000</p>
          </div>
        </div>
      )}
    </div>
  )
);

AdmissionFeeSection.displayName = "AdmissionFeeSection";

// Memoized payment dialog component
const PaymentDialog = memo(
  ({
    isOpen,
    onClose,
    admissionNo,
    admissionFee,
    onPaymentProcess,
    isProcessing,
  }: {
    isOpen: boolean;
    onClose: () => void;
    admissionNo: string;
    admissionFee: number;
    onPaymentProcess: () => void;
    isProcessing: boolean;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Collect Admission Fee</DialogTitle>
          <DialogDescription>
            {admissionNo
              ? `Student enrolled successfully with admission number: ${admissionNo}`
              : "Student enrolled successfully."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-green-900 dark:text-green-100">
              Enrollment Successful!
            </p>
            {admissionNo && (
              <p className="text-sm text-muted-foreground mt-1">
                Admission No: {admissionNo}
              </p>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Admission Fee:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{admissionFee.toLocaleString()}
              </span>
            </div>

            <Button
              onClick={onPaymentProcess}
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <span className="text-lg font-bold mr-2">₹</span>
                  Collect Payment & Print Receipt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
);

PaymentDialog.displayName = "PaymentDialog";

type Reservation = CollegeReservationMinimalRead & {
  // Add any additional properties needed for the component
  reservation_no?: string;
  student_name: string;
  aadhar_no: string;
  gender: string;
  dob: string;
  group_name?: string | null;
  course_name?: string | null;
  father_or_guardian_name?: string;
  father_or_guardian_aadhar_no?: string;
  father_or_guardian_mobile?: string;
  father_or_guardian_occupation?: string;
  mother_or_guardian_name?: string;
  mother_or_guardian_aadhar_no?: string;
  mother_or_guardian_mobile?: string;
  mother_or_guardian_occupation?: string;
  siblings?: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }>;
  previous_class: string;
  previous_school_details: string;
  present_address: string;
  permanent_address: string;
  application_fee: number;
  application_fee_paid: boolean;
  preferred_class_id: number;
  preferred_group_id?: number;
  preferred_course_id?: number;
  class_name: string;
  tuition_fee: number;
  total_tuition_fee?: number;
  book_fee: number;
  tuition_concession: number;
  transport_required: boolean;
  preferred_transport_id: number | null;
  preferred_distance_slab_id: number | null;
  pickup_point: string | null;
  transport_fee: number;
  transport_concession: number;
  concession_lock: boolean;
  status: string;
  referred_by: number | null;
  remarks: string | null;
  reservation_date: string;
  is_enrolled?: boolean;
  admission_income_id?: number;
  application_income_id?: number | null;
  group_fee?: number;
  course_fee?: number;
}

const ConfirmedReservationsTabComponent = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("CONFIRMED");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string>("");
  const [createdAdmissionNo, setCreatedAdmissionNo] = useState<string>("");
  const [createdStudentId, setCreatedStudentId] = useState<number | null>(null);
  const [admissionFee, setAdmissionFee] = useState<number>(3000);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Edit form state
  const [editForm, setEditForm] = useState<Reservation | null>(null);

  // Fetch reservations
  const {
    data: reservationsData,
    isLoading,
    refetch,
  } = useCollegeReservationsList({
    page: 1,
    page_size: 100,
    status: statusFilter,
  });

  // Memoized data processing
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];
    if (!Array.isArray(reservationsData.reservations)) return [];
    return reservationsData.reservations;
  }, [reservationsData]);

  // Initialize mutation hooks
  const createStudentMutation = useCreateCollegeStudent();
  const updateReservationMutation = useUpdateCollegeReservation(selectedReservation?.reservation_id ?? 0);
  const updateStatusMutation = useUpdateCollegeReservationStatus(selectedReservation?.reservation_id ?? 0);

  // Define handleViewDetails
  const handleViewDetails = useCallback(async (reservationId: number) => {
    try {
      const reservationDetails = await CollegeReservationsService.getById(reservationId);
      setSelectedReservation(reservationDetails as unknown as Reservation);
      setEditForm(reservationDetails as unknown as Reservation);
      setAdmissionFee(3000);
      setIsEditMode(false);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Failed to load reservation:", error);
      toast({
        title: "Error",
        description: "Failed to load reservation details. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  const handleEnrollStudent = useCallback(async (reservationId: number) => {
    try {
      const reservationDetails = await CollegeReservationsService.getById(reservationId);
      setSelectedReservation(reservationDetails as unknown as Reservation);
      setEditForm(reservationDetails as unknown as Reservation);
      setAdmissionFee(3000);
      setIsEditMode(false);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Failed to load reservation:", error);
      toast({
        title: "Error",
        description: "Failed to load reservation details. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions: ActionConfig<CollegeReservationMinimalRead>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row) => handleViewDetails(row.reservation_id),
    },
  ], [handleViewDetails]);

  // Define columns
  const columns: ColumnDef<CollegeReservationMinimalRead>[] = useMemo(() => [
    {
      accessorKey: "reservation_no",
      header: "Reservation No",
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">
          {row.getValue("reservation_no")}
        </span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("student_name")}</span>,
    },
    {
      accessorKey: "reservation_date",
      header: "Date",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.getValue("reservation_date"))}</span>,
    },
    {
      accessorKey: "group_name",
      header: "Group",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-50">
          {row.getValue("group_name") || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "course_name",
      header: "Course",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-50">
          {row.getValue("course_name") || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "application_income_id",
      header: "App Fee",
      cell: ({ row }) => (
        <PaymentStatusBadge
          applicationIncomeId={row.getValue("application_income_id")}
        />
      ),
    },
    {
      accessorKey: "is_enrolled",
      header: "Enrollment Status",
      cell: ({ row }) => {
        const isEnrolled = row.original.is_enrolled;
        return isEnrolled ? <EnrolledBadge /> : (
          <EnrollButton
            reservationId={row.original.reservation_id}
            onEnrollStudent={handleEnrollStudent}
          />
        );
      },
    },
  ], [handleEnrollStudent]);

  const handleEditDetails = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditForm(selectedReservation);
    setIsEditMode(false);
  }, [selectedReservation]);

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      if (!editForm) return;
      setEditForm({ ...editForm, [field]: value });
    },
    [editForm]
  );

  const handleAdmissionFeeChange = useCallback((fee: number) => {
    setAdmissionFee(fee);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editForm) return;

    try {
      const updatePayload = {
        student_name: editForm.student_name,
        aadhar_no: editForm.aadhar_no,
        gender: editForm.gender,
        dob: editForm.dob,
        father_name: editForm.father_or_guardian_name,
        father_aadhar_no: editForm.father_or_guardian_aadhar_no,
        father_mobile: editForm.father_or_guardian_mobile,
        father_occupation: editForm.father_or_guardian_occupation,
        mother_name: editForm.mother_or_guardian_name,
        mother_aadhar_no: editForm.mother_or_guardian_aadhar_no,
        mother_mobile: editForm.mother_or_guardian_mobile,
        mother_occupation: editForm.mother_or_guardian_occupation,
        siblings: editForm.siblings?.map(sibling => ({
          ...sibling,
          gender: sibling.gender as "MALE" | "FEMALE" | "OTHER" | null
        })),
        previous_class: editForm.previous_class,
        previous_school_details: editForm.previous_school_details,
        present_address: editForm.present_address,
        permanent_address: editForm.permanent_address,
        application_fee: editForm.application_fee,
        preferred_class_id: editForm.preferred_class_id,
        group_name: editForm.class_name,
        course_name: editForm.class_name,
        group_fee: editForm.tuition_fee,
        course_fee: 0,
        book_fee: editForm.book_fee,
        total_tuition_fee: editForm.tuition_fee,
        tuition_concession: editForm.tuition_concession,
        transport_required: editForm.transport_required,
        preferred_transport_id: editForm.preferred_transport_id,
        preferred_distance_slab_id: editForm.preferred_distance_slab_id,
        pickup_point: editForm.pickup_point,
        transport_fee: editForm.transport_fee,
        transport_concession: editForm.transport_concession,
        status: editForm.status,
        referred_by: editForm.referred_by,
        remarks: editForm.remarks,
        reservation_date: editForm.reservation_date,
      };
      // Use mutation hook which handles cache invalidation automatically
      // Following CACHE_REVIEW_ACADEMIC.md: mutation hook already invalidates and refetches
      await updateReservationMutation.mutateAsync(updatePayload);

      // ✅ FIX: Removed CacheUtils - React Query handles caching properly
      // Mutation hook already invalidates queries, no need for additional cache clearing

      // Wait for React Query to update the cache and React to process state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: "Reservation Updated",
        description: "Reservation details have been updated successfully.",
        variant: "success",
      });
      setIsEditMode(false);
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: error?.message || "Could not update reservation. Please try again.",
        variant: "destructive",
      });
    }
  }, [editForm, selectedReservation, updateReservationMutation, queryClient]);

  const handleEnrollConfirm = useCallback(async () => {
    if (!selectedReservation) return;

    try {
      // Create student record from reservation
      const studentData = {
        reservation_id: selectedReservation.reservation_id,
        student_name: selectedReservation.student_name,
        aadhar_no: selectedReservation.aadhar_no,
        gender: selectedReservation.gender,
        dob: selectedReservation.dob,
        father_name: selectedReservation.father_or_guardian_name,
        father_aadhar_no: selectedReservation.father_or_guardian_aadhar_no,
        father_mobile: selectedReservation.father_or_guardian_mobile,
        father_occupation: selectedReservation.father_or_guardian_occupation,
        mother_name: selectedReservation.mother_or_guardian_name,
        mother_aadhar_no: selectedReservation.mother_or_guardian_aadhar_no,
        mother_mobile: selectedReservation.mother_or_guardian_mobile,
        mother_occupation: selectedReservation.mother_or_guardian_occupation,
        siblings: selectedReservation.siblings,
        previous_class: selectedReservation.previous_class,
        previous_school_details: selectedReservation.previous_school_details,
        present_address: selectedReservation.present_address,
        permanent_address: selectedReservation.permanent_address,
        application_fee: selectedReservation.application_fee,
        preferred_class_id: selectedReservation.preferred_class_id,
        preferred_group_id: selectedReservation.preferred_group_id,
        group_name: selectedReservation.group_name,
        preferred_course_id: selectedReservation.preferred_course_id,
        course_name: selectedReservation.course_name,
        group_fee: selectedReservation.group_fee || selectedReservation.tuition_fee,
        course_fee: selectedReservation.course_fee,
        book_fee: selectedReservation.book_fee,
        total_tuition_fee: selectedReservation.total_tuition_fee || selectedReservation.tuition_fee,
        tuition_concession: selectedReservation.tuition_concession,
        transport_required: selectedReservation.transport_required,
        preferred_transport_id: selectedReservation.preferred_transport_id,
        preferred_distance_slab_id: selectedReservation.preferred_distance_slab_id,
        pickup_point: selectedReservation.pickup_point,
        transport_fee: selectedReservation.transport_fee,
        transport_concession: selectedReservation.transport_concession,
        status: selectedReservation.status,
        referred_by: selectedReservation.referred_by,
        remarks: selectedReservation.remarks,
        reservation_date: selectedReservation.reservation_date,
      };

      const response = await createStudentMutation.mutateAsync(studentData) as any;
      
      // Check if the operation was successful (StudentCreationResult structure)
      if (response?.success === false) {
        const errorMessage = response?.message || "Failed to enroll student. Please try again.";
        console.error("Student response:", response);
        toast({
          title: "Enrollment Failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }

      const raw = response as { data?: { student_id?: number; admission_no?: string }; student_id?: number; admission_no?: string };
      const studentId = raw?.data?.student_id ?? raw?.student_id;
      const admissionNo = raw?.data?.admission_no ?? raw?.admission_no;

      if (studentId == null || studentId === 0) {
        console.error("Student response:", response);
        toast({
          title: "Enrollment Error",
          description:
            "Student created but student_id not received from server.",
          variant: "destructive",
        });
        throw new Error("Student created but no student_id received");
      }

      setCreatedStudentId(studentId);
      setCreatedAdmissionNo(admissionNo ?? "");
      setShowDetailsDialog(false);
      setShowPaymentDialog(true);

      // Small delay to ensure backend has processed the enrollment
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      requestAnimationFrame(() => {
        queryClient.invalidateQueries({
          queryKey: collegeKeys.reservations.root(),
          exact: false,
          refetchType: 'none',
        });
        
        queryClient.invalidateQueries({
          queryKey: collegeKeys.students.root(),
          exact: false,
          refetchType: 'none',
        });
        
        queryClient.invalidateQueries({
          queryKey: collegeKeys.admissions.root(),
          exact: false,
          refetchType: 'none',
        });
        
        // Manually refetch with delays
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: collegeKeys.reservations.root(),
            exact: false,
            type: 'active',
          });
        }, 200);
        
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: collegeKeys.students.root(),
            exact: false,
            type: 'active',
          });
        }, 300);
        
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: collegeKeys.admissions.root(),
            exact: false,
            type: 'active',
          });
        }, 400);
      });

      // Wait for React Query to update the cache
      await new Promise(resolve => setTimeout(resolve, 300));

      // Force table refresh
      setRefreshKey((prev) => prev + 1);

      toast({
        title: "Student Enrolled Successfully",
        description: admissionNo ? `Student enrolled with admission number ${admissionNo}` : "Student enrolled successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Enrollment failed:", error);
      toast({
        title: "Enrollment Failed",
        description:
          error?.message || "Failed to enroll student. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedReservation, createStudentMutation, queryClient]);

  const handlePaymentProcess = useCallback(async () => {
    if (createdStudentId == null || createdStudentId === 0) return;

    setIsProcessingPayment(true);

    try {
      const result = await handleCollegePayByStudentWithIncomeId(createdStudentId, {
        details: [{
          purpose: "ADMISSION_FEE",
          paid_amount: admissionFee,
          payment_method: "CASH",
        }],
        remarks: "Admission fee payment",
      });

      const { blobUrl, paymentData } = result;

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

      // Small delay to ensure backend has processed the payment
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      requestAnimationFrame(() => {
        queryClient.invalidateQueries({
          queryKey: collegeKeys.reservations.root(),
          exact: false,
          refetchType: 'none',
        });
        
        queryClient.invalidateQueries({
          queryKey: collegeKeys.students.root(),
          exact: false,
          refetchType: 'none',
        });
        
        queryClient.invalidateQueries({
          queryKey: collegeKeys.admissions.root(),
          exact: false,
          refetchType: 'none',
        });
        
        // Manually refetch with staggered delays
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: collegeKeys.reservations.root(),
            exact: false,
            type: 'active',
          });
        }, 200);
        
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: collegeKeys.students.root(),
            exact: false,
            type: 'active',
          });
        }, 300);
        
        // Refetch all admissions queries so Student Admissions list shows updated status
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: collegeKeys.admissions.root(),
            exact: false,
          });
        }, 400);
      });

      // Step 4: Wait for React Query to update the cache and React to process state updates
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 5: Force table refresh by updating refresh key
      // This ensures the action button shows "Enrolled" badge after payment
      setRefreshKey((prev) => prev + 1);
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
  }, [createdStudentId, admissionFee, queryClient, refetch]);

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
      setReceiptBlobUrl("");
    }
    
    // ✅ CRITICAL FIX: Clear other state immediately
    setCreatedAdmissionNo("");
    setCreatedStudentId(null);
    setAdmissionFee(0);
    setSelectedReservation(null);
    
    // ✅ CRITICAL FIX: Defer query invalidation to prevent UI blocking
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(
        () => {
          // Refetch reservations after modal closes
          if (refetch) {
            void refetch();
          }
        },
        { timeout: 1000 }
      );
    } else {
      setTimeout(() => {
        if (refetch) {
          void refetch();
        }
      }, 500);
    }
  }, [receiptBlobUrl, refetch]);

  return (
    <div className="space-y-6">
      {/* Reservations Table */}
      <DataTable
        key={`confirmed-reservations-${refreshKey}`}
        data={allReservations}
        columns={columns}
        actions={actions}
        title="Confirmed Reservations"
        searchKey="student_name"
        searchPlaceholder="Search by name, reservation number..."
        loading={isLoading}
        showSearch={true}
        className="w-full"
      />

      {/* Reservation Details Sheet (aligned with school UI) */}
      <Sheet open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl h-full overflow-y-auto scrollbar-hide"
        >
          <SheetHeader className="pr-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle>Student Enrollment Details</SheetTitle>
                <SheetDescription>
                  Review and confirm student details before enrollment
                </SheetDescription>
              </div>
              {!isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditDetails}
                  className="flex items-center gap-2 ml-4 shrink-0"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </Button>
              )}
            </div>
          </SheetHeader>

          {editForm && (
            <div className="space-y-6 py-6">
              <ReservationInfo reservation={editForm} />
              <StudentInfoSection
                editForm={editForm}
                isEditMode={isEditMode}
                onFieldChange={handleFieldChange}
              />
              <ParentInfoSection
                editForm={editForm}
                isEditMode={isEditMode}
                onFieldChange={handleFieldChange}
              />
              <AddressInfoSection
                editForm={editForm}
                isEditMode={isEditMode}
                onFieldChange={handleFieldChange}
              />
              <FeeStructure editForm={editForm} />
              <AdmissionFeeSection
                editForm={editForm}
                admissionFee={admissionFee}
                onAdmissionFeeChange={handleAdmissionFeeChange}
              />
            </div>
          )}

          <SheetFooter className="flex flex-row gap-2 sm:gap-2 border-t pt-4 mt-6">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  Cancel
                </Button>
                {!editForm?.is_enrolled && (
                  <Button
                    onClick={handleEnrollConfirm}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="h-4 w-4" />
                    Enroll Student
                  </Button>
                )}
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog && !showReceiptModal}
        onClose={() => {
          setShowPaymentDialog(false);
          setCreatedAdmissionNo("");
          setCreatedStudentId(null);
        }}
        admissionNo={createdAdmissionNo}
        admissionFee={admissionFee}
        onPaymentProcess={handlePaymentProcess}
        isProcessing={isProcessingPayment}
      />

      {/* Receipt Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl}
      />
    </div>
  );
};

export const ConfirmedReservationsTab = ConfirmedReservationsTabComponent;
export default ConfirmedReservationsTabComponent;
