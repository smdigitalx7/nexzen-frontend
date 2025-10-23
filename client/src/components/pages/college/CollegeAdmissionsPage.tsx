import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  UserCheck,
  GraduationCap,
  Edit,
  CheckCircle,
  DollarSign,
  List,
  Users,
} from "lucide-react";
import { useCollegeReservationsList } from "@/lib/hooks/college/use-college-reservations";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
import { CollegeStudentsService } from "@/lib/services/college/students.service";
import { toast } from "@/hooks/use-toast";
import { ReceiptPreviewModal, TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import {
  handleRegenerateReceipt,
  handlePayByAdmissionWithIncomeId,
} from "@/lib/api";
import AdmissionsList from "@/components/features/college/admissions/AdmissionsList";

interface Reservation {
  reservation_id: number;
  reservation_no: string;
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
  siblings: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }>;
  previous_class: string;
  previous_school_details: string;
  present_address: string;
  permanent_address: string;
  application_fee: number;
  application_fee_paid: boolean;
  preferred_class_id: number;
  class_name: string;
  tuition_fee: number;
  book_fee: number;
  tuition_concession: number;
  transport_required: boolean;
  preferred_transport_id: number | null;
  preferred_distance_slab_id: number | null;
  pickup_point: string | null;
  transport_fee: number;
  transport_concession: number;
  concession_lock: boolean;
  status: string;
  referred_by: number | null;
  remarks: string | null;
  reservation_date: string;
  income_id?: number;
  is_enrolled?: boolean;
  admission_income_id?: number;
}

const CollegeAdmissionsPage = () => {
  const [activeTab, setActiveTab] = useState("reservations");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("CONFIRMED");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string>("");
  const [createdAdmissionNo, setCreatedAdmissionNo] = useState<string>("");
  const [admissionFee, setAdmissionFee] = useState<number>(0);

  // Edit form state
  const [editForm, setEditForm] = useState<Reservation | null>(null);

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

    return reservationsData.reservations;
  }, [reservationsData]);

  // Filter reservations based on search term
  const filteredReservations = useMemo(() => {
    if (!searchTerm.trim()) return allReservations;

    return allReservations.filter(
      (reservation: any) =>
        reservation.student_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.reservation_no
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.aadhar_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allReservations, searchTerm]);

  const handleEnrollStudent = async (reservationId: number) => {
    try {
      // Fetch full reservation details
      const reservationDetails = await CollegeReservationsService.getById(
        reservationId
      );
      setSelectedReservation(reservationDetails as unknown as Reservation);
      setEditForm(reservationDetails as unknown as Reservation);
      setAdmissionFee(3000); // Set default admission fee to 3000
      setIsEditMode(false);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Failed to load reservation:", error);
      toast({
        title: "Error",
        description: "Failed to load reservation details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDetails = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditForm(selectedReservation);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm || !selectedReservation) return;

    try {
      const payload = {
        student_name: editForm.student_name,
        aadhar_no: editForm.aadhar_no,
        gender: editForm.gender as "MALE" | "FEMALE" | "OTHER",
        dob: editForm.dob,
        father_or_guardian_name: editForm.father_or_guardian_name,
        father_or_guardian_aadhar_no: editForm.father_or_guardian_aadhar_no,
        father_or_guardian_mobile: editForm.father_or_guardian_mobile,
        father_or_guardian_occupation: editForm.father_or_guardian_occupation,
        mother_or_guardian_name: editForm.mother_or_guardian_name,
        mother_or_guardian_aadhar_no: editForm.mother_or_guardian_aadhar_no,
        mother_or_guardian_mobile: editForm.mother_or_guardian_mobile,
        mother_or_guardian_occupation: editForm.mother_or_guardian_occupation,
        siblings: (editForm.siblings || []).map(sibling => ({
          ...sibling,
          gender: sibling.gender as "MALE" | "FEMALE" | "OTHER" | null
        })),
        previous_class: editForm.previous_class,
        previous_school_details: editForm.previous_school_details,
        present_address: editForm.present_address,
        permanent_address: editForm.permanent_address,
        application_fee: editForm.application_fee,
        application_fee_paid: editForm.application_fee_paid,
        preferred_class_id: editForm.preferred_class_id,
        preferred_transport_id: editForm.preferred_transport_id,
        preferred_distance_slab_id: editForm.preferred_distance_slab_id,
        pickup_point: editForm.pickup_point,
        transport_fee: editForm.transport_fee,
        status: editForm.status as "PENDING" | "CONFIRMED" | "CANCELLED",
        referred_by: editForm.referred_by,
        remarks: editForm.remarks,
        reservation_date: editForm.reservation_date,
      };

      await CollegeReservationsService.update(
        selectedReservation.reservation_id,
        payload
      );

      // Reload the reservation details
      const updatedReservation = await CollegeReservationsService.getById(
        selectedReservation.reservation_id
      );
      setSelectedReservation(updatedReservation as unknown as Reservation);
      setEditForm(updatedReservation as unknown as Reservation);
      setIsEditMode(false);

      toast({
        title: "Details Updated",
        description: "Reservation details have been updated successfully",
      });
    } catch (error: any) {
      console.error("Failed to update reservation:", error);
      toast({
        title: "Update Failed",
        description:
          error?.message ||
          "Failed to update reservation details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnrollConfirm = async () => {
    if (!selectedReservation) return;

    try {
      // Create student from reservation
      const payload = {
        reservation_id: selectedReservation.reservation_id,
        student_name: selectedReservation.student_name,
        aadhar_no: selectedReservation.aadhar_no,
        gender: selectedReservation.gender,
        dob: selectedReservation.dob,
        father_or_guardian_name: selectedReservation.father_or_guardian_name,
        father_or_guardian_aadhar_no:
          selectedReservation.father_or_guardian_aadhar_no,
        father_or_guardian_mobile:
          selectedReservation.father_or_guardian_mobile,
        father_or_guardian_occupation:
          selectedReservation.father_or_guardian_occupation,
        mother_or_guardian_name: selectedReservation.mother_or_guardian_name,
        mother_or_guardian_aadhar_no:
          selectedReservation.mother_or_guardian_aadhar_no,
        mother_or_guardian_mobile:
          selectedReservation.mother_or_guardian_mobile,
        mother_or_guardian_occupation:
          selectedReservation.mother_or_guardian_occupation,
        present_address: selectedReservation.present_address,
        permanent_address: selectedReservation.permanent_address,
        admission_fee: admissionFee,
      };

      const studentResponse = await CollegeStudentsService.create(
        payload
      );

      // Handle nested response structure - safely access admission_no
      const admissionNo =
        (studentResponse as any)?.data?.admission_no ||
        (studentResponse as any)?.admission_no;

      if (!admissionNo) {
        console.error("Student response:", studentResponse);
      toast({
          title: "Enrollment Error",
          description:
            "Student created but admission number not received from server.",
        variant: "destructive",
      });
        throw new Error("Student created but no admission number received");
      }

      setCreatedAdmissionNo(admissionNo);
      setShowDetailsDialog(false);
      setShowPaymentDialog(true);

      toast({
        title: "Student Enrolled Successfully",
        description: `Student enrolled with admission number ${admissionNo}`,
      });
    } catch (error: any) {
      console.error("Enrollment failed:", error);
      toast({
        title: "Enrollment Failed",
        description:
          error?.message || "Failed to enroll student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentProcess = async () => {
    if (!createdAdmissionNo) return;

    try {
      const paymentResponse = await handlePayByAdmissionWithIncomeId(
        createdAdmissionNo,
        {
          details: [
            {
              purpose: "ADMISSION_FEE",
              paid_amount: admissionFee,
              payment_method: "CASH",
            },
          ],
          remarks: "Admission fee payment",
        }
      );

      const { blobUrl } = paymentResponse;

      if (blobUrl) {
        setReceiptBlobUrl(blobUrl);
        setShowPaymentDialog(false);
        setShowReceiptModal(true);
      }

      toast({
        title: "Payment Successful",
        description: "Admission fee payment processed successfully",
      });

      refetch();
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment Failed",
        description:
          error?.message ||
          "Failed to process admission fee payment. Please try again.",
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
    setCreatedAdmissionNo("");
    setAdmissionFee(0);
    setSelectedReservation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs: TabItem[] = [
    {
      value: "reservations",
      label: "Confirmed Reservations",
      icon: UserCheck,
      content: (
    <div className="space-y-6">
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
                    <TableHead>Class</TableHead>
                    <TableHead>Payment Status</TableHead>
                <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UserCheck className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No confirmed reservations found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                    filteredReservations.map(
                      (reservation: any, index: number) => (
                        <TableRow
                          key={`${reservation.reservation_id}-${reservation.reservation_no}-${index}`}
                        >
                    <TableCell className="font-medium">
                            {reservation.reservation_no}
                    </TableCell>
                          <TableCell>{reservation.student_name}</TableCell>
                          <TableCell>{reservation.class_name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                reservation.application_fee_paid
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {reservation.application_fee_paid ? "✓ Paid" : "Unpaid"}
                            </Badge>
                          </TableCell>
                          <TableCell>{reservation.reservation_date}</TableCell>
                    <TableCell>
                            <Badge
                              variant={
                                reservation.status === "CONFIRMED"
                                  ? "secondary"
                                  : reservation.status === "PENDING"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {reservation.status}
                            </Badge>
                    </TableCell>
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
                                onClick={() =>
                                  handleEnrollStudent(
                                    reservation.reservation_id
                                  )
                                }
                          className="flex items-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Enroll Student
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                      )
                    )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </div>
      ),
    },
    {
      value: "admissions",
      label: "Student Admissions",
      icon: Users,
      content: <AdmissionsList />,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">College Admissions</h1>
          <p className="text-muted-foreground">
            Process confirmed reservations and manage student admissions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Reservation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Student Enrollment Details</span>
              {!isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditDetails}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Review and confirm student details before enrollment
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="space-y-6">
              {/* Reservation Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Reservation No:
                    </span>{" "}
                    {editForm.reservation_no}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Date:
                    </span>{" "}
                    {editForm.reservation_date}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Class:
                    </span>{" "}
                    {editForm.class_name}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Status:
                    </span>{" "}
                    <Badge variant="secondary">{editForm.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Student Information
                </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Student Name</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.student_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            student_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.student_name}
                      </p>
                    )}
                </div>
                <div>
                    <Label>Aadhar Number</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.aadhar_no}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            aadhar_no: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.aadhar_no}
                      </p>
                    )}
                </div>
                <div>
                    <Label>Gender</Label>
                    {isEditMode ? (
                      <Select
                        value={editForm.gender}
                        onValueChange={(value) =>
                          setEditForm({ ...editForm, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.gender}
                      </p>
                    )}
                </div>
                <div>
                    <Label>Date of Birth</Label>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={editForm.dob}
                        onChange={(e) =>
                          setEditForm({ ...editForm, dob: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{editForm.dob}</p>
                    )}
                </div>
                  <div>
                    <Label>Previous Class</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.previous_class}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            previous_class: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.previous_class || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Previous School</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.previous_school_details}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            previous_school_details: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.previous_school_details || "-"}
                      </p>
                    )}
                  </div>
              </div>
            </div>

              {/* Parent/Guardian Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Father/Guardian Name</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.father_or_guardian_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            father_or_guardian_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.father_or_guardian_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Father/Guardian Aadhar</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.father_or_guardian_aadhar_no}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            father_or_guardian_aadhar_no: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.father_or_guardian_aadhar_no}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Father/Guardian Mobile</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.father_or_guardian_mobile}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            father_or_guardian_mobile: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.father_or_guardian_mobile}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Father/Guardian Occupation</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.father_or_guardian_occupation}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            father_or_guardian_occupation: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.father_or_guardian_occupation}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Mother/Guardian Name</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.mother_or_guardian_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            mother_or_guardian_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.mother_or_guardian_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Mother/Guardian Aadhar</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.mother_or_guardian_aadhar_no}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            mother_or_guardian_aadhar_no: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.mother_or_guardian_aadhar_no}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Mother/Guardian Mobile</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.mother_or_guardian_mobile}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            mother_or_guardian_mobile: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.mother_or_guardian_mobile}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Mother/Guardian Occupation</Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.mother_or_guardian_occupation}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            mother_or_guardian_occupation: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.mother_or_guardian_occupation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Present Address</Label>
                    {isEditMode ? (
                      <Textarea
                        value={editForm.present_address}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            present_address: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.present_address}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Permanent Address</Label>
                    {isEditMode ? (
                      <Textarea
                        value={editForm.permanent_address}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            permanent_address: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {editForm.permanent_address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Fee Structure & Payment Details
                </h3>

                {/* Fee Breakdown Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">
                          Fee Type
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Amount
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Concession
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Payable
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {/* Application Fee */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">
                          Application Fee
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{editForm.application_fee.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          -
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{editForm.application_fee.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={
                              editForm.application_fee_paid
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {editForm.application_fee_paid
                              ? "✓ Paid"
                              : "Unpaid"}
                          </Badge>
                        </td>
                      </tr>

                      {/* Tuition Fee */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Tuition Fee</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{editForm.tuition_fee.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {editForm.tuition_concession > 0 ? (
                            <span className="text-orange-600 font-semibold">
                              -₹{editForm.tuition_concession.toLocaleString()}
                  </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-blue-600">
                          ₹
                          {(
                            editForm.tuition_fee - editForm.tuition_concession
                          ).toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        </td>
                      </tr>

                      {/* Book Fee */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Book Fee</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{editForm.book_fee.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          -
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-purple-600">
                          ₹{editForm.book_fee.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        </td>
                      </tr>

                      {/* Transport Fee (if required) */}
                      {editForm.transport_required && (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-medium">
                            Transport Fee
                          </td>
                          <td className="text-right py-3 px-4 font-semibold">
                            ₹{editForm.transport_fee.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4">
                            {editForm.transport_concession > 0 ? (
                              <span className="text-orange-600 font-semibold">
                                -₹
                                {editForm.transport_concession.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-orange-600">
                            ₹
                            {(
                              editForm.transport_fee -
                              editForm.transport_concession
                            ).toLocaleString()}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          </td>
                        </tr>
                      )}

                      {/* Total Row */}
                      <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                        <td className="py-3 px-4 text-base">
                          Total Annual Fee
                        </td>
                        <td className="text-right py-3 px-4">
                          ₹
                          {(
                            editForm.application_fee +
                            editForm.tuition_fee +
                            editForm.book_fee +
                            (editForm.transport_required
                              ? editForm.transport_fee
                              : 0)
                          ).toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-orange-600">
                          -₹
                          {(
                            editForm.tuition_concession +
                            editForm.transport_concession
                          ).toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-green-600 text-lg">
                          ₹
                          {(
                            editForm.application_fee +
                            editForm.tuition_fee +
                            editForm.book_fee +
                            (editForm.transport_required
                              ? editForm.transport_fee
                              : 0) -
                            editForm.tuition_concession -
                            editForm.transport_concession
                          ).toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {editForm.application_fee_paid
                              ? "Partial"
                              : "Unpaid"}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Concession Lock Warning */}
                {editForm.concession_lock && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <div className="text-red-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100">
                        Fee Structure Locked
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Tuition and Transport fees (including concessions) are
                        locked and cannot be modified.
                      </p>
                    </div>
                  </div>
                )}

                {/* Admission Fee Section */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-base font-semibold text-green-900 dark:text-green-100">
                        {editForm.admission_income_id
                          ? "Admission Fee Status"
                          : "Admission Fee to Collect Now"}
                      </Label>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {editForm.admission_income_id
                          ? "Admission fee has already been paid"
                          : "This is a one-time payment required during enrollment"}
                      </p>
                    </div>
                  </div>
                  {editForm.admission_income_id ? (
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-lg border-2 border-green-400">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-lg font-bold text-green-600">
                        Admission Fee Paid
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Payment has been successfully processed
                      </p>
                    </div>
                  </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={admissionFee}
                          onChange={(e) =>
                            setAdmissionFee(Number(e.target.value))
                          }
                          placeholder="Enter admission fee"
                          className="text-xl font-bold h-12 bg-white dark:bg-slate-950 border-green-300 focus:border-green-500"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Default Amount
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ₹3,000
                        </p>
                      </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          )}

          <DialogFooter>
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
              <Button
                variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                  onClick={handleEnrollConfirm}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="h-4 w-4" />
                  Enroll Student
              </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Admission Fee</DialogTitle>
            <DialogDescription>
              Student enrolled successfully with admission number:{" "}
              {createdAdmissionNo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                Enrollment Successful!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Admission No: {createdAdmissionNo}
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Admission Fee:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{admissionFee.toLocaleString()}
                </span>
          </div>

              <Button
                onClick={handlePaymentProcess}
                className="w-full"
                size="lg"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Collect Payment & Print Receipt
              </Button>
        </div>
          </div>
        </DialogContent>
      </Dialog>

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
