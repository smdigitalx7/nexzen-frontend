import React, { useMemo, memo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent } from "lucide-react";
import { EnhancedDataTable } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/lib/constants";
import type { ReservationStatusEnum } from "@/lib/types/college/reservations";

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
}) => {
  const { user } = useAuthStore();

  // Check if user has permission to view concession button
  const canViewConcession = useMemo(() => {
    if (!user?.role) return false;
    return user.role === ROLES.ADMIN || user.role === ROLES.INSTITUTE_ADMIN;
  }, [user?.role]);

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

  // Memoized action buttons for EnhancedDataTable
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (row: ReservationForAllReservations) => onView(row),
      },
      {
        type: "edit" as const,
        onClick: (row: ReservationForAllReservations) => onEdit(row),
      },
      {
        type: "delete" as const,
        onClick: (row: ReservationForAllReservations) => onDelete(row),
      },
    ],
    [onView, onEdit, onDelete]
  );

  // Custom action buttons for concession (college-specific)
  const actionButtons = useMemo(
    () => [
      {
        id: "concession",
        label: "Concession",
        icon: Percent,
        variant: "outline" as const,
        onClick: (row: ReservationForAllReservations) =>
          onUpdateConcession?.(row),
        show: (row: ReservationForAllReservations) =>
          canViewConcession && !row.concession_lock,
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
    <>
      <EnhancedDataTable
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
        className="w-full max-w-full mt-6"
      />
    </>
  );
};

export default AllReservationsComponent;
