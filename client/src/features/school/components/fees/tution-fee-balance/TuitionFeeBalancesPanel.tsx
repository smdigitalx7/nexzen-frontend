import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Label } from "@/common/components/ui/label";
import { useSchoolClasses, useSchoolTuitionBalancesList, useSchoolTuitionBalance } from "@/features/school/hooks";
import { SchoolClassDropdown, SchoolSectionDropdown } from "@/common/components/shared/Dropdowns";
import type { SchoolTuitionFeeBalanceRead, SchoolTuitionFeeBalanceFullRead } from "@/features/school/types";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/common/components/ui/sheet";
import { Separator } from "@/common/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { User, BookOpen, Wallet, Calendar, FileText } from "lucide-react";
import { formatCurrency } from "@/common/utils";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

interface TuitionFeeBalancesPanelProps {
  onViewStudent: (s: StudentRow) => void;
  onExportCSV: () => void;
}

// Right-side sheet: Tuition Fee Balance Details
const DetailsSheet = memo(({
  isOpen,
  onClose,
  selectedBalanceId,
  selectedBalance,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedBalanceId: number | undefined;
  selectedBalance: SchoolTuitionFeeBalanceFullRead | undefined;
}) => (
  <Sheet open={isOpen} onOpenChange={onClose}>
    <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
      <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
        <SheetTitle>Tuition Fee Balance</SheetTitle>
        <SheetDescription className="sr-only">Detailed tuition fee balance for the selected student</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {selectedBalanceId == null ? (
          <p className="text-sm text-muted-foreground py-8">No student selected.</p>
        ) : selectedBalance == null ? (
          <p className="text-sm text-muted-foreground py-8">Loading...</p>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Student info */}
            <section>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <User className="h-4 w-4" />
                Student
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Admission No</span>
                  <span className="font-medium tabular-nums">{selectedBalance.admission_no}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Roll No</span>
                  <span className="font-medium">{selectedBalance.roll_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{selectedBalance.student_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Class / Section</span>
                  <span className="font-medium">{selectedBalance.class_name} / {selectedBalance.section_name || "–"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Father</span>
                  <span className="font-medium">{selectedBalance.father_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedBalance.phone_number || "–"}</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Fee summary */}
            <section>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Wallet className="h-4 w-4" />
                Fee Summary
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual Fee</span>
                  <span className="font-medium">{formatCurrency(selectedBalance.actual_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concession</span>
                  <span className="font-medium">{formatCurrency(selectedBalance.concession_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Fee</span>
                  <span>{formatCurrency(selectedBalance.total_fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-destructive">
                  <span>Overall Balance</span>
                  <span>{formatCurrency(selectedBalance.overall_balance_fee)}</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Book fee */}
            <section>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <BookOpen className="h-4 w-4" />
                Book Fee
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Book Fee</span>
                  <span className="font-medium">{formatCurrency(selectedBalance.book_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium">{formatCurrency(selectedBalance.book_paid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{selectedBalance.book_paid_status}</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Terms table */}
            <section>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <FileText className="h-4 w-4" />
                Term-wise
              </div>
              <div className="rounded-lg border bg-card overflow-hidden">
                <Table bordered>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Term</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Term 1</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedBalance.term1_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedBalance.term1_paid)}</TableCell>
                      <TableCell className="text-right text-destructive font-medium">{formatCurrency(selectedBalance.term1_balance)}</TableCell>
                      <TableCell>{selectedBalance.term1_status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Term 2</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedBalance.term2_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedBalance.term2_paid)}</TableCell>
                      <TableCell className="text-right text-destructive font-medium">{formatCurrency(selectedBalance.term2_balance)}</TableCell>
                      <TableCell>{selectedBalance.term2_status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Term 3</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedBalance.term3_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedBalance.term3_paid)}</TableCell>
                      <TableCell className="text-right text-destructive font-medium">{formatCurrency(selectedBalance.term3_balance)}</TableCell>
                      <TableCell>{selectedBalance.term3_status}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <Calendar className="h-4 w-4" />
                Record
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{new Date(selectedBalance.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{selectedBalance.updated_at ? new Date(selectedBalance.updated_at).toLocaleString() : "–"}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </SheetContent>
  </Sheet>
));

DetailsSheet.displayName = "DetailsSheet";

const TuitionFeeBalancesPanelComponent = ({ onViewStudent, onExportCSV }: TuitionFeeBalancesPanelProps) => {
  // State management
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [balanceSection, setBalanceSection] = useState<number | null>(null);
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Hooks
  const { data: classes = [] } = useSchoolClasses();

  // Memoized class ID for API calls
  const classIdNum = useMemo(() => 
    balanceClass ? parseInt(balanceClass) : undefined,
    [balanceClass]
  );

  // API hooks with memoized parameters (returns full response: { data, total_pages, current_page, page_size, total_count })
  const { data: tuitionResp, isLoading: tuitionLoading } = useSchoolTuitionBalancesList({ 
    class_id: classIdNum, 
    page, 
    page_size: pageSize,
    section_id: balanceSection ?? undefined,
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

  // Reset section when class changes
  useEffect(() => {
    setBalanceSection(null);
  }, [classIdNum]);

  // Reset to first page when class or section changes
  useEffect(() => {
    setPage(1);
  }, [classIdNum, balanceSection]);

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

  // Memoized data transformation (tuitionResp is full API response: { data, total_pages, current_page, ... })
  const rows = useMemo<StudentRow[]>(() => {
    const list = tuitionResp?.data ?? [];
    return (Array.isArray(list) ? list : []).map((t: SchoolTuitionFeeBalanceRead) => {
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
      {/* Class and Section Selection */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] max-w-xs">
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
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Label htmlFor="section-select">Section</Label>
            <SchoolSectionDropdown
              classId={classIdNum ?? 0}
              value={balanceSection}
              onChange={setBalanceSection}
              placeholder={classIdNum ? "All sections" : "Select class first"}
              emptyValue
              emptyValueLabel="All sections"
            />
          </div>
          {!classIdNum && (
            <p className="text-sm text-red-500 w-full">
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
          loading={tuitionLoading}
          pagination="server"
          totalCount={tuitionResp?.total_count ?? 0}
          currentPage={tuitionResp?.current_page ?? 1}
          pageSize={tuitionResp?.page_size ?? pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      {/* Details: right-side sheet */}
      <DetailsSheet
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
