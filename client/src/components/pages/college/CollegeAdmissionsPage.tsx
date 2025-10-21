import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserCheck, GraduationCap, CheckCircle } from "lucide-react";
import { useCollegeReservationsList } from "@/lib/hooks/college/use-college-reservations";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
import { CollegeStudentsService } from "@/lib/services/college/students.service";
import { toast } from "@/hooks/use-toast";
import { ReceiptPreviewModal } from "@/components/shared";
import { handleRegenerateReceipt } from "@/lib/api";

interface Reservation {
  id: string;
  no: string;
  studentName: string;
  status: string;
  date: string;
  totalFee: number;
  reservation_id: number;
  student_name: string;
  aadhar_no: string;
  gender: string;
  dob: string;
  father_or_guardian_name: string;
  father_or_guardian_aadhar_no: string;
  father_or_guardian_mobile: string;
  father_or_guardian_occupation: string;
  mother_or_guardian_name: string;
  mother_or_guardian_aadhar_no: string;
  mother_or_guardian_mobile: string;
  mother_or_guardian_occupation: string;
  present_address: string;
  permanent_address: string;
  admission_fee: number;
  admission_fee_paid: boolean;
  group_name: string;
  course_name: string;
  preferred_class_id: number;
  is_enrolled?: boolean;
  admission_income_id?: number;
}

interface AdmissionFormData {
  student_name: string;
  aadhar_no: string;
  gender: string;
  dob: string;
  father_or_guardian_name: string;
  father_or_guardian_aadhar_no: string;
  father_or_guardian_mobile: string;
  father_or_guardian_occupation: string;
  mother_or_guardian_name: string;
  mother_or_guardian_aadhar_no: string;
  mother_or_guardian_mobile: string;
  mother_or_guardian_occupation: string;
  present_address: string;
  permanent_address: string;
  admission_fee: number;
  admission_fee_paid: boolean;
  admission_date: string;
  status: string;
}

const CollegeAdmissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("CONFIRMED");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showAdmissionDialog, setShowAdmissionDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string>("");
  const [admissionFormData, setAdmissionFormData] = useState<AdmissionFormData>(
    {
      student_name: "",
      aadhar_no: "",
      gender: "",
      dob: "",
      father_or_guardian_name: "",
      father_or_guardian_aadhar_no: "",
      father_or_guardian_mobile: "",
      father_or_guardian_occupation: "",
      mother_or_guardian_name: "",
      mother_or_guardian_aadhar_no: "",
      mother_or_guardian_mobile: "",
      mother_or_guardian_occupation: "",
      present_address: "",
      permanent_address: "",
      admission_fee: 0,
      admission_fee_paid: false,
      admission_date: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    }
  );

  const {
    data: reservationsData,
    isLoading,
    refetch,
  } = useCollegeReservationsList({
    page: 1,
    page_size: 100,
    status: statusFilter,
  });

  // Process reservations data
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];

    if (!Array.isArray(reservationsData.reservations)) return [];

    return reservationsData.reservations.map((r: any) => ({
      id: String(r.reservation_id),
      no: r.reservation_no || r.reservationNo || "",
      studentName: r.student_name,
      status: r.status || "PENDING",
      date: r.reservation_date || "",
      totalFee: Number(r.total_tuition_fee || 0) + Number(r.transport_fee || 0),
      reservation_id: r.reservation_id,
      student_name: r.student_name,
      aadhar_no: r.aadhar_no,
      gender: r.gender,
      dob: r.dob,
      father_or_guardian_name: r.father_or_guardian_name,
      father_or_guardian_aadhar_no: r.father_or_guardian_aadhar_no,
      father_or_guardian_mobile: r.father_or_guardian_mobile,
      father_or_guardian_occupation: r.father_or_guardian_occupation,
      mother_or_guardian_name: r.mother_or_guardian_name,
      mother_or_guardian_aadhar_no: r.mother_or_guardian_aadhar_no,
      mother_or_guardian_mobile: r.mother_or_guardian_mobile,
      mother_or_guardian_occupation: r.mother_or_guardian_occupation,
      present_address: r.present_address,
      permanent_address: r.permanent_address,
      admission_fee: r.admission_fee || 0,
      admission_fee_paid: r.admission_fee_paid || false,
      group_name: r.group_name,
      course_name: r.course_name,
      preferred_class_id: r.preferred_class_id,
      is_enrolled: r.is_enrolled || false,
      admission_income_id: r.admission_income_id,
    }));
  }, [reservationsData]);

  // Filter reservations based on search term
  const filteredReservations = useMemo(() => {
    if (!searchTerm.trim()) return allReservations;

    return allReservations.filter(
      (reservation) =>
        reservation.studentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.aadhar_no.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allReservations, searchTerm]);

  const handleEnrollStudent = (reservation: Reservation) => {
    setSelectedReservation(reservation);

    // Pre-fill form with reservation data
    setAdmissionFormData({
      student_name: reservation.student_name,
      aadhar_no: reservation.aadhar_no,
      gender: reservation.gender,
      dob: reservation.dob,
      father_or_guardian_name: reservation.father_or_guardian_name,
      father_or_guardian_aadhar_no: reservation.father_or_guardian_aadhar_no,
      father_or_guardian_mobile: reservation.father_or_guardian_mobile,
      father_or_guardian_occupation: reservation.father_or_guardian_occupation,
      mother_or_guardian_name: reservation.mother_or_guardian_name,
      mother_or_guardian_aadhar_no: reservation.mother_or_guardian_aadhar_no,
      mother_or_guardian_mobile: reservation.mother_or_guardian_mobile,
      mother_or_guardian_occupation: reservation.mother_or_guardian_occupation,
      present_address: reservation.present_address,
      permanent_address: reservation.permanent_address,
      admission_fee: reservation.admission_fee,
      admission_fee_paid: false,
      admission_date: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    });

    setShowAdmissionDialog(true);
  };

  const handleAdmissionPayment = async () => {
    if (!selectedReservation) return;

    try {
      // Process admission fee payment
      const paymentResponse =
        await CollegeReservationsService.processPaymentAndPrintReceipt(
          selectedReservation.aadhar_no,
          {
            details: [
              {
                purpose: "ADMISSION_FEE",
                paid_amount: selectedReservation.admission_fee,
                payment_method: "CASH",
              },
            ],
            remarks: "Admission fee payment",
          }
        );

      // Get income_id and blobUrl from payment response
      const { income_id, blobUrl } = paymentResponse;

      if (blobUrl) {
        setReceiptBlobUrl(blobUrl);
        setShowReceiptModal(true);

        // Update form to mark fee as paid
        setAdmissionFormData((prev) => ({
          ...prev,
          admission_fee_paid: true,
        }));
      }

      // If we have income_id, we can regenerate receipt later if needed
      if (income_id && income_id > 0) {
        console.log("✅ Payment processed with income_id:", income_id);
      }
    } catch (error: any) {
      console.error("Payment processing failed:", error);
      toast({
        title: "Payment Failed",
        description:
          error?.message ||
          "Failed to process admission fee payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateStudent = async () => {
    if (!admissionFormData.admission_fee_paid) {
      toast({
        title: "Payment Required",
        description: "Please complete the admission fee payment first",
        variant: "destructive",
      });
      return;
    }

    try {
      await CollegeStudentsService.create(admissionFormData as any);

      toast({
        title: "Student Created Successfully",
        description: "Student has been enrolled successfully",
      });

      setShowAdmissionDialog(false);
      setSelectedReservation(null);
      refetch();
    } catch (error: any) {
      console.error("Student creation failed:", error);
      toast({
        title: "Enrollment Failed",
        description:
          error?.message ||
          "Failed to create student record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">College Admissions</h1>
          <p className="text-muted-foreground">
            Process confirmed reservations into student admissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, reservation number, or Aadhar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Confirmed Reservations ({filteredReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Admission Fee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UserCheck className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No confirmed reservations found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.no}
                    </TableCell>
                    <TableCell>{reservation.studentName}</TableCell>
                    <TableCell>
                      {reservation.group_name} - {reservation.course_name}
                    </TableCell>
                    <TableCell>₹{reservation.admission_fee}</TableCell>
                    <TableCell>{reservation.date}</TableCell>
                    <TableCell>
                      {reservation.is_enrolled ? (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 w-fit"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Enrolled
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEnrollStudent(reservation)}
                          className="flex items-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Enroll Student
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admission Dialog */}
      {showAdmissionDialog && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Enroll Student</h2>

            {/* Student Details */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Student Name</label>
                  <Input value={admissionFormData.student_name} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Aadhar Number</label>
                  <Input value={admissionFormData.aadhar_no} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <Input value={admissionFormData.gender} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input value={admissionFormData.dob} readOnly />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">Admission Fee Payment</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Admission Fee:</span>
                  <span className="text-lg font-bold">
                    ₹{admissionFormData.admission_fee}
                  </span>
                </div>
                {selectedReservation?.admission_income_id ? (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-green-400">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-bold text-green-600">
                        Admission Fee Paid
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Payment has been successfully processed
                      </p>
                    </div>
                  </div>
                ) : !admissionFormData.admission_fee_paid ? (
                  <Button onClick={handleAdmissionPayment} className="w-full">
                    Pay Admission Fee
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <UserCheck className="h-4 w-4" />
                    <span className="font-medium">Payment Completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAdmissionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStudent}
                disabled={!admissionFormData.admission_fee_paid}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Complete Enrollment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptBlobUrl && (
        <ReceiptPreviewModal
          isOpen={showReceiptModal}
          onClose={handleCloseReceiptModal}
          blobUrl={receiptBlobUrl}
        />
      )}
    </div>
  );
};

export default CollegeAdmissionsPage;
