import { useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent } from "lucide-react";
import { EnhancedDataTable } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/lib/constants/roles";

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
            {formatDate(row.getValue("date") as string)}
          </div>
        ),
      },
      {
        accessorKey: "application_income_id",
        header: "Application Fee Status",
        cell: ({ row }) => {
          const applicationIncomeId = row.getValue("application_income_id") as
            | number
            | null
            | undefined;
          return (
            <ApplicationFeeBadge applicationIncomeId={applicationIncomeId} />
          );
        },
      },
    ],
    []
  );

  // Memoized action buttons for EnhancedDataTable
  // Use actionButtonGroups for standard actions (view, edit, delete) to use EnhancedDataTable's built-in icons
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (row: Reservation) => onView(row),
      },
      {
        type: "edit" as const,
        onClick: (row: Reservation) => onEdit(row),
      },
      {
        type: "delete" as const,
        onClick: (row: Reservation) => onDelete(row),
      },
    ],
    [onView, onEdit, onDelete]
  );

  // Custom action button for concession (no built-in icon available)
  // Only visible for ADMIN and INSTITUTE_ADMIN roles
  const actionButtons = useMemo(
    () => [
      {
        id: "concession",
        label: "Concession",
        icon: Percent,
        variant: "outline" as const,
        onClick: (row: Reservation) => onUpdateConcession?.(row),
        show: (row: Reservation) => canViewConcession && !row.concession_lock,
      },
    ],
    [onUpdateConcession, canViewConcession]
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
  );
};

export const AllReservationsTable = AllReservationsTableComponent;
export default AllReservationsTableComponent;
