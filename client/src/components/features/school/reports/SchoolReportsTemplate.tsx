import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, Eye, PieChart } from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { TabSwitcher } from "@/components/shared";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import { useSchoolIncomeDashboard, useSchoolExpenditureList, useSchoolExpenditureDashboard } from "@/lib/hooks/school";
import { IncomeSummaryTable } from "@/components/features/school/reports/components/IncomeSummaryTable";
import { ExpenditureTable } from "@/components/features/school/reports/components/ExpenditureTable";
import { AddExpenditureDialog } from "@/components/features/school/reports/components/AddExpenditureDialog";
import { SchoolIncomeStatsCards } from "../income/SchoolIncomeStatsCards";
import { SchoolExpenditureStatsCards } from "../expenditure/SchoolExpenditureStatsCards";
import { SchoolFinanceReportButtons } from "../reports/components/SchoolFinanceReportButtons";
import { SchoolFinancialAnalytics } from "./components/SchoolFinancialAnalytics";

export const SchoolReportsTemplate = () => {
  const { currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("income");
  const [showAddExpenditureDialog, setShowAddExpenditureDialog] =
    useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  // Fetch real expenditure data
  const { data: expenditureData = [] } = useSchoolExpenditureList();

  // Fetch dashboard data for financial stats
  const {
    data: incomeDashboard,
    error: incomeDashboardError,
    isLoading: incomeDashboardLoading,
  } = useSchoolIncomeDashboard();
  const {
    data: expenditureDashboard,
    error: expenditureDashboardError,
    isLoading: expenditureDashboardLoading,
  } = useSchoolExpenditureDashboard();

  // Handlers
  const handleExportReport = () => {
    // TODO: Implement export functionality
    if (import.meta.env.DEV) {
      console.log("Exporting report...");
    }
    setShowExportDialog(false);
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

      {/* Detailed Income Stats Cards - Only show when income tab is active */}
      {activeTab === "income" && incomeDashboard && (
        <SchoolIncomeStatsCards
          stats={incomeDashboard}
          loading={incomeDashboardLoading}
        />
      )}

      {/* Detailed Expenditure Stats Cards - Only show when expenditure tab is active */}
      {activeTab === "expenditure" && expenditureDashboard && (
        <SchoolExpenditureStatsCards
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
            content: <IncomeSummaryTable onExportCSV={() => {}} />,
          },
          {
            value: "expenditure",
            label: "Expenditure",
            icon: TrendingUp,
            content: (
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
              <SchoolFinancialAnalytics
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
