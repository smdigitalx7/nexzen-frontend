import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";

export type Reservation = {
  id: string;
  studentName: string;
  fatherName: string;
  classAdmission: string;
  status: "Pending" | "Cancelled" | string;
  date: string;
  totalFee: number;
};

export type ReservationsTableProps = {
  reservations: Reservation[];
  onConvert: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
};

export default function ReservationsTable({ reservations, onConvert, onCancel }: ReservationsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Reservations</CardTitle>
        <CardDescription>View and manage all student reservations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Father Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Fee</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">{reservation.id}</TableCell>
                <TableCell>{reservation.studentName}</TableCell>
                <TableCell>{reservation.fatherName}</TableCell>
                <TableCell>{reservation.classAdmission}</TableCell>
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
                <TableCell>₹{reservation.totalFee.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {reservation.status === "Pending" && (
                      <>
                        <Button size="sm" onClick={() => onConvert(reservation)} className="gap-1">
                          <UserPlus className="h-3 w-3" />
                          Convert to Admission
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onCancel(reservation)} className="gap-1">
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


