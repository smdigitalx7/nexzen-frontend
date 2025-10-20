import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolTransportBalancesList, useSchoolTransportBalance, useBulkCreateSchoolTransportBalances } from "@/lib/hooks/school/use-school-fee-balances";
import type { SchoolTransportFeeBalanceListRead } from "@/lib/types/school";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StudentFeeBalancesTable from "../tution-fee-balance/StudentFeeBalancesTable";
import { Plus } from "lucide-react";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

export function TransportFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: StudentRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useSchoolClasses();
  const [balanceClass, setBalanceClass] = useState<string>(classes[0]?.class_id?.toString() || "");
  const { toast } = useToast();
  const bulkCreateMutation = useBulkCreateSchoolTransportBalances();

  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id?.toString() || '');
    }
  }, [classes, balanceClass]);

  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: transportResp, refetch } = useSchoolTransportBalancesList({ class_id: classIdNum, page: 1, page_size: 50 });
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const { data: selectedBalance } = useSchoolTransportBalance(selectedBalanceId);

  const handleBulkCreate = async () => {
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
        description: "Transport fee balances created successfully for the selected class",
      });
      refetch();
      setBulkCreateOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transport fee balances",
        variant: "destructive",
      });
    }
  };

  const rows = useMemo<StudentRow[]>(() => {
    return (transportResp?.data || []).map((t: SchoolTransportFeeBalanceListRead) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0);
      const outstanding = t.overall_balance_fee || 0;
      return {
        id: t.enrollment_id,
        student_id: t.admission_no,
        student_name: t.student_name,
        class_name: t.section_name || "",
        academic_year: "",
        total_fee: t.total_fee,
        paid_amount: paidTotal,
        outstanding_amount: outstanding,
        admission_paid: true,
        books_paid: false,
        term_1_paid: t.term1_paid > 0,
        term_2_paid: t.term2_paid > 0,
        term_3_paid: false,
        transport_paid: paidTotal > 0,
        last_payment_date: new Date().toISOString(),
        status: outstanding <= 0 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'OUTSTANDING',
      };
    });
  }, [transportResp]);

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
            <DialogTitle>Transport Fee Balance Details</DialogTitle>
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
              <div><span className="text-muted-foreground">Section:</span> {selectedBalance.section_name || '-'}</div>
              <div><span className="text-muted-foreground">Total Fee:</span> {selectedBalance.total_fee}</div>
              <div className="grid grid-cols-2 gap-2">
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
              </div>
              <div><span className="text-muted-foreground">Overall Balance:</span> {selectedBalance.overall_balance_fee}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog open={bulkCreateOpen} onOpenChange={setBulkCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Create Transport Fee Balances</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will create transport fee balances for all students in the selected class: <strong>{classes.find(c => c.class_id?.toString() === balanceClass)?.class_name}</strong>
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
                    <p>This action will create transport fee balance records for all students in the selected class. This cannot be undone.</p>
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
