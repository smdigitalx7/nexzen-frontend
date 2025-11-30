import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Label } from "@/common/components/ui/label";
import { useSchoolClasses, useSchoolTransportBalancesList, useSchoolTransportBalance } from "@/features/school/hooks";
import { SchoolClassDropdown } from "@/common/components/shared/Dropdowns";
import type { SchoolTransportFeeBalanceListRead, SchoolTransportFeeBalanceFullRead } from "@/features/school/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/common/components/ui/dialog";
import StudentFeeBalancesTable from "../tution-fee-balance/StudentFeeBalancesTable";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

export function TransportFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: StudentRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useSchoolClasses();
  const [balanceClass, setBalanceClass] = useState<string>("");

  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      const firstClassId = classes[0]?.class_id;
      if (firstClassId) {
        setBalanceClass(firstClassId.toString());
      }
    }
  }, [classes, balanceClass]);

  const classIdNum = useMemo(() => 
    balanceClass ? parseInt(balanceClass) : undefined,
    [balanceClass]
  );
  const { data: transportResp, refetch } = useSchoolTransportBalancesList({ class_id: classIdNum, page: 1, page_size: 50 });
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: selectedBalance } = useSchoolTransportBalance(selectedBalanceId);

  const rows = useMemo<StudentRow[]>(() => {
    return (transportResp?.data || []).map((t: SchoolTransportFeeBalanceListRead) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0);
      const outstanding = t.overall_balance_fee || 0;
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
        onViewStudent={(student) => {
          setSelectedBalanceId(student.id);
          setDetailsOpen(true);
          onViewStudent(student);
        }}
        onExportCSV={onExportCSV}
        showHeader={false}
        />
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Transport Fee Balance Details</DialogTitle>
            <DialogDescription className="sr-only">View detailed transport fee balance information for the selected student</DialogDescription>
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
                  <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{selectedBalance.class_name || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Section:</span> <span className="font-medium">{selectedBalance.section_name || '-'}</span></div>
                  <div><span className="text-muted-foreground">Father Name:</span> <span className="font-medium">{selectedBalance.father_name || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Phone Number:</span> <span className="font-medium">{selectedBalance.phone_number || 'N/A'}</span></div>
                </div>
              </div>

              {/* Fee Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Transport Fee Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Actual Fee:</span> <span className="font-medium">₹{selectedBalance.actual_fee}</span></div>
                  <div><span className="text-muted-foreground">Concession Amount:</span> <span className="font-medium">₹{selectedBalance.concession_amount}</span></div>
                  <div><span className="text-muted-foreground">Total Fee:</span> <span className="font-medium text-lg">₹{selectedBalance.total_fee}</span></div>
                  <div><span className="text-muted-foreground">Overall Balance:</span> <span className="font-medium text-lg text-red-600">₹{selectedBalance.overall_balance_fee}</span></div>
                </div>
              </div>

              {/* Term-wise Payment Details */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Term-wise Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </motion.div>
  );
}
