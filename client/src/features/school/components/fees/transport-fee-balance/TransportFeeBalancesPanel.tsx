import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Label } from "@/common/components/ui/label";
import { useSchoolClasses, useSchoolTransportBalancesList, useSchoolTransportBalance, useUpdateSchoolTransportConcession } from "@/features/school/hooks";
import { ConcessionUpdateModal } from "@/common/components/shared/ConcessionUpdateModal";
import { Wallet, User, FileText, Calendar, Search } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { SchoolClassDropdown, SchoolSectionDropdown } from "@/common/components/shared/Dropdowns";
import type { SchoolTransportFeeBalanceListRead, SchoolTransportFeeBalanceFullRead } from "@/features/school/types";
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
import { formatCurrency } from "@/common/utils";
import StudentFeeBalancesTable from "../tution-fee-balance/StudentFeeBalancesTable";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

export function TransportFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: StudentRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useSchoolClasses();
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [balanceSection, setBalanceSection] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  // Reset section when class changes
  useEffect(() => {
    setBalanceSection(null);
  }, [classIdNum]);

  // Returns full API response: { data, total_pages, current_page, page_size, total_count }
  const { data: transportResp, isLoading } = useSchoolTransportBalancesList({ 
    class_id: classIdNum, 
    page, 
    page_size: pageSize,
    section_id: balanceSection ?? undefined,
    search: searchQuery,
  });
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | undefined>();

  // Reset to first page when class, section or search changes
  useEffect(() => {
    setPage(1);
  }, [classIdNum, balanceSection, searchQuery]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: selectedBalance } = useSchoolTransportBalance(selectedBalanceId);
  
  const [concessionModalOpen, setConcessionModalOpen] = useState(false);
  const updateConcessionMutation = useUpdateSchoolTransportConcession(selectedBalanceId || 0);

  const handleUpdateConcession = async (amount: number) => {
    if (!selectedBalanceId) return;
    await updateConcessionMutation.mutateAsync({ concession_amount: amount });
  };

  const rows = useMemo<StudentRow[]>(() => {
    const list = transportResp?.data ?? [];
    return (Array.isArray(list) ? list : []).map((t: SchoolTransportFeeBalanceListRead) => {
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
        concession_amount: 0,
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
          onViewStudent={(student) => {
            setSelectedBalanceId(student.id);
            setDetailsOpen(true);
            onViewStudent(student);
          }}
          onExportCSV={onExportCSV}
          showHeader={false}
          title="Transport Fee Balances"
          description="Track student transport fee payments and outstanding amounts"
          loading={isLoading}
          pagination="server"
          totalCount={transportResp?.total_count ?? 0}
          currentPage={transportResp?.current_page ?? 1}
          pageSize={transportResp?.page_size ?? pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
        />
      )}

      {/* Details: right-side sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
            <SheetTitle>Transport Fee Balance</SheetTitle>
            <SheetDescription className="sr-only">Detailed transport fee balance for the selected student</SheetDescription>
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
                      <span className="font-medium">{selectedBalance.class_name || "–"} / {selectedBalance.section_name || "–"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Father</span>
                      <span className="font-medium">{selectedBalance.father_name || "–"}</span>
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
                    Transport Fee Summary
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
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => setConcessionModalOpen(true)}
                      >
                        <Wallet className="h-4 w-4" />
                        Update Concession
                      </Button>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Term-wise table */}
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

      <ConcessionUpdateModal
        isOpen={concessionModalOpen}
        onClose={() => setConcessionModalOpen(false)}
        onUpdate={handleUpdateConcession}
        currentConcession={selectedBalance?.concession_amount || 0}
        studentName={selectedBalance?.student_name}
        title="Update Transport Concession"
      />
    </motion.div>
  );
}
