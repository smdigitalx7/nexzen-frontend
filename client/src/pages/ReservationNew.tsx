import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import { Printer, UserPlus, X } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Student Reservation Form</CardTitle>
              <CardDescription>
                Fill in all the required details for the new student reservation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={form.studentName}
                      onChange={(e) =>
                        setForm({ ...form, studentName: e.target.value })
                      }
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentAadhar">Student Aadhar No</Label>
                    <Input
                      id="studentAadhar"
                      value={form.studentAadhar}
                      onChange={(e) =>
                        setForm({ ...form, studentAadhar: e.target.value })
                      }
                      placeholder="Enter Aadhar number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherName">Father/Guardian Name</Label>
                    <Input
                      id="fatherName"
                      value={form.fatherName}
                      onChange={(e) =>
                        setForm({ ...form, fatherName: e.target.value })
                      }
                      placeholder="Enter father/guardian name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherAadhar">
                      Father/Guardian Aadhar No
                    </Label>
                    <Input
                      id="fatherAadhar"
                      value={form.fatherAadhar}
                      onChange={(e) =>
                        setForm({ ...form, fatherAadhar: e.target.value })
                      }
                      placeholder="Enter father/guardian Aadhar"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherName">Mother/Guardian Name</Label>
                    <Input
                      id="motherName"
                      value={form.motherName}
                      onChange={(e) =>
                        setForm({ ...form, motherName: e.target.value })
                      }
                      placeholder="Enter mother/guardian name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherAadhar">
                      Mother/Guardian Aadhar No
                    </Label>
                    <Input
                      id="motherAadhar"
                      value={form.motherAadhar}
                      onChange={(e) =>
                        setForm({ ...form, motherAadhar: e.target.value })
                      }
                      placeholder="Enter mother/guardian Aadhar"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherOccupation">
                      Father/Guardian Occupation
                    </Label>
                    <Input
                      id="fatherOccupation"
                      value={form.fatherOccupation}
                      onChange={(e) =>
                        setForm({ ...form, fatherOccupation: e.target.value })
                      }
                      placeholder="Enter occupation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherOccupation">
                      Mother/Guardian Occupation
                    </Label>
                    <Input
                      id="motherOccupation"
                      value={form.motherOccupation}
                      onChange={(e) =>
                        setForm({ ...form, motherOccupation: e.target.value })
                      }
                      placeholder="Enter occupation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(value) =>
                        setForm({ ...form, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) =>
                        setForm({ ...form, dob: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Previous School Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Previous School Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="previousSchool">Name of the School</Label>
                    <Input
                      id="previousSchool"
                      value={form.previousSchool}
                      onChange={(e) =>
                        setForm({ ...form, previousSchool: e.target.value })
                      }
                      placeholder="Enter school name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      value={form.village}
                      onChange={(e) =>
                        setForm({ ...form, village: e.target.value })
                      }
                      placeholder="Enter village"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastClass">Class Studied</Label>
                    <Input
                      id="lastClass"
                      value={form.lastClass}
                      onChange={(e) =>
                        setForm({ ...form, lastClass: e.target.value })
                      }
                      placeholder="Enter last class"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="presentAddress">Present Address</Label>
                    <Textarea
                      id="presentAddress"
                      value={form.presentAddress}
                      onChange={(e) =>
                        setForm({ ...form, presentAddress: e.target.value })
                      }
                      placeholder="Enter present address"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permanentAddress">Permanent Address</Label>
                    <Textarea
                      id="permanentAddress"
                      value={form.permanentAddress}
                      onChange={(e) =>
                        setForm({ ...form, permanentAddress: e.target.value })
                      }
                      placeholder="Enter permanent address"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherMobile">
                      Father/Guardian Mobile No
                    </Label>
                    <Input
                      id="fatherMobile"
                      value={form.fatherMobile}
                      onChange={(e) =>
                        setForm({ ...form, fatherMobile: e.target.value })
                      }
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherMobile">
                      Mother/Guardian Mobile No
                    </Label>
                    <Input
                      id="motherMobile"
                      value={form.motherMobile}
                      onChange={(e) =>
                        setForm({ ...form, motherMobile: e.target.value })
                      }
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="classAdmission">Class Admission</Label>
                    <Select
                      value={form.classAdmission}
                      onValueChange={(value) =>
                        setForm({ ...form, classAdmission: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(classFeeMap).map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="group">Group</Label>
                    <Select
                      value={form.group}
                      onValueChange={(value) =>
                        setForm({ ...form, group: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MPC">MPC</SelectItem>
                        <SelectItem value="BiPC">BiPC</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Select
                      value={form.course}
                      onValueChange={(value) =>
                        setForm({ ...form, course: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IPE">IPE</SelectItem>
                        <SelectItem value="Mains">Mains</SelectItem>
                        <SelectItem value="EAPCET">EAPCET</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Fee Setup */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fee Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Class Fee (Based on selected class)</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <span className="text-lg font-semibold">
                        ₹{classFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="transport">Transport</Label>
                    <Select
                      value={form.transport}
                      onValueChange={(value) =>
                        setForm({ ...form, transport: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.transport === "Yes" && (
                    <div className="md:col-span-2">
                      <Label htmlFor="busRoute">Bus Route</Label>
                      <Select
                        value={form.busRoute}
                        onValueChange={(value) =>
                          setForm({ ...form, busRoute: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bus route" />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.name} - ₹{route.fee.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.transport === "Yes" && (
                    <div>
                      <Label>Transport Fee</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <span className="text-lg font-semibold">
                          ₹{transportFee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicationFee">Application Fee</Label>
                    <Input
                      id="applicationFee"
                      type="number"
                      value={form.applicationFee}
                      onChange={(e) =>
                        setForm({ ...form, applicationFee: e.target.value })
                      }
                      placeholder="Enter application fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reservationFee">Reservation Fee</Label>
                    <Input
                      id="reservationFee"
                      type="number"
                      value={form.reservationFee}
                      onChange={(e) =>
                        setForm({ ...form, reservationFee: e.target.value })
                      }
                      placeholder="Enter reservation fee"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Remarks</h3>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={form.remarks}
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                    placeholder="Enter any additional remarks"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sticky Footer for New Reservation */}
          <div className="sticky bottom-0 bg-background border-t p-4">
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={!form.studentName || !form.classAdmission}
              >
                Save
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={!form.studentName || !form.classAdmission}
              >
                Save & Pay
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* All Reservations Tab */}
      {activeTab === "all" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Reservations</CardTitle>
              <CardDescription>
                View and manage all student reservations
              </CardDescription>
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
                  {mockReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">
                        {reservation.id}
                      </TableCell>
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
                      <TableCell>
                        ₹{reservation.totalFee.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {reservation.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleConvertToAdmission(reservation)
                                }
                                className="gap-1"
                              >
                                <UserPlus className="h-3 w-3" />
                                Convert to Admission
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleCancelReservation(reservation)
                                }
                                className="gap-1"
                              >
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
