import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, CheckCircle, AlertTriangle } from "lucide-react";
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

interface StudentFeeBalance {
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

interface PaymentCollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent: StudentFeeBalance | null;
  onCollectPayment: (amount: number, paymentMode: string) => void;
}

export const PaymentCollectionForm = ({
  isOpen,
  onClose,
  selectedStudent,
  onCollectPayment,
}: PaymentCollectionFormProps) => {
  const [collectSelection, setCollectSelection] = useState({
    books: false,
    t1: false,
    t2: false,
    t3: false,
    tr1: false,
    tr2: false,
  });
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const isSelectionValid = () => {
    return Object.values(collectSelection).some(Boolean) || customAmount !== "";
  };

  const computeSelectedAmount = () => {
    if (customAmount !== "") return parseFloat(customAmount);
    
    if (!selectedStudent) return 0;
    
    let amount = 0;
    if (collectSelection.books) amount += selectedStudent.total_fee * 0.15; // 15% for books
    if (collectSelection.t1) amount += selectedStudent.total_fee * 0.33; // 33% for term 1
    if (collectSelection.t2) amount += selectedStudent.total_fee * 0.33; // 33% for term 2
    if (collectSelection.t3) amount += selectedStudent.total_fee * 0.34; // 34% for term 3
    if (collectSelection.tr1) amount += 2000; // Transport fee
    if (collectSelection.tr2) amount += 2000; // Transport fee
    
    return amount;
  };

  const handleCollect = () => {
    if (!selectedStudent || !isSelectionValid()) return;
    
    const amount = computeSelectedAmount();
    onCollectPayment(amount, paymentMode);
    
    // Reset form
    setCollectSelection({
      books: false,
      t1: false,
      t2: false,
      t3: false,
      tr1: false,
      tr2: false,
    });
    setCustomAmount("");
    onClose();
  };

  const handleSelectionChange = (key: keyof typeof collectSelection, checked: boolean) => {
    setCollectSelection(prev => ({ ...prev, [key]: checked }));
    if (checked) setCustomAmount(""); // Clear custom amount when selecting items
  };

  if (!selectedStudent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Collect payment from {selectedStudent.student_name} ({selectedStudent.student_id})
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
                  <p className="text-sm text-muted-foreground">{selectedStudent.student_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Class</Label>
                  <p className="text-sm text-muted-foreground">{selectedStudent.class_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Fee</Label>
                  <p className="text-sm font-bold">{formatCurrency(selectedStudent.total_fee)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Outstanding</Label>
                  <p className="text-sm text-red-600 font-bold">
                    {formatCurrency(selectedStudent.outstanding_amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Payment Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="books"
                    checked={collectSelection.books}
                    onCheckedChange={(checked) => handleSelectionChange('books', checked as boolean)}
                  />
                  <Label htmlFor="books">Books Fee</Label>
                  <Badge variant="outline">
                    {formatCurrency(selectedStudent.total_fee * 0.15)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="t1"
                    checked={collectSelection.t1}
                    onCheckedChange={(checked) => handleSelectionChange('t1', checked as boolean)}
                  />
                  <Label htmlFor="t1">Term 1 Fee</Label>
                  <Badge variant="outline">
                    {formatCurrency(selectedStudent.total_fee * 0.33)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="t2"
                    checked={collectSelection.t2}
                    onCheckedChange={(checked) => handleSelectionChange('t2', checked as boolean)}
                  />
                  <Label htmlFor="t2">Term 2 Fee</Label>
                  <Badge variant="outline">
                    {formatCurrency(selectedStudent.total_fee * 0.33)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="t3"
                    checked={collectSelection.t3}
                    onCheckedChange={(checked) => handleSelectionChange('t3', checked as boolean)}
                  />
                  <Label htmlFor="t3">Term 3 Fee</Label>
                  <Badge variant="outline">
                    {formatCurrency(selectedStudent.total_fee * 0.34)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tr1"
                    checked={collectSelection.tr1}
                    onCheckedChange={(checked) => handleSelectionChange('tr1', checked as boolean)}
                  />
                  <Label htmlFor="tr1">Transport Term 1</Label>
                  <Badge variant="outline">{formatCurrency(2000)}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tr2"
                    checked={collectSelection.tr2}
                    onCheckedChange={(checked) => handleSelectionChange('tr2', checked as boolean)}
                  />
                  <Label htmlFor="tr2">Transport Term 2</Label>
                  <Badge variant="outline">{formatCurrency(2000)}</Badge>
                </div>
              </div>

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
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCollect}
            disabled={!isSelectionValid()}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Collect {formatCurrency(computeSelectedAmount())}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
