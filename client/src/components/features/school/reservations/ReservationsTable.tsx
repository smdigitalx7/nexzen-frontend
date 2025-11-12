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
import { useMemo, useState, memo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SchoolReservationsService } from "@/lib/services/school";
import {
  ReceiptPreviewModal,
  ConcessionUpdateDialog,
} from "@/components/shared";
import { handleRegenerateReceipt as regenerateReceiptAPI } from "@/lib/api";

export type Reservation = {
  id: string;
  no: string; // Add reservation number field
  studentName: string;
  classAdmission?: string; // Add classAdmission field for search
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

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => (
  <Badge
    variant={
      status === "Pending"
        ? "default"
        : status === "Cancelled"
        ? "destructive"
        : status === "Confirmed"
        ? "secondary"
        : "outline"
    }
    className={
      status === "Confirmed" || status === "CONFIRMED"
        ? "bg-green-500 text-white hover:bg-green-600"
        : ""
    }
  >
    {status}
  </Badge>
));

StatusBadge.displayName = "StatusBadge";

// Memoized action buttons component
const ActionButtons = memo(({ 
  reservation, 
  onView, 
  onEdit, 
  onDelete, 
  onUpdateConcession, 
  onRegenerateReceipt, 
  regeneratingReceipts 
}: { 
  reservation: Reservation;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onUpdateConcession?: (reservation: Reservation) => void;
  onRegenerateReceipt: (reservation: Reservation) => void;
  regeneratingReceipts: Set<number>;
}) => (
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
            onRegenerateReceipt(reservation);
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
));

ActionButtons.displayName = "ActionButtons";

// Memoized table row component
const ReservationRow = memo(({ 
  reservation, 
  onView, 
  onEdit, 
  onDelete, 
  onUpdateConcession, 
  onRegenerateReceipt, 
  regeneratingReceipts 
}: { 
  reservation: Reservation;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onUpdateConcession?: (reservation: Reservation) => void;
  onRegenerateReceipt: (reservation: Reservation) => void;
  regeneratingReceipts: Set<number>;
}) => (
  <TableRow key={reservation.id}>
    <TableCell className="font-medium">{reservation.no}</TableCell>
    <TableCell>{reservation.studentName}</TableCell>
    <TableCell>
      <StatusBadge status={reservation.status} />
    </TableCell>
    <TableCell>{reservation.date}</TableCell>
    <TableCell>
      <ActionButtons
        reservation={reservation}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdateConcession={onUpdateConcession}
        onRegenerateReceipt={onRegenerateReceipt}
        regeneratingReceipts={regeneratingReceipts}
      />
    </TableCell>
  </TableRow>
));

ReservationRow.displayName = "ReservationRow";

// Memoized pagination component
const PaginationControls = memo(({ 
  filteredReservations, 
  currentPage, 
  totalPages, 
  startIndex, 
  endIndex, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}: { 
  filteredReservations: Reservation[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}) => {
  if (filteredReservations.length === 0) return null;

  return (
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
              onItemsPerPageChange(Number(value));
              onPageChange(1);
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
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
                onClick={() => onPageChange(pageNum)}
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
            onPageChange(Math.min(currentPage + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

PaginationControls.displayName = "PaginationControls";

// Memoized search and filter component
const SearchAndFilter = memo(({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange 
}: { 
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}) => (
  <div className="flex items-center gap-4">
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search reservations..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
    <div className="w-48">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger aria-label="Filter by status">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
));

SearchAndFilter.displayName = "SearchAndFilter";

const ReservationsTableComponent = ({
  reservations,
  onView,
  onEdit,
  onDelete,
  onUpdateConcession,
}: ReservationsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [regeneratingReceipts, setRegeneratingReceipts] = useState<Set<number>>(
    new Set()
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  // Memoized filtered reservations
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

  // Memoized pagination logic
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReservations = filteredReservations.slice(
      startIndex,
      endIndex
    );

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedReservations,
    };
  }, [filteredReservations, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Memoized handlers
  const handleRegenerateReceipt = useCallback(async (reservation: Reservation) => {
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
      if (import.meta.env.DEV) {
        console.log(
          "🔄 Starting receipt regeneration for income ID:",
          reservation.income_id
        );
      }
      const blobUrl = await regenerateReceiptAPI(reservation.income_id, 'school');
      if (import.meta.env.DEV) {
        console.log("✅ Receipt blob URL received:", blobUrl);
      }

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
  }, []);

  const handleCloseReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  }, [receiptBlobUrl]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">All Reservations</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all student reservations
          </p>
        </div>
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />
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
          {paginationData.paginatedReservations.length === 0 ? (
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
            paginationData.paginatedReservations.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdateConcession={onUpdateConcession}
                onRegenerateReceipt={handleRegenerateReceipt}
                regeneratingReceipts={regeneratingReceipts}
              />
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <PaginationControls
        filteredReservations={filteredReservations}
        currentPage={currentPage}
        totalPages={paginationData.totalPages}
        startIndex={paginationData.startIndex}
        endIndex={paginationData.endIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
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

export const ReservationsTable = ReservationsTableComponent;
export default ReservationsTableComponent;
