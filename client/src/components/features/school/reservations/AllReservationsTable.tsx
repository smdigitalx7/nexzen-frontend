import { useMemo, memo, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent, CreditCard } from "lucide-react";
import { EnhancedDataTable } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ReservationPaymentProcessor,
  ReservationPaymentData,
} from "@/components/shared/payment";
import { ReceiptPreviewModal } from "@/components/shared";
import type { SchoolIncomeRead } from "@/lib/types/school";
import { useQueryClient } from "@tanstack/react-query";
import { schoolKeys } from "@/lib/hooks/school/query-keys";
import { toast } from "@/hooks/use-toast";
import { SchoolReservationsService } from "@/lib/services/school";
import { CacheUtils } from "@/lib/api";

// Helper function to format date from ISO format to YYYY-MM-DD
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  // If date is in ISO format (2025-06-09T00:00:00), extract just the date part
  if (dateString.includes("T")) {
    return dateString.split("T")[0];
  }
  return dateString;
};

export type Reservation = {
  id: string;
  no: string;
  reservation_id: number;
  studentName: string;
  classAdmission?: string;
  status: string;
  date: string;
  totalFee: number;
  income_id?: number;
  concession_lock?: boolean;
  tuition_fee?: number;
  transport_fee?: number;
  book_fee?: number;
  application_fee?: number;
  application_fee_paid?: boolean;
  tuition_concession?: number;
  transport_concession?: number;
  remarks?: string;
  // Additional fields for enrollment and income tracking
  application_income_id?: number | null;
  admission_income_id?: number | null;
  is_enrolled?: boolean | null;
};

export type AllReservationsTableProps = {
  reservations: Reservation[];
  isLoading: boolean;
  isError: boolean;
  error?: any;
  onRefetch: () => void;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onUpdateConcession?: (reservation: Reservation) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
};

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

const AllReservationsTableComponent = ({
  reservations,
  isLoading,
  isError,
  error,
  onRefetch,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
  statusFilter,
  onStatusFilterChange,
}: AllReservationsTableProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Payment related state
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [paymentData, setPaymentData] = useState<ReservationPaymentData | null>(
    null
  );
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

  // Memoized custom search function
  const customSearchFunction = useMemo(() => {
    return (row: any, columnId: string, value: string) => {
      if (!value) return true;

      const searchValue = value.toLowerCase();
      const reservation = row.original as Reservation;

      // Search across multiple fields
      return (
        reservation.studentName?.toLowerCase().includes(searchValue) ||
        reservation.no?.toLowerCase().includes(searchValue) ||
        reservation.classAdmission?.toLowerCase().includes(searchValue) ||
        reservation.id?.toLowerCase().includes(searchValue)
      );
    };
  }, []);

  // Memoized column definitions for EnhancedDataTable
  const reservationColumns: ColumnDef<Reservation>[] = useMemo(
    () => [
      {
        accessorKey: "no",
        header: "Reservation No",
        cell: ({ row }) => (
          <div className="font-medium max-w-[300px]">{row.getValue("no")}</div>
        ),
      },
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.getValue("studentName")}
          </div>
        ),
      },
      {
        accessorKey: "classAdmission",
        header: "Class",
        cell: ({ row }) => (
          <div className="max-w-[100px] text-center">
            {row.getValue("classAdmission") || "-"}
          </div>
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
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDate(row.getValue("date"))}
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

  // Helper function to check if application fee is paid
  // Uses application_income_id only (backend doesn't return application_fee_paid in list)
  const isApplicationFeePaid = useCallback((row: Reservation): boolean => {
    const applicationIncomeId = row.application_income_id;
    
    // Fee is paid if application_income_id exists and is a valid positive number
    return (
      applicationIncomeId !== null && 
      applicationIncomeId !== undefined && 
      applicationIncomeId !== 0 &&
      (typeof applicationIncomeId === 'number' && applicationIncomeId > 0)
    );
  }, []);

  // Memoized action buttons for EnhancedDataTable
  // Use actionButtonGroups for standard actions (view, edit, delete) to use EnhancedDataTable's built-in icons
  // Show view/edit buttons ONLY when fee IS paid
  // Show delete button when fee IS paid OR status is PENDING
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (row: Reservation) => onView(row),
        show: (row: Reservation) => isApplicationFeePaid(row),
      },
      {
        type: "edit" as const,
        onClick: (row: Reservation) => onEdit(row),
        show: (row: Reservation) => isApplicationFeePaid(row),
      },
      {
        type: "delete" as const,
        onClick: (row: Reservation) => onDelete(row),
        show: (row: Reservation) => {
          // Show delete button if:
          // 1. Application fee is paid, OR
          // 2. Status is PENDING (allow deletion of pending reservations)
          const isPending = row.status === "PENDING";
          return isApplicationFeePaid(row) || isPending;
        },
      },
    ],
    [onView, onEdit, onDelete, isApplicationFeePaid]
  );

  // Handle pay fee button click
  const handlePayFee = useCallback(async (reservation: Reservation) => {
    try {
      setIsLoadingPaymentData(true);

      // Get reservation number - use reservation_no if available, otherwise fallback to reservation_id
      const reservationNo = reservation.no && reservation.no.trim() !== "" 
        ? reservation.no 
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
      const fullReservationData = await SchoolReservationsService.getById(
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
          description: `Application fee is set to 0 for reservation ${reservationNo}. Payment will proceed with 0 amount.`,
          variant: "default",
        });
      }

      const paymentData: ReservationPaymentData = {
        reservationId: reservation.reservation_id,
        reservationNo: reservationNo,
        studentName: reservation.studentName || fullReservationData.student_name,
        className: reservation.classAdmission || fullReservationData.class_name || "N/A",
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

  // Custom action buttons
  const actionButtons = useMemo(
    () => [
      {
        id: "pay-fee",
        label: "Pay Application Fee",
        icon: CreditCard,
        variant: "default" as const,
        onClick: handlePayFee,
        show: (row: Reservation) => {
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
        onClick: (row: Reservation) => onUpdateConcession?.(row),
        show: (row: Reservation) => {
          // Show concession button if:
          // 1. User has permission
          // 2. Concession is not locked
          // 3. Status is PENDING (show for pending reservations)
          // Note: Backend will validate that reservation fee exists when applying concession
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
      <EnhancedDataTable
        key={`all-reservations-${refreshKey}`}
        data={reservations}
        columns={reservationColumns}
        title="All Reservations"
        searchPlaceholder="Search by student name, reservation number, or class..."
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
        className="w-full max-w-full mt-6"
      />

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
              <ReservationPaymentProcessor
                reservationData={paymentData}
                onPaymentComplete={async (
                  incomeRecord: SchoolIncomeRead,
                  blobUrl: string
                ) => {
                  setReceiptBlobUrl(blobUrl);
                  setShowPaymentProcessor(false);
                  
                  // Delay to ensure backend transaction is committed
                  await new Promise(resolve => setTimeout(resolve, 300));
                  
                  // Cache invalidation after payment
                  // Step 1: Clear API cache
                  try {
                    CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
                  } catch (error) {
                    console.warn('Failed to clear API cache:', error);
                  }
                  
                  // Step 2: Remove queries from cache to force fresh fetch (bypasses staleTime)
                  queryClient.removeQueries({ 
                    queryKey: schoolKeys.reservations.root(),
                    exact: false 
                  });
                  
                  // Step 3: Invalidate queries (AWAIT to ensure it completes)
                  await queryClient.invalidateQueries({ 
                    queryKey: schoolKeys.reservations.root(),
                    exact: false 
                  });
                  
                  // Step 4: Refetch active queries (AWAIT to ensure it completes)
                  await queryClient.refetchQueries({ 
                    queryKey: schoolKeys.reservations.root(), 
                    type: 'active',
                    exact: false 
                  });

                  // Step 5: Call refetch callback and wait for it to complete
                  if (onRefetch) {
                    await onRefetch();
                  }
                  
                  // Step 6: Additional delay to ensure React processes state updates
                  await new Promise(resolve => setTimeout(resolve, 200));
                  
                  // Step 7: Force table refresh by updating refresh key
                  setRefreshKey((prev) => prev + 1);
                  
                  setShowReceipt(true);
                  
                  toast({
                    title: "Payment Successful",
                    description: "Application fee has been paid successfully",
                    variant: "success",
                  });
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
        onClose={async () => {
          setShowReceipt(false);
          if (receiptBlobUrl) {
            URL.revokeObjectURL(receiptBlobUrl);
            setReceiptBlobUrl(null);
          }
          
          // After closing receipt, ensure data is fresh
          // Step 1: Clear API cache first to ensure fresh network request
          CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
          
          // Step 2: Remove query data to force fresh fetch
          queryClient.removeQueries({ queryKey: schoolKeys.reservations.list(undefined) });
          
          // Step 3: Invalidate all reservation-related queries
          queryClient.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
          
          // Step 4: Force refetch active queries (bypasses cache)
          await queryClient.refetchQueries({
            queryKey: schoolKeys.reservations.list(undefined),
            type: 'active',
            exact: false
          });
          
          // Step 5: Call refetch callback and wait for it to complete
          if (onRefetch) {
            await onRefetch();
          }
          
          // Step 6: Wait for React Query to update the cache
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Step 7: Force table refresh by updating refresh key
          setRefreshKey((prev) => prev + 1);
          
          setPaymentData(null);
        }}
        blobUrl={receiptBlobUrl}
      />
    </>
  );
};

export const AllReservationsTable = AllReservationsTableComponent;
export default AllReservationsTableComponent;
