import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CreditCard, Truck } from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { TabSwitcher } from "@/common/components/shared";
import type { TabItem } from "@/common/components/shared/TabSwitcher";
import { useCollegeFeesManagement, useCollegeTuitionFeeBalancesDashboard } from "@/features/college/hooks";
import { TuitionFeeBalancesPanel } from "./tution-fee-balance/TuitionFeeBalancesPanel";
import { TransportFeeBalancesPanel } from "./transport-fee-balance/TransportFeeBalancesPanel";
import { CollectFee, type StudentFeeDetails } from "./collect-fee/CollectFee";
import { CollegeTuitionFeeBalanceStatsCards } from "../tuition-fee-balances/CollegeTuitionFeeBalanceStatsCards";
import { useAuthStore } from "@/core/auth/authStore";
import { Badge } from "@/common/components/ui/badge";

export const FeesManagement = () => {
  const { currentBranch } = useAuthStore();
  
  // State for collect fee search
  const [searchResults, setSearchResults] = useState<StudentFeeDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="text-xs font-bold">₹</span>
            {currentBranch?.branch_name}
          </Badge>
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
            content: (
              <CollectFee 
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            ),
          },
          {
            value: "tuition-balances",
            label: "Tuition Fee Balances",
            icon: IndianRupeeIcon,
            content: <TuitionFeeBalancesPanel onViewStudent={() => {}} onExportCSV={() => {}} />,
          },
          {
            value: "transport-balances",
            label: "Transport Fee Balances",
            icon: Truck,
            content: <TransportFeeBalancesPanel onViewStudent={() => {}} onExportCSV={() => {}} />,
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

    </div>
  );
};

export default FeesManagement;
