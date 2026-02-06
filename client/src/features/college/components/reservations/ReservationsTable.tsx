"use client";

import React, { useMemo, useState, memo, useCallback } from "react";
import { 
  Printer, 
  Eye, 
  Edit, 
  Trash2, 
  Percent 
} from "lucide-react";
import { DataTable } from "@/common/components/shared/DataTable";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { Badge } from "@/common/components/ui/badge";
import { toast } from "@/common/hooks/use-toast";
import {
  CollegeReservationsService,
  CollegeIncomeService,
} from "@/features/college/services";
import { ReceiptPreviewModal } from "@/common/components/shared";
import type {
  ReservationStatusEnum,
} from "@/features/college/types/reservations";

export type Reservation = {
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
  income_id?: number; // For receipt regeneration
  concession_lock?: boolean; // For UI state
  tuition_fee?: number; // For concession dialog
  transport_fee?: number; // For concession dialog
  book_fee?: number; // For concession dialog
  application_fee?: number; // For concession dialog
  tuition_concession?: number; // Current tuition concession
  transport_concession?: number; // Current transport concession
};

export type ReservationsTableProps = {
  reservations: Reservation[];
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onUpdateConcession?: (reservation: Reservation) => void;
  // ✅ Server-side pagination props
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  enableServerSidePagination?: boolean;
  isLoading?: boolean;
};

const ReservationsTableComponent = ({
  reservations,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  enableServerSidePagination = false,
  isLoading = false,
}: ReservationsTableProps) => {
  const [regeneratingReceipts, setRegeneratingReceipts] = useState<Set<number>>(
    new Set()
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  const handleRegenerateReceipt = async (reservation: Reservation) => {
    if (!reservation.income_id) {
      toast({
        title: "Receipt Not Available",
        description:
          "This reservation does not have an associated income record for receipt generation.",
        variant: "destructive",
      });
      return;
    }

    setRegeneratingReceipts((prev) =>
      new Set(prev).add(reservation.income_id!)
    );

    try {
      const blob = await CollegeIncomeService.regenerateReceipt(
        reservation.income_id
      );
      const blobUrl = URL.createObjectURL(blob);

      setReceiptBlobUrl(blobUrl);
      setShowReceiptModal(true);

      toast({
        title: "Receipt Generated",
        description: "Receipt has been generated and is ready for viewing.",
        variant: "success",
      });
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
    } finally {
      setRegeneratingReceipts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reservation.income_id!);
        return newSet;
      });
    }
  };

  const handleCloseReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  }, [receiptBlobUrl]);

  const columns = useMemo(() => [
    {
      accessorKey: "reservation_no",
      header: "Reservation No",
      cell: ({ row }: { row: { original: Reservation } }) => (
        <span className="font-medium text-xs">
          {row.original.reservation_no || row.original.reservation_id}
        </span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }: { row: { original: Reservation } }) => <span className="text-xs">{row.original.student_name}</span>,
    },
    {
      accessorKey: "group_name",
      header: "Group",
      cell: ({ row }: { row: { original: Reservation } }) => <span className="text-xs">{row.original.group_name || "N/A"}</span>,
    },
    {
      accessorKey: "course_name",
      header: "Course",
      cell: ({ row }: { row: { original: Reservation } }) => <span className="text-xs">{row.original.course_name || "N/A"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Reservation } }) => {
        const status = row.original.status;
        return (
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
            className={status === "CONFIRMED" ? "bg-green-500 text-white text-[10px]" : "text-[10px]"}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reservation_date",
      header: "Date",
      cell: ({ row }: { row: { original: Reservation } }) => {
        const date = row.original.reservation_date || row.original.created_at;
        return <span className="text-xs">{date ? new Date(date).toLocaleDateString() : "-"}</span>;
      },
    },
  ], []);

  const actions: ActionConfig<Reservation>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: onView,
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: onEdit,
    },
    {
      id: "receipt",
      label: "Receipt",
      icon: Printer,
      onClick: handleRegenerateReceipt,
      show: (row: Reservation) => !!(row.income_id && Number(row.income_id) > 0),
    },
    {
      id: "concession",
      label: "Concession",
      icon: Percent,
      onClick: (row: Reservation) => onUpdateConcession?.(row),
      show: (row: Reservation) => !!onUpdateConcession && !row.concession_lock,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: onDelete,
    },
  ], [onView, onEdit, onDelete, onUpdateConcession]);

  return (
    <div className="space-y-4">
      <DataTable
        data={reservations}
        columns={columns}
        actions={actions}
        loading={isLoading}
        // Search configuration
        showSearch={true}
        searchPlaceholder="Search students..."
        searchKey="student_name"
        // Pagination configuration
        pagination={enableServerSidePagination ? "server" : "client"}
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        // Export configuration
        export={{ enabled: true, filename: "college_reservations" }}
      />

      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl}
      />
    </div>
  );
};

export const ReservationsTable = memo(ReservationsTableComponent);
export default ReservationsTableComponent;
