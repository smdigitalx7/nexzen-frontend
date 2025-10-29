import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Trash2, DollarSign, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CollegeIncomeService } from "@/lib/services/college/income.service";
import { ReceiptPreviewModal } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import type { ReservationStatusEnum } from "@/lib/types/college/reservations";
import { handleRegenerateReceipt } from "@/lib/api";

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
  isLoading?: boolean;
}

const AllReservationsComponent: React.FC<AllReservationsComponentProps> = ({
  reservations,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
  isLoading = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regeneratingReceipts, setRegeneratingReceipts] = useState<Set<number>>(
    new Set()
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  // Filter reservations based on status
  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return reservations;
    return reservations.filter((r) => r.status === statusFilter.toUpperCase());
  }, [reservations, statusFilter]);

  const handleRegenerateReceipt = async (
    reservation: ReservationForAllReservations
  ) => {
    if (!reservation.income_id) {
      toast({
        title: "No Receipt Available",
        description: "This reservation doesn't have a receipt to regenerate.",
        variant: "destructive",
      });
      return;
    }

    setRegeneratingReceipts((prev) =>
      new Set(prev).add(reservation.reservation_id)
    );

    try {
      const blob = await CollegeIncomeService.regenerateReceipt(
        reservation.income_id
      );
      const url = URL.createObjectURL(blob);
      setReceiptBlobUrl(url);
      setShowReceiptModal(true);
    } catch (error: any) {
      console.error("Failed to regenerate receipt:", error);
      toast({
        title: "Receipt Generation Failed",
        description:
          error?.message || "Could not regenerate receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingReceipts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reservation.reservation_id);
        return newSet;
      });
    }
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  };

  const handleConcessionUpdate = (
    reservation: ReservationForAllReservations
  ) => {
    if (onUpdateConcession) {
      onUpdateConcession(reservation);
    } else {
      toast({
        title: "Concession Update",
        description:
          "Concession update functionality is not available for this reservation.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "default";
      case "CONFIRMED":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    if (status.toUpperCase() === "CONFIRMED") {
      return "bg-green-500 text-white hover:bg-green-600";
    }
    return "";
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Column definitions for the enhanced table
  const columns: ColumnDef<ReservationForAllReservations>[] = useMemo(
    () => [
      {
        accessorKey: "reservation_no",
        header: "Reservation No",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.reservation_no || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "student_name",
        header: "Student Name",
        cell: ({ row }) => <span>{row.getValue("student_name")}</span>,
      },
      {
        accessorKey: "group_name",
        header: "Group",
        cell: ({ row }) => <span>{row.getValue("group_name") || "-"}</span>,
      },
      {
        accessorKey: "course_name",
        header: "Course",
        cell: ({ row }) => <span>{row.getValue("course_name") || "-"}</span>,
      },
      // {
      //   accessorKey: "father_name",
      //   header: "Father Name",
      //   cell: ({ row }) => <span>{row.getValue("father_name") || "-"}</span>,
      // },
      {
        accessorKey: "father_mobile",
        header: "Mobile",
        cell: ({ row }) => <span>{row.getValue("father_mobile") || "-"}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              variant={getStatusBadgeVariant(status)}
              className={getStatusBadgeClassName(status)}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "reservation_date",
        header: "Date",
        cell: ({ row }) => (
          <span>{formatDate(row.getValue("reservation_date"))}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const reservation = row.original;
          const isRegenerating = regeneratingReceipts.has(
            reservation.reservation_id
          );

          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(reservation)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(reservation)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {reservation.income_id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRegenerateReceipt(reservation)}
                  disabled={isRegenerating}
                  className="flex items-center gap-1"
                >
                  {isRegenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Receipt
                </Button>
              )}
              {onUpdateConcession && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConcessionUpdate(reservation)}
                  className="flex items-center gap-1"
                >
                  <DollarSign className="h-4 w-4" />
                  Concession
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(reservation)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onView, onEdit, onDelete, onUpdateConcession, regeneratingReceipts]
  );

  const handleExport = useCallback(() => {
    // Export functionality can be implemented here
    toast({
      title: "Export Started",
      description: "Reservations data is being exported...",
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Reservations Table */}
      <EnhancedDataTable
        data={filteredReservations}
        columns={columns}
        title="All Reservations"
        searchKey="student_name"
        searchPlaceholder="Search by name, reservation no, group, course, or father name..."
        loading={isLoading}
        showSearch={true}
        enableDebounce={true}
        debounceDelay={300}
        highlightSearchResults={true}
        exportable={true}
        onExport={handleExport}
        className="w-full"
      />

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl}
      />
    </div>
  );
};

export default AllReservationsComponent;
