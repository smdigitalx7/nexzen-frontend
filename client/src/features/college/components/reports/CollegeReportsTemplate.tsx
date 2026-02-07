import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore } from "@/core/auth/authStore";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { TabSwitcher } from "@/common/components/shared";
import { useTabNavigation, useTabEnabled } from "@/common/hooks/use-tab-navigation";
import {
  useCollegeIncomeList,
  useCollegeIncomeDashboard,
  useCollegeIncome,
  useCollegeExpenditureList,
  useCollegeExpenditureDashboard,
} from "@/features/college/hooks";
import { IncomeTable } from "./components/IncomeTable";
import { ExpenditureTable } from "./components/ExpenditureTable";
import { AddExpenditureDialog } from "./components/AddExpenditureDialog";
import { ViewIncomeDialog } from "./components/ViewIncomeDialog";
import { CollegeIncomeStatsCards } from "../income/CollegeIncomeStatsCards";
import { CollegeExpenditureStatsCards } from "../expenditure/CollegeExpenditureStatsCards";
import { CollapsibleStatsSection } from "@/common/components/shared/dashboard";
import { CollegeFinanceReportButtons } from "./components/CollegeFinanceReportButtons";
import { CollegeFinancialAnalytics } from "./components/CollegeFinancialAnalytics";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";

export const CollegeReportsTemplate = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("income");
  const [showAddExpenditureDialog, setShowAddExpenditureDialog] =
    useState(false);
  const [showViewIncomeDialog, setShowViewIncomeDialog] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<number | null>(null);

  // ✅ OPTIMIZATION: Get enabled states for each tab
  const incomeTabEnabled = useTabEnabled("income", "income");
  const expenditureTabEnabled = useTabEnabled("expenditure", "income");
  const analyticsTabEnabled = useTabEnabled("analytics", "income");

  // ✅ OPTIMIZATION: Use static empty arrays
  const EMPTY_ARRAY = useMemo(() => [], []);

  // ✅ OPTIMIZATION: Only fetch income data when Income tab is active
  const {
    data: incomeData = EMPTY_ARRAY,
    isLoading: incomeLoading,
    error: incomeError,
  } = useCollegeIncomeList(undefined, { enabled: incomeTabEnabled });

  // ✅ OPTIMIZATION: Only fetch expenditure data when Expenditure tab is active
  const {
    data: expenditureData = EMPTY_ARRAY,
    isLoading: expenditureLoading,
    error: expenditureError,
  } = useCollegeExpenditureList(undefined, { enabled: expenditureTabEnabled });

  // ✅ OPTIMIZATION: Stabilize params
  const incomeParams = useMemo(() => ({}), []);

  // ✅ OPTIMIZATION: Only fetch dashboard data when respective tabs are active
  const {
    data: incomeDashboard,
    error: incomeDashboardError,
    isLoading: incomeDashboardLoading,
  } = useCollegeIncomeDashboard({ enabled: incomeTabEnabled || analyticsTabEnabled });
  
  const {
    data: expenditureDashboard,
    error: expenditureDashboardError,
    isLoading: expenditureDashboardLoading,
  } = useCollegeExpenditureDashboard({ enabled: expenditureTabEnabled || analyticsTabEnabled });

  // ✅ GLOBAL MODAL GUARDIAN: Ensure UI is unlocked when no modals are open
  useEffect(() => {
    const anyModalOpen = showAddExpenditureDialog || showViewIncomeDialog;

    if (!anyModalOpen) {
      const timer = setTimeout(() => {
        cleanupDialogState();
      }, 100);
      
      const longTimer = setTimeout(() => {
        cleanupDialogState();
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(longTimer);
      };
    }
  }, [showAddExpenditureDialog, showViewIncomeDialog]);

  // Fetch individual income data for view dialog
  const {
    data: selectedIncome,
    error: selectedIncomeError,
    isLoading: selectedIncomeLoading,
  } = useCollegeIncome(selectedIncomeId);

  // Handlers
  const handleViewIncome = useCallback((income: any) => {
    setSelectedIncomeId(income.income_id);
    setShowViewIncomeDialog(true);
  }, []);

  const handleAddExpenditure = useCallback(() => {
    setShowAddExpenditureDialog(true);
  }, []);

  // ✅ STABILIZATION: Memoize tabs array
  const collegeTabs = useMemo(() => [
    {
      value: "income",
      label: "Income",
      icon: IndianRupeeIcon,
      content: incomeLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : incomeError ? (
        <div className="text-center py-8">
          <p className="text-red-600">
            Error loading income data: {incomeError.message}
          </p>
        </div>
      ) : (
        <IncomeTable
          onViewIncome={handleViewIncome}
          params={incomeParams}
          enabled={incomeTabEnabled}
        />
      ),
    },
    {
      value: "expenditure",
      label: "Expenditure",
      icon: TrendingUp,
      content: expenditureLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : expenditureError ? (
        <div className="text-center py-8">
          <p className="text-red-600">
            Error loading expenditure data: {expenditureError.message}
          </p>
        </div>
      ) : (
        <ExpenditureTable
          expenditureData={expenditureData as any[]}
          onExportCSV={() => {}}
          onAddExpenditure={handleAddExpenditure}
        />
      ),
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: PieChart,
      content: (
        <CollegeFinancialAnalytics
          incomeDashboard={incomeDashboard}
          expenditureDashboard={expenditureDashboard}
          loading={incomeDashboardLoading || expenditureDashboardLoading}
        />
      ),
    },
  ], [
    handleViewIncome, 
    incomeParams, 
    incomeTabEnabled, 
    incomeLoading, 
    incomeError,
    expenditureLoading,
    expenditureError,
    expenditureData,
    handleAddExpenditure,
    incomeDashboard,
    expenditureDashboard,
    incomeDashboardLoading,
    expenditureDashboardLoading
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <BarChart3 className="h-3 w-3" />
            College Financial Reports
          </Badge>
          <CollegeFinanceReportButtons />
        </div>
      </motion.div>

      {/* API Error Messages */}
      {(incomeDashboardError || expenditureDashboardError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              ❌ Dashboard API error. Financial metrics may not be accurate.
            </div>
          </div>
        </div>
      )}

      {/* Detailed Income Stats Cards */}
      {activeTab === "income" && incomeDashboard && (
        <CollapsibleStatsSection label="Stats" defaultOpen>
          <CollegeIncomeStatsCards
            stats={incomeDashboard}
            loading={incomeDashboardLoading}
          />
        </CollapsibleStatsSection>
      )}

      {/* Detailed Expenditure Stats Cards */}
      {activeTab === "expenditure" && expenditureDashboard && (
        <CollapsibleStatsSection label="Stats" defaultOpen>
          <CollegeExpenditureStatsCards
            stats={expenditureDashboard}
            loading={expenditureDashboardLoading}
          />
        </CollapsibleStatsSection>
      )}

      {/* Tabs */}
      <TabSwitcher
        tabs={collegeTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Add Expenditure Dialog */}
      <AddExpenditureDialog
        open={showAddExpenditureDialog}
        onOpenChange={setShowAddExpenditureDialog}
      />

      {/* View Income Dialog */}
      <ViewIncomeDialog
        open={showViewIncomeDialog}
        onOpenChange={setShowViewIncomeDialog}
        income={selectedIncome || null}
        isLoading={selectedIncomeLoading}
        error={selectedIncomeError}
      />
    </div>
  );
};
