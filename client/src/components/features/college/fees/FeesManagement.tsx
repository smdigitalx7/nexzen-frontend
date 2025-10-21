import { motion } from "framer-motion";
import { useMemo } from "react";
import { CreditCard, DollarSign } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { useCollegeFeesManagement } from "@/lib/hooks/college/use-college-fees-management";
import { useCollegeTuitionFeeBalancesDashboard } from "@/lib/hooks/college/use-college-tuition-balances";
import { TuitionFeeBalancesPanel } from "./tution-fee-balance/TuitionFeeBalancesPanel";
import { CollectFee } from "./collect-fee/CollectFee";
import { CollegeTuitionFeeBalanceStatsCards } from "../tuition-fee-balances/CollegeTuitionFeeBalanceStatsCards";

export const FeesManagement = () => {
  // Dashboard stats hooks
  const { data: tuitionDashboardStats, isLoading: tuitionDashboardLoading } = useCollegeTuitionFeeBalancesDashboard();
  
  const {
    activeTab,
    setActiveTab,
    tuitionBalances,
  } = useCollegeFeesManagement();


  // Build rows for "Collect Fees" from tuition balances
  const filteredStudentBalances = useMemo(() => {
    return (tuitionBalances || []).map((t: any) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, (t.total_fee || 0) - ((t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0)));
      const status: 'PAID' | 'PARTIAL' | 'OUTSTANDING' = outstanding <= 0 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'OUTSTANDING';
      return {
        id: t.enrollment_id,
        student_id: t.admission_no,
        student_name: t.student_name,
        class_name: t.class_name || "",
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

      {/* College Tuition Fee Balance Dashboard Stats - Only show when tuition-balances tab is active */}
      {activeTab === 'tuition-balances' && tuitionDashboardStats && (
        <CollegeTuitionFeeBalanceStatsCards
          stats={tuitionDashboardStats}
          loading={tuitionDashboardLoading}
        />
      )}

      {/* Main Content Tabs */}
      <TabSwitcher
        tabs={[
          {
            value: "collect",
            label: "Collect Fees",
            icon: CreditCard,
            content: <CollectFee />,
          },
          {
            value: "tuition-balances",
            label: "Tuition Fee Balances",
            icon: DollarSign,
            content: <TuitionFeeBalancesPanel onViewStudent={() => {}} onExportCSV={() => {}} />,
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

    </div>
  );
};

export default FeesManagement;
