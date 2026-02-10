import { motion } from "framer-motion";
import React, { useMemo, memo, useCallback, useEffect, useState } from "react";
import { CreditCard, Building2, Truck, PanelRightClose, PanelRightOpen } from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { TabSwitcher } from "@/common/components/shared";
import { useSchoolFeesManagement, useSchoolTuitionBalancesDashboard, useSchoolTransportBalancesDashboard } from "@/features/school/hooks";
import { useTabEnabled } from "@/common/hooks/use-tab-navigation";
import { TuitionFeeBalancesPanel } from "./tution-fee-balance/TuitionFeeBalancesPanel";
import { TransportFeeBalancesPanel } from "./transport-fee-balance/TransportFeeBalancesPanel";
import { SchoolTuitionFeeBalanceStatsCards } from "./tution-fee-balance/SchoolTuitionFeeBalanceStatsCards";
import { SchoolTransportFeeBalanceStatsCards } from "./transport-fee-balance/SchoolTransportFeeBalanceStatsCards";
import { CollapsibleStatsSection } from "@/common/components/shared/dashboard";
import { CollectFee } from "./collect-fee/CollectFee";
import type { StudentFeeDetails } from "./collect-fee/CollectFee";
import { useAuthStore } from "@/core/auth/authStore";
import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/utils";

// Wrapper component to pass state to CollectFee
const CollectFeeWithState = memo(({ 
  searchResults, 
  setSearchResults, 
  searchQuery, 
  setSearchQuery 
}: { 
  searchResults: StudentFeeDetails[];
  setSearchResults: React.Dispatch<React.SetStateAction<StudentFeeDetails[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <CollectFee 
      searchResults={searchResults}
      setSearchResults={setSearchResults}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
});

CollectFeeWithState.displayName = "CollectFeeWithState";

// Memoized header content component
const HeaderContent = memo(({
  currentBranch,
  statsOpen,
  onToggleStats,
}: {
  currentBranch: any;
  statsOpen: boolean;
  onToggleStats: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between gap-4 flex-wrap"
  >
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
      <p className="text-muted-foreground">
        Comprehensive fee structure management and payment tracking
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleStats}
        aria-expanded={statsOpen}
        aria-label={statsOpen ? "Hide stats" : "Show stats"}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
          "transition-colors rounded px-2 py-1 -mx-2 -my-1 hover:bg-muted/50"
        )}
      >
        {statsOpen ? (
          <>
            <PanelRightClose className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Hide stats</span>
          </>
        ) : (
          <>
            <PanelRightOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Show stats</span>
          </>
        )}
      </button>
      <Badge variant="outline" className="gap-1">
        {currentBranch?.branch_type === "SCHOOL" ? (
          <span className="text-xs font-bold">₹</span>
        ) : (
          <Building2 className="h-3 w-3" />
        )}
        {currentBranch?.branch_name}
      </Badge>
    </div>
  </motion.div>
));

HeaderContent.displayName = "HeaderContent";

const FeesManagementComponent = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab, tuitionBalances } = useSchoolFeesManagement();
  
  // ✅ OPTIMIZATION: Check if tabs are active before fetching dashboard stats
  const isTuitionTabActive = useTabEnabled("tuition-balances", "collect");
  const isTransportTabActive = useTabEnabled("transport-balances", "collect");
  
  // ✅ OPTIMIZATION: Dashboard stats hooks - only fetch when respective tab is active
  const { data: tuitionDashboardStats, isLoading: tuitionDashboardLoading } = useSchoolTuitionBalancesDashboard({
    enabled: isTuitionTabActive,
  });
  const { data: transportDashboardStats, isLoading: transportDashboardLoading } = useSchoolTransportBalancesDashboard({
    enabled: isTransportTabActive,
  });
  
  // State for collect fee search persistence across tab switches
  const [collectFeeSearchResults, setCollectFeeSearchResults] = useState<any[]>([]);
  const [collectFeeSearchQuery, setCollectFeeSearchQuery] = useState("");

  // Stats section visibility (header button + right-edge tag both control this)
  const [statsOpen, setStatsOpen] = useState(true);

  // ✅ RESET: Reset search state when branch changes or tab changes
  useEffect(() => {
    setCollectFeeSearchResults([]);
    setCollectFeeSearchQuery("");
  }, [currentBranch?.branch_id, activeTab]);

  // Memoized data transformation
  const filteredStudentBalances = useMemo(() => {
    return (tuitionBalances || []).map((t: any) => {
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, (t.total_fee || 0) - ((t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0)));
      const status: 'PAID' | 'PARTIAL' | 'OUTSTANDING' = outstanding <= 0 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'OUTSTANDING';
      return {
        id: t.enrollment_id,
        student_id: t.admission_no,
        student_name: t.student_name,
        class_name: t.section_name || "Unknown",
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

  // Memoized handlers
  const handleViewStudent = useCallback(() => {
    // Placeholder handler
  }, []);

  const handleExportCSV = useCallback(() => {
    // Placeholder export; integrate real export as needed
    void filteredStudentBalances;
  }, [filteredStudentBalances]);

  // Memoized tabs configuration
  const tabsConfig = useMemo(() => [
    {
      value: "collect",
      label: "Collect Fees",
      icon: CreditCard,
      content: (
        <CollectFeeWithState 
          searchResults={collectFeeSearchResults}
          setSearchResults={setCollectFeeSearchResults}
          searchQuery={collectFeeSearchQuery}
          setSearchQuery={setCollectFeeSearchQuery}
        />
      ),
    },
    {
      value: "tuition-balances",
      label: "Tuition Fee Balances",
      icon: IndianRupeeIcon,
      content: (
        <TuitionFeeBalancesPanel 
          onViewStudent={handleViewStudent} 
          onExportCSV={handleExportCSV} 
        />
      ),
    },
    {
      value: "transport-balances",
      label: "Transport Fee Balances",
      icon: Truck,
      content: (
        <TransportFeeBalancesPanel 
          onViewStudent={handleViewStudent} 
          onExportCSV={handleExportCSV} 
        />
      ),
    },
  ], [handleViewStudent, handleExportCSV, collectFeeSearchResults, collectFeeSearchQuery]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <HeaderContent
        currentBranch={currentBranch}
        statsOpen={statsOpen}
        onToggleStats={() => setStatsOpen((prev) => !prev)}
      />

      {/* School Tuition Fee Balance Dashboard Stats - Only mount when tab active and stats open (avoids extra gap when hidden) */}
      {statsOpen && activeTab === 'tuition-balances' && tuitionDashboardStats && (
        <CollapsibleStatsSection
          label="Stats"
          open={statsOpen}
          onOpenChange={setStatsOpen}
          showTag={false}
        >
          <SchoolTuitionFeeBalanceStatsCards
            stats={tuitionDashboardStats}
            loading={tuitionDashboardLoading}
          />
        </CollapsibleStatsSection>
      )}

      {/* School Transport Fee Balance Dashboard Stats - Only mount when tab active and stats open (avoids extra gap when hidden) */}
      {statsOpen && activeTab === 'transport-balances' && transportDashboardStats && (
        <CollapsibleStatsSection
          label="Stats"
          open={statsOpen}
          onOpenChange={setStatsOpen}
          showTag={false}
        >
          <SchoolTransportFeeBalanceStatsCards
            stats={transportDashboardStats}
            loading={transportDashboardLoading}
          />
        </CollapsibleStatsSection>
      )}

      {/* Main Content Tabs */}
      <TabSwitcher
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab, { clearOtherParams: true })}
      />
    </div>
  );
};

export const FeesManagement = FeesManagementComponent;
export default FeesManagementComponent;
