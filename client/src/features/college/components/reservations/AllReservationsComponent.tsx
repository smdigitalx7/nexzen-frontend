import React, { useMemo, memo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Percent, CreditCard } from "lucide-react";
import { EnhancedDataTable, ServerSidePagination } from "@/common/components/shared";
import { useAuthStore } from "@/core/auth/authStore";
import { ROLES } from "@/common/constants";
import { useCanDelete } from "@/core/permissions";
import type { ReservationStatusEnum } from "@/features/college/types/reservations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import CollegeReservationPaymentProcessor from "@/common/components/shared/payment/CollegeReservationPaymentProcessor";
import { ReservationPaymentData } from "@/common/components/shared/payment";
import { ReceiptPreviewModal } from "@/common/components/shared";
import type { CollegeIncomeRead } from "@/features/college/types/income";
import { collegeKeys } from "@/features/college/hooks/query-keys";
import { toast } from "@/common/hooks/use-toast";
import { CollegeReservationsService } from "@/features/college/services";
import { invalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";

// Helper function to format date from ISO format to YYYY-MM-DD
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  // If date is in ISO format (2025-06-09T00:00:00), extract just the date part
  if (dateString.includes("T")) {
    return dateString.split("T")[0];
  }
  return dateString;
};

// Define the reservation type for this component
export type ReservationForAllReservations = {
  reservation_id: number;
  reservation_no?: string | null;
  reservation_date?: string | null;
  student_name: string;
  aadhar_no?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  dob?: string | null;
  father_name?: string | null;
  father_mobile?: string | null;
  group_id: number;
  course_id: number;
  group_name?: string | null;
  course_name?: string | null;
  status: ReservationStatusEnum;
  created_at: string;
  remarks?: string | null;
  // Additional fields for UI functionality
  income_id?: number;
  application_income_id?: number | null;
  concession_lock?: boolean;
  tuition_fee?: number;
  transport_fee?: number;
  book_fee?: number;
  application_fee?: number;
  tuition_concession?: number;
  transport_concession?: number;
};

interface AllReservationsComponentProps {
  reservations: ReservationForAllReservations[];
  onView: (reservation: ReservationForAllReservations) => void;
  onEdit: (reservation: ReservationForAllReservations) => void;
  onDelete: (reservation: ReservationForAllReservations) => void;
  onUpdateConcession?: (reservation: ReservationForAllReservations) => void;
  isLoading: boolean;
  isError: boolean;
  error?: any;
  onRefetch: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  // ✅ Server-side pagination props
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  enableServerSidePagination?: boolean;
}

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => (
  <Badge
    variant={
      status === "PENDING"
        ? "default"
        : status === "CANCELLED"
          ? "destructive"
          : status === "CONFIRMED"
            ? "secondary"
            : "outline"
    }
    className={
      status === "CONFIRMED" ? "bg-green-500 text-white hover:bg-green-600" : ""
    }
  >
    {status}
  </Badge>
));

StatusBadge.displayName = "StatusBadge";

// Memoized application fee status badge component
const ApplicationFeeBadge = memo(
  ({ applicationIncomeId }: { applicationIncomeId?: number | null }) => {
    const isPaid =
      applicationIncomeId !== null && applicationIncomeId !== undefined;
    return (
      <Badge variant={isPaid ? "secondary" : "destructive"} className="text-xs">
        {isPaid ? "Paid" : "Not Paid"}
      </Badge>
    );
  }
);

ApplicationFeeBadge.displayName = "ApplicationFeeBadge";

// Memoized loading component
const LoadingState = memo(() => (
  <div className="p-6 text-sm text-muted-foreground text-center">
    Loading reservations…
  </div>
));

LoadingState.displayName = "LoadingState";

// Memoized error component
const ErrorState = memo(
  ({ error, onRefetch }: { error?: any; onRefetch: () => void }) => (
    <div className="p-6 text-center">
      <div className="text-red-600 mb-2">
        <h3 className="font-medium">Connection Error</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message?.includes("Bad Gateway")
            ? "Backend server is not responding (502 Bad Gateway)"
            : "Failed to load reservations"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRefetch}>
        Try Again
      </Button>
    </div>
  )
);

ErrorState.displayName = "ErrorState";

const AllReservationsComponent: React.FC<AllReservationsComponentProps> = ({
  reservations,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
  isLoading,
  isError,
  error,
  onRefetch,
  statusFilter,
  onStatusFilterChange,
  // ✅ Server-side pagination props
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  enableServerSidePagination = false,
}) => {
  const { user } = useAuthStore();

  // Payment related state
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [paymentData, setPaymentData] = useState<ReservationPaymentData | null>(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isLoadingPaymentData, setIsLoadingPaymentData] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (receiptBlobUrl) {
        URL.revokeObjectURL(receiptBlobUrl);
      }
    };
  }, [receiptBlobUrl]);

  // Check if user has permission to view concession button
  const canViewConcession = useMemo(() => {
    if (!user?.role) return false;
    return user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN;
  }, [user?.role]);

  // Helper function to check if application fee is paid
  const isApplicationFeePaid = useCallback((row: ReservationForAllReservations): boolean => {
    const applicationIncomeId = row.application_income_id;
    
    // Fee is paid if application_income_id exists and is a valid positive number
    const hasIncomeId = 
      applicationIncomeId !== null && 
      applicationIncomeId !== undefined && 
      applicationIncomeId !== 0 &&
      (typeof applicationIncomeId === 'number' && applicationIncomeId > 0);
    
    // Fee is paid if application_fee_paid flag is true (if available)
    const isPaidByFlag = (row as any).application_fee_paid === true;
    
    return hasIncomeId || isPaidByFlag;
  }, []);

  // Handle pay fee button click
  const handlePayFee = useCallback(async (reservation: ReservationForAllReservations) => {
    try {
      setIsLoadingPaymentData(true);

      // Get reservation number - use reservation_no if available, otherwise fallback to reservation_id
      const reservationNo = reservation.reservation_no && reservation.reservation_no.trim() !== "" 
        ? reservation.reservation_no 
        : String(reservation.reservation_id);
      
      if (!reservationNo) {
        toast({
          title: "Error",
          description: `Reservation number is missing for reservation ID: ${reservation.reservation_id}`,
          variant: "destructive",
        });
        setIsLoadingPaymentData(false);
        return;
      }

      // Fetch full reservation details to get application_fee
      const fullReservationData = await CollegeReservationsService.getById(
        reservation.reservation_id
      );

      // Get application fee from full reservation data
      // Handle null, undefined, or 0 values - allow payment to proceed and let backend validate
      const applicationFee = fullReservationData.application_fee;
      
      // Check if application_fee is explicitly null or undefined (not just 0)
      if (applicationFee === null || applicationFee === undefined) {
        toast({
          title: "Error",
          description: `Application fee is not set for reservation ${reservationNo}. Please set the application fee first before processing payment.`,
          variant: "destructive",
        });
        setIsLoadingPaymentData(false);
        return;
      }

      // Convert to number and use 0 as fallback if conversion fails
      const feeAmount = Number(applicationFee) || 0;
      
      // If fee is 0, warn but allow payment to proceed (backend will handle validation)
      if (feeAmount === 0) {
        toast({
          title: "Warning",
          description: `Reservation fee is set to 0 for reservation ${reservationNo}. Payment will proceed with 0 amount.`,
          variant: "default",
        });
      }

      const paymentData: ReservationPaymentData = {
        reservationId: reservation.reservation_id,
        reservationNo: reservationNo,
        studentName: reservation.student_name,
        className: reservation.group_name 
          ? `${reservation.group_name}${reservation.course_name ? ` - ${reservation.course_name}` : ""}` 
          : "N/A",
        reservationFee: feeAmount,
        totalAmount: feeAmount,
        paymentMethod: "CASH",
        purpose: "APPLICATION_FEE",
        note: `Payment for reservation ${reservationNo}`,
      };

      setPaymentData(paymentData);
      setShowPaymentProcessor(true);
    } catch (error: any) {
      console.error("Failed to load reservation for payment:", error);
      toast({
        title: "Failed to Load Reservation",
        description: error?.message || "Could not load reservation details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPaymentData(false);
    }
  }, []);

  // Filter reservations based on status
  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return reservations;
    return reservations.filter((r) => r.status === statusFilter.toUpperCase());
  }, [reservations, statusFilter]);

  // Memoized custom search function
  const customSearchFunction = useMemo(() => {
    return (row: any, columnId: string, value: string) => {
      if (!value) return true;

      const searchValue = value.toLowerCase();
      const reservation = row.original as ReservationForAllReservations;

      // Search across multiple fields
      return (
        reservation.student_name?.toLowerCase().includes(searchValue) ||
        reservation.reservation_no?.toLowerCase().includes(searchValue) ||
        reservation.group_name?.toLowerCase().includes(searchValue) ||
        reservation.course_name?.toLowerCase().includes(searchValue) ||
        reservation.father_name?.toLowerCase().includes(searchValue) ||
        String(reservation.reservation_id).includes(searchValue)
      );
    };
  }, []);

  // Column definitions for EnhancedDataTable
  const columns: ColumnDef<ReservationForAllReservations>[] = useMemo(
    () => [
      {
        accessorKey: "reservation_no",
        header: "Reservation No",
        cell: ({ row }) => (
          <div className="font-medium max-w-[300px]">
            {row.original.reservation_no || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "student_name",
        header: "Student Name",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.getValue("student_name")}
          </div>
        ),
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "reservation_date",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDate(row.getValue("reservation_date"))}
          </div>
        ),
      },
      {
        accessorKey: "application_income_id",
        header: "Application Fee Status",
        cell: ({ row }) => {
          const applicationIncomeId = row.getValue("application_income_id") as number | null | undefined;
          return (
            <ApplicationFeeBadge applicationIncomeId={applicationIncomeId} />
          );
        },
      },
    ],
    []
  );

  // Check delete permission
  const canDeleteReservation = useCanDelete("reservations");

  // Memoized action buttons for EnhancedDataTable
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (row: ReservationForAllReservations) => onView(row),
        show: (row: ReservationForAllReservations) => isApplicationFeePaid(row),
      },
      {
        type: "edit" as const,
        onClick: (row: ReservationForAllReservations) => onEdit(row),
        show: (row: ReservationForAllReservations) => isApplicationFeePaid(row),
      },
      {
        type: "delete" as const,
        onClick: (row: ReservationForAllReservations) => onDelete(row),
        show: (row: ReservationForAllReservations) => {
          // Hide delete button if user doesn't have permission
          if (!canDeleteReservation) return false;
          // Show delete button if:
          // 1. Application fee is paid, OR
          // 2. Status is PENDING (allow deletion of pending reservations)
          const isPending = row.status === "PENDING";
          return isApplicationFeePaid(row) || isPending;
        },
      },
    ],
    [onView, onEdit, onDelete, isApplicationFeePaid, canDeleteReservation]
  );

  // Custom action buttons for payment and concession
  const actionButtons = useMemo(
    () => [
      {
        id: "pay-fee",
        label: "Pay Application Fee",
        icon: CreditCard,
        variant: "default" as const,
        onClick: handlePayFee,
        show: (row: ReservationForAllReservations) => {
          // Show "Pay Application Fee" button ONLY when application fee is NOT paid
          // Hide the button after fee is paid
          return !isApplicationFeePaid(row);
        },
      },
      {
        id: "concession",
        label: "Concession",
        icon: Percent,
        variant: "outline" as const,
        onClick: (row: ReservationForAllReservations) =>
          onUpdateConcession?.(row),
        show: (row: ReservationForAllReservations) => {
          // Show concession button if:
          // 1. User has permission
          // 2. Concession is not locked
          // 3. Status is PENDING (show for pending reservations)
          const isPending = row.status === "PENDING";
          
          return Boolean(
            canViewConcession && 
            !row.concession_lock &&
            isPending
          );
        },
      },
    ],
    [onUpdateConcession, canViewConcession, handlePayFee, isApplicationFeePaid]
  );

  // Memoized status filter options
  const statusFilterOptions = useMemo(
    () => [
      { value: "PENDING", label: "Pending" },
      { value: "CONFIRMED", label: "Confirmed" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
    []
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState error={error} onRefetch={onRefetch} />;
  }

  return (
    <>
      <div className="w-full max-w-full mt-6">
        <EnhancedDataTable
          key={`all-reservations-${refreshKey}`}
          data={filteredReservations}
          columns={columns}
          title="All Reservations"
          searchPlaceholder="Search by student name, reservation number, group, course, or father name..."
          exportable={true}
          loading={isLoading}
          showActions={true}
          actionButtons={actionButtons}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          customGlobalFilterFn={customSearchFunction}
          filters={[
            {
              key: "status",
              label: "Status",
              options: statusFilterOptions,
              value: statusFilter,
              onChange: onStatusFilterChange,
            },
          ]}
          className="w-full"
          // ✅ Disable client-side pagination when server-side pagination is enabled
          enableClientSidePagination={!enableServerSidePagination}
        />
        
        {/* ✅ Server-side pagination controls */}
        {enableServerSidePagination &&
          currentPage !== undefined &&
          totalPages !== undefined &&
          totalCount !== undefined &&
          pageSize !== undefined &&
          onPageChange &&
          onPageSizeChange && (
            <ServerSidePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              isLoading={isLoading}
            />
          )}
      </div>

      {/* Payment Processor Dialog */}
      {paymentData && (
        <Dialog
          open={showPaymentProcessor}
          onOpenChange={setShowPaymentProcessor}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
              <DialogTitle>Pay Application Fee (Reservation Fee)</DialogTitle>
              <DialogDescription>
                Process application fee payment for reservation {paymentData.reservationNo}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
              <CollegeReservationPaymentProcessor
                reservationData={paymentData}
                onPaymentComplete={(
                  incomeRecord: CollegeIncomeRead,
                  blobUrl: string
                ) => {
                  // ✅ CRITICAL: Close payment modal immediately (no blocking)
                  setShowPaymentProcessor(false);
                  
                  // ✅ CRITICAL: Set receipt data immediately (needed for receipt modal)
                  setReceiptBlobUrl(blobUrl);

                  // ✅ DEFER: Query invalidation (low priority, defer to next tick)
                  setTimeout(() => {
                    invalidateAndRefetch(collegeKeys.reservations.root());
                    
                    // ✅ DEFER: Refetch callback (low priority)
                    if (onRefetch) {
                      void onRefetch();
                    }
                    
                    // ✅ DEFER: Force table refresh (low priority)
                    setRefreshKey((prev) => prev + 1);
                  }, 0);

                  // ✅ DEFER: Receipt modal (wait for payment modal to close completely)
                  setTimeout(() => {
                    setShowReceipt(true);
                  }, 250);

                  // ✅ DEFER: Toast notification (low priority)
                  setTimeout(() => {
                    toast({
                      title: "Payment Successful",
                      description: "Application fee has been paid successfully",
                      variant: "success",
                    });
                  }, 0);
                }}
                onPaymentFailed={(error: string) => {
                  toast({
                    title: "Payment Failed",
                    description:
                      error || "Could not process payment. Please try again.",
                    variant: "destructive",
                  });
                  setShowPaymentProcessor(false);
                }}
                onPaymentCancel={() => {
                  setShowPaymentProcessor(false);
                  setPaymentData(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceipt}
        onClose={() => {
          // Close modal immediately - don't block UI
          setShowReceipt(false);
          
          // Clean up blob URL immediately
          if (receiptBlobUrl) {
            URL.revokeObjectURL(receiptBlobUrl);
            setReceiptBlobUrl(null);
          }
          
          // Force table refresh immediately
          setRefreshKey((prev) => prev + 1);
          setPaymentData(null);
          
          // Invalidate and refetch using debounced utility (prevents UI freeze)
          invalidateAndRefetch(collegeKeys.reservations.root());
              
          // Call refetch callback if provided
              if (onRefetch) {
            void onRefetch();
            }
        }}
        blobUrl={receiptBlobUrl}
      />
    </>
  );
};

export default AllReservationsComponent;
