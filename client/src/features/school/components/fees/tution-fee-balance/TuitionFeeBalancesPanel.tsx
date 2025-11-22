import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Label } from "@/common/components/ui/label";
import { useSchoolClasses, useSchoolTuitionBalancesList, useSchoolTuitionBalance } from "@/features/school/hooks";
import { SchoolClassDropdown } from "@/common/components/shared/Dropdowns";
import type { SchoolTuitionFeeBalanceRead, SchoolTuitionFeeBalanceFullRead } from "@/features/school/types";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";

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
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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

const TuitionFeeBalancesPanelComponent = ({ onViewStudent, onExportCSV }: TuitionFeeBalancesPanelProps) => {
  // State management
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Hooks
  const { data: classes = [] } = useSchoolClasses();

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


  // Auto-select first class when available
  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      const firstClassId = classes[0]?.class_id;
      if (firstClassId) {
        setBalanceClass(firstClassId.toString());
      }
    }
  }, [classes, balanceClass]);

  // Memoized handlers
  const handleViewStudent = useCallback((student: StudentRow) => {
    setSelectedBalanceId(student.id);
    setDetailsOpen(true);
    onViewStudent(student);
  }, [onViewStudent]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedBalanceId(undefined);
  }, []);

  // Memoized data transformation
  const rows = useMemo<StudentRow[]>(() => {
    return (tuitionResp?.data || []).map((t: SchoolTuitionFeeBalanceRead) => {
      const totalFee = (t.total_fee || 0) + (t.book_fee || 0); // Include book_fee in total
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, totalFee - paidTotal);
      return {
        id: t.enrollment_id,
        student_id: t.admission_no,
        student_name: t.student_name,
        class_name: t.class_name || "Unknown",
        section_name: t.section_name || "Unknown",
        academic_year: "",
        total_fee: totalFee,
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
      {/* Class Selection Dropdown */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <Label htmlFor="class-select">Select Class *</Label>
            <SchoolClassDropdown
              value={classIdNum || null}
              onChange={(value) => {
                if (value !== null) {
                  setBalanceClass(value.toString());
                } else {
                  setBalanceClass("");
                }
              }}
              placeholder="Select a class"
              required
            />
          </div>
          {!classIdNum && (
            <p className="text-sm text-red-500">
              Please select a class to view fee balances
            </p>
          )}
        </div>
      </div>

      {classIdNum && (
        <StudentFeeBalancesTable
        studentBalances={rows}
        onViewStudent={handleViewStudent}
        onExportCSV={onExportCSV}
        showHeader={false}
        classes={classes}
        />
      )}

      {/* Details Dialog */}
      <DetailsDialog
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        selectedBalanceId={selectedBalanceId}
        selectedBalance={selectedBalance}
      />
    </motion.div>
  );
};

export const TuitionFeeBalancesPanel = TuitionFeeBalancesPanelComponent;
export default TuitionFeeBalancesPanelComponent;
