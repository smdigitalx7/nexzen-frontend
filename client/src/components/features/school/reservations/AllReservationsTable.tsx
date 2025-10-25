import { useMemo, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Percent, Printer } from "lucide-react";
import { EnhancedDataTable } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "@/hooks/use-toast";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import { handleRegenerateReceipt as regenerateReceiptAPI } from "@/lib/api";

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
  >
    {status}
  </Badge>
));

StatusBadge.displayName = "StatusBadge";

// Memoized application fee status badge component
const ApplicationFeeBadge = memo(({ isPaid }: { isPaid: boolean }) => (
  <Badge
    variant={isPaid ? "secondary" : "destructive"}
    className="text-xs"
  >
    {isPaid ? "Paid" : "Not Paid"}
  </Badge>
));

ApplicationFeeBadge.displayName = "ApplicationFeeBadge";

// Memoized enrollment status badge component
const EnrollmentStatusBadge = memo(({ isEnrolled }: { isEnrolled: boolean }) => (
  <Badge
    variant={isEnrolled ? "secondary" : "outline"}
    className={`text-xs ${
      isEnrolled ? "bg-green-100 text-green-800" : ""
    }`}
  >
    {isEnrolled ? "Enrolled" : "Not Enrolled"}
  </Badge>
));

EnrollmentStatusBadge.displayName = "EnrollmentStatusBadge";

// Memoized loading component
const LoadingState = memo(() => (
  <div className="p-6 text-sm text-muted-foreground text-center">
    Loading reservations…
  </div>
));

LoadingState.displayName = "LoadingState";

// Memoized error component
const ErrorState = memo(({ error, onRefetch }: { error?: any; onRefetch: () => void }) => (
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
));

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

  // Memoized receipt regeneration handler
  const handleRegenerateReceipt = useCallback(async (reservation: Reservation) => {
    // Check for application_income_id first, then fallback to income_id
    const incomeId = reservation.application_income_id || reservation.income_id;

    if (!incomeId) {
      toast({
        title: "Receipt Not Available",
        description:
          "This reservation does not have an associated income record for receipt generation.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("🔄 Starting receipt regeneration for income ID:", incomeId);
      const blobUrl = await regenerateReceiptAPI(incomeId);
      console.log("✅ Receipt blob URL received:", blobUrl);

      toast({
        title: "Receipt Generated",
        description: "Receipt has been generated and is ready for viewing.",
      });

      // Open receipt in new tab
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Receipt regeneration failed:", error);

      toast({
        title: "Receipt Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, []);

  // Memoized column definitions for EnhancedDataTable
  const reservationColumns: ColumnDef<Reservation>[] = useMemo(
    () => [
      {
        accessorKey: "no",
        header: "Reservation No",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("no")}</div>
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
          <div className="max-w-[100px] truncate">
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
          <div className="text-sm">{row.getValue("date") || "-"}</div>
        ),
      },
      {
        accessorKey: "application_fee_paid",
        header: "Application Fee Status",
        cell: ({ row }) => {
          const isPaid = row.getValue("application_fee_paid") as boolean;
          return <ApplicationFeeBadge isPaid={isPaid} />;
        },
      },
      {
        accessorKey: "is_enrolled",
        header: "Enrollment Status",
        cell: ({ row }) => {
          const isEnrolled = row.getValue("is_enrolled") as boolean;
          return <EnrollmentStatusBadge isEnrolled={isEnrolled} />;
        },
      },
    ],
    []
  );

  // Memoized action buttons for EnhancedDataTable
  const actionButtons = useMemo(
    () => [
      {
        id: "view",
        label: "View",
        icon: Eye,
        variant: "outline" as const,
        onClick: (row: Reservation) => onView(row),
      },
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        variant: "outline" as const,
        onClick: (row: Reservation) => onEdit(row),
      },
      {
        id: "receipt",
        label: "Receipt",
        icon: Printer,
        variant: "outline" as const,
        onClick: (row: Reservation) => handleRegenerateReceipt(row),
        show: (row: Reservation) =>
          !!(
            (row.application_income_id || row.income_id) &&
            Number(row.application_income_id || row.income_id) > 0
          ),
      },
      {
        id: "concession",
        label: "Concession",
        icon: Percent,
        variant: "outline" as const,
        onClick: (row: Reservation) => onUpdateConcession?.(row),
        show: (row: Reservation) => !row.concession_lock,
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive" as const,
        onClick: (row: Reservation) => onDelete(row),
      },
    ],
    [onView, onEdit, onUpdateConcession, onDelete, handleRegenerateReceipt]
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
    <EnhancedDataTable
      data={reservations}
      columns={reservationColumns}
      title="All Reservations"
      searchPlaceholder="Search by student name, reservation number, or class..."
      exportable={true}
      loading={isLoading}
      showActions={true}
      actionButtons={actionButtons}
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
    />
  );
};

export const AllReservationsTable = AllReservationsTableComponent;
export default AllReservationsTableComponent;
