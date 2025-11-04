import { motion } from "framer-motion";
import React, { useMemo, memo, useCallback } from "react";
import { CreditCard, Building2, Truck } from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { TabSwitcher } from "@/components/shared";
import { useSchoolFeesManagement } from "@/lib/hooks/school/use-school-fees-management";
import { TuitionFeeBalancesPanel } from "./tution-fee-balance/TuitionFeeBalancesPanel";
import { TransportFeeBalancesPanel } from "./transport-fee-balance/TransportFeeBalancesPanel";
import { CollectFee } from "./collect-fee/CollectFee";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
  transportBalance: any;
}

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
const HeaderContent = memo(({ currentBranch }: { currentBranch: any }) => (
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
  
  // State for collect fee search persistence across tab switches
  const [collectFeeSearchResults, setCollectFeeSearchResults] = React.useState<any[]>([]);
  const [collectFeeSearchQuery, setCollectFeeSearchQuery] = React.useState("");

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
      <HeaderContent currentBranch={currentBranch} />

      {/* Main Content Tabs */}
      <TabSwitcher
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export const FeesManagement = FeesManagementComponent;
export default FeesManagementComponent;
