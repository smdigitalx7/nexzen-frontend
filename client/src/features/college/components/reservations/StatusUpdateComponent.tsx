import { useState, useMemo, memo, useCallback } from "react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "@/common/hooks/use-toast";
import { collegeKeys } from "@/features/college/hooks/query-keys";
import { CollegeReservationsService } from "@/features/college/services";
import { EnhancedDataTable } from "@/common/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { invalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";

export type Reservation = {
  id: string;
  no: string;
  reservation_id: number;
  studentName: string;
  status: string;
  remarks?: string;
};

export type StatusUpdateTableProps = {
  reservations: Reservation[];
  isLoading: boolean;
  isError: boolean;
  error?: any;
  onRefetch: () => void;
  totalCount?: number;
};

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const current = status.toUpperCase();
  return (
    <Badge
      variant={
        current === "PENDING"
          ? "default"
          : current === "CANCELLED"
            ? "destructive"
            : current === "CONFIRMED"
              ? "secondary"
              : "outline"
      }
      className={
        current === "CONFIRMED"
          ? "bg-green-500 text-white hover:bg-green-600"
          : ""
      }
    >
      {current}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

// Memoized status select component
const StatusSelect = memo(
  ({
    reservation,
    statusChanges,
    onStatusChange,
  }: {
    reservation: Reservation;
    statusChanges: Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">;
    onStatusChange: (
      reservationId: string,
      status: "PENDING" | "CONFIRMED" | "CANCELLED"
    ) => void;
  }) => {
    const current = (reservation.status || "").toUpperCase();
    const selected = (statusChanges[reservation.id] || current);
    const isConfirmed = current === "CONFIRMED";

    return (
      <div className="w-48">
        <Select
          value={selected}
          onValueChange={(v) => onStatusChange(reservation.id, v as any)}
          disabled={isConfirmed}
        >
          <SelectTrigger aria-label="Select status" disabled={isConfirmed}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

StatusSelect.displayName = "StatusSelect";

// Memoized remarks textarea component
const RemarksTextarea = memo(
  ({
    reservation,
    statusRemarks,
    onRemarksChange,
  }: {
    reservation: Reservation;
    statusRemarks: Record<string, string>;
    onRemarksChange: (reservationId: string, remarks: string) => void;
  }) => {
    const currentStatus = (reservation.status || "").toUpperCase();
    const isConfirmed = currentStatus === "CONFIRMED";
    
    // When confirmed, show the reservation's actual remarks (read-only)
    // Otherwise, show the editable statusRemarks value
    const displayValue = isConfirmed 
      ? (reservation.remarks || "") 
      : (statusRemarks[reservation.id] || "");

    return (
      <div className="w-48">
        <Textarea
          placeholder={isConfirmed ? "No remarks" : "Enter remarks..."}
          value={displayValue}
          onChange={(e) => {
            if (isConfirmed) return; // Prevent changes if confirmed
            onRemarksChange(reservation.id, e.target.value);
          }}
          disabled={isConfirmed}
          readOnly={isConfirmed}
          rows={1}
          className={`text-sm resize-none ${isConfirmed ? 'bg-muted cursor-not-allowed' : ''}`}
        />
      </div>
    );
  }
);

RemarksTextarea.displayName = "RemarksTextarea";

// Memoized update button component
const UpdateButton = memo(
  ({
    reservation,
    statusChanges,
    statusRemarks,
    onUpdate,
  }: {
    reservation: Reservation;
    statusChanges: Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">;
    statusRemarks: Record<string, string>;
    onUpdate: (
      reservation: Reservation,
      newStatus: "PENDING" | "CONFIRMED" | "CANCELLED",
      remarks: string
    ) => void;
  }) => {
    const current = (reservation.status || "").toUpperCase();
    const selected = (statusChanges[reservation.id] || current);
    const same = selected === current;

    return (
      <div className="flex justify-start">
        <Button
          size="sm"
          variant={same ? "outline" : "default"}
          disabled={same}
          onClick={() => {
            const to = (statusChanges[reservation.id] || current);
            const remarks = statusRemarks[reservation.id] || "";
            onUpdate(reservation, to, remarks);
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          Update
        </Button>
      </div>
    );
  }
);

UpdateButton.displayName = "UpdateButton";

// Memoized header component
const StatusUpdateHeader = memo(
  ({
    reservations,
    totalCount,
    isLoading,
    onRefetch,
  }: {
    reservations: Reservation[];
    totalCount?: number;
    isLoading: boolean;
    onRefetch: () => void;
  }) => (
    <div className="flex items-center justify-between">
      {/* <div>
      <h3 className="text-lg font-semibold">Update Status</h3>
      <p className="text-sm text-muted-foreground">
        Modify reservation statuses quickly
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="outline">
        {reservations.length} items
      </Badge>
      {totalCount && (
        <Badge variant="secondary">
          Total: {totalCount}
        </Badge>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefetch}
        disabled={isLoading}
      >
        Refresh
      </Button>
    </div> */}
    </div>
  )
);

StatusUpdateHeader.displayName = "StatusUpdateHeader";

const StatusUpdateTableComponent = ({
  reservations,
  isLoading,
  isError,
  error,
  onRefetch,
  totalCount,
}: StatusUpdateTableProps) => {
  const [statusChanges, setStatusChanges] = useState<
    Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">
  >({});
  const [statusRemarks, setStatusRemarks] = useState<Record<string, string>>(
    {}
  );
  const [refreshKey, setRefreshKey] = useState(0);

  // Memoized handlers
  const handleStatusChange = useCallback(
    (reservationId: string, status: "PENDING" | "CONFIRMED" | "CANCELLED") => {
      setStatusChanges((prev) => ({
        ...prev,
        [reservationId]: status,
      }));
    },
    []
  );

  const handleRemarksChange = useCallback(
    (reservationId: string, remarks: string) => {
      setStatusRemarks((prev) => ({
        ...prev,
        [reservationId]: remarks,
      }));
    },
    []
  );

  const handleStatusUpdate = useCallback(
    async (
      reservation: Reservation,
      newStatus: "PENDING" | "CONFIRMED" | "CANCELLED",
      remarks: string
    ) => {
      try {
        const payload = {
          status: newStatus,
          remarks: remarks.trim() ? remarks : null,
        };

        // Step 1: Update status via service
        await CollegeReservationsService.updateStatus(
          reservation.reservation_id,
          payload
        );

        // Step 2: Clear local state immediately (before table re-renders)
        setStatusChanges((prev) => {
          const updated = { ...prev };
          delete updated[reservation.id];
          return updated;
        });
        setStatusRemarks((prev) => ({
          ...prev,
          [reservation.id]: "",
        }));

        // Step 3: Invalidate and refetch using debounced utility (prevents UI freeze)
        invalidateAndRefetch(collegeKeys.reservations.detail(reservation.reservation_id));
        invalidateAndRefetch(collegeKeys.reservations.root());

        // Step 4: Call onRefetch callback if provided
        if (onRefetch) {
          void onRefetch();
        }

        // Step 5: Force table refresh by updating refresh key
        setRefreshKey((prev) => prev + 1);
        
        // Step 6: Show success toast
        toast({
          title: "Status Updated",
          description: `Reservation ${reservation.no} status updated to ${newStatus} successfully.`,
          variant: "success",
        });
      } catch (e: any) {
        console.error("Failed to update status:", e);
        toast({
          title: "Status Update Failed",
          description:
            e?.response?.data?.detail ||
            e?.message ||
            "Could not update reservation status. Please try again.",
          variant: "destructive",
        });
      }
    },
    [onRefetch]
  );

  // Column definitions for EnhancedDataTable
  const statusColumns: ColumnDef<Reservation>[] = useMemo(
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
        header: "Student",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.getValue("studentName")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Current Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "changeTo",
        header: "Change To",
        cell: ({ row }) => {
          const reservation = row.original;
          return (
            <StatusSelect
              reservation={reservation}
              statusChanges={statusChanges}
              onStatusChange={handleStatusChange}
            />
          );
        },
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => {
          const reservation = row.original;
          return (
            <RemarksTextarea
              reservation={reservation}
              statusRemarks={statusRemarks}
              onRemarksChange={handleRemarksChange}
            />
          );
        },
      },
      {
        accessorKey: "updateAction",
        header: "Update",
        cell: ({ row }) => {
          const reservation = row.original;
          return (
            <UpdateButton
              reservation={reservation}
              statusChanges={statusChanges}
              statusRemarks={statusRemarks}
              onUpdate={handleStatusUpdate}
            />
          );
        },
      },
    ],
    [
      statusChanges,
      statusRemarks,
      handleStatusChange,
      handleRemarksChange,
      handleStatusUpdate,
    ]
  );

  return (
    <div className="space-y-4">
      <StatusUpdateHeader
        reservations={reservations}
        totalCount={totalCount}
        isLoading={isLoading}
        onRefetch={onRefetch}
      />

      <EnhancedDataTable
        key={`status-table-${refreshKey}`}
        data={reservations}
        columns={statusColumns}
        title="Status Updates"
        searchPlaceholder="Search by student name or reservation number..."
        exportable={false}
        loading={isLoading}
        showActions={false}
        className="w-full"
      />
    </div>
  );
};

export const StatusUpdateTable = StatusUpdateTableComponent;
export default StatusUpdateTableComponent;
