"use client";

import React, { useState, useMemo, memo, useCallback } from "react";
import { Save } from "lucide-react";
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
import { toast } from "@/common/hooks/use-toast";
import { collegeKeys } from "@/features/college/hooks/query-keys";
import { CollegeReservationsService } from "@/features/college/services";
import { DataTable } from "@/common/components/shared/DataTable";
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
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

const StatusBadge = memo(({ status }: { status: string }) => {
  const current = status.toUpperCase();
  return (
    <Badge
      variant={
        current === "PENDING" ? "default" :
        current === "CANCELLED" ? "destructive" :
        current === "CONFIRMED" ? "secondary" : "outline"
      }
      className={current === "CONFIRMED" ? "bg-green-500 text-white" : ""}
    >
      {current}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

const StatusSelect = memo(({
  reservation,
  statusChanges,
  onStatusChange,
}: {
  reservation: Reservation;
  statusChanges: Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">;
  onStatusChange: (id: string, s: "PENDING" | "CONFIRMED" | "CANCELLED") => void;
}) => {
  const current = (reservation.status || "").toUpperCase();
  const selected = statusChanges[reservation.id] || current;
  const isConfirmed = current === "CONFIRMED";

  return (
    <div className="w-40">
      <Select
        value={selected}
        onValueChange={(v) => onStatusChange(reservation.id, v as any)}
        disabled={isConfirmed}
      >
        <SelectTrigger className="h-8">
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
});

StatusSelect.displayName = "StatusSelect";

const RemarksTextarea = memo(({
  reservation,
  statusRemarks,
  onRemarksChange,
}: {
  reservation: Reservation;
  statusRemarks: Record<string, string>;
  onRemarksChange: (id: string, r: string) => void;
}) => {
  const currentStatus = (reservation.status || "").toUpperCase();
  const isConfirmed = currentStatus === "CONFIRMED";
  const displayValue = isConfirmed ? (reservation.remarks || "") : (statusRemarks[reservation.id] || "");

  return (
    <div className="w-48">
      <Textarea
        placeholder={isConfirmed ? "No remarks" : "Enter remarks..."}
        value={displayValue}
        onChange={(e) => !isConfirmed && onRemarksChange(reservation.id, e.target.value)}
        disabled={isConfirmed}
        rows={1}
        className={`text-xs h-8 min-h-[32px] py-1 px-2 resize-none ${isConfirmed ? 'bg-muted/50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
});

RemarksTextarea.displayName = "RemarksTextarea";

const UpdateButton = memo(({
  reservation,
  statusChanges,
  statusRemarks,
  onUpdate,
}: {
  reservation: Reservation;
  statusChanges: Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">;
  statusRemarks: Record<string, string>;
  onUpdate: (r: Reservation, s: any, rem: string) => void;
}) => {
  const current = (reservation.status || "").toUpperCase();
  const selected = statusChanges[reservation.id] || current;
  const same = (selected === current) && !(statusRemarks[reservation.id]?.trim());

  return (
    <Button
      size="sm"
      variant={same ? "ghost" : "default"}
      disabled={same}
      className="h-8 w-8 p-0 sm:w-auto sm:px-3"
      onClick={() => {
        const to = statusChanges[reservation.id] || current;
        const rem = statusRemarks[reservation.id] || "";
        onUpdate(reservation, to as any, rem);
      }}
    >
      <Save className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline text-xs">Update</span>
    </Button>
  );
});

UpdateButton.displayName = "UpdateButton";

const StatusUpdateTableComponent = ({
  reservations,
  isLoading,
  onRefetch,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: StatusUpdateTableProps) => {
  const [statusChanges, setStatusChanges] = useState<Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">>({});
  const [statusRemarks, setStatusRemarks] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatusChange = useCallback((id: string, s: any) => {
    setStatusChanges(p => ({ ...p, [id]: s }));
  }, []);

  const handleRemarksChange = useCallback((id: string, r: string) => {
    setStatusRemarks(p => ({ ...p, [id]: r }));
  }, []);

  const handleStatusUpdate = useCallback(async (
    reservation: Reservation,
    newStatus: "PENDING" | "CONFIRMED" | "CANCELLED",
    remarks: string
  ) => {
    try {
      await CollegeReservationsService.updateStatus(reservation.reservation_id, {
        status: newStatus,
        remarks: remarks.trim() ? remarks : null,
      });

      setStatusChanges(p => { const n = { ...p }; delete n[reservation.id]; return n; });
      setStatusRemarks(p => ({ ...p, [reservation.id]: "" }));

      invalidateAndRefetch(collegeKeys.reservations.root());
      if (onRefetch) onRefetch();
      setRefreshKey(p => p + 1);
      
      toast({ title: "Status Updated", variant: "success" });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e?.message || "Failed.", variant: "destructive" });
    }
  }, [onRefetch]);

  const columns = useMemo(() => [
    {
      accessorKey: "no",
      header: "Reservation No",
      cell: ({ row }: { row: { original: Reservation } }) => <span className="text-xs font-medium">{row.original.no}</span>,
    },
    {
      accessorKey: "studentName",
      header: "Student",
      cell: ({ row }: { row: { original: Reservation } }) => <div className="max-w-[150px] truncate text-xs">{row.original.studentName}</div>,
    },
    {
      accessorKey: "status",
      header: "Current",
      cell: ({ row }: { row: { original: Reservation } }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "changeTo",
      header: "Change To",
      cell: ({ row }: { row: { original: Reservation } }) => (
        <StatusSelect
          reservation={row.original}
          statusChanges={statusChanges}
          onStatusChange={handleStatusChange}
        />
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }: { row: { original: Reservation } }) => (
        <RemarksTextarea
          reservation={row.original}
          statusRemarks={statusRemarks}
          onRemarksChange={handleRemarksChange}
        />
      ),
    },
    {
      id: "actions",
      header: "Update",
      cell: ({ row }: { row: { original: Reservation } }) => (
        <UpdateButton
          reservation={row.original}
          statusChanges={statusChanges}
          statusRemarks={statusRemarks}
          onUpdate={handleStatusUpdate}
        />
      ),
    },
  ], [statusChanges, statusRemarks, handleStatusChange, handleRemarksChange, handleStatusUpdate]);

  return (
    <div className="w-full mt-4">
      <DataTable
        key={`status-table-${refreshKey}`}
        data={reservations}
        columns={columns}
        loading={isLoading}
        showSearch={true}
        searchPlaceholder="Search students..."
        searchKey="studentName"
        title="Status Updates"
        pagination="server"
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
        className="border-none shadow-none"
      />
    </div>
  );
};

export default memo(StatusUpdateTableComponent);
