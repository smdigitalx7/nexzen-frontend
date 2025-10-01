import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { Printer } from "lucide-react";
import ReservationForm from "../features/reservations/ReservationForm";
import ReservationsTable from "../features/reservations/ReservationsTable";

const classFeeMap: Record<string, number> = {
  I: 12000,
  II: 13000,
  III: 14000,
  IV: 15000,
  V: 16000,
  VI: 17000,
  VII: 18000,
  VIII: 19000,
  IX: 20000,
  X: 21000,
  "XI-MPC": 45000,
  "XI-BiPC": 45000,
  "XII-MPC": 48000,
  "XII-BiPC": 48000,
};

const routes = [
  { id: "R1", name: "City Center", fee: 8000 },
  { id: "R2", name: "Suburb North", fee: 10000 },
  { id: "R3", name: "Suburb South", fee: 9000 },
  { id: "R4", name: "Industrial Area", fee: 12000 },
];

// Mock reservations data
const mockReservations = [
  {
    id: "RSV24250001",
    studentName: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    classAdmission: "V",
    status: "Pending",
    date: "2024-01-15",
    totalFee: 24000,
  },
  {
    id: "RSV24250002",
    studentName: "Divya Mehta",
    fatherName: "Suresh Mehta",
    classAdmission: "IX",
    status: "Pending",
    date: "2024-01-16",
    totalFee: 20000,
  },
  {
    id: "RSV24250003",
    studentName: "Rahul Kumar",
    fatherName: "Vikash Kumar",
    classAdmission: "VII",
    status: "Cancelled",
    date: "2024-01-17",
    totalFee: 18000,
  },
];

export default function ReservationNew() {
  const { academicYear } = useAuthStore();
  const [activeTab, setActiveTab] = useState("new");
  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  const [form, setForm] = useState({
    // Personal Details
    studentName: "",
    studentAadhar: "",
    fatherName: "",
    fatherAadhar: "",
    motherName: "",
    motherAadhar: "",
    fatherOccupation: "",
    motherOccupation: "",
    gender: "",
    dob: "",

    // Previous School Details
    previousSchool: "",
    village: "",
    lastClass: "",

    // Contact Details
    presentAddress: "",
    permanentAddress: "",
    fatherMobile: "",
    motherMobile: "",

    // Academic Details
    classAdmission: "",
    group: "N/A",
    course: "N/A",

    // Fee Setup
    transport: "No",
    busRoute: "",

    // Payments
    applicationFee: "",
    reservationFee: "",

    // Remarks
    remarks: "",
  });

  const classFee = useMemo(() => {
    return classFeeMap[form.classAdmission] || 0;
  }, [form.classAdmission]);

  const transportFee = useMemo(() => {
    if (form.transport === "Yes") {
      return routes.find((r) => r.id === form.busRoute)?.fee || 0;
    }
    return 0;
  }, [form.transport, form.busRoute]);

  const handleSave = (withPayment: boolean) => {
    // Auto-generate Reservation No: RSV<YY><YY><seq>
    const year =
      (academicYear || "2025-2026").slice(2, 4) +
      (academicYear || "2025-2026").slice(7, 9);
    const seq = Math.floor(1000 + Math.random() * 9000);
    const rno = `RSV${year}${seq}`;
    setReservationNo(rno);
    if (withPayment) {
      setShowReceipt(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelRemarks.trim()) {
      alert("Please provide cancellation remarks");
      return;
    }
    // Here you would update the reservation status to cancelled
    console.log(
      "Cancelling reservation:",
      selectedReservation.id,
      "Remarks:",
      cancelRemarks
    );
    setShowCancelDialog(false);
    setCancelRemarks("");
    setSelectedReservation(null);
  };

  const handleConvertToAdmission = (reservation: any) => {
    // Navigate to admissions page with reservation data
    window.location.href = `/admissions/new?reservation=${reservation.id}`;
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reservations</h1>
            <p className="text-muted-foreground">Manage student reservations</p>
          </div>
          {reservationNo && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              Reservation No: {reservationNo}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Simple Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("new")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "new"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            New Reservations
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Reservations
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "new" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ReservationForm
            form={form as any}
            setForm={(next) => setForm(next as any)}
            classFee={classFee}
            transportFee={transportFee}
            routes={routes}
            classFeeMapKeys={Object.keys(classFeeMap)}
            onSave={handleSave}
          />
        </motion.div>
      )}

      {/* All Reservations Tab */}
      {activeTab === "all" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ReservationsTable
            reservations={mockReservations as any}
            onConvert={handleConvertToAdmission as any}
            onCancel={handleCancelReservation as any}
          />
        </motion.div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Receipt</DialogTitle>
            <DialogDescription>
              Reservation has been created successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Reservation No:</strong> {reservationNo}
              </div>
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
              <div>
                <strong>Student Name:</strong> {form.studentName}
              </div>
              <div>
                <strong>Class:</strong> {form.classAdmission}
              </div>
              <div>
                <strong>Father Name:</strong> {form.fatherName}
              </div>
              <div>
                <strong>Mobile:</strong> {form.fatherMobile}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Class Fee:</span>
                <span>₹{classFee.toLocaleString()}</span>
              </div>
              {form.transport === "Yes" && (
                <div className="flex justify-between">
                  <span>Transport Fee:</span>
                  <span>₹{transportFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{(classFee + transportFee).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => setShowReceipt(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this reservation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelRemarks">Cancellation Remarks</Label>
              <Textarea
                id="cancelRemarks"
                value={cancelRemarks}
                onChange={(e) => setCancelRemarks(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
