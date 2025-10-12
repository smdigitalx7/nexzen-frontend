import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-classes";
import { useSchoolTuitionBalancesList, useSchoolTuitionBalance } from "@/lib/hooks/school/use-school-fee-balances";
import type { SchoolTuitionFeeBalanceRead } from "@/lib/types/school";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

export function TuitionFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: StudentRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useSchoolClasses();
  const [balanceClass, setBalanceClass] = useState<string>(classes[0]?.class_id?.toString() || "");

  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id.toString());
    }
  }, [classes, balanceClass]);

  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: tuitionResp } = useSchoolTuitionBalancesList({ class_id: classIdNum, page: 1, page_size: 50 });

  // Optional: when a row is clicked, fetch full details
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: selectedBalance } = useSchoolTuitionBalance(selectedBalanceId);

  const rows = useMemo<StudentRow[]>(() => {
    return (tuitionResp?.data || []).map((t: SchoolTuitionFeeBalanceRead) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, (t.total_fee || 0) - ((t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0)));
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tuition Fee Balances</h2>
          <p className="text-muted-foreground">
            Track individual student tuition fee payments and outstanding amounts
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
              <div><span className="text-muted-foreground">Section:</span> {selectedBalance.section_name || '-'}</div>
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
    </motion.div>
  );
}


