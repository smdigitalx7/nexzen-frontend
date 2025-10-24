import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Calculator, CheckCircle, AlertTriangle, Receipt, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
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
import { api } from "@/lib/api";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
  transportBalance?: any; // Make optional to match CollectFeeSearch
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
  const [generatedBill, setGeneratedBill] = useState<any>(null);
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
    if (selectedStudent.tuitionBalance) {
      const tuition = selectedStudent.tuitionBalance;
      if (collectSelection.books) amount += Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0));
      if (collectSelection.t1) amount += Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0));
      if (collectSelection.t2) amount += Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0));
      if (collectSelection.t3) amount += Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));
    }
    
    // Transport fees
    if (selectedStudent.transportBalance) {
      const transport = selectedStudent.transportBalance;
      if (collectSelection.tr1) amount += Math.max(0, (transport.term1_amount || 0) - (transport.term1_paid || 0));
      if (collectSelection.tr2) amount += Math.max(0, (transport.term2_amount || 0) - (transport.term2_paid || 0));
    }
    
    return amount;
  };

  const handleCollect = async () => {
    if (!selectedStudent || !isSelectionValid()) return;
    
    setIsProcessing(true);
    try {
      const amount = computeSelectedAmount();
      const paymentDate = new Date().toISOString();
      
      // Build payment details array for the pay-by-admission API
      const paymentDetails = [];
      
      if (collectSelection.books && selectedStudent.tuitionBalance) {
        paymentDetails.push({
          purpose: "BOOK_FEE",
          custom_purpose_name: null,
          term_number: null,
          paid_amount: selectedStudent.tuitionBalance.book_fee - selectedStudent.tuitionBalance.book_paid,
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.t1 && selectedStudent.tuitionBalance) {
        paymentDetails.push({
          purpose: "TUITION_FEE",
          custom_purpose_name: null,
          term_number: 1,
          paid_amount: selectedStudent.tuitionBalance.term1_amount - selectedStudent.tuitionBalance.term1_paid,
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.t2 && selectedStudent.tuitionBalance) {
        paymentDetails.push({
          purpose: "TUITION_FEE",
          custom_purpose_name: null,
          term_number: 2,
          paid_amount: selectedStudent.tuitionBalance.term2_amount - selectedStudent.tuitionBalance.term2_paid,
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.t3 && selectedStudent.tuitionBalance) {
        paymentDetails.push({
          purpose: "TUITION_FEE",
          custom_purpose_name: null,
          term_number: 3,
          paid_amount: selectedStudent.tuitionBalance.term3_amount - selectedStudent.tuitionBalance.term3_paid,
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.tr1 && selectedStudent.transportBalance) {
        paymentDetails.push({
          purpose: "TRANSPORT_FEE",
          custom_purpose_name: null,
          term_number: 1,
          paid_amount: selectedStudent.transportBalance.term1_amount - selectedStudent.transportBalance.term1_paid,
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.tr2 && selectedStudent.transportBalance) {
        paymentDetails.push({
          purpose: "TRANSPORT_FEE",
          custom_purpose_name: null,
          term_number: 2,
          paid_amount: selectedStudent.transportBalance.term2_amount - selectedStudent.transportBalance.term2_paid,
          payment_method: paymentMode
        });
      }
      
      if (collectSelection.tr3 && selectedStudent.transportBalance) {
        paymentDetails.push({
          purpose: "TRANSPORT_FEE",
          custom_purpose_name: null,
          term_number: 3,
          paid_amount: selectedStudent.transportBalance.term3_amount - selectedStudent.transportBalance.term3_paid,
          payment_method: paymentMode
        });
      }
      
      // Use the pay-by-admission API endpoint
      const apiPayload = {
        details: paymentDetails,
        remarks: null
      };

      const result = await api({
        method: 'POST',
        path: `/college/income/pay-fee/${selectedStudent.student.admission_no}`,
        body: apiPayload,
      }) as { success: boolean; message?: string };
      
      if (result.success) {
        // Generate bill
        const bill = {
          billNumber: `BILL-${Date.now()}`,
          studentName: selectedStudent.student.student_name,
          admissionNo: selectedStudent.student.admission_no,
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
        });
        
        onPaymentComplete();
      } else {
        throw new Error(result.message || 'Payment processing failed');
      }
      
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentItems = () => {
    const items = [];
    
    if (collectSelection.books && selectedStudent?.tuitionBalance) {
      items.push({
        description: "Book Fee",
        amount: selectedStudent.tuitionBalance.book_fee - selectedStudent.tuitionBalance.book_paid
      });
    }
    
    if (collectSelection.t1 && selectedStudent?.tuitionBalance) {
      items.push({
        description: "Tuition Term 1",
        amount: selectedStudent.tuitionBalance.term1_amount - selectedStudent.tuitionBalance.term1_paid
      });
    }
    
    if (collectSelection.t2 && selectedStudent?.tuitionBalance) {
      items.push({
        description: "Tuition Term 2",
        amount: selectedStudent.tuitionBalance.term2_amount - selectedStudent.tuitionBalance.term2_paid
      });
    }
    
    if (collectSelection.t3 && selectedStudent?.tuitionBalance) {
      items.push({
        description: "Tuition Term 3",
        amount: selectedStudent.tuitionBalance.term3_amount - selectedStudent.tuitionBalance.term3_paid
      });
    }
    
    if (collectSelection.tr1 && selectedStudent?.transportBalance) {
      items.push({
        description: "Transport Term 1",
        amount: selectedStudent.transportBalance.term1_amount - selectedStudent.transportBalance.term1_paid
      });
    }
    
    if (collectSelection.tr2 && selectedStudent?.transportBalance) {
      items.push({
        description: "Transport Term 2",
        amount: selectedStudent.transportBalance.term2_amount - selectedStudent.transportBalance.term2_paid
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
              ${billRef.current.innerHTML}
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collect Fee Payment</DialogTitle>
            <DialogDescription>
              Collect payment from {selectedStudent.student.student_name} ({selectedStudent.student.admission_no})
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
                    <p className="text-sm text-muted-foreground">{selectedStudent.student.student_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Admission No</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.student.admission_no}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Class</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.student.class_name || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.student.gender || "N/A"}</p>
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
                {selectedStudent.tuitionBalance && (
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
                          {formatCurrency(selectedStudent.tuitionBalance.book_fee - selectedStudent.tuitionBalance.book_paid)}
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
                          {formatCurrency(selectedStudent.tuitionBalance.term1_amount - selectedStudent.tuitionBalance.term1_paid)}
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
                          {formatCurrency(selectedStudent.tuitionBalance.term2_amount - selectedStudent.tuitionBalance.term2_paid)}
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
                          {formatCurrency(selectedStudent.tuitionBalance.term3_amount - selectedStudent.tuitionBalance.term3_paid)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStudent.transportBalance && (
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
                          {formatCurrency(selectedStudent.transportBalance.term1_amount - selectedStudent.transportBalance.term1_paid)}
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
                          {formatCurrency(selectedStudent.transportBalance.term2_amount - selectedStudent.transportBalance.term2_paid)}
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
              onClick={handleCollect}
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
                    {generatedBill.items.map((item: any, index: number) => (
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
