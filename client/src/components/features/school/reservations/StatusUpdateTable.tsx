import { useState, useMemo } from "react";
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
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
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

export default function StatusUpdateTable({
  reservations,
  isLoading,
  isError,
  error,
  onRefetch,
  totalCount,
}: StatusUpdateTableProps) {
  const [statusChanges, setStatusChanges] = useState<
    Record<string, "PENDING" | "CONFIRMED" | "CANCELLED">
  >({});
  const [statusRemarks, setStatusRemarks] = useState<Record<string, string>>({});

  // Column definitions for EnhancedDataTable
  const statusColumns: ColumnDef<Reservation>[] = useMemo(() => [
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
        <div className="max-w-[200px] truncate">{row.getValue("studentName")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Current Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
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
          >
            {current}
          </Badge>
        );
      },
    },
    {
      accessorKey: "changeTo",
      header: "Change To",
      cell: ({ row }) => {
        const reservation = row.original as Reservation;
        const current = (reservation.status || "").toUpperCase();
        const selected = (statusChanges[reservation.id] || current) as
          | "PENDING"
          | "CONFIRMED"
          | "CANCELLED";
        
        return (
          <div className="w-48">
            <Select
              value={selected}
              onValueChange={(v) =>
                setStatusChanges((prev) => ({
                  ...prev,
                  [reservation.id]: v as any,
                }))
              }
            >
              <SelectTrigger aria-label="Select status">
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
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const reservation = row.original as Reservation;
        return (
          <div className="w-48">
            <Textarea
              placeholder="Enter remarks..."
              value={statusRemarks[reservation.id] || ""}
              onChange={(e) =>
                setStatusRemarks((prev) => ({
                  ...prev,
                  [reservation.id]: e.target.value,
                }))
              }
              rows={1}
              className="text-sm resize-none"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "updateAction",
      header: "Update",
      cell: ({ row }) => {
        const reservation = row.original as Reservation;
        const current = (reservation.status || "").toUpperCase();
        const selected = (statusChanges[reservation.id] || current) as
          | "PENDING"
          | "CONFIRMED"
          | "CANCELLED";
        const same = selected === current;
        
        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant={same ? "outline" : "default"}
              disabled={same}
              onClick={() => {
                const to = (statusChanges[reservation.id] || current) as
                  | "PENDING"
                  | "CONFIRMED"
                  | "CANCELLED";
                const remarks = statusRemarks[reservation.id] || "";
                handleStatusUpdate(reservation, to, remarks);
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>
        );
      },
    },
  ], [statusChanges, statusRemarks]);

  const handleStatusUpdate = async (
    reservation: Reservation,
    newStatus: "PENDING" | "CONFIRMED" | "CANCELLED",
    remarks: string
  ) => {
    try {
      await SchoolReservationsService.updateStatus(
        reservation.reservation_id,
        newStatus,
        remarks.trim() ? remarks : undefined
      );
      
      toast({
        title: "Status Updated",
        description: `Reservation ${reservation.no} status updated to ${newStatus}.`,
      });

      // Clear the remarks after successful update
      setStatusRemarks((prev) => ({
        ...prev,
        [reservation.id]: "",
      }));

      // Refresh the data
      onRefetch();
    } catch (e: any) {
      console.error("Failed to update status:", e);
      toast({
        title: "Status Update Failed",
        description:
          e?.message ||
          "Could not update reservation status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
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
            onClick={() => onRefetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <EnhancedDataTable
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
}
