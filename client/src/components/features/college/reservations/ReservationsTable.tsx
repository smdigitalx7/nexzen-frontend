import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Edit,
  Trash2,
  Printer,
  Lock,
  Percent,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import { ReceiptPreviewModal } from "@/components/shared";
import { handleRegenerateReceipt as regenerateReceiptAPI } from "@/lib/api";

export type Reservation = {
  id: string;
  no: string; // Add reservation number field
  studentName: string;
  status: "Pending" | "Cancelled" | string;
  date: string;
  totalFee: number;
  income_id?: number; // Add income_id for receipt regeneration
  concession_lock?: boolean; // Add concession_lock for UI state
  tuition_fee?: number; // Add tuition_fee for concession dialog
  transport_fee?: number; // Add transport_fee for concession dialog
  book_fee?: number; // Add book_fee for concession dialog
  application_fee?: number; // Add application_fee for concession dialog
  tuition_concession?: number; // Add current tuition_concession
  transport_concession?: number; // Add current transport_concession
  remarks?: string; // Add remarks for concession dialog
};

export type ReservationsTableProps = {
  reservations: Reservation[];
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onUpdateConcession?: (reservation: Reservation) => void;
};

export default function ReservationsTable({
  reservations,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
}: ReservationsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [regeneratingReceipts, setRegeneratingReceipts] = useState<Set<number>>(
    new Set()
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    // Filter by status
    if (statusFilter !== "all") {
      const target = statusFilter.toLowerCase();
      filtered = filtered.filter(
        (r) => (r.status || "").toLowerCase() === target
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.studentName.toLowerCase().includes(search) ||
          r.id.toLowerCase().includes(search) ||
          (r.classAdmission || "").toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [reservations, statusFilter, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

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
      console.log(
        "🔄 Starting receipt regeneration for income ID:",
        reservation.income_id
      );
      const blobUrl = await regenerateReceiptAPI(reservation.income_id);
      console.log("✅ Receipt blob URL received:", blobUrl);

      setReceiptBlobUrl(blobUrl);
      setShowReceiptModal(true);

      toast({
        title: "Receipt Generated",
        description: "Receipt has been generated and is ready for viewing.",
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

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">All Reservations</h3>
          <p className="text-lg text-muted-foreground">
            View and manage all student reservations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Filter by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="admitted">Admitted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reservation No</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedReservations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                <div className="space-y-2">
                  <p>No reservations found</p>
                  <p className="text-xs">
                    Create your first reservation using the "New Reservations"
                    tab
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">{reservation.no}</TableCell>
                <TableCell>{reservation.studentName}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      reservation.status === "Pending"
                        ? "default"
                        : reservation.status === "Cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell>{reservation.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(reservation)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(reservation)}
                    >
                      Edit
                    </Button>
                    {reservation.income_id &&
                      Number(reservation.income_id) > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRegenerateReceipt(reservation);
                          }}
                          disabled={regeneratingReceipts.has(
                            reservation.income_id
                          )}
                        >
                          Receipt
                        </Button>
                      )}
                    {onUpdateConcession && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onUpdateConcession(reservation);
                        }}
                        disabled={reservation.concession_lock}
                      >
                        {reservation.concession_lock ? "Locked" : "Concession"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(reservation)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {filteredReservations.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredReservations.length)} of{" "}
              {filteredReservations.length} reservations
            </span>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl}
      />
    </div>
  );
}
