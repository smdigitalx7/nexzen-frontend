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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CollegeReservationsService, CollegeIncomeService } from "@/lib/services/college";
import {
  ReceiptPreviewModal,
  ConcessionUpdateDialog,
} from "@/components/shared";
import type {
  CollegeReservationMinimalRead,
  ReservationStatusEnum,
} from "@/lib/types/college/reservations";

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
      const target = statusFilter.toUpperCase();
      filtered = filtered.filter((r) => r.status === target);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.student_name.toLowerCase().includes(search) ||
          r.reservation_id.toString().includes(search) ||
          (r.group_name || "").toLowerCase().includes(search) ||
          (r.course_name || "").toLowerCase().includes(search) ||
          (r.father_name || "").toLowerCase().includes(search)
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
  useEffect(() => {
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
      const blob = await CollegeIncomeService.regenerateReceipt(
        reservation.income_id
      );
      const blobUrl = URL.createObjectURL(blob);
      console.log("✅ Receipt blob URL received:", blobUrl);

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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reservation ID</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedReservations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
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
              <TableRow key={reservation.reservation_id}>
                <TableCell className="font-medium">
                  {reservation.reservation_no || reservation.reservation_id}
                </TableCell>
                <TableCell>{reservation.student_name}</TableCell>
                <TableCell>{reservation.group_name || "N/A"}</TableCell>
                <TableCell>{reservation.course_name || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      reservation.status === "PENDING"
                        ? "default"
                        : reservation.status === "CANCELLED"
                        ? "destructive"
                        : reservation.status === "CONFIRMED"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      reservation.status === "CONFIRMED"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : ""
                    }
                  >
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {reservation.reservation_date
                    ? new Date(
                        reservation.reservation_date
                      ).toLocaleDateString()
                    : new Date(reservation.created_at).toLocaleDateString()}
                </TableCell>
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
                          {regeneratingReceipts.has(reservation.income_id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                              Loading...
                            </>
                          ) : (
                            "Receipt"
                          )}
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
