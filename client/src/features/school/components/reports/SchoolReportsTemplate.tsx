import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, TrendingUp, PieChart } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore } from "@/core/auth/authStore";
import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { TabSwitcher } from "@/common/components/shared";
import { useTabNavigation, useTabEnabled } from "@/common/hooks/use-tab-navigation";
import { useSchoolIncomeDashboard, useSchoolExpenditureList, useSchoolExpenditureDashboard } from "@/features/school/hooks";
import { IncomeSummaryTable } from "@/features/school/components/reports/components/IncomeSummaryTable";
import { ExpenditureTable } from "@/features/school/components/reports/components/ExpenditureTable";
import { AddExpenditureDialog } from "@/features/school/components/reports/components/AddExpenditureDialog";
import { SchoolIncomeStatsCards } from "../income/SchoolIncomeStatsCards";
import { SchoolExpenditureStatsCards } from "../expenditure/SchoolExpenditureStatsCards";
import { CollapsibleStatsSection } from "@/common/components/shared/dashboard";
import { SchoolFinanceReportButtons } from "../reports/components/SchoolFinanceReportButtons";
import { SchoolFinancialAnalytics } from "./components/SchoolFinancialAnalytics";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";

export const SchoolReportsTemplate = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("income");
  const [showAddExpenditureDialog, setShowAddExpenditureDialog] =
    useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  // ✅ OPTIMIZATION: Get enabled states for each tab - only fetch when tab is active
  const incomeTabEnabled = useTabEnabled("income", "income");
  const expenditureTabEnabled = useTabEnabled("expenditure", "income");
  const analyticsTabEnabled = useTabEnabled("analytics", "income");

  // ✅ OPTIMIZATION: Use static empty arrays to prevent trigger re-renders
  const EMPTY_ARRAY = useMemo(() => [], []);

  // ✅ OPTIMIZATION: Only fetch expenditure when tab is active; income is fetched inside IncomeSummaryTable
  // ✅ Expenditure is now fetched inside ExpenditureTable
  // const { data: expenditureData = EMPTY_ARRAY } = useSchoolExpenditureList(undefined, { enabled: expenditureTabEnabled });

  const {
    data: incomeDashboard,
    error: incomeDashboardError,
    isLoading: incomeDashboardLoading,
  } = useSchoolIncomeDashboard({ enabled: incomeTabEnabled || analyticsTabEnabled });
  
  const {
    data: expenditureDashboard,
    error: expenditureDashboardError,
    isLoading: expenditureDashboardLoading,
  } = useSchoolExpenditureDashboard({ enabled: expenditureTabEnabled || analyticsTabEnabled });

  // ✅ GLOBAL MODAL GUARDIAN: Ensure UI is unlocked when no modals are open
  useEffect(() => {
    const anyModalOpen = showAddExpenditureDialog || showExportDialog;

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
  }, [showAddExpenditureDialog, showExportDialog]);

  // Handlers
  const handleExportReport = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Exporting report...");
    }
    setShowExportDialog(false);
  }, []);

  const handleAddExpenditure = useCallback(() => {
    setShowAddExpenditureDialog(true);
  }, []);

  // ✅ STABILIZATION: Memoize tabs array to prevent infinite re-render loops in child components
  const schoolTabs = useMemo(() => [
    {
      value: "income",
      label: "Income",
      icon: IndianRupeeIcon,
      content: <IncomeSummaryTable onExportCSV={() => {}} enabled={incomeTabEnabled} />,
    },
    {
      value: "expenditure",
      label: "Expenditure",
      icon: TrendingUp,
      content: (
        <ExpenditureTable
          onExportCSV={() => {}}
          onAddExpenditure={handleAddExpenditure}
          enabled={expenditureTabEnabled}
        />
      ),
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: PieChart,
      content: (
        <SchoolFinancialAnalytics
          incomeDashboard={incomeDashboard}
          expenditureDashboard={expenditureDashboard}
          loading={incomeDashboardLoading || expenditureDashboardLoading}
        />
      ),
    },
  ], [incomeTabEnabled, handleAddExpenditure, incomeDashboard, expenditureDashboard, incomeDashboardLoading, expenditureDashboardLoading]);

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
            School Financial Reports
          </Badge>
          <SchoolFinanceReportButtons />
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
          <SchoolIncomeStatsCards
            stats={incomeDashboard}
            loading={incomeDashboardLoading}
          />
        </CollapsibleStatsSection>
      )}

      {/* Detailed Expenditure Stats Cards */}
      {activeTab === "expenditure" && expenditureDashboard && (
        <CollapsibleStatsSection label="Stats" defaultOpen>
          <SchoolExpenditureStatsCards
            stats={expenditureDashboard}
            loading={expenditureDashboardLoading}
          />
        </CollapsibleStatsSection>
      )}

      {/* Tabs */}
      <TabSwitcher
        tabs={schoolTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Financial Report</DialogTitle>
            <DialogDescription>
              Choose the format and date range for your financial report export.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="pdf" value="pdf">
                    PDF Document
                  </SelectItem>
                  <SelectItem key="excel" value="excel">
                    Excel Spreadsheet
                  </SelectItem>
                  <SelectItem key="csv" value="csv">
                    CSV File
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-date-range">Date Range</Label>
              <Select defaultValue="3months">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="3months" value="3months">
                    Last 3 Months
                  </SelectItem>
                  <SelectItem key="6months" value="6months">
                    Last 6 Months
                  </SelectItem>
                  <SelectItem key="1year" value="1year">
                    Last Year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expenditure Dialog */}
      <AddExpenditureDialog
        open={showAddExpenditureDialog}
        onOpenChange={setShowAddExpenditureDialog}
      />
    </div>
  );
};
