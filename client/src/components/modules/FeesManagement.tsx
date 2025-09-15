import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  DollarSign,
  Receipt,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  Users,
  BookOpen,
  Bus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";

// Mock data for fee management
const mockFeeStructures = [
  {
    id: 1,
    class_name: "Class 8",
    academic_year: "2024-25",
    admission_fee: 2000,
    book_fee: 3500,
    tuition_fee: 18000,
    total_fee: 23500,
    term_1_fee: 7833,
    term_2_fee: 7833,
    term_3_fee: 7834,
    active: true,
    students_count: 45,
  },
  {
    id: 2,
    class_name: "Class 9",
    academic_year: "2024-25",
    admission_fee: 2500,
    book_fee: 4000,
    tuition_fee: 20000,
    total_fee: 26500,
    term_1_fee: 8667,
    term_2_fee: 8667,
    term_3_fee: 8666,
    active: true,
    students_count: 38,
  },
  {
    id: 3,
    class_name: "Class 10",
    academic_year: "2024-25",
    admission_fee: 3000,
    book_fee: 4500,
    tuition_fee: 22000,
    total_fee: 29500,
    term_1_fee: 9667,
    term_2_fee: 9667,
    term_3_fee: 9666,
    active: true,
    students_count: 42,
  },
  {
    id: 4,
    class_name: "1st Year MPC",
    academic_year: "2024-26",
    admission_fee: 5000,
    book_fee: 6000,
    tuition_fee: 25000,
    total_fee: 36000,
    term_1_fee: 18000,
    term_2_fee: 18000,
    active: true,
    students_count: 25,
  },
];

const mockStudentFeeBalances = [
  {
    id: 1,
    student_id: "STU2024156",
    student_name: "Priya Patel",
    class_name: "Class 8",
    academic_year: "2024-25",
    total_fee: 23500,
    admission_fee: 2000,
    book_fee: 3500,
    tuition_fee: 18000,
    concession_amount: 0,
    net_fee: 23500,
    term_1_paid: 7833,
    term_1_balance: 0,
    term_2_paid: 5000,
    term_2_balance: 2833,
    term_3_paid: 0,
    term_3_balance: 7834,
    total_paid: 12833,
    total_balance: 10667,
    last_payment_date: "2024-12-15",
    status: "partial",
  },
  {
    id: 2,
    student_id: "STU2024157",
    student_name: "Arjun Sharma",
    class_name: "Class 9",
    academic_year: "2024-25",
    total_fee: 26500,
    admission_fee: 2500,
    book_fee: 4000,
    tuition_fee: 20000,
    concession_amount: 1000,
    net_fee: 25500,
    term_1_paid: 8667,
    term_1_balance: 0,
    term_2_paid: 8667,
    term_2_balance: 0,
    term_3_paid: 8666,
    term_3_balance: 0,
    total_paid: 26000,
    total_balance: 0,
    last_payment_date: "2024-12-20",
    status: "paid",
  },
  {
    id: 3,
    student_id: "STU2024158",
    student_name: "Sneha Reddy",
    class_name: "1st Year MPC",
    academic_year: "2024-26",
    total_fee: 36000,
    admission_fee: 5000,
    book_fee: 6000,
    tuition_fee: 25000,
    concession_amount: 0,
    net_fee: 36000,
    term_1_paid: 18000,
    term_1_balance: 0,
    term_2_paid: 0,
    term_2_balance: 18000,
    total_paid: 18000,
    total_balance: 18000,
    last_payment_date: "2024-11-30",
    status: "partial",
  },
];

const mockTransportFeeStructures = [
  {
    id: 1,
    route_name: "R001-City Center",
    stop_name: "Main Market",
    distance_km: 5.2,
    term_1_fee: 1200,
    term_2_fee: 1200,
    total_fee: 2400,
    active: true,
    students_count: 25,
  },
  {
    id: 2,
    route_name: "R002-North District",
    stop_name: "North Point",
    distance_km: 8.5,
    term_1_fee: 1500,
    term_2_fee: 1500,
    total_fee: 3000,
    active: true,
    students_count: 18,
  },
  {
    id: 3,
    route_name: "R003-South Zone",
    stop_name: "South Plaza",
    distance_km: 12.3,
    term_1_fee: 1800,
    term_2_fee: 1800,
    total_fee: 3600,
    active: true,
    students_count: 22,
  },
];

const mockFeePayments = [
  {
    id: 1,
    student_id: "STU2024156",
    student_name: "Priya Patel",
    payment_date: "2024-12-15",
    amount: 5000,
    payment_method: "Bank Transfer",
    term: "Term 2",
    fee_type: "Tuition Fee",
    receipt_number: "REC2024001",
    status: "completed",
    branch_name: "Main Campus",
  },
  {
    id: 2,
    student_id: "STU2024157",
    student_name: "Arjun Sharma",
    payment_date: "2024-12-20",
    amount: 8666,
    payment_method: "Cash",
    term: "Term 3",
    fee_type: "Tuition Fee",
    receipt_number: "REC2024002",
    status: "completed",
    branch_name: "Main Campus",
  },
  {
    id: 3,
    student_id: "STU2024158",
    student_name: "Sneha Reddy",
    payment_date: "2024-11-30",
    amount: 18000,
    payment_method: "Cheque",
    term: "Term 1",
    fee_type: "Tuition Fee",
    receipt_number: "REC2024003",
    status: "completed",
    branch_name: "Science College",
  },
];

const FeesManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const [feeStructures, setFeeStructures] = useState(mockFeeStructures);
  const [studentFeeBalances, setStudentFeeBalances] = useState(
    mockStudentFeeBalances
  );
  const [transportFeeStructures, setTransportFeeStructures] = useState(
    mockTransportFeeStructures
  );
  const [feePayments, setFeePayments] = useState(mockFeePayments);
  const [activeTab, setActiveTab] = useState("structures");
  const [isAddFeeStructureOpen, setIsAddFeeStructureOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [collectTarget, setCollectTarget] = useState<any | null>(null);
  const [collectSelection, setCollectSelection] = useState<{
    books: boolean;
    t1: boolean;
    t2: boolean;
    t3: boolean;
    tr1: boolean;
    tr2: boolean;
  }>({ books: false, t1: false, t2: false, t3: false, tr1: false, tr2: false });
  // Payments filters
  const [paymentsStartDate, setPaymentsStartDate] = useState<string>("");
  const [paymentsEndDate, setPaymentsEndDate] = useState<string>("");
  const [paymentsTerm, setPaymentsTerm] = useState<string>("all");
  const [paymentsClass, setPaymentsClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [newFeeStructure, setNewFeeStructure] = useState({
    class_name: "",
    academic_year: "2024-25",
    admission_fee: "",
    book_fee: "",
    tuition_fee: "",
  });
  const [newPayment, setNewPayment] = useState({
    student_id: "",
    amount: "",
    payment_method: "",
    term: "",
    fee_type: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalFee = (
    admission: number,
    book: number,
    tuition: number
  ) => {
    return admission + book + tuition;
  };

  const calculateTermFees = (totalFee: number, terms: number) => {
    const baseAmount = Math.floor(totalFee / terms);
    const remainder = totalFee % terms;
    const termFees = Array(terms).fill(baseAmount);

    // Distribute remainder to first terms
    for (let i = 0; i < remainder; i++) {
      termFees[i] += 1;
    }

    return termFees;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Map student_id to class for filtering
  const studentIdToClass: Record<string, string> = Object.fromEntries(
    studentFeeBalances.map((s) => [s.student_id, s.class_name])
  );

  const getFilteredPayments = () => {
    return feePayments.filter((p) => {
      const matchesSearch =
        p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTerm = paymentsTerm === "all" || p.term === paymentsTerm;
      const cls = studentIdToClass[p.student_id] || "";
      const matchesClass = paymentsClass === "all" || cls === paymentsClass;
      const dateOk = (() => {
        if (!paymentsStartDate && !paymentsEndDate) return true;
        const d = new Date(p.payment_date).getTime();
        const s = paymentsStartDate
          ? new Date(paymentsStartDate).getTime()
          : -Infinity;
        const e = paymentsEndDate
          ? new Date(paymentsEndDate).getTime()
          : Infinity;
        return d >= s && d <= e;
      })();
      return matchesSearch && matchesTerm && matchesClass && dateOk;
    });
  };

  const exportPaymentsCSV = () => {
    const rowsSource = getFilteredPayments();
    const rows = [
      [
        "Receipt No",
        "Student",
        "Student ID",
        "Amount",
        "Method",
        "Term",
        "Date",
        "Status",
        "Branch",
      ],
      ...rowsSource.map((p) => [
        p.receipt_number,
        p.student_name,
        p.student_id,
        String(p.amount),
        p.payment_method,
        p.term,
        p.payment_date,
        p.status,
        p.branch_name,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportBalancesCSV = () => {
    const rows = [
      [
        "Student",
        "Student ID",
        "Class",
        "Net Fee",
        "Paid",
        "Balance",
        "Status",
      ],
      ...filteredStudentBalances.map((b) => [
        b.student_name,
        b.student_id,
        b.class_name,
        String(b.net_fee),
        String(b.total_paid),
        String(b.total_balance),
        b.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `balances_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openCollectFor = (balance: any) => {
    setCollectTarget(balance);
    setCollectSelection({
      books: false,
      t1: false,
      t2: false,
      t3: false,
      tr1: false,
      tr2: false,
    });
    setIsCollectOpen(true);
  };

  const isSelectionValid = () => {
    const s = collectSelection;
    // Tuition order: T1 -> T2 -> T3
    if (s.t2 && !s.t1) return false;
    if (s.t3 && (!s.t1 || !s.t2)) return false;
    // Transport term 2 blocked until Tuition T1 & T2 cleared
    if (s.tr2 && (!s.t1 || !s.t2)) return false;
    return true;
  };

  const computeSelectedAmount = () => {
    if (!collectTarget) return 0;
    const sel = collectSelection;
    let total = 0;
    if (sel.books) total += Number(collectTarget.book_fee || 0);
    if (sel.t1) total += Number(collectTarget.term_1_balance || 0);
    if (sel.t2) total += Number(collectTarget.term_2_balance || 0);
    if (sel.t3) total += Number(collectTarget.term_3_balance || 0);
    if (sel.tr1) total += 0;
    if (sel.tr2) total += 0;
    return total;
  };

  const applyCollect = () => {
    if (!isSelectionValid()) return;
    const amount = computeSelectedAmount();
    const newId = Math.max(...feePayments.map((p) => p.id)) + 1;
    const payment = {
      id: newId,
      student_id: collectTarget.student_id,
      student_name: collectTarget.student_name,
      payment_date: new Date().toISOString().split("T")[0],
      amount,
      payment_method: "Cash",
      term: "Mixed",
      fee_type: "Multiple",
      fee_lines: Object.entries(collectSelection)
        .filter(([k, v]) => v)
        .map(([k]) => ({ code: k, amount: computeSelectedAmount() })),
      receipt_number: `REC${new Date().getFullYear()}${String(newId).padStart(
        4,
        "0"
      )}`,
      status: "completed",
      branch_name: currentBranch?.branch_name || "Main Campus",
    } as any;
    setFeePayments([payment, ...feePayments]);
    setIsCollectOpen(false);
  };

  const handleAddFeeStructure = () => {
    const admissionFee = parseInt(newFeeStructure.admission_fee);
    const bookFee = parseInt(newFeeStructure.book_fee);
    const tuitionFee = parseInt(newFeeStructure.tuition_fee);
    const totalFee = calculateTotalFee(admissionFee, bookFee, tuitionFee);
    const terms = currentBranch?.branch_type === "college" ? 2 : 3;
    const termFees = calculateTermFees(tuitionFee, terms);

    const newId = Math.max(...feeStructures.map((f) => f.id)) + 1;
    const feeStructure = {
      id: newId,
      ...newFeeStructure,
      admission_fee: admissionFee,
      book_fee: bookFee,
      tuition_fee: tuitionFee,
      total_fee: totalFee,
      term_1_fee: termFees[0],
      term_2_fee: termFees[1],
      term_3_fee: terms === 3 ? termFees[2] : 0,
      active: true,
      students_count: 0,
    };

    setFeeStructures([...feeStructures, feeStructure]);
    setNewFeeStructure({
      class_name: "",
      academic_year: "2024-25",
      admission_fee: "",
      book_fee: "",
      tuition_fee: "",
    });
    setIsAddFeeStructureOpen(false);
  };

  const handleAddPayment = () => {
    const newId = Math.max(...feePayments.map((p) => p.id)) + 1;
    const student = studentFeeBalances.find(
      (s) => s.student_id === newPayment.student_id
    );
    const payment = {
      id: newId,
      ...newPayment,
      student_name: student?.student_name || "",
      amount: parseInt(newPayment.amount),
      payment_date: new Date().toISOString().split("T")[0],
      receipt_number: `REC${new Date().getFullYear()}${String(newId).padStart(
        4,
        "0"
      )}`,
      status: "completed",
      branch_name: currentBranch?.branch_name || "Main Campus",
    };

    setFeePayments([payment, ...feePayments]);
    setNewPayment({
      student_id: "",
      amount: "",
      payment_method: "",
      term: "",
      fee_type: "",
    });
    setIsAddPaymentOpen(false);
  };

  const filteredStudentBalances = studentFeeBalances.filter((balance) => {
    const matchesSearch =
      balance.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      balance.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || balance.class_name === selectedClass;
    const matchesStatus =
      selectedStatus === "all" || balance.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const totalOutstanding = studentFeeBalances.reduce(
    (sum, balance) => sum + balance.total_balance,
    0
  );
  const totalCollected = studentFeeBalances.reduce(
    (sum, balance) => sum + balance.total_paid,
    0
  );
  const collectionRate =
    (totalCollected / (totalCollected + totalOutstanding)) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            Comprehensive fee structure management and payment tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Fee Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending fee payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fee collection amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {collectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {studentFeeBalances.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Students with fee records
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            <TabsTrigger value="balances">Student Balances</TabsTrigger>
            <TabsTrigger value="transport">Transport Fees</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="promotions">Promotion/Dropout</TabsTrigger>
          </TabsList>

          {/* Fee Structures Tab */}
          <TabsContent value="structures" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search fee structures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    feeStructures.filter((f) =>
                      f.class_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Structures
                </Badge>
              </div>
              <Dialog
                open={isAddFeeStructureOpen}
                onOpenChange={setIsAddFeeStructureOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Fee Structure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Fee Structure</DialogTitle>
                    <DialogDescription>
                      Create a new fee structure for a class
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="class_name">Class Name</Label>
                      <Input
                        id="class_name"
                        value={newFeeStructure.class_name}
                        onChange={(e) =>
                          setNewFeeStructure({
                            ...newFeeStructure,
                            class_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Class 8, 1st Year MPC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="academic_year">Academic Year</Label>
                      <Input
                        id="academic_year"
                        value={newFeeStructure.academic_year}
                        onChange={(e) =>
                          setNewFeeStructure({
                            ...newFeeStructure,
                            academic_year: e.target.value,
                          })
                        }
                        placeholder="2024-25"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="admission_fee">Admission Fee (₹)</Label>
                        <Input
                          id="admission_fee"
                          type="number"
                          value={newFeeStructure.admission_fee}
                          onChange={(e) =>
                            setNewFeeStructure({
                              ...newFeeStructure,
                              admission_fee: e.target.value,
                            })
                          }
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="book_fee">Book Fee (₹)</Label>
                        <Input
                          id="book_fee"
                          type="number"
                          value={newFeeStructure.book_fee}
                          onChange={(e) =>
                            setNewFeeStructure({
                              ...newFeeStructure,
                              book_fee: e.target.value,
                            })
                          }
                          placeholder="3500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tuition_fee">Tuition Fee (₹)</Label>
                        <Input
                          id="tuition_fee"
                          type="number"
                          value={newFeeStructure.tuition_fee}
                          onChange={(e) =>
                            setNewFeeStructure({
                              ...newFeeStructure,
                              tuition_fee: e.target.value,
                            })
                          }
                          placeholder="18000"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddFeeStructureOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddFeeStructure}>
                      Add Structure
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {feeStructures
                .filter((f) =>
                  f.class_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((structure, index) => (
                  <motion.div
                    key={structure.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {structure.class_name}
                              </CardTitle>
                              <CardDescription>
                                {structure.academic_year}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={structure.active ? "default" : "secondary"}
                          >
                            {structure.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Admission Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(structure.admission_fee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Book Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(structure.book_fee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tuition Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(structure.tuition_fee)}
                            </span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Fee:</span>
                              <span className="text-green-600">
                                {formatCurrency(structure.total_fee)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Students: {structure.students_count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Student Balances Tab */}
          <TabsContent value="balances" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="Class 8">Class 8</SelectItem>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                    <SelectItem value="Class 10">Class 10</SelectItem>
                    <SelectItem value="1st Year MPC">1st Year MPC</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">
                  {filteredStudentBalances.length} Students
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={exportBalancesCSV}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
              <Dialog
                open={isAddPaymentOpen}
                onOpenChange={setIsAddPaymentOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Fee Payment</DialogTitle>
                    <DialogDescription>
                      Record a new fee payment for a student
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="student_id">Student ID</Label>
                      <Select
                        value={newPayment.student_id}
                        onValueChange={(value) =>
                          setNewPayment({ ...newPayment, student_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {studentFeeBalances.map((student) => (
                            <SelectItem
                              key={student.student_id}
                              value={student.student_id}
                            >
                              {student.student_name} - {student.student_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            amount: e.target.value,
                          })
                        }
                        placeholder="5000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Select
                          value={newPayment.payment_method}
                          onValueChange={(value) =>
                            setNewPayment({
                              ...newPayment,
                              payment_method: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank Transfer">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="DD">DD</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="term">Term</Label>
                        <Select
                          value={newPayment.term}
                          onValueChange={(value) =>
                            setNewPayment({ ...newPayment, term: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Term 1">Term 1</SelectItem>
                            <SelectItem value="Term 2">Term 2</SelectItem>
                            <SelectItem value="Term 3">Term 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fee_type">Fee Type</Label>
                      <Select
                        value={newPayment.fee_type}
                        onValueChange={(value) =>
                          setNewPayment({ ...newPayment, fee_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tuition Fee">
                            Tuition Fee
                          </SelectItem>
                          <SelectItem value="Admission Fee">
                            Admission Fee
                          </SelectItem>
                          <SelectItem value="Book Fee">Book Fee</SelectItem>
                          <SelectItem value="Transport Fee">
                            Transport Fee
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddPaymentOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddPayment}>Record Payment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudentBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {balance.student_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {balance.student_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{balance.class_name}</TableCell>
                    <TableCell>{formatCurrency(balance.net_fee)}</TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(balance.total_paid)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(balance.total_balance)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(balance.status)}>
                        {getStatusIcon(balance.status)}
                        <span className="ml-1 capitalize">
                          {balance.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Transport Fees Tab */}
          <TabsContent value="transport" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search transport routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline">
                  {
                    transportFeeStructures.filter(
                      (t) =>
                        t.route_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        t.stop_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  Routes
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {transportFeeStructures
                .filter(
                  (t) =>
                    t.route_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    t.stop_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((transport, index) => (
                  <motion.div
                    key={transport.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <Bus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {transport.route_name}
                              </CardTitle>
                              <CardDescription>
                                {transport.stop_name}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={transport.active ? "default" : "secondary"}
                          >
                            {transport.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Distance:</span>
                            <span className="font-medium">
                              {transport.distance_km} km
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Term 1 Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(transport.term_1_fee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Term 2 Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(transport.term_2_fee)}
                            </span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Fee:</span>
                              <span className="text-blue-600">
                                {formatCurrency(transport.total_fee)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Students: {transport.students_count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Input
                  type="date"
                  className="w-40"
                  value={paymentsStartDate}
                  onChange={(e) => setPaymentsStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  className="w-40"
                  value={paymentsEndDate}
                  onChange={(e) => setPaymentsEndDate(e.target.value)}
                />
                <Select value={paymentsTerm} onValueChange={setPaymentsTerm}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Terms</SelectItem>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentsClass} onValueChange={setPaymentsClass}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="Class 8">Class 8</SelectItem>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                    <SelectItem value="Class 10">Class 10</SelectItem>
                    <SelectItem value="1st Year MPC">1st Year MPC</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">
                  {getFilteredPayments().length} Payments
                </Badge>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={exportPaymentsCSV}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredPayments().map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.receipt_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payment.student_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.student_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{payment.term}</TableCell>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">
                          {payment.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCollectFor(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={exportPaymentsCSV}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Vouchers Tab */}
          <TabsContent value="vouchers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Misc. Income & Expenditure</CardTitle>
                <CardDescription>
                  Record vouchers (remarks required)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expenditure">Expenditure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Mode</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="DD">DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-4">
                    <Label>Remarks</Label>
                    <Textarea placeholder="Remarks (required)" />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button>Record Voucher</Button>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="gap-2"
                onClick={exportPaymentsCSV}
              >
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reservations Dashboard</CardTitle>
                <CardDescription>Track reservation status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reservation No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: "RSV24250001",
                        name: "Aarav S.",
                        status: "Pending",
                      },
                      {
                        id: "RSV24250002",
                        name: "Divya M.",
                        status: "Converted",
                      },
                    ].map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.id}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.status === "Converted" ? "default" : "secondary"
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                              <a href="/admissions/new">Convert</a>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <a href="/reservations/new">View</a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotion & Dropout Tab */}
          <TabsContent value="promotions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Promotion</CardTitle>
                <CardDescription>
                  Promote students to next class & year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label>From Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class 8">Class 8</SelectItem>
                        <SelectItem value="Class 9">Class 9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>To Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class 9">Class 9</SelectItem>
                        <SelectItem value="Class 10">Class 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input placeholder="2025-2026" />
                  </div>
                  <div className="md:col-span-4">
                    <Label>Eligible Students</Label>
                    <div className="text-sm text-muted-foreground">
                      System will check dues and list eligible students. (mock)
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button>Run Eligibility</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Dropout</CardTitle>
                <CardDescription>Mark dropouts with remarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3 items-end">
                  <div>
                    <Label>Student ID</Label>
                    <Input placeholder="STU..." />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Remarks</Label>
                    <Textarea placeholder="Reason (required)" />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button variant="destructive">Mark Dropout</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
      {/* Accountant Extensions */}
      <Tabs value={activeTab} className="hidden" />

      <Dialog open={isCollectOpen} onOpenChange={setIsCollectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Fees</DialogTitle>
            <DialogDescription>
              Select fee items to collect. Order rules will be enforced.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="font-medium">{collectTarget?.student_name}</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={collectSelection.books}
                  onChange={(e) =>
                    setCollectSelection({
                      ...collectSelection,
                      books: e.target.checked,
                    })
                  }
                />
                Book Fees
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={collectSelection.t1}
                  onChange={(e) =>
                    setCollectSelection({
                      ...collectSelection,
                      t1: e.target.checked,
                    })
                  }
                />
                Tuition Term 1
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={collectSelection.t2}
                  onChange={(e) =>
                    setCollectSelection({
                      ...collectSelection,
                      t2: e.target.checked,
                    })
                  }
                />
                Tuition Term 2
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={collectSelection.t3}
                  onChange={(e) =>
                    setCollectSelection({
                      ...collectSelection,
                      t3: e.target.checked,
                    })
                  }
                />
                Tuition Term 3
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={collectSelection.tr1}
                  onChange={(e) =>
                    setCollectSelection({
                      ...collectSelection,
                      tr1: e.target.checked,
                    })
                  }
                />
                Transport Term 1
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={collectSelection.tr2}
                  onChange={(e) =>
                    setCollectSelection({
                      ...collectSelection,
                      tr2: e.target.checked,
                    })
                  }
                />
                Transport Term 2
              </label>
            </div>
            <div className="text-sm">
              Total selected: {formatCurrency(computeSelectedAmount())}
            </div>
            {!isSelectionValid() && (
              <div className="text-xs text-red-600">
                Invalid selection. Ensure Tuition T1 before T2, T1&2 before T3
                and Transport T2.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollectOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!isSelectionValid()} onClick={applyCollect}>
              Collect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesManagement;
