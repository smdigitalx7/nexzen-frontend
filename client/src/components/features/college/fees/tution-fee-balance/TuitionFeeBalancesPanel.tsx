import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useCollegeClasses } from "@/lib/hooks/college/use-college-classes";
import { useCollegeGroups } from "@/lib/hooks/college/use-college-groups";
import { useCollegeTuitionBalancesList, useCollegeTuitionBalance, useBulkCreateCollegeTuitionBalances } from "@/lib/hooks/college/use-college-tuition-balances";
import type { CollegeTuitionFeeBalanceRead, CollegeTuitionFeeBalanceFullRead } from "@/lib/types/college";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

export function TuitionFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: StudentRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useCollegeClasses();
  const { data: groups = [] } = useCollegeGroups();
  const [balanceClass, setBalanceClass] = useState<string>(classes[0]?.class_id?.toString() || "");
  const [balanceGroup, setBalanceGroup] = useState<string>(groups[0]?.group_id?.toString() || "");
  const { toast } = useToast();
  const bulkCreateMutation = useBulkCreateCollegeTuitionBalances();

  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id.toString());
    }
  }, [classes, balanceClass]);

  useEffect(() => {
    if (!balanceGroup && groups.length > 0) {
      setBalanceGroup(groups[0].group_id.toString());
    }
  }, [groups, balanceGroup]);

  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const groupIdNum = balanceGroup ? parseInt(balanceGroup) : undefined;
  const { data: tuitionResp, refetch } = useCollegeTuitionBalancesList({ 
    class_id: classIdNum, 
    group_id: groupIdNum,
    page: 1, 
    pageSize: 50 
  });

  // Optional: when a row is clicked, fetch full details
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const { data: selectedBalance } = useCollegeTuitionBalance(selectedBalanceId);

  const handleBulkCreate = async () => {
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
  };

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

      <StudentFeeBalancesTable
        studentBalances={rows}
        onViewStudent={(student) => {
          setSelectedBalanceId(student.id);
          setDetailsOpen(true);
          onViewStudent(student);
        }}
        onExportCSV={onExportCSV}
        onBulkCreate={() => setBulkCreateOpen(true)}
        showHeader={false}
      />

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tuition Fee Balance Details</DialogTitle>
          </DialogHeader>
          {!selectedBalanceId ? (
            <div className="p-2 text-sm text-muted-foreground">No balance selected.</div>
          ) : !selectedBalance ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Enrollment ID:</span> {selectedBalance.enrollment_id}</div>
              <div><span className="text-muted-foreground">Student:</span> {selectedBalance.student_name} ({selectedBalance.admission_no})</div>
              <div><span className="text-muted-foreground">Roll No:</span> {selectedBalance.roll_number}</div>
              <div><span className="text-muted-foreground">Group:</span> {selectedBalance.group_name || '-'}</div>
              <div><span className="text-muted-foreground">Total Fee:</span> {selectedBalance.total_fee}</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="font-medium">Term 1</div>
                  <div className="text-muted-foreground">Amount: {selectedBalance.term1_amount}</div>
                  <div className="text-muted-foreground">Paid: {selectedBalance.term1_paid}</div>
                  <div className="text-muted-foreground">Balance: {selectedBalance.term1_balance}</div>
                </div>
                <div>
                  <div className="font-medium">Term 2</div>
                  <div className="text-muted-foreground">Amount: {selectedBalance.term2_amount}</div>
                  <div className="text-muted-foreground">Paid: {selectedBalance.term2_paid}</div>
                  <div className="text-muted-foreground">Balance: {selectedBalance.term2_balance}</div>
                </div>
                <div>
                  <div className="font-medium">Term 3</div>
                  <div className="text-muted-foreground">Amount: {selectedBalance.term3_amount}</div>
                  <div className="text-muted-foreground">Paid: {selectedBalance.term3_paid}</div>
                  <div className="text-muted-foreground">Balance: {selectedBalance.term3_balance}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog open={bulkCreateOpen} onOpenChange={setBulkCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Create Tuition Fee Balances</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will create tuition fee balances for all students in the selected class and group: <strong>{classes.find(c => c.class_id?.toString() === balanceClass)?.class_name}</strong> - <strong>{groups.find(g => g.group_id?.toString() === balanceGroup)?.group_name}</strong>
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
                onClick={() => setBulkCreateOpen(false)}
                disabled={bulkCreateMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkCreate}
                disabled={bulkCreateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {bulkCreateMutation.isPending ? 'Creating...' : 'Create Balances'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}


