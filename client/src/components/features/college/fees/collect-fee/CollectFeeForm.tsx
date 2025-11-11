import { useState, useRef } from "react";
import { Calculator, CheckCircle, AlertTriangle, Receipt, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { sanitizeHTML } from "@/lib/utils/security/sanitization";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
// Removed individual payment hooks - now using pay-by-admission API
import { useToast } from "@/hooks/use-toast";
import { CollegeIncomeService } from "@/lib/services/college/income.service";
import type { CollegeStudentRead } from "@/lib/types/college/students";
import type { CollegeTuitionFeeBalanceRead } from "@/lib/types/college/tuition-fee-balances";
import type { CollegeTransportFeeBalanceListRead } from "@/lib/types/college/transport-fee-balances";

interface BillItem {
  description: string;
  amount: number;
}

interface GeneratedBill {
  billNumber: string;
  studentName: string;
  admissionNo: string;
  paymentDate: string;
  amount: number;
  paymentMode: string;
  items: BillItem[];
  instituteName: string;
  address: string;
  phone: string;
}

interface StudentFeeDetails {
  student: CollegeStudentRead;
  tuitionBalance: CollegeTuitionFeeBalanceRead | null;
  transportBalance?: CollegeTransportFeeBalanceListRead | null;
}

interface CollectFeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent: StudentFeeDetails | null;
  onPaymentComplete: () => void;
}

export const CollectFeeForm = ({
  isOpen,
  onClose,
  selectedStudent,
  onPaymentComplete,
}: CollectFeeFormProps) => {
  const [collectSelection, setCollectSelection] = useState({
    books: false,
    t1: false,
    t2: false,
    t3: false,
    tr1: false,
    tr2: false,
    tr3: false,
  });
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<GeneratedBill | null>(null);
  const [showBill, setShowBill] = useState(false);
  
  const billRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isSelectionValid = () => {
    return Object.values(collectSelection).some(Boolean) || customAmount !== "";
  };

  const computeSelectedAmount = () => {
    if (customAmount !== "") return parseFloat(customAmount);
    
    if (!selectedStudent) return 0;
    
    let amount = 0;
    
    // Tuition fees
    const tuitionData = selectedStudent.tuitionBalance;
    if (tuitionData) {
      const bookFee = tuitionData.book_fee ?? 0;
      const bookPaid = tuitionData.book_paid ?? 0;
      const term1Amount = tuitionData.term1_amount ?? 0;
      const term1Paid = tuitionData.term1_paid ?? 0;
      const term2Amount = tuitionData.term2_amount ?? 0;
      const term2Paid = tuitionData.term2_paid ?? 0;
      const term3Amount = tuitionData.term3_amount ?? 0;
      const term3Paid = tuitionData.term3_paid ?? 0;
      
      if (collectSelection.books) amount += Math.max(0, bookFee - bookPaid);
      if (collectSelection.t1) amount += Math.max(0, term1Amount - term1Paid);
      if (collectSelection.t2) amount += Math.max(0, term2Amount - term2Paid);
      if (collectSelection.t3) amount += Math.max(0, term3Amount - term3Paid);
    }
    
    // Transport fees
    const transportData = selectedStudent.transportBalance;
    if (transportData) {
      const transportTerm1Amount = transportData.term1_amount ?? 0;
      const transportTerm1Paid = transportData.term1_paid ?? 0;
      const transportTerm2Amount = transportData.term2_amount ?? 0;
      const transportTerm2Paid = transportData.term2_paid ?? 0;
      
      if (collectSelection.tr1) amount += Math.max(0, transportTerm1Amount - transportTerm1Paid);
      if (collectSelection.tr2) amount += Math.max(0, transportTerm2Amount - transportTerm2Paid);
    }
    
    return amount;
  };

  const handleCollect = async () => {
    if (!selectedStudent || !isSelectionValid()) return;
    
    setIsProcessing(true);
    try {
      const studentData = selectedStudent.student;
      const amount = computeSelectedAmount();
      const paymentDate = new Date().toISOString();
      
      // Build payment details array for the pay-by-admission API
      const paymentDetails = [];
      
      const tuitionData = selectedStudent.tuitionBalance;
      if (collectSelection.books && tuitionData) {
        const bookFee = tuitionData.book_fee ?? 0;
        const bookPaid = tuitionData.book_paid ?? 0;
        paymentDetails.push({
          purpose: "BOOK_FEE",
          custom_purpose_name: null,
          term_number: null,
          paid_amount: Math.max(0, bookFee - bookPaid),
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.t1 && tuitionData) {
        const term1Amount = tuitionData.term1_amount ?? 0;
        const term1Paid = tuitionData.term1_paid ?? 0;
        paymentDetails.push({
          purpose: "TUITION_FEE",
          custom_purpose_name: null,
          term_number: 1,
          paid_amount: Math.max(0, term1Amount - term1Paid),
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.t2 && tuitionData) {
        const term2Amount = tuitionData.term2_amount ?? 0;
        const term2Paid = tuitionData.term2_paid ?? 0;
        paymentDetails.push({
          purpose: "TUITION_FEE",
          custom_purpose_name: null,
          term_number: 2,
          paid_amount: Math.max(0, term2Amount - term2Paid),
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.t3 && tuitionData) {
        const term3Amount = tuitionData.term3_amount ?? 0;
        const term3Paid = tuitionData.term3_paid ?? 0;
        paymentDetails.push({
          purpose: "TUITION_FEE",
          custom_purpose_name: null,
          term_number: 3,
          paid_amount: Math.max(0, term3Amount - term3Paid),
          payment_method: paymentMode
        });
      }
      
      // NOTE: Transport fees for colleges require payment_month (YYYY-MM-01 format), not term_number
      // This form uses term-based transport balance which may not match the API requirements
      // For proper transport fee payment, use the MultiplePaymentForm which supports monthly payments
      // Keeping this for backward compatibility but transport fees may not work correctly here
      const transportData = selectedStudent.transportBalance;
      if (collectSelection.tr1 && transportData) {
        // TODO: Update to use payment_month instead of term_number
        // Need to get monthly payment data from transport balance API
        const transportTerm1Amount = transportData.term1_amount ?? 0;
        const transportTerm1Paid = transportData.term1_paid ?? 0;
        paymentDetails.push({
          purpose: "TRANSPORT_FEE",
          custom_purpose_name: null,
          // term_number: 1, // REMOVED - colleges use payment_month, not term_number
          // payment_month: "YYYY-MM-01", // TODO: Get from transport balance data
          paid_amount: Math.max(0, transportTerm1Amount - transportTerm1Paid),
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.tr2 && transportData) {
        const transportTerm2Amount = transportData.term2_amount ?? 0;
        const transportTerm2Paid = transportData.term2_paid ?? 0;
        paymentDetails.push({
          purpose: "TRANSPORT_FEE",
          custom_purpose_name: null,
          // term_number: 2, // REMOVED - colleges use payment_month, not term_number
          // payment_month: "YYYY-MM-01", // TODO: Get from transport balance data
          paid_amount: Math.max(0, transportTerm2Amount - transportTerm2Paid),
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.tr3 && transportData) {
        const transportTerm3Amount = transportData.term3_amount ?? 0;
        const transportTerm3Paid = transportData.term3_paid ?? 0;
        paymentDetails.push({
          purpose: "TRANSPORT_FEE",
          custom_purpose_name: null,
          // term_number: 3, // REMOVED - colleges use payment_month, not term_number
          // payment_month: "YYYY-MM-01", // TODO: Get from transport balance data
          paid_amount: Math.max(0, transportTerm3Amount - transportTerm3Paid),
          payment_method: paymentMode
        });
      }
      
      // Use the pay-by-admission API endpoint
      const apiPayload = {
        details: paymentDetails,
        remarks: null
      };

      const result = await CollegeIncomeService.payFee(
        studentData.admission_no,
        apiPayload
      );
      
      // If we get a result, payment was successful
      if (result && result.income_id) {
        // Generate bill
        const bill: GeneratedBill = {
          billNumber: `BILL-${Date.now()}`,
          studentName: studentData.student_name,
          admissionNo: studentData.admission_no,
          paymentDate,
          amount,
          paymentMode,
          items: getPaymentItems(),
          instituteName: "NexGen College",
          address: "123 Education Street, Learning City",
          phone: "+1 234 567 8900"
        };
        
        setGeneratedBill(bill);
        setShowBill(true);
        
        toast({
          title: "Payment Successful",
          description: `Payment of ${formatCurrency(amount)} collected successfully`,
          variant: "success",
        });
        
        onPaymentComplete();
      } else {
        throw new Error('Payment processing failed');
      }
      
    } catch (error) {
      // Parse error message and provide user-friendly feedback based on markdown guide
      let errorMessage = error instanceof Error ? error.message : "Failed to process payment. Please try again.";
      let errorTitle = "Payment Failed";
      
      // Handle specific error types from the markdown guide
      if (errorMessage.includes("Student not found")) {
        errorTitle = "Student Not Found";
        errorMessage = "Student not found. Please check the admission number.";
      } else if (errorMessage.includes("Active enrollment not found")) {
        errorTitle = "Enrollment Not Found";
        errorMessage = "Student is not enrolled for this academic year.";
      } else if (errorMessage.includes("Payment sequence violation")) {
        errorTitle = "Payment Sequence Error";
        errorMessage = "Please pay previous terms/months first.";
      } else if (errorMessage.includes("exceeds remaining_balance")) {
        errorTitle = "Amount Exceeds Balance";
        errorMessage = "Payment amount exceeds remaining balance.";
      } else if (errorMessage.includes("must be paid in full")) {
        errorTitle = "Full Payment Required";
        errorMessage = "This fee must be paid in full. Partial payments are not allowed.";
      } else if (errorMessage.includes("Book fee prerequisite")) {
        errorTitle = "Book Fee Required";
        errorMessage = "Book fee must be paid before tuition fees.";
      } else if (errorMessage.includes("Sequential payment validation failed")) {
        errorTitle = "Sequential Payment Required";
        errorMessage = "Please pay pending months first.";
      } else if (errorMessage.includes("Transport assignment not found")) {
        errorTitle = "Transport Assignment Not Found";
        errorMessage = "Student does not have an active transport assignment.";
      } else if (errorMessage.includes("Duplicate payment months")) {
        errorTitle = "Duplicate Payment";
        errorMessage = "Each month can only be paid once per transaction.";
      } else if (errorMessage.includes("Missing required parameter")) {
        errorTitle = "Missing Information";
        // Keep original message as it's specific
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentItems = (): BillItem[] => {
    const items: BillItem[] = [];
    
    if (!selectedStudent) return items;
    
    const tuitionData = selectedStudent.tuitionBalance;
    const transportData = selectedStudent.transportBalance;
    
    if (collectSelection.books && tuitionData) {
      const bookFee = tuitionData.book_fee ?? 0;
      const bookPaid = tuitionData.book_paid ?? 0;
      items.push({
        description: "Book Fee",
        amount: Math.max(0, bookFee - bookPaid)
      });
    }
    
    if (collectSelection.t1 && tuitionData) {
      const term1Amount = tuitionData.term1_amount ?? 0;
      const term1Paid = tuitionData.term1_paid ?? 0;
      items.push({
        description: "Tuition Term 1",
        amount: Math.max(0, term1Amount - term1Paid)
      });
    }
    
    if (collectSelection.t2 && tuitionData) {
      const term2Amount = tuitionData.term2_amount ?? 0;
      const term2Paid = tuitionData.term2_paid ?? 0;
      items.push({
        description: "Tuition Term 2",
        amount: Math.max(0, term2Amount - term2Paid)
      });
    }
    
    if (collectSelection.t3 && tuitionData) {
      const term3Amount = tuitionData.term3_amount ?? 0;
      const term3Paid = tuitionData.term3_paid ?? 0;
      items.push({
        description: "Tuition Term 3",
        amount: Math.max(0, term3Amount - term3Paid)
      });
    }
    
    if (collectSelection.tr1 && transportData) {
      const transportTerm1Amount = transportData.term1_amount ?? 0;
      const transportTerm1Paid = transportData.term1_paid ?? 0;
      items.push({
        description: "Transport Term 1",
        amount: Math.max(0, transportTerm1Amount - transportTerm1Paid)
      });
    }
    
    if (collectSelection.tr2 && transportData) {
      const transportTerm2Amount = transportData.term2_amount ?? 0;
      const transportTerm2Paid = transportData.term2_paid ?? 0;
      items.push({
        description: "Transport Term 2",
        amount: Math.max(0, transportTerm2Amount - transportTerm2Paid)
      });
    }
    
    return items;
  };

  const handleSelectionChange = (key: keyof typeof collectSelection, checked: boolean) => {
    setCollectSelection(prev => ({ ...prev, [key]: checked }));
    if (checked) setCustomAmount(""); // Clear custom amount when selecting items
  };

  const handlePrint = () => {
    if (billRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Fee Receipt - ${generatedBill?.billNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .bill-details { margin-bottom: 20px; }
                .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .total { font-weight: bold; font-size: 18px; }
                .footer { margin-top: 30px; text-align: center; }
              </style>
            </head>
            <body>
              ${sanitizeHTML(billRef.current.innerHTML)}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const resetForm = () => {
    setCollectSelection({
      books: false,
      t1: false,
      t2: false,
      t3: false,
      tr1: false,
      tr2: false,
      tr3: false,
    });
    setCustomAmount("");
    setGeneratedBill(null);
    setShowBill(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!selectedStudent) return null;

  // Extract data safely for UI rendering
  const studentData = selectedStudent.student;
  const tuitionData = selectedStudent.tuitionBalance;
  const transportData = selectedStudent.transportBalance;

  // Calculate outstanding amounts for display
  const bookOutstanding = tuitionData ? Math.max(0, (tuitionData.book_fee ?? 0) - (tuitionData.book_paid ?? 0)) : 0;
  const term1Outstanding = tuitionData ? Math.max(0, (tuitionData.term1_amount ?? 0) - (tuitionData.term1_paid ?? 0)) : 0;
  const term2Outstanding = tuitionData ? Math.max(0, (tuitionData.term2_amount ?? 0) - (tuitionData.term2_paid ?? 0)) : 0;
  const term3Outstanding = tuitionData ? Math.max(0, (tuitionData.term3_amount ?? 0) - (tuitionData.term3_paid ?? 0)) : 0;
  const transportTerm1Outstanding = transportData ? Math.max(0, (transportData.term1_amount ?? 0) - (transportData.term1_paid ?? 0)) : 0;
  const transportTerm2Outstanding = transportData ? Math.max(0, (transportData.term2_amount ?? 0) - (transportData.term2_paid ?? 0)) : 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Collect Fee Payment</DialogTitle>
            <DialogDescription>
              Collect payment from {studentData.student_name} ({studentData.admission_no})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Student Name</Label>
                    <p className="text-sm text-muted-foreground">{studentData.student_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Admission No</Label>
                    <p className="text-sm text-muted-foreground">{studentData.admission_no}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Class</Label>
                    <p className="text-sm text-muted-foreground">{studentData.class_name ?? "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-sm text-muted-foreground">{studentData.gender ?? "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outstanding Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tuitionData && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Tuition Fees</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="books"
                          checked={collectSelection.books}
                          onCheckedChange={(checked) => handleSelectionChange('books', checked as boolean)}
                        />
                        <Label htmlFor="books">Book Fee</Label>
                        <Badge variant="outline">
                          {formatCurrency(bookOutstanding)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="t1"
                          checked={collectSelection.t1}
                          onCheckedChange={(checked) => handleSelectionChange('t1', checked as boolean)}
                        />
                        <Label htmlFor="t1">Term 1</Label>
                        <Badge variant="outline">
                          {formatCurrency(term1Outstanding)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="t2"
                          checked={collectSelection.t2}
                          onCheckedChange={(checked) => handleSelectionChange('t2', checked as boolean)}
                        />
                        <Label htmlFor="t2">Term 2</Label>
                        <Badge variant="outline">
                          {formatCurrency(term2Outstanding)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="t3"
                          checked={collectSelection.t3}
                          onCheckedChange={(checked) => handleSelectionChange('t3', checked as boolean)}
                        />
                        <Label htmlFor="t3">Term 3</Label>
                        <Badge variant="outline">
                          {formatCurrency(term3Outstanding)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {transportData && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Transport Fees</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tr1"
                          checked={collectSelection.tr1}
                          onCheckedChange={(checked) => handleSelectionChange('tr1', checked as boolean)}
                        />
                        <Label htmlFor="tr1">Transport Term 1</Label>
                        <Badge variant="outline">
                          {formatCurrency(transportTerm1Outstanding)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tr2"
                          checked={collectSelection.tr2}
                          onCheckedChange={(checked) => handleSelectionChange('tr2', checked as boolean)}
                        />
                        <Label htmlFor="tr2">Transport Term 2</Label>
                        <Badge variant="outline">
                          {formatCurrency(transportTerm2Outstanding)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Label htmlFor="customAmount">Or enter custom amount</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value !== "") {
                        setCollectSelection({
                          books: false,
                          t1: false,
                          t2: false,
                          t3: false,
                          tr1: false,
                          tr2: false,
                          tr3: false,
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMode">Payment Mode</Label>
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Calculator className="h-4 w-4" />
                      <span className="text-lg font-bold">
                        {formatCurrency(computeSelectedAmount())}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => { void handleCollect(); }}
              disabled={!isSelectionValid() || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Collect {formatCurrency(computeSelectedAmount())}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Generation Dialog */}
      <Dialog open={showBill} onOpenChange={setShowBill}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Fee Receipt
            </DialogTitle>
          </DialogHeader>
          
          {generatedBill && (
            <div ref={billRef} className="space-y-4">
              {/* Bill Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">{generatedBill.instituteName}</h2>
                <p className="text-sm text-muted-foreground">{generatedBill.address}</p>
                <p className="text-sm text-muted-foreground">Phone: {generatedBill.phone}</p>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Bill No:</strong> {generatedBill.billNumber}</p>
                  <p><strong>Date:</strong> {new Date(generatedBill.paymentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p><strong>Student:</strong> {generatedBill.studentName}</p>
                  <p><strong>Admission No:</strong> {generatedBill.admissionNo}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedBill.items.map((item: BillItem, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted">
                    <tr>
                      <td className="p-2 font-bold">Total</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(generatedBill.amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Info */}
              <div className="text-sm">
                <p><strong>Payment Mode:</strong> {generatedBill.paymentMode}</p>
                <p><strong>Payment Date:</strong> {new Date(generatedBill.paymentDate).toLocaleString()}</p>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>Thank you for your payment!</p>
                <p>This is a computer generated receipt.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBill(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
