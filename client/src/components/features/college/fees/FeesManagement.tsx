import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchoolFeesManagement } from "@/lib/hooks/school/use-school-fees-management";
import { TuitionFeeBalancesPanel } from "./tution-fee-balance/TuitionFeeBalancesPanel";
import { TuitionFeeStructuresPanel } from "./tution-fee-structure/TuitionFeeStructuresPanel";
import { TransportFeeBalancesPanel } from "./transport-fee-balance/TransportFeeBalancesPanel";
import { FeeStatsCards } from "./FeeStatsCards";
import { StudentFeeBalancesTable } from "./tution-fee-balance/StudentFeeBalancesTable";
import { PaymentCollectionForm } from "./fee-collection/PaymentCollectionForm";


export const FeesManagement = () => {
  const {
    totalOutstanding,
    totalIncome,
    collectionRate,
    activeTab,
    setActiveTab,
  } = useSchoolFeesManagement();

  const totalCollected = totalIncome;

  // Local state for collection flow
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Build rows for "Collect Fees" from tuition balances
  const { tuitionBalances } = useSchoolFeesManagement();
  const filteredStudentBalances = useMemo(() => {
    return (tuitionBalances || []).map((t: any) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, (t.total_fee || 0) - ((t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0)));
      const status: 'PAID' | 'PARTIAL' | 'OUTSTANDING' = outstanding <= 0 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'OUTSTANDING';
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
        books_paid: (t.book_paid || 0) > 0,
        term_1_paid: (t.term1_paid || 0) > 0,
        term_2_paid: (t.term2_paid || 0) > 0,
        term_3_paid: (t.term3_paid || 0) > 0,
        transport_paid: false,
        last_payment_date: new Date().toISOString(),
        status,
      };
    });
  }, [tuitionBalances]);

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsCollectOpen(true);
  };

  const exportBalancesCSV = () => {
    // Placeholder export; integrate real export as needed
    void filteredStudentBalances;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            Comprehensive fee structure management and payment tracking
          </p>
        </div>
      </motion.div>

      {/* Fee Overview Cards */}
      <FeeStatsCards
        totalOutstanding={totalOutstanding}
        totalCollected={totalCollected}
        collectionRate={collectionRate}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collect">Collect Fees</TabsTrigger>
          <TabsTrigger value="tuition-structures">Tuition Fee Structures</TabsTrigger>
          <TabsTrigger value="tuition-balances">Tuition Fee Balances</TabsTrigger>
          <TabsTrigger value="transport-balances">Transport Fee Balances</TabsTrigger>          
        </TabsList>

        <TabsContent value="collect" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Fee Collection</h2>
                <p className="text-muted-foreground">Collect payments from students</p>
              </div>
            </div>

            <StudentFeeBalancesTable
              studentBalances={filteredStudentBalances}
              onViewStudent={handleViewStudent}
              onExportCSV={exportBalancesCSV}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="tuition-balances" className="space-y-4">
          <TuitionFeeBalancesPanel onViewStudent={() => {}} onExportCSV={() => {}} />
        </TabsContent>

        <TabsContent value="transport-balances" className="space-y-4">
          <TransportFeeBalancesPanel onViewStudent={() => {}} onExportCSV={() => {}} />
        </TabsContent>

        <TabsContent value="tuition-structures" className="space-y-4">
          <TuitionFeeStructuresPanel />
        </TabsContent>

      </Tabs>

      <PaymentCollectionForm
        isOpen={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        selectedStudent={selectedStudent}
        onCollectPayment={() => {}}
      />

      {/* Payment collection dialog removed; feature not wired to current hooks */}
    </div>
  );
};

export default FeesManagement;
