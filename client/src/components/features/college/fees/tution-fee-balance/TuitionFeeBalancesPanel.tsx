import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useCollegeTuitionBalancesList, useCollegeTuitionBalanceByAdmission, useBulkCreateCollegeTuitionBalances } from "@/lib/hooks/college";
import { useCollegeClasses, useCollegeGroups } from "@/lib/hooks/college/use-college-dropdowns";
import type { CollegeTuitionFeeBalanceRead, CollegeTuitionFeeBalanceFullRead } from "@/lib/types/college";
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

// Memoized bulk create dialog component
const BulkCreateDialog = memo(({ 
  isOpen, 
  onClose, 
  onConfirm, 
  className, 
  groupName,
  isPending 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className: string;
  groupName: string;
  isPending: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Bulk Create Tuition Fee Balances</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This will create tuition fee balances for all students in the selected class and group: <strong>{className}</strong> - <strong>{groupName}</strong>
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
                <p>This action will create tuition fee balance records for all students in the selected class and group. This cannot be undone.</p>
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
  const { data: classesData } = useCollegeClasses();
  const classes = classesData?.items || [];
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [balanceGroup, setBalanceGroup] = useState<string>("");
  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: groupsData } = useCollegeGroups(classIdNum);
  const groups = groupsData?.items || [];
  const { toast } = useToast();
  const bulkCreateMutation = useBulkCreateCollegeTuitionBalances();

  // Optional: when a row is clicked, fetch full details
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
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

  // Memoized selected class and group names
  const selectedClassName = useMemo(() => 
    classes.find(c => c.class_id?.toString() === balanceClass)?.class_name || "",
    [classes, balanceClass]
  );

  const selectedGroupName = useMemo(() => 
    groups.find(g => g.group_id?.toString() === balanceGroup)?.group_name || "",
    [groups, balanceGroup]
  );

  // Memoized handlers
  const handleBulkCreate = useCallback(async () => {
    if (!classIdNum || !groupIdNum) {
      toast({
        title: "Error",
        description: "Please select both class and group first",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkCreateMutation.mutateAsync({ 
        class_id: classIdNum,
        group_id: groupIdNum 
      });
      // Cache invalidation handled by mutation hook
      setBulkCreateOpen(false);
    } catch (error) {
      // Error toast handled by mutation hook
    }
  }, [classIdNum, groupIdNum, bulkCreateMutation, toast]);

  const handleViewStudent = useCallback((student: StudentRow) => {
    setSelectedAdmissionNo(student.student_id); // student_id contains admission_no
    setDetailsOpen(true);
    onViewStudent(student);
  }, [onViewStudent]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedAdmissionNo(null);
  }, []);

  const handleCloseBulkCreate = useCallback(() => {
    setBulkCreateOpen(false);
  }, []);

  const handleOpenBulkCreate = useCallback(() => {
    setBulkCreateOpen(true);
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
          onBulkCreate={handleOpenBulkCreate}
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

      {/* Bulk Create Dialog */}
      <BulkCreateDialog
        isOpen={bulkCreateOpen}
        onClose={handleCloseBulkCreate}
        onConfirm={handleBulkCreate}
        className={selectedClassName}
        groupName={selectedGroupName}
        isPending={bulkCreateMutation.isPending}
      />
    </motion.div>
  );
};

export const TuitionFeeBalancesPanel = TuitionFeeBalancesPanelComponent;
export default TuitionFeeBalancesPanelComponent;
