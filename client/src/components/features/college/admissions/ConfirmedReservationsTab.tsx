import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { useCollegeReservationsList, useUpdateCollegeReservation, useUpdateCollegeReservationStatus, useCreateCollegeStudent } from "@/lib/hooks/college";
import { CollegeReservationsService, CollegeStudentsService } from "@/lib/services/college";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ReceiptPreviewModal } from "@/components/shared";
import { handleCollegePayByAdmissionWithIncomeId as handlePayByAdmissionWithIncomeId } from "@/lib/api-college";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";

// Use the actual API types instead of custom interface
import type { CollegeReservationMinimalRead, CollegeReservationRead } from "@/lib/types/college";

type Reservation = CollegeReservationMinimalRead & {
  // Add any additional properties needed for the component
  reservation_no?: string;
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
  is_enrolled?: boolean;
  admission_income_id?: number;
}

const ConfirmedReservationsTab = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("CONFIRMED");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string>("");
  const [createdAdmissionNo, setCreatedAdmissionNo] = useState<string>("");
  const [admissionFee, setAdmissionFee] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Reservation | null>(null);

  const {
    data: reservationsData,
    isLoading,
    refetch,
  } = useCollegeReservationsList({
    page: 1,
    page_size: 100,
    status: statusFilter,
  });

  // Initialize mutation hooks
  const createStudentMutation = useCreateCollegeStudent();
  const updateReservationMutation = useUpdateCollegeReservation(selectedReservation?.reservation_id ?? 0);
  const updateStatusMutation = useUpdateCollegeReservationStatus(selectedReservation?.reservation_id ?? 0);

  // Process reservations data
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];
    if (!Array.isArray(reservationsData.reservations)) return [];

    return reservationsData.reservations;
  }, [reservationsData]);

  const handleEnrollStudent = async (reservationId: number) => {
    try {
      // Fetch full reservation details
      const reservationDetails = await CollegeReservationsService.getById(reservationId);
      
      if (!reservationDetails) {
        toast({
          title: "Error",
          description: "Reservation not found",
          variant: "destructive",
        });
        return;
      }

      // Create student record
      const studentData = {
        student_name: reservationDetails.student_name,
        aadhar_no: reservationDetails.aadhar_no,
        gender: reservationDetails.gender,
        dob: reservationDetails.dob,
        father_name: reservationDetails.father_name,
        father_aadhar_no: reservationDetails.father_aadhar_no,
        father_mobile: reservationDetails.father_mobile,
        father_occupation: reservationDetails.father_occupation,
        mother_name: reservationDetails.mother_name,
        mother_aadhar_no: reservationDetails.mother_aadhar_no,
        mother_mobile: reservationDetails.mother_mobile,
        mother_occupation: reservationDetails.mother_occupation,
        siblings: reservationDetails.siblings,
        previous_class: reservationDetails.previous_class,
        previous_school_details: reservationDetails.previous_school_details,
        present_address: reservationDetails.present_address,
        permanent_address: reservationDetails.permanent_address,
        reservation_fee: reservationDetails.reservation_fee,
        preferred_class_id: reservationDetails.preferred_class_id,
        preferred_group_id: reservationDetails.preferred_group_id,
        group_name: reservationDetails.group_name,
        preferred_course_id: reservationDetails.preferred_course_id,
        course_name: reservationDetails.course_name,
        group_fee: reservationDetails.group_fee,
        course_fee: reservationDetails.course_fee,
        book_fee: reservationDetails.book_fee,
        total_tuition_fee: reservationDetails.total_tuition_fee,
        tuition_concession: reservationDetails.tuition_concession,
        transport_required: reservationDetails.preferred_transport_id ? true : false,
        preferred_transport_id: reservationDetails.preferred_transport_id,
        preferred_distance_slab_id: reservationDetails.preferred_distance_slab_id,
        pickup_point: reservationDetails.pickup_point,
        transport_fee: reservationDetails.transport_fee,
        transport_concession: reservationDetails.transport_concession,
        status: reservationDetails.status,
        referred_by: reservationDetails.referred_by,
        remarks: reservationDetails.remarks,
        reservation_date: reservationDetails.reservation_date,
      };

      // Use mutation hook which handles cache invalidation automatically
      const response = await createStudentMutation.mutateAsync(studentData);
      
      if (response) {
        // Mark reservation as enrolled using mutation hook
        await updateStatusMutation.mutateAsync({
          status: "CONFIRMED",
          remarks: "Student enrolled successfully",
        });

        // Invalidate cache to refresh both students and reservations
        void queryClient.invalidateQueries({ queryKey: ["college", "students"] });
        void queryClient.invalidateQueries({ queryKey: ["college", "reservations"] });

        // Set admission details for payment dialog
        setCreatedAdmissionNo(response.admission_no || "");
        setAdmissionFee(3000); // Default admission fee
        setShowPaymentDialog(true);
        
        toast({
          title: "Enrollment Successful",
          description: `Student enrolled with admission number: ${response.admission_no}`,
        });
      }
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description: error?.message || "Could not enroll student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditForm({ ...reservation });
    setIsEditMode(true);
    setShowDetailsDialog(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm(null);
    setSelectedReservation(null);
    setShowDetailsDialog(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const updatePayload = {
        student_name: editForm.student_name,
        aadhar_no: editForm.aadhar_no,
        gender: editForm.gender as "MALE" | "FEMALE" | "OTHER",
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
        reservation_fee: editForm.application_fee,
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
      await updateReservationMutation.mutateAsync(updatePayload);

      // Additional invalidation
      void queryClient.invalidateQueries({ queryKey: ["college", "reservations"] });
      
      toast({
        title: "Reservation Updated",
        description: "Reservation details have been updated successfully.",
      });
      handleCancelEdit();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: error?.message || "Could not update reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnrollConfirm = async () => {
    if (!selectedReservation) return;
    await handleEnrollStudent(selectedReservation.reservation_id);
    setShowDetailsDialog(false);
  };

  const handlePaymentProcess = async () => {
    if (!createdAdmissionNo) return;

    setIsProcessingPayment(true);

    try {
      const result = await handlePayByAdmissionWithIncomeId(createdAdmissionNo, {
        details: [{
          purpose: "ADMISSION_FEE",
          paid_amount: admissionFee,
          payment_method: "CASH",
        }],
        remarks: "Admission fee payment",
      });

      if (result.blobUrl) {
        setReceiptBlobUrl(result.blobUrl);
        setShowReceiptModal(true);
        setShowPaymentDialog(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error?.message || "Could not process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCloseReceiptModal = () => {
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
  };

  // Column definitions for the enhanced table
  const columns: ColumnDef<any>[] = useMemo(() => [
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
      accessorKey: "group_course",
      header: "Group/Course",
      cell: ({ row }) => {
        const reservation = row.original;
        const groupCourse = reservation.group_name
          ? `${reservation.group_name}${reservation.course_name ? ` - ${reservation.course_name}` : ""}`
          : "-";
        return (
          <div className="max-w-[150px] truncate">{groupCourse}</div>
        );
      },
    },
    {
      accessorKey: "application_income_id",
      header: "Payment Status",
      cell: ({ row }) => {
        const applicationIncomeId = row.getValue("application_income_id");
        const isPaid = applicationIncomeId !== null && applicationIncomeId !== undefined;
        return (
          <Badge
            variant={isPaid ? "secondary" : "destructive"}
            className="text-xs"
          >
            {isPaid ? "✓ Paid" : "Unpaid"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reservation_date",
      header: "Date",
      cell: ({ row }) => <span>{row.getValue("reservation_date")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <Badge
            variant={
              status === "CONFIRMED"
                ? "secondary"
                : status === "PENDING"
                ? "default"
                : "destructive"
            }
            className={
              status === "CONFIRMED"
                ? "bg-green-500 text-white hover:bg-green-600"
                : ""
            }
          >
            {String(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const reservation = row.original;
        return reservation.is_enrolled ? (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 w-fit"
          >
            <CheckCircle className="h-3 w-3" />
            Enrolled
          </Badge>
        ) : (
          <Button
            size="sm"
            onClick={() => handleEnrollStudent(reservation.reservation_id)}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Enroll Student
          </Button>
        );
      },
    },
  ], [handleEnrollStudent]);

  return (
    <div className="space-y-6">
      {/* Enhanced Reservations Table */}
      <EnhancedDataTable
        data={allReservations}
        columns={columns}
        title="Confirmed Reservations"
        searchKey="student_name"
        searchPlaceholder="Search by name, reservation number, or Aadhar..."
        loading={isLoading}
        showSearch={true}
        enableDebounce={true}
        debounceDelay={300}
        highlightSearchResults={true}
        className="w-full"
      />

      {/* Reservation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {isEditMode ? "Edit Reservation" : "Reservation Details"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update reservation information"
                : "View and manage reservation details"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
            {selectedReservation && (
              <div className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Student Name</Label>
                  {isEditMode ? (
                    <Input
                      value={editForm?.student_name || ""}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, student_name: e.target.value } : null
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium">{selectedReservation.student_name}</p>
                  )}
                </div>
                <div>
                  <Label>Aadhar Number</Label>
                  {isEditMode ? (
                    <Input
                      value={editForm?.aadhar_no || ""}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, aadhar_no: e.target.value } : null
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium">{selectedReservation.aadhar_no}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                {isEditMode ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => handleEditDetails(selectedReservation)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    {!selectedReservation.is_enrolled && (
                      <Button onClick={handleEnrollConfirm}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Enroll Student
                      </Button>
                    )}
                  </>
                )}
              </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Admission Fee</DialogTitle>
            <DialogDescription>
              Student enrolled successfully with admission number: {createdAdmissionNo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                Enrollment Successful!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Admission No: {createdAdmissionNo}
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
                onClick={handlePaymentProcess}
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
                    <span className="text-lg font-bold mr-2">₹</span>
                    Collect Payment & Print Receipt
                  </>
                )}
              </Button>
            </div>
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

export default ConfirmedReservationsTab;
