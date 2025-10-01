import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

// Types
export interface FeeStructure {
  id: number;
  class_name: string;
  academic_year: string;
  admission_fee: number;
  book_fee: number;
  tuition_fee: number;
  total_fee: number;
  term_1_fee: number;
  term_2_fee: number;
  term_3_fee: number;
  active: boolean;
  students_count: number;
}

export interface StudentFeeBalance {
  id: number;
  student_id: string;
  student_name: string;
  class_name: string;
  academic_year: string;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  admission_paid: boolean;
  books_paid: boolean;
  term_1_paid: boolean;
  term_2_paid: boolean;
  term_3_paid: boolean;
  transport_paid: boolean;
  last_payment_date: string;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
}

export interface FeePayment {
  id: number;
  student_id: string;
  student_name: string;
  class_name: string;
  payment_date: string;
  amount: number;
  payment_mode: string;
  fee_type: string;
  term: string;
  receipt_number: string;
  branch_name: string;
}

export interface TransportFeeStructure {
  id: number;
  route_name: string;
  distance_km: number;
  total_fee: number;
  term_1_fee: number;
  term_2_fee: number;
  term_3_fee: number;
  active: boolean;
  students_count: number;
}

// Mock data
const mockFeeStructures: FeeStructure[] = [
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
  // ... more mock data
];

const mockStudentFeeBalances: StudentFeeBalance[] = [
  {
    id: 1,
    student_id: "STU2024156",
    student_name: "John Doe",
    class_name: "Class 8",
    academic_year: "2024-25",
    total_fee: 23500,
    paid_amount: 15000,
    outstanding_amount: 8500,
    admission_paid: true,
    books_paid: false,
    term_1_paid: true,
    term_2_paid: false,
    term_3_paid: false,
    transport_paid: false,
    last_payment_date: "2024-01-15",
    status: 'PARTIAL',
  },
  // ... more mock data
];

const mockFeePayments: FeePayment[] = [
  {
    id: 1,
    student_id: "STU2024156",
    student_name: "John Doe",
    class_name: "Class 8",
    payment_date: "2024-01-15",
    amount: 15000,
    payment_mode: "Cash",
    fee_type: "tuition",
    term: "Term 1",
    receipt_number: "RCP001",
    branch_name: "Science College",
  },
  // ... more mock data
];

const mockTransportFeeStructures: TransportFeeStructure[] = [
  {
    id: 1,
    route_name: "City Center",
    distance_km: 5,
    total_fee: 8000,
    term_1_fee: 2667,
    term_2_fee: 2667,
    term_3_fee: 2666,
    active: true,
    students_count: 25,
  },
  // ... more mock data
];

export const useFeesManagement = () => {
  const { user, currentBranch } = useAuthStore();
  
  // State
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(mockFeeStructures);
  const [studentFeeBalances, setStudentFeeBalances] = useState<StudentFeeBalance[]>(mockStudentFeeBalances);
  const [transportFeeStructures, setTransportFeeStructures] = useState<TransportFeeStructure[]>(mockTransportFeeStructures);
  const [feePayments, setFeePayments] = useState<FeePayment[]>(mockFeePayments);
  
  // UI State
  const [activeTab, setActiveTab] = useState("collect");
  const [isAddFeeStructureOpen, setIsAddFeeStructureOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  
  // Form State
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeBalance | null>(null);
  const [feeType, setFeeType] = useState("tuition");
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [collectTarget, setCollectTarget] = useState<StudentFeeBalance | null>(null);
  const [collectSelection, setCollectSelection] = useState({
    books: false,
    t1: false,
    t2: false,
    t3: false,
    tr1: false,
    tr2: false,
  });
  
  // Filters
  const [paymentsStartDate, setPaymentsStartDate] = useState<string>("");
  const [paymentsEndDate, setPaymentsEndDate] = useState<string>("");
  const [paymentsTerm, setPaymentsTerm] = useState<string>("all");
  const [paymentsClass, setPaymentsClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Computed values
  const totalOutstanding = useMemo(() => {
    return studentFeeBalances.reduce((sum, student) => sum + student.outstanding_amount, 0);
  }, [studentFeeBalances]);

  const totalCollected = useMemo(() => {
    return studentFeeBalances.reduce((sum, student) => sum + student.paid_amount, 0);
  }, [studentFeeBalances]);

  const collectionRate = useMemo(() => {
    return (totalCollected / (totalCollected + totalOutstanding)) * 100;
  }, [totalCollected, totalOutstanding]);

  const getFilteredPayments = () => {
    return feePayments.filter((p) => {
      const dateOk = (() => {
        if (!paymentsStartDate && !paymentsEndDate) return true;
        const d = new Date(p.payment_date).getTime();
        const start = paymentsStartDate ? new Date(paymentsStartDate).getTime() : 0;
        const end = paymentsEndDate ? new Date(paymentsEndDate).getTime() : Date.now();
        return d >= start && d <= end;
      })();
      
      const termOk = paymentsTerm === "all" || p.term === paymentsTerm;
      const classOk = paymentsClass === "all" || p.class_name === paymentsClass;
      
      return dateOk && termOk && classOk;
    });
  };

  const filteredStudentBalances = useMemo(() => {
    return studentFeeBalances.filter((student) => {
      const classMatch = selectedClass === "all" || student.class_name === selectedClass;
      const statusMatch = selectedStatus === "all" || student.status === selectedStatus;
      const searchMatch = searchTerm === "" || 
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return classMatch && statusMatch && searchMatch;
    });
  }, [studentFeeBalances, selectedClass, selectedStatus, searchTerm]);

  // Business logic functions
  const isSelectionValid = () => {
    return Object.values(collectSelection).some(Boolean) || customAmount !== "";
  };

  const computeSelectedAmount = () => {
    if (customAmount !== "") return parseFloat(customAmount);
    
    let amount = 0;
    if (collectSelection.books) amount += (collectTarget?.total_fee || 0) * 0.15;
    if (collectSelection.t1) amount += (collectTarget?.total_fee || 0) * 0.3; // 30% for term 1
    if (collectSelection.t2) amount += (collectTarget?.total_fee || 0) * 0.3; // 30% for term 2
    if (collectSelection.t3) amount += (collectTarget?.total_fee || 0) * 0.3; // 30% for term 3
    if (collectSelection.tr1) amount += 2000; // Transport fee
    if (collectSelection.tr2) amount += 2000; // Transport fee
    
    return amount;
  };

  const applyCollect = () => {
    if (!collectTarget || !isSelectionValid()) return;
    
    const amount = computeSelectedAmount();
    // Apply payment logic here
  };

  const handleAddFeeStructure = () => {
    // Add fee structure logic
  };

  const handleAddPayment = () => {
    // Add payment logic
  };

  const exportPaymentsCSV = () => {
    const rowsSource = getFilteredPayments();
    const csvContent = [
      ["Student ID", "Student Name", "Class", "Payment Date", "Amount", "Mode", "Fee Type", "Term", "Receipt"],
      ...rowsSource.map(p => [
        p.student_id,
        p.student_name,
        p.class_name,
        p.payment_date,
        p.amount.toString(),
        p.payment_mode,
        p.fee_type,
        p.term,
        p.receipt_number
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee_payments.csv";
    a.click();
  };

  const exportBalancesCSV = () => {
    const csvContent = [
      ["Student ID", "Student Name", "Class", "Total Fee", "Paid Amount", "Outstanding", "Status"],
      ...filteredStudentBalances.map(s => [
        s.student_id,
        s.student_name,
        s.class_name,
        s.total_fee.toString(),
        s.paid_amount.toString(),
        s.outstanding_amount.toString(),
        s.status
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee_balances.csv";
    a.click();
  };

  return {
    // Data
    feeStructures,
    studentFeeBalances,
    transportFeeStructures,
    feePayments,
    filteredStudentBalances,
    
    // Computed values
    totalOutstanding,
    totalCollected,
    collectionRate,
    
    // UI State
    activeTab,
    setActiveTab,
    isAddFeeStructureOpen,
    setIsAddFeeStructureOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isCollectOpen,
    setIsCollectOpen,
    showStudentPopup,
    setShowStudentPopup,
    showPaymentPopup,
    setShowPaymentPopup,
    showReceiptPopup,
    setShowReceiptPopup,
    
    // Form State
    selectedStudent,
    setSelectedStudent,
    feeType,
    setFeeType,
    selectedTerms,
    setSelectedTerms,
    customAmount,
    setCustomAmount,
    paymentMode,
    setPaymentMode,
    collectTarget,
    setCollectTarget,
    collectSelection,
    setCollectSelection,
    
    // Filters
    paymentsStartDate,
    setPaymentsStartDate,
    paymentsEndDate,
    setPaymentsEndDate,
    paymentsTerm,
    setPaymentsTerm,
    paymentsClass,
    setPaymentsClass,
    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    selectedStatus,
    setSelectedStatus,
    
    // Business logic
    isSelectionValid,
    computeSelectedAmount,
    applyCollect,
    handleAddFeeStructure,
    handleAddPayment,
    exportPaymentsCSV,
    exportBalancesCSV,
    getFilteredPayments,
    
    // User context
    user,
    currentBranch,
  };
};
