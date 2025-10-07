import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClasses } from "@/lib/hooks/useSchool";
import { useTransportFeeBalances, useTransportFeeBalance } from "@/lib/hooks/useFeeBalances";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

export function TransportFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: StudentRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useClasses();
  const [balanceClass, setBalanceClass] = useState<string>(classes[0]?.class_id?.toString() || "");

  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id.toString());
    }
  }, [classes, balanceClass]);

  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: transportResp } = useTransportFeeBalances({ class_id: classIdNum, page: 1, page_size: 50 });
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: selectedBalance } = useTransportFeeBalance(selectedBalanceId);

  const rows = useMemo<StudentRow[]>(() => {
    return (transportResp?.data || []).map((t) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0);
      const outstanding = t.overall_balance_fee || 0;
      return {
        id: t.balance_id,
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transport Fee Balances</h2>
          <p className="text-muted-foreground">
            Track individual student transport fee payments and outstanding amounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={balanceClass} onValueChange={setBalanceClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Class" />
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
      </div>

      <StudentFeeBalancesTable
        studentBalances={rows}
        onViewStudent={(student) => {
          setSelectedBalanceId(student.id);
          setDetailsOpen(true);
          onViewStudent(student);
        }}
        onExportCSV={onExportCSV}
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
              <div><span className="text-muted-foreground">Balance ID:</span> {selectedBalance.balance_id}</div>
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
    </motion.div>
  );
}
