import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { useCollegeTuitionBalancesList, useCollegeTuitionBalanceByAdmission } from "@/features/college/hooks";
import { useCollegeClasses, useCollegeGroups } from "@/features/college/hooks/use-college-dropdowns";
import type { CollegeTuitionFeeBalanceRead, CollegeTuitionFeeBalanceFullRead } from "@/features/college/types";
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
  selectedAdmissionNo, 
  selectedBalance 
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAdmissionNo: string | null;
  selectedBalance: CollegeTuitionFeeBalanceFullRead | undefined;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
      <DialogHeader>
        <DialogTitle>Tuition Fee Balance Details</DialogTitle>
      </DialogHeader>
      {!selectedAdmissionNo ? (
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
              <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{selectedBalance.class_name || '-'}</span></div>
              <div><span className="text-muted-foreground">Group:</span> <span className="font-medium">{selectedBalance.group_name || '-'}</span></div>
              <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{selectedBalance.course_name || '-'}</span></div>
              <div><span className="text-muted-foreground">Father Name:</span> <span className="font-medium">{selectedBalance.father_name || '-'}</span></div>
              <div><span className="text-muted-foreground">Phone Number:</span> <span className="font-medium">{selectedBalance.phone_number || '-'}</span></div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Fee Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Group Fee:</span> <span className="font-medium">₹{selectedBalance.group_fee}</span></div>
              <div><span className="text-muted-foreground">Course Fee:</span> <span className="font-medium">₹{selectedBalance.course_fee}</span></div>
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
  const { data: classesData } = useCollegeClasses();
  const classes = classesData?.items || [];
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [balanceGroup, setBalanceGroup] = useState<string>("");
  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: groupsData } = useCollegeGroups(classIdNum);
  const groups = groupsData?.items || [];
  // Optional: when a row is clicked, fetch full details
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: selectedBalance } = useCollegeTuitionBalanceByAdmission(selectedAdmissionNo);

  // Reset group when class changes
  useEffect(() => {
    if (balanceClass) {
      setBalanceGroup("");
    }
  }, [balanceClass]);

  const groupIdNum = balanceGroup ? parseInt(balanceGroup) : undefined;
  // Only fetch data when both class and group are selected
  const { data: tuitionResp, refetch } = useCollegeTuitionBalancesList(
    classIdNum && groupIdNum ? { 
      class_id: classIdNum, 
      group_id: groupIdNum,
      page: 1, 
      pageSize: 50 
    } : undefined
  );


  // Memoized handlers
  const handleViewStudent = useCallback((student: StudentRow) => {
    setSelectedAdmissionNo(student.student_id); // student_id contains admission_no
    setDetailsOpen(true);
    onViewStudent(student);
  }, [onViewStudent]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedAdmissionNo(null);
  }, []);

  // Memoized data transformation
  const rows = useMemo<StudentRow[]>(() => {
    return (tuitionResp?.data || []).map((t: CollegeTuitionFeeBalanceRead, index: number) => {
      const totalFee = (t.total_fee || 0) + (t.book_fee || 0); // Include book_fee in total
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, totalFee - paidTotal);
      return {
        id: index + 1, // Use index as ID since enrollment_id is not available in list response
        student_id: t.admission_no,
        student_name: t.student_name,
        class_name: t.course_name || "", // Use course_name as class_name since class_name is not available
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
      {/* Class and Group Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Class</label>
          <Select 
            value={balanceClass} 
            onValueChange={(value) => {
              setBalanceClass(value);
              setBalanceGroup(""); // Reset group when class changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls: any) => (
                <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                  {cls.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Group</label>
          <Select 
            value={balanceGroup} 
            onValueChange={setBalanceGroup}
            disabled={!balanceClass}
          >
            <SelectTrigger>
              <SelectValue placeholder={balanceClass ? "Select group" : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              {groups.map((grp: any) => (
                <SelectItem key={grp.group_id} value={grp.group_id.toString()}>
                  {grp.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!balanceClass || !balanceGroup ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Please select a class and group to view tuition fee balances.</p>
        </div>
      ) : (
        <StudentFeeBalancesTable
          studentBalances={rows}
          onViewStudent={handleViewStudent}
          onExportCSV={onExportCSV}
          showHeader={false}
          loading={!tuitionResp}
        />
      )}

      {/* Details Dialog */}
      <DetailsDialog
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        selectedAdmissionNo={selectedAdmissionNo}
        selectedBalance={selectedBalance}
      />
    </motion.div>
  );
};

export const TuitionFeeBalancesPanel = TuitionFeeBalancesPanelComponent;
export default TuitionFeeBalancesPanelComponent;
