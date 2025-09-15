import { useState, useMemo } from "react";
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
import { Printer, Search, Lock, Eye } from "lucide-react";

// Mock reservation data
const mockReservations = [
  {
    id: "RSV24250001",
    studentName: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    motherName: "Priya Sharma",
    fatherMobile: "9876543210",
    motherMobile: "9876543211",
    classAdmission: "V",
    group: "N/A",
    course: "N/A",
    transport: "Yes",
    busRoute: "R1",
    classFee: 16000,
    transportFee: 8000,
    totalFee: 24000,
    applicationFee: 500,
    reservationFee: 2000,
    presentAddress: "123 Main Street, City",
    permanentAddress: "123 Main Street, City",
    remarks: "Good student",
  },
  {
    id: "RSV24250002",
    studentName: "Divya Mehta",
    fatherName: "Suresh Mehta",
    motherName: "Kavita Mehta",
    fatherMobile: "9876543212",
    motherMobile: "9876543213",
    classAdmission: "IX",
    group: "MPC",
    course: "IPE",
    transport: "No",
    busRoute: "",
    classFee: 20000,
    transportFee: 0,
    totalFee: 20000,
    applicationFee: 500,
    reservationFee: 2000,
    presentAddress: "456 Park Avenue, City",
    permanentAddress: "456 Park Avenue, City",
    remarks: "Excellent academic record",
  },
];

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

// Mock admissions data
const mockAdmissions = [
  {
    id: "NZN24250001",
    studentName: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    classAdmission: "V",
    status: "Active",
    date: "2024-01-15",
    totalFee: 24000,
    paidAmount: 24000,
    balance: 0,
  },
  {
    id: "NZN24250002",
    studentName: "Divya Mehta",
    fatherName: "Suresh Mehta",
    classAdmission: "IX",
    status: "Active",
    date: "2024-01-16",
    totalFee: 20000,
    paidAmount: 15000,
    balance: 5000,
  },
  {
    id: "NZN24250003",
    studentName: "Priya Singh",
    fatherName: "Amit Singh",
    classAdmission: "VII",
    status: "Active",
    date: "2024-01-17",
    totalFee: 18000,
    paidAmount: 18000,
    balance: 0,
  },
];

export default function AdmissionNew() {
  const { academicYear, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("new");
  const [searchResNo, setSearchResNo] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [admissionNo, setAdmissionNo] = useState("");
  const [showAdmissionOrder, setShowAdmissionOrder] = useState(false);
  const [feeLocked, setFeeLocked] = useState(false);
  const [concession, setConcession] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  // Mock student data based on reservation
  const studentData = useMemo(() => {
    if (!selectedReservation) return null;

    const baseFee = classFeeMap[selectedReservation.classAdmission] || 0;
    const transportFee =
      selectedReservation.transport === "Yes"
        ? routes.find((r) => r.id === selectedReservation.busRoute)?.fee || 0
        : 0;

    const totalFee = baseFee + transportFee;
    const concessionAmount = parseFloat(concession) || 0;
    const finalFee = totalFee - concessionAmount;

    // Fee structure: Books (7000), Tuition (3 terms: 40/30/30), Transport (2 terms: 50/50)
    const booksFee = 7000;
    const tuitionFee = finalFee - booksFee;
    const tuitionTerm1 = Math.round(tuitionFee * 0.4);
    const tuitionTerm2 = Math.round(tuitionFee * 0.3);
    const tuitionTerm3 = Math.round(tuitionFee * 0.3);

    const transportTerm1 = Math.round(transportFee * 0.5);
    const transportTerm2 = Math.round(transportFee * 0.5);

    return {
      ...selectedReservation,
      baseFee,
      transportFee,
      totalFee,
      concessionAmount,
      finalFee,
      booksFee,
      tuitionFee,
      tuitionTerm1,
      tuitionTerm2,
      tuitionTerm3,
      transportTerm1,
      transportTerm2,
    };
  }, [selectedReservation, concession]);

  const handleSearch = () => {
    const reservation = mockReservations.find((r) => r.id === searchResNo);
    if (reservation) {
      setSelectedReservation(reservation);
    } else {
      alert("Reservation not found!");
    }
  };

  const handleFeeLock = () => {
    if (user?.role === "institute_admin") {
      setFeeLocked(!feeLocked);
    }
  };

  const handlePayment = () => {
    if (!paymentAmount || !paymentMode) {
      alert("Please enter payment amount and select payment mode");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    // Auto-generate Admission No: NZN<Year><Sequence>
    const year =
      (academicYear || "2025-2026").slice(2, 4) +
      (academicYear || "2025-2026").slice(7, 9);
    const seq = Math.floor(1000 + Math.random() * 9000);
    const admNo = `NZN${year}${seq}`;
    setAdmissionNo(admNo);
    setShowAdmissionOrder(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admissions</h1>
            <p className="text-muted-foreground">Manage student admissions</p>
          </div>
          {admissionNo && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              Admission No: {admissionNo}
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
            New Admissions
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Admissions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "new" && (
        <>
          {/* Search Reservation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Search Reservation</CardTitle>
                <CardDescription>
                  Enter reservation number to load student details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="searchResNo">Reservation Number</Label>
                    <Input
                      id="searchResNo"
                      value={searchResNo}
                      onChange={(e) => setSearchResNo(e.target.value)}
                      placeholder="Enter reservation number (e.g., RSV24250001)"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} className="gap-2">
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student Details & Admission Form */}
          {studentData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Admission Form</CardTitle>
                  <CardDescription>
                    Review and edit student details for admission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Information (Read-only) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Student Name:</strong> {studentData.studentName}
                      </div>
                      <div>
                        <strong>Class:</strong> {studentData.classAdmission}
                      </div>
                      <div>
                        <strong>Father Name:</strong> {studentData.fatherName}
                      </div>
                      <div>
                        <strong>Mother Name:</strong> {studentData.motherName}
                      </div>
                      <div>
                        <strong>Group:</strong> {studentData.group}
                      </div>
                      <div>
                        <strong>Course:</strong> {studentData.course}
                      </div>
                    </div>
                  </div>

                  {/* Editable Contact Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Contact Details (Editable)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fatherMobile">
                          Father/Guardian Mobile
                        </Label>
                        <Input
                          id="fatherMobile"
                          value={studentData.fatherMobile}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label htmlFor="motherMobile">
                          Mother/Guardian Mobile
                        </Label>
                        <Input
                          id="motherMobile"
                          value={studentData.motherMobile}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="presentAddress">Present Address</Label>
                        <Textarea
                          id="presentAddress"
                          value={studentData.presentAddress}
                          readOnly
                          className="bg-muted"
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="permanentAddress">
                          Permanent Address
                        </Label>
                        <Textarea
                          id="permanentAddress"
                          value={studentData.permanentAddress}
                          readOnly
                          className="bg-muted"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fee Structure */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Fee Structure</h3>
                      {user?.role === "institute_admin" && (
                        <Button
                          variant={feeLocked ? "destructive" : "outline"}
                          onClick={handleFeeLock}
                          className="gap-2"
                        >
                          <Lock className="h-4 w-4" />
                          {feeLocked ? "Unlock Fee" : "Lock Fee"}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Base Class Fee</Label>
                        <div className="p-3 bg-muted rounded-md">
                          <span className="text-lg font-semibold">
                            ₹{studentData.baseFee.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {studentData.transportFee > 0 && (
                        <div>
                          <Label>Transport Fee</Label>
                          <div className="p-3 bg-muted rounded-md">
                            <span className="text-lg font-semibold">
                              ₹{studentData.transportFee.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Concession (Admin only) */}
                    {user?.role === "institute_admin" && (
                      <div>
                        <Label htmlFor="concession">
                          Concession Amount (₹)
                        </Label>
                        <Input
                          id="concession"
                          type="number"
                          value={concession}
                          onChange={(e) => setConcession(e.target.value)}
                          placeholder="Enter concession amount"
                          disabled={feeLocked}
                        />
                      </div>
                    )}

                    {/* Fee Breakdown */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Fee Breakdown:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between">
                            <span>Books Fee:</span>
                            <span>
                              ₹{studentData.booksFee.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tuition Term 1 (40%):</span>
                            <span>
                              ₹{studentData.tuitionTerm1.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tuition Term 2 (30%):</span>
                            <span>
                              ₹{studentData.tuitionTerm2.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tuition Term 3 (30%):</span>
                            <span>
                              ₹{studentData.tuitionTerm3.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {studentData.transportFee > 0 && (
                          <div>
                            <div className="flex justify-between">
                              <span>Transport Term 1 (50%):</span>
                              <span>
                                ₹{studentData.transportTerm1.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Transport Term 2 (50%):</span>
                              <span>
                                ₹{studentData.transportTerm2.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Fee:</span>
                          <span>₹{studentData.finalFee.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="paymentAmount">Amount (₹)</Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Enter payment amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMode">Payment Mode</Label>
                        <Select
                          value={paymentMode}
                          onValueChange={setPaymentMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Bank Transfer">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="DD">DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handlePayment} className="w-full">
                          Process Payment
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Remarks</h3>
                    <div>
                      <Label htmlFor="remarks">Additional Remarks</Label>
                      <Textarea
                        id="remarks"
                        value={studentData.remarks}
                        readOnly
                        className="bg-muted"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* All Admissions Tab */}
      {activeTab === "all" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Admissions</CardTitle>
              <CardDescription>
                View and manage all student admissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Father Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAdmissions.map((admission) => (
                    <TableRow key={admission.id}>
                      <TableCell className="font-medium">
                        {admission.id}
                      </TableCell>
                      <TableCell>{admission.studentName}</TableCell>
                      <TableCell>{admission.fatherName}</TableCell>
                      <TableCell>{admission.classAdmission}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            admission.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {admission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{admission.date}</TableCell>
                      <TableCell>
                        ₹{admission.totalFee.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ₹{admission.paidAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            admission.balance > 0
                              ? "text-red-600 font-semibold"
                              : "text-green-600"
                          }
                        >
                          ₹{admission.balance.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Printer className="h-3 w-3" />
                            Print
                          </Button>
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

      {/* Admission Order Dialog */}
      <Dialog open={showAdmissionOrder} onOpenChange={setShowAdmissionOrder}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Admission Order</DialogTitle>
            <DialogDescription>
              Admission has been processed successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Admission No:</strong> {admissionNo}
              </div>
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
              <div>
                <strong>Student Name:</strong> {studentData?.studentName}
              </div>
              <div>
                <strong>Class:</strong> {studentData?.classAdmission}
              </div>
              <div>
                <strong>Father Name:</strong> {studentData?.fatherName}
              </div>
              <div>
                <strong>Mobile:</strong> {studentData?.fatherMobile}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Total Fee:</span>
                <span>₹{studentData?.finalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Amount:</span>
                <span>
                  ₹{parseFloat(paymentAmount || "0").toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span>{paymentMode}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => setShowAdmissionOrder(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
