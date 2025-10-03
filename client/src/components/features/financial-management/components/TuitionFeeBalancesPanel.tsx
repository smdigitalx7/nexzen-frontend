import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClasses } from "@/lib/hooks/useSchool";
import { useTuitionFeeBalances } from "@/lib/hooks/useFeeBalances";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

export function TuitionFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: StudentRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useClasses();
  const [balanceClass, setBalanceClass] = useState<string>(classes[0]?.class_id?.toString() || "");

  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id.toString());
    }
  }, [classes, balanceClass]);

  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: tuitionResp } = useTuitionFeeBalances({ class_id: classIdNum, page: 1, page_size: 50 });

  const rows = useMemo<StudentRow[]>(() => {
    return (tuitionResp?.data || []).map((t) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, (t.total_fee || 0) - ((t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0)));
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
        onViewStudent={onViewStudent as any}
        onExportCSV={onExportCSV}
        showHeader={false}
      />
    </motion.div>
  );
}


