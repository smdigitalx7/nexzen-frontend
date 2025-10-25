import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolTuitionBalancesList, useSchoolTuitionBalance, useBulkCreateSchoolTuitionBalances } from "@/lib/hooks/school/use-school-fee-balances";
import type { SchoolTuitionFeeBalanceRead, SchoolTuitionFeeBalanceFullRead } from "@/lib/types/school";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";
import { Plus } from "lucide-react";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

interface TuitionFeeBalancesPanelProps {
  onViewStudent: (s: StudentRow) => void;
  onExportCSV: () => void;
}

// Memoized details dialog component
const DetailsDialog = memo(({ 
  isOpen, 
  onClose, 
  selectedBalanceId, 
  selectedBalance 
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedBalanceId: number | undefined;
  selectedBalance: SchoolTuitionFeeBalanceFullRead | undefined;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Tuition Fee Balance Details</DialogTitle>
      </DialogHeader>
      {!selectedBalanceId ? (
        <div className="p-2 text-sm text-muted-foreground">No balance selected.</div>
      ) : !selectedBalance ? (
        <div className="p-2 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Admission No:</span> <span className="font-medium">{selectedBalance.admission_no}</span></div>
              <div><span className="text-muted-foreground">Roll Number:</span> <span className="font-medium">{selectedBalance.roll_number}</span></div>
              <div><span className="text-muted-foreground">Student Name:</span> <span className="font-medium">{selectedBalance.student_name}</span></div>
              <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{selectedBalance.class_name}</span></div>
              <div><span className="text-muted-foreground">Section:</span> <span className="font-medium">{selectedBalance.section_name || '-'}</span></div>
              <div><span className="text-muted-foreground">Father Name:</span> <span className="font-medium">{selectedBalance.father_name}</span></div>
              <div><span className="text-muted-foreground">Phone Number:</span> <span className="font-medium">{selectedBalance.phone_number}</span></div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Fee Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Actual Fee:</span> <span className="font-medium">₹{selectedBalance.actual_fee}</span></div>
              <div><span className="text-muted-foreground">Concession Amount:</span> <span className="font-medium">₹{selectedBalance.concession_amount}</span></div>
              <div><span className="text-muted-foreground">Total Fee:</span> <span className="font-medium text-lg">₹{selectedBalance.total_fee}</span></div>
              <div><span className="text-muted-foreground">Overall Balance:</span> <span className="font-medium text-lg text-red-600">₹{selectedBalance.overall_balance_fee}</span></div>
            </div>
          </div>

          {/* Book Fee Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Book Fee Details</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted-foreground">Book Fee:</span> <span className="font-medium">₹{selectedBalance.book_fee}</span></div>
              <div><span className="text-muted-foreground">Book Paid:</span> <span className="font-medium">₹{selectedBalance.book_paid}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{selectedBalance.book_paid_status}</span></div>
            </div>
          </div>

          {/* Term-wise Payment Details */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Term-wise Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Term 1 */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-base mb-3 text-blue-600">Term 1</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">₹{selectedBalance.term1_amount}</span></div>
                  <div><span className="text-muted-foreground">Paid:</span> <span className="font-medium">₹{selectedBalance.term1_paid}</span></div>
                  <div><span className="text-muted-foreground">Balance:</span> <span className="font-medium text-red-600">₹{selectedBalance.term1_balance}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{selectedBalance.term1_status}</span></div>
                </div>
              </div>

              {/* Term 2 */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-base mb-3 text-green-600">Term 2</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">₹{selectedBalance.term2_amount}</span></div>
                  <div><span className="text-muted-foreground">Paid:</span> <span className="font-medium">₹{selectedBalance.term2_paid}</span></div>
                  <div><span className="text-muted-foreground">Balance:</span> <span className="font-medium text-red-600">₹{selectedBalance.term2_balance}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{selectedBalance.term2_status}</span></div>
                </div>
              </div>

              {/* Term 3 */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-base mb-3 text-purple-600">Term 3</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">₹{selectedBalance.term3_amount}</span></div>
                  <div><span className="text-muted-foreground">Paid:</span> <span className="font-medium">₹{selectedBalance.term3_paid}</span></div>
                  <div><span className="text-muted-foreground">Balance:</span> <span className="font-medium text-red-600">₹{selectedBalance.term3_balance}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{selectedBalance.term3_status}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Record Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Created At:</span> <span className="font-medium">{new Date(selectedBalance.created_at).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Updated At:</span> <span className="font-medium">{selectedBalance.updated_at ? new Date(selectedBalance.updated_at).toLocaleString() : 'Never'}</span></div>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
));

DetailsDialog.displayName = "DetailsDialog";

// Memoized bulk create dialog component
const BulkCreateDialog = memo(({ 
  isOpen, 
  onClose, 
  onConfirm, 
  className, 
  isPending 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className: string;
  isPending: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Bulk Create Tuition Fee Balances</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This will create tuition fee balances for all students in the selected class: <strong>{className}</strong>
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This action will create tuition fee balance records for all students in the selected class. This cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isPending ? 'Creating...' : 'Create Balances'}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
));

BulkCreateDialog.displayName = "BulkCreateDialog";

const TuitionFeeBalancesPanelComponent = ({ onViewStudent, onExportCSV }: TuitionFeeBalancesPanelProps) => {
  // State management
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);

  // Hooks
  const { data: classes = [] } = useSchoolClasses();
  const { toast } = useToast();
  const bulkCreateMutation = useBulkCreateSchoolTuitionBalances();

  // Memoized class ID for API calls
  const classIdNum = useMemo(() => 
    balanceClass ? parseInt(balanceClass) : undefined,
    [balanceClass]
  );

  // API hooks with memoized parameters
  const { data: tuitionResp, refetch } = useSchoolTuitionBalancesList({ 
    class_id: classIdNum, 
    page: 1, 
    page_size: 50 
  });
  const { data: selectedBalance } = useSchoolTuitionBalance(selectedBalanceId);

  // Memoized selected class name
  const selectedClassName = useMemo(() => 
    classes.find(c => c.class_id?.toString() === balanceClass)?.class_name || "",
    [classes, balanceClass]
  );

  // Auto-select first class when available
  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id?.toString() || '');
    }
  }, [classes, balanceClass]);

  // Memoized handlers
  const handleBulkCreate = useCallback(async () => {
    if (!classIdNum) {
      toast({
        title: "Error",
        description: "Please select a class first",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkCreateMutation.mutateAsync({ class_id: classIdNum });
      toast({
        title: "Success",
        description: "Tuition fee balances created successfully for the selected class",
      });
      refetch();
      setBulkCreateOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tuition fee balances",
        variant: "destructive",
      });
    }
  }, [classIdNum, bulkCreateMutation, toast, refetch]);

  const handleViewStudent = useCallback((student: StudentRow) => {
    setSelectedBalanceId(student.id);
    setDetailsOpen(true);
    onViewStudent(student);
  }, [onViewStudent]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedBalanceId(undefined);
  }, []);

  const handleCloseBulkCreate = useCallback(() => {
    setBulkCreateOpen(false);
  }, []);

  const handleOpenBulkCreate = useCallback(() => {
    setBulkCreateOpen(true);
  }, []);

  // Memoized data transformation
  const rows = useMemo<StudentRow[]>(() => {
    return (tuitionResp?.data || []).map((t: SchoolTuitionFeeBalanceRead) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, (t.total_fee || 0) - ((t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0)));
      return {
        id: t.enrollment_id,
        student_id: t.admission_no,
        student_name: t.student_name,
        class_name: t.class_name || "Unknown",
        section_name: t.section_name || "Unknown",
        academic_year: "",
        total_fee: t.total_fee,
        paid_amount: paidTotal,
        outstanding_amount: outstanding,
        admission_paid: true,
        books_paid: t.book_paid > 0,
        term_1_paid: t.term1_paid > 0,
        term_2_paid: t.term2_paid > 0,
        term_3_paid: t.term3_paid > 0,
        transport_paid: false,
        last_payment_date: new Date().toISOString(),
        status: outstanding <= 0 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'OUTSTANDING',
      };
    });
  }, [tuitionResp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >

      <StudentFeeBalancesTable
        studentBalances={rows}
        onViewStudent={handleViewStudent}
        onExportCSV={onExportCSV}
        onBulkCreate={handleOpenBulkCreate}
        showHeader={false}
      />

      {/* Details Dialog */}
      <DetailsDialog
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        selectedBalanceId={selectedBalanceId}
        selectedBalance={selectedBalance}
      />

      {/* Bulk Create Dialog */}
      <BulkCreateDialog
        isOpen={bulkCreateOpen}
        onClose={handleCloseBulkCreate}
        onConfirm={handleBulkCreate}
        className={selectedClassName}
        isPending={bulkCreateMutation.isPending}
      />
    </motion.div>
  );
};

export const TuitionFeeBalancesPanel = TuitionFeeBalancesPanelComponent;
export default TuitionFeeBalancesPanelComponent;
