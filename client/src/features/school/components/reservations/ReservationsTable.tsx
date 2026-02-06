import { useMemo, useState, memo, useCallback, useEffect } from "react";
import { Badge } from "@/common/components/ui/badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Printer, 
  Percent 
} from "lucide-react";
import { toast } from "@/common/hooks/use-toast";
import { 
  DataTable,
  ReceiptPreviewModal 
} from "@/common/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { handleRegenerateReceipt as regenerateReceiptAPI } from "@/core/api";

export type Reservation = {
  id: string;
  no: string;
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
  tuition_concession?: number;
  transport_concession?: number;
  remarks?: string;
};

export type ReservationsTableProps = {
  reservations: Reservation[];
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onUpdateConcession?: (reservation: Reservation) => void;
};

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const currentStatus = status?.toUpperCase();
  return (
    <Badge
      variant={
        currentStatus === "PENDING"
          ? "default"
          : currentStatus === "CANCELLED"
            ? "destructive"
            : currentStatus === "CONFIRMED"
              ? "secondary"
              : "outline"
      }
      className={
        currentStatus === "CONFIRMED"
          ? "bg-green-500 text-white hover:bg-green-600"
          : ""
      }
    >
      {status}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

const ReservationsTableComponent = ({
  reservations,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
}: ReservationsTableProps) => {
  const [regeneratingReceipts, setRegeneratingReceipts] = useState<Set<number>>(
    new Set()
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  // Column definitions for DataTable V2
  const columns: ColumnDef<Reservation>[] = useMemo(
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
        header: "Student Name",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      },
      {
        accessorKey: "date",
        header: "Date",
      },
    ],
    []
  );

  const handleRegenerateReceipt = useCallback(
    async (reservation: Reservation) => {
      if (!reservation.income_id) {
        toast({
          title: "Receipt Not Available",
          description: "This reservation does not have an associated income record.",
          variant: "destructive",
        });
        return;
      }

      setRegeneratingReceipts((prev) => new Set(prev).add(reservation.income_id!));

      try {
        const blobUrl = await regenerateReceiptAPI(
          reservation.income_id,
          "school"
        );
        setReceiptBlobUrl(blobUrl);
        setShowReceiptModal(true);
        toast({
          title: "Receipt Generated",
          description: "Receipt is ready for viewing.",
          variant: "success",
        });
      } catch (error) {
        console.error("Receipt regeneration failed:", error);
        toast({
          title: "Receipt Generation Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setRegeneratingReceipts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reservation.income_id!);
          return newSet;
        });
      }
    },
    []
  );

  const handleCloseReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  }, [receiptBlobUrl]);

  // Combined actions for DataTable V2
  const actions: ActionConfig<Reservation>[] = useMemo(
    () => [
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
        onClick: (row: Reservation) => handleRegenerateReceipt(row),
        show: (row: Reservation) => !!(row.income_id && Number(row.income_id) > 0),
        loading: (row: Reservation) => regeneratingReceipts.has(row.income_id!),
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
    ],
    [onView, onEdit, onDelete, onUpdateConcession, handleRegenerateReceipt, regeneratingReceipts]
  );

  return (
    <div className="space-y-4">
      <DataTable
        data={reservations}
        columns={columns}
        title="All Reservations"
        searchPlaceholder="Search by student name..."
        searchKey="studentName"
        actions={actions}
        actionsHeader="Actions"
        export={{
          enabled: true,
          filename: "reservations",
        }}
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
export default ReservationsTable;
