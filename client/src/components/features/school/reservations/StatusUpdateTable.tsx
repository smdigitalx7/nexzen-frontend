import { useState, useMemo, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { schoolKeys } from "@/lib/hooks/school/query-keys";
import { SchoolReservationsService } from "@/lib/services/school";
import { EnhancedDataTable } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";

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
  }) => (
    <div className="w-48">
      <Textarea
        placeholder="Enter remarks..."
        value={statusRemarks[reservation.id] || ""}
        onChange={(e) => onRemarksChange(reservation.id, e.target.value)}
        rows={1}
        className="text-sm resize-none"
      />
    </div>
  )
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
  const queryClient = useQueryClient();
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
        // Step 1: Update the status via API
        await SchoolReservationsService.updateStatus(
          reservation.reservation_id,
          newStatus,
          remarks.trim() ? remarks : undefined
        );

        // Step 2: Remove the query data to force fresh fetch
        queryClient.removeQueries({ queryKey: schoolKeys.reservations.list({ page: 1, page_size: 20 }) });
        
        // Step 3: Invalidate all reservation queries
        queryClient.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
        
        // Step 4: FORCE REFETCH - This will make a network request to /school/reservations
        // The refetch will fetch fresh data from server since we removed the cache
        if (onRefetch) {
          await onRefetch();
        }
        
        // Step 5: Also explicitly refetch to ensure network request
        await queryClient.refetchQueries({
          queryKey: schoolKeys.reservations.list({ page: 1, page_size: 20 }),
          type: 'active'
        });
        
        // Step 6: Wait for React to process the state update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 7: Force table refresh by updating refresh key
        setRefreshKey((prev) => prev + 1);

        toast({
          title: "Successful",
          description: `Reservation ${reservation.no} status updated to ${newStatus}.`,
          variant: "success",
        });

        // Clear the status change and remarks after successful update
        setStatusChanges((prev) => {
          const updated = { ...prev };
          delete updated[reservation.id];
          return updated;
        });
        setStatusRemarks((prev) => ({
          ...prev,
          [reservation.id]: "",
        }));
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
    [onRefetch, queryClient]
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
