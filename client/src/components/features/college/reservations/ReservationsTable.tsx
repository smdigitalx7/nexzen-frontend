import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Reservation = {
  id: string;
  studentName: string;
  status: "Pending" | "Cancelled" | string;
  date: string;
  totalFee: number;
};

export type ReservationsTableProps = {
  reservations: Reservation[];
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
};

export default function ReservationsTable({ reservations, onView, onEdit, onDelete }: ReservationsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return reservations;
    const target = statusFilter.toLowerCase();
    return reservations.filter((r) => (r.status || "").toLowerCase() === target);
  }, [reservations, statusFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>All Reservations</CardTitle>
            <CardDescription>View and manage all student reservations</CardDescription>
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
      </CardHeader>
      <CardContent>
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
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p>No reservations found</p>
                    <p className="text-xs">Create your first reservation using the "New Reservations" tab</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.id}</TableCell>
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
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="View"
                        title="View"
                        onClick={() => onView(reservation)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Edit"
                        title="Edit"
                        onClick={() => onEdit(reservation)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete"
                        title="Delete"
                        onClick={() => onDelete(reservation)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


