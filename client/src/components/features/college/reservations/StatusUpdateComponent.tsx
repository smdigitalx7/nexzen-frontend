import React, { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
// Define a minimal interface for status update functionality
interface ReservationForStatusUpdate {
  reservation_id: number;
  student_name: string;
  status?: string | null;
}

interface StatusUpdateComponentProps {
  reservations: ReservationForStatusUpdate[];
  onStatusUpdate: () => void;
  isLoading?: boolean;
}

type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

const StatusUpdateComponent: React.FC<StatusUpdateComponentProps> = ({
  reservations,
  onStatusUpdate,
  isLoading = false,
}) => {
  const [statusChanges, setStatusChanges] = useState<
    Record<string, ReservationStatus>
  >({});
  const [statusRemarks, setStatusRemarks] = useState<Record<string, string>>({});
  const [updatingReservationId, setUpdatingReservationId] = useState<number | null>(null);

  const handleStatusChange = (reservationId: number, newStatus: ReservationStatus) => {
    setStatusChanges((prev) => ({
      ...prev,
      [reservationId]: newStatus,
    }));
  };

  const handleRemarksChange = (reservationId: number, remarks: string) => {
    setStatusRemarks((prev) => ({
      ...prev,
      [reservationId]: remarks,
    }));
  };

  const handleStatusUpdate = async (reservation: ReservationForStatusUpdate) => {
    const currentStatus = (reservation.status || "").toUpperCase() as ReservationStatus;
    const newStatus = statusChanges[reservation.reservation_id] || currentStatus;
    const remarks = statusRemarks[reservation.reservation_id] || "";

    if (newStatus === currentStatus) {
      return; // No change needed
    }

    setUpdatingReservationId(reservation.reservation_id);

    try {
      const payload = {
        status: newStatus,
        remarks: remarks.trim() ? remarks : null,
      };

      await CollegeReservationsService.updateStatus(
        Number(reservation.reservation_id),
        payload
      );

      // Clear the remarks after successful update
      setStatusRemarks((prev) => ({
        ...prev,
        [reservation.reservation_id]: "",
      }));

      // Clear the status change
      setStatusChanges((prev) => {
        const updated = { ...prev };
        delete updated[reservation.reservation_id];
        return updated;
      });

      onStatusUpdate();

      toast({
        title: "Status Updated",
        description: `Reservation status updated to ${newStatus}`,
      });
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast({
        title: "Status Update Failed",
        description:
          error?.message ||
          "Could not update reservation status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingReservationId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "CONFIRMED":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reservations found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>New Status</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => {
              const currentStatus = (reservation.status || "").toUpperCase() as ReservationStatus;
              const selectedStatus = statusChanges[reservation.reservation_id] || currentStatus;
              const hasChanges = selectedStatus !== currentStatus;
              const isUpdating = updatingReservationId === reservation.reservation_id;

              return (
                <TableRow key={reservation.reservation_id}>
                  <TableCell className="font-medium">
                    {reservation.reservation_id}
                  </TableCell>
                  <TableCell>{reservation.student_name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(currentStatus)}>
                      {currentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-48">
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) =>
                          handleStatusChange(reservation.reservation_id, value as ReservationStatus)
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
                  </TableCell>
                  <TableCell>
                    <div className="w-48">
                      <Textarea
                        placeholder="Enter remarks..."
                        value={statusRemarks[reservation.reservation_id] || ""}
                        onChange={(e) =>
                          handleRemarksChange(reservation.reservation_id, e.target.value)
                        }
                        className="text-sm"
                        rows={2}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={hasChanges ? "default" : "outline"}
                        disabled={!hasChanges || isUpdating}
                        onClick={() => handleStatusUpdate(reservation)}
                        className="flex items-center gap-2"
                      >
                        {isUpdating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isUpdating ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StatusUpdateComponent;
