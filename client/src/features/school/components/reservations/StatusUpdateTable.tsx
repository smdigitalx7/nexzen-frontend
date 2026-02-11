import { useState, useMemo, memo, useCallback, useEffect } from "react";
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
import { SchoolReservationsService } from "@/features/school/services";
import { DataTable } from "@/common/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "@/common/hooks/use-toast";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { invalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";

export type Reservation = {
  id: string;
  no: string;
  reservation_id: number;
  studentName: string;
  status: string;
};

export type StatusUpdateTableProps = {
  reservations: Reservation[];
  isLoading: boolean;
  isError: boolean;
  error?: any;
  onRefetch?: () => void | Promise<void>; // Optional - cache invalidation handled by hooks
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

// Status badge component
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

// Status select component
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
          onValueChange={(v) =>
            onStatusChange(reservation.id, v as "PENDING" | "CONFIRMED" | "CANCELLED")
          }
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

// Remarks textarea component - fully isolated to prevent re-renders
const RemarksTextarea = ({
  reservation,
  statusRemarks,
  onRemarksChange,
}: {
  reservation: Reservation & { remarks?: string };
  statusRemarks: Record<string, string>;
  onRemarksChange: (reservationId: string, remarks: string) => void;
}) => {
  const externalValue = statusRemarks[reservation.id] || "";
  const [localValue, setLocalValue] = useState(externalValue);
  const currentStatus = (reservation.status || "").toUpperCase();
  const isConfirmed = currentStatus === "CONFIRMED";

  // When confirmed, show the reservation's actual remarks (read-only)
  // Otherwise, show the editable local value
  const displayValue = isConfirmed 
    ? (reservation.remarks || "") 
    : localValue;

  // Sync localValue only when external value is cleared (after successful update)
  useEffect(() => {
    // Only sync if external value is empty and local is not (after update clears it)
    if (externalValue === "" && localValue !== "") {
      setLocalValue("");
    }
  }, [externalValue]); // Remove localValue from deps to prevent loop

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isConfirmed) return;
      const newValue = e.target.value;
      setLocalValue(newValue);
      // Call parent callback - this updates state but table won't re-render
      // because statusRemarks is not in statusColumns dependencies
      onRemarksChange(reservation.id, newValue);
    },
    [isConfirmed, reservation.id, onRemarksChange]
  );

  return (
    <div className="w-48">
      <Textarea
        placeholder={isConfirmed ? "No remarks" : "Enter remarks..."}
        value={displayValue}
        onChange={handleChange}
        disabled={isConfirmed}
        readOnly={isConfirmed}
        rows={1}
        className={`text-sm resize-none ${isConfirmed ? 'bg-muted cursor-not-allowed' : ''}`}
      />
    </div>
  );
};

RemarksTextarea.displayName = "RemarksTextarea";

// Update button component
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
    ) => void | Promise<void>;
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
          Save
        </Button>
      </div>
    );
  }
);

UpdateButton.displayName = "UpdateButton";

const StatusUpdateTableComponent = ({
  reservations,
  isLoading,
  isError,
  error,
  onRefetch,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: StatusUpdateTableProps) => {
  const [statusChanges, setStatusChanges] = useState<
    Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">
  >({});
  const [statusRemarks, setStatusRemarks] = useState<Record<string, string>>(
    {}
  );
  const [refreshKey, setRefreshKey] = useState(0);

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
        // Step 1: Update status via service
        await SchoolReservationsService.updateStatus(
          reservation.reservation_id,
          newStatus,
          remarks.trim() ? remarks : undefined
        );

        // Step 2: Clear local state immediately (before table re-renders)
        setStatusChanges((prev) => {
          const updated = { ...prev };
          delete updated[reservation.id];
          return updated;
        });
        setStatusRemarks((prev) => {
          const updated = { ...prev };
          updated[reservation.id] = "";
          return updated;
        });

        // Step 3: Invalidate and refetch using debounced utility (prevents UI freeze)
        invalidateAndRefetch(schoolKeys.reservations.root());

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
          title: "Update Failed",
          description: e?.response?.data?.detail || e?.message || "Failed to update reservation status.",
          variant: "destructive",
        });
      }
    },
    [onRefetch]
  );

  // Column definitions
  // Note: statusRemarks is intentionally NOT in dependencies to prevent table re-render on every keystroke
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
      handleStatusChange,
      handleRemarksChange,
      handleStatusUpdate,
      // statusRemarks intentionally excluded to prevent re-render on every keystroke
    ]
  );

  return (
    <div className="space-y-4">
      <DataTable
        data={reservations}
        columns={statusColumns}
        title="Status Updates"
        searchPlaceholder="Search by student name or reservation number..."
        searchKey="studentName"
        export={{ enabled: false }}
        loading={isLoading}
        pagination="server"
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className="w-full"
      />
    </div>
  );
};

export const StatusUpdateTable = StatusUpdateTableComponent;
export default StatusUpdateTableComponent;
