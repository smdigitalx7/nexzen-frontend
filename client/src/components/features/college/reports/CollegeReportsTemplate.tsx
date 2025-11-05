import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { TrendingUp, PieChart } from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { TabSwitcher } from "@/components/shared";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import {
  useCollegeIncomeList,
  useCollegeIncomeDashboard,
  useCollegeIncome,
  useCollegeExpenditureList,
  useCollegeExpenditureDashboard,
} from "@/lib/hooks/college";
import { IncomeTable } from "./components/IncomeTable";
import { ExpenditureTable } from "./components/ExpenditureTable";
import { AddExpenditureDialog } from "./components/AddExpenditureDialog";
import { ViewIncomeDialog } from "./components/ViewIncomeDialog";
import { CollegeIncomeStatsCards } from "../income/CollegeIncomeStatsCards";
import { CollegeExpenditureStatsCards } from "../expenditure/CollegeExpenditureStatsCards";
import { CollegeFinanceReportButtons } from "./components/CollegeFinanceReportButtons";
import { CollegeFinancialAnalytics } from "./components/CollegeFinancialAnalytics";

export const CollegeReportsTemplate = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("income");
  const [showAddExpenditureDialog, setShowAddExpenditureDialog] =
    useState(false);
  const [showViewIncomeDialog, setShowViewIncomeDialog] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<number | null>(null);

  // Fetch real income and expenditure data
  const {
    data: incomeData = [],
    isLoading: incomeLoading,
    error: incomeError,
  } = useCollegeIncomeList();
  const {
    data: expenditureData = [],
    isLoading: expenditureLoading,
    error: expenditureError,
  } = useCollegeExpenditureList();

  // Define income params for the IncomeTable component
  const incomeParams = {};

  // Fetch dashboard data for financial stats
  const {
    data: incomeDashboard,
    error: incomeDashboardError,
    isLoading: incomeDashboardLoading,
  } = useCollegeIncomeDashboard();
  const {
    data: expenditureDashboard,
    error: expenditureDashboardError,
    isLoading: expenditureDashboardLoading,
  } = useCollegeExpenditureDashboard();

  // Fetch individual income data for view dialog
  const {
    data: selectedIncome,
    error: selectedIncomeError,
    isLoading: selectedIncomeLoading,
  } = useCollegeIncome(selectedIncomeId);

  // Handlers
  const handleViewIncome = (income: any) => {
    setSelectedIncomeId(income.income_id);
    setShowViewIncomeDialog(true);
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

      {/* Detailed Income Stats Cards - Only show when income tab is active */}
      {activeTab === "income" && incomeDashboard && (
        <CollegeIncomeStatsCards
          stats={incomeDashboard}
          loading={incomeDashboardLoading}
        />
      )}

      {/* Detailed Expenditure Stats Cards - Only show when expenditure tab is active */}
      {activeTab === "expenditure" && expenditureDashboard && (
        <CollegeExpenditureStatsCards
          stats={expenditureDashboard}
          loading={expenditureDashboardLoading}
        />
      )}

      {/* Tabs */}
      <TabSwitcher
        tabs={[
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
                expenditureData={expenditureData}
                onExportCSV={() => {}}
                onAddExpenditure={() => setShowAddExpenditureDialog(true)}
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
        ]}
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
