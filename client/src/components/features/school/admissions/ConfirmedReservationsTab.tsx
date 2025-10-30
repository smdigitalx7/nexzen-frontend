import { useState, useMemo, useCallback, memo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCheck,
  GraduationCap,
  Edit,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import {
  useSchoolReservationsList,
  useUpdateSchoolReservation,
} from "@/lib/hooks/school/use-school-reservations";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import { SchoolStudentsService } from "@/lib/services/school/students.service";
import { toast } from "@/hooks/use-toast";
import { ReceiptPreviewModal } from "@/components/shared";
import { handleRegenerateReceipt } from "@/lib/api";
import { handleSchoolPayByAdmissionWithIncomeId as handlePayByAdmissionWithIncomeId } from "@/lib/api-school";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import type { SchoolReservationListItem } from "@/lib/types/school/reservations";
import { useQueryClient } from "@tanstack/react-query";

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
          value={editForm.gender}
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
          value={editForm.father_or_guardian_name}
          onChange={(value) => onFieldChange("father_or_guardian_name", value)}
          isEditMode={isEditMode}
        />
        <FormField
          label="Father/Guardian Aadhar"
          value={editForm.father_or_guardian_aadhar_no}
          onChange={(value) =>
            onFieldChange("father_or_guardian_aadhar_no", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Father/Guardian Mobile"
          value={editForm.father_or_guardian_mobile}
          onChange={(value) =>
            onFieldChange("father_or_guardian_mobile", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Father/Guardian Occupation"
          value={editForm.father_or_guardian_occupation}
          onChange={(value) =>
            onFieldChange("father_or_guardian_occupation", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Name"
          value={editForm.mother_or_guardian_name}
          onChange={(value) => onFieldChange("mother_or_guardian_name", value)}
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Aadhar"
          value={editForm.mother_or_guardian_aadhar_no}
          onChange={(value) =>
            onFieldChange("mother_or_guardian_aadhar_no", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Mobile"
          value={editForm.mother_or_guardian_mobile}
          onChange={(value) =>
            onFieldChange("mother_or_guardian_mobile", value)
          }
          isEditMode={isEditMode}
        />
        <FormField
          label="Mother/Guardian Occupation"
          value={editForm.mother_or_guardian_occupation}
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
      <DollarSign className="h-5 w-5" />
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
            feeType="Tuition Fee"
            amount={editForm.tuition_fee}
            concession={editForm.tuition_concession}
            payable={editForm.tuition_fee - editForm.tuition_concession}
            status="Pending"
            isPaid={false}
          />
          <FeeTableRow
            feeType="Book Fee"
            amount={editForm.book_fee}
            concession={0}
            payable={editForm.book_fee}
            status="Pending"
            isPaid={false}
          />
          {editForm.transport_required && (
            <FeeTableRow
              feeType="Transport Fee"
              amount={editForm.transport_fee}
              concession={editForm.transport_concession}
              payable={editForm.transport_fee - editForm.transport_concession}
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
            Student enrolled successfully with admission number: {admissionNo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-green-900 dark:text-green-100">
              Enrollment Successful!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Admission No: {admissionNo}
            </p>
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
                  <DollarSign className="h-5 w-5 mr-2" />
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

interface Reservation {
  reservation_id: number;
  reservation_no: string;
  student_name: string;
  aadhar_no: string;
  gender: string;
  dob: string;
  father_or_guardian_name: string;
  father_or_guardian_aadhar_no: string;
  father_or_guardian_mobile: string;
  father_or_guardian_occupation: string;
  mother_or_guardian_name: string;
  mother_or_guardian_aadhar_no: string;
  mother_or_guardian_mobile: string;
  mother_or_guardian_occupation: string;
  siblings: Array<{
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
  application_fee_paid: string;
  application_income_id?: number | null;
  preferred_class_id: number;
  class_name: string;
  tuition_fee: number;
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
  income_id?: number;
  is_enrolled?: boolean;
  admission_income_id?: number;
}

const ConfirmedReservationsTabComponent = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("CONFIRMED");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string>("");
  const [createdAdmissionNo, setCreatedAdmissionNo] = useState<string>("");
  const [admissionFee, setAdmissionFee] = useState<number>(0);
  const [editForm, setEditForm] = useState<Reservation | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const {
    data: reservationsData,
    isLoading,
    refetch,
  } = useSchoolReservationsList({
    page: 1,
    page_size: 100,
    status: statusFilter,
  });

  // Get update mutation hook (we'll use this properly)
  const updateReservationMutation = useUpdateSchoolReservation(
    selectedReservation?.reservation_id ?? 0
  );

  // Memoized data processing
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];
    if (!Array.isArray(reservationsData.reservations)) return [];
    return reservationsData.reservations;
  }, [reservationsData]);

  // Memoized handlers
  const handleEnrollStudent = useCallback(async (reservationId: number) => {
    try {
      const reservationDetails =
        await SchoolReservationsService.getById(reservationId);
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
    if (!editForm || !selectedReservation) return;

    try {
      // Convert payload to FormData as required by the service
      const formData = new FormData();
      formData.append("student_name", editForm.student_name);
      formData.append("aadhar_no", editForm.aadhar_no);
      formData.append("gender", editForm.gender);
      formData.append("dob", editForm.dob);
      formData.append(
        "father_or_guardian_name",
        editForm.father_or_guardian_name
      );
      formData.append(
        "father_or_guardian_aadhar_no",
        editForm.father_or_guardian_aadhar_no
      );
      formData.append(
        "father_or_guardian_mobile",
        editForm.father_or_guardian_mobile
      );
      formData.append(
        "father_or_guardian_occupation",
        editForm.father_or_guardian_occupation
      );
      formData.append(
        "mother_or_guardian_name",
        editForm.mother_or_guardian_name
      );
      formData.append(
        "mother_or_guardian_aadhar_no",
        editForm.mother_or_guardian_aadhar_no
      );
      formData.append(
        "mother_or_guardian_mobile",
        editForm.mother_or_guardian_mobile
      );
      formData.append(
        "mother_or_guardian_occupation",
        editForm.mother_or_guardian_occupation
      );
      if (editForm.siblings && editForm.siblings.length > 0) {
        formData.append("siblings", JSON.stringify(editForm.siblings));
      }
      formData.append("previous_class", editForm.previous_class);
      formData.append(
        "previous_school_details",
        editForm.previous_school_details
      );
      formData.append("present_address", editForm.present_address);
      formData.append("permanent_address", editForm.permanent_address);
      formData.append("application_fee", editForm.application_fee.toString());
      formData.append("application_fee_paid", editForm.application_fee_paid);
      formData.append(
        "preferred_class_id",
        editForm.preferred_class_id.toString()
      );
      if (editForm.preferred_transport_id) {
        formData.append(
          "preferred_transport_id",
          editForm.preferred_transport_id.toString()
        );
      }
      if (editForm.preferred_distance_slab_id) {
        formData.append(
          "preferred_distance_slab_id",
          editForm.preferred_distance_slab_id.toString()
        );
      }
      if (editForm.pickup_point) {
        formData.append("pickup_point", editForm.pickup_point);
      }
      formData.append("transport_fee", editForm.transport_fee.toString());
      formData.append("status", editForm.status);
      if (editForm.referred_by) {
        formData.append("referred_by", editForm.referred_by.toString());
      }
      if (editForm.remarks) {
        formData.append("remarks", editForm.remarks);
      }
      formData.append("reservation_date", editForm.reservation_date);

      // Use mutation hook which handles cache invalidation automatically
      await updateReservationMutation.mutateAsync(formData);

      // Invalidating queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["school", "reservations"] });

      // Refresh reservation details
      const updatedReservation = await SchoolReservationsService.getById(
        selectedReservation.reservation_id
      );
      setSelectedReservation(updatedReservation as unknown as Reservation);
      setEditForm(updatedReservation as unknown as Reservation);
      setIsEditMode(false);
    } catch (error: any) {
      // Error toast is handled by mutation hook
      console.error("Failed to update reservation:", error);
    }
  }, [editForm, selectedReservation, updateReservationMutation, queryClient]);

  const handleEnrollConfirm = useCallback(async () => {
    if (!selectedReservation) return;

    try {
      const payload = {
        reservation_id: selectedReservation.reservation_id,
        student_name: selectedReservation.student_name,
        aadhar_no: selectedReservation.aadhar_no,
        gender: selectedReservation.gender,
        dob: selectedReservation.dob,
        father_or_guardian_name: selectedReservation.father_or_guardian_name,
        father_or_guardian_aadhar_no:
          selectedReservation.father_or_guardian_aadhar_no,
        father_or_guardian_mobile:
          selectedReservation.father_or_guardian_mobile,
        father_or_guardian_occupation:
          selectedReservation.father_or_guardian_occupation,
        mother_or_guardian_name: selectedReservation.mother_or_guardian_name,
        mother_or_guardian_aadhar_no:
          selectedReservation.mother_or_guardian_aadhar_no,
        mother_or_guardian_mobile:
          selectedReservation.mother_or_guardian_mobile,
        mother_or_guardian_occupation:
          selectedReservation.mother_or_guardian_occupation,
        present_address: selectedReservation.present_address,
        permanent_address: selectedReservation.permanent_address,
        admission_fee: admissionFee,
      };

      const studentResponse =
        await SchoolStudentsService.createFromReservation(payload);
      const admissionNo =
        (studentResponse as any)?.data?.admission_no ||
        (studentResponse as any)?.admission_no;

      if (!admissionNo) {
        console.error("Student response:", studentResponse);
        toast({
          title: "Enrollment Error",
          description:
            "Student created but admission number not received from server.",
          variant: "destructive",
        });
        throw new Error("Student created but no admission number received");
      }

      setCreatedAdmissionNo(admissionNo);
      setShowDetailsDialog(false);
      setShowPaymentDialog(true);

      toast({
        title: "Student Enrolled Successfully",
        description: `Student enrolled with admission number ${admissionNo}`,
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
  }, [selectedReservation, admissionFee]);

  const handlePaymentProcess = useCallback(async () => {
    if (!createdAdmissionNo) return;

    setIsProcessingPayment(true);

    try {
      const paymentResponse = await handlePayByAdmissionWithIncomeId(
        createdAdmissionNo,
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
        setShowPaymentDialog(false);
        setShowReceiptModal(true);
      }

      toast({
        title: "Payment Successful",
        description: "Admission fee payment processed successfully",
        variant: "success",
      });

      // Invalidate reservations cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["school", "reservations"] });
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
  }, [createdAdmissionNo, admissionFee, refetch, queryClient]);

  const handleCloseReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    // Clean up blob URL after a delay to ensure modal has time to use it
    setTimeout(() => {
      if (receiptBlobUrl) {
        URL.revokeObjectURL(receiptBlobUrl);
      }
      setReceiptBlobUrl("");
      setCreatedAdmissionNo("");
      setAdmissionFee(0);
      setSelectedReservation(null);
    }, 100);
  }, [receiptBlobUrl]);

  // Column definitions for the enhanced table
  const columns: ColumnDef<SchoolReservationListItem>[] = useMemo(
    () => [
      {
        accessorKey: "reservation_no",
        header: "Reservation No",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("reservation_no")}</span>
        ),
      },
      {
        accessorKey: "student_name",
        header: "Student Name",
        cell: ({ row }) => <span>{row.getValue("student_name")}</span>,
      },
      {
        accessorKey: "admit_into",
        header: "Class",
        cell: ({ row }) => <span>{row.getValue("admit_into") || "-"}</span>,
      },
      {
        accessorKey: "application_income_id",
        header: "Payment Status",
        cell: ({ row }) => {
          const applicationIncomeId = row.getValue("application_income_id") as
            | number
            | null
            | undefined;
          return (
            <PaymentStatusBadge applicationIncomeId={applicationIncomeId} />
          );
        },
      },
      {
        accessorKey: "reservation_date",
        header: "Date",
        cell: ({ row }) => (
          <span>{formatDate(row.getValue("reservation_date") as string)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <StatusBadge status={status} />;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const reservation = row.original;
          const isEnrolled = reservation.is_enrolled ?? false;
          return isEnrolled ? (
            <EnrolledBadge />
          ) : (
            <EnrollButton
              reservationId={reservation.reservation_id}
              onEnrollStudent={handleEnrollStudent}
            />
          );
        },
      },
    ],
    [handleEnrollStudent]
  );

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Reservations Table */}
      <EnhancedDataTable
        data={allReservations}
        columns={columns}
        title="Confirmed Reservations"
        searchKey="student_name"
        searchPlaceholder="Search by name, reservation number..."
        loading={isLoading}
        showSearch={true}
        enableDebounce={true}
        debounceDelay={300}
        highlightSearchResults={true}
        className="w-full"
        exportable={true}
      />

      {/* Reservation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Student Enrollment Details</span>
              {!isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditDetails}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Review and confirm student details before enrollment
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="space-y-6">
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

          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
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
