import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { DollarSign, TrendingUp } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { useSchoolIncomeList, useSchoolIncomeDashboard } from "@/lib/hooks/school/use-school-income-expenditure";
import { useSchoolExpenditureList, useSchoolExpenditureDashboard } from "@/lib/hooks/school/use-school-income-expenditure";
import { FinancialStatsCards } from "@/components/features/school/reports/components/FinancialStatsCards";
import { IncomeTable } from "@/components/features/school/reports/components/IncomeTable";
import { ExpenditureTable } from "@/components/features/school/reports/components/ExpenditureTable";
import { AddIncomeDialog } from "@/components/features/school/reports/components/AddIncomeDialog";
import { AddExpenditureDialog } from "@/components/features/school/reports/components/AddExpenditureDialog";
import { SchoolIncomeStatsCards } from "../income/SchoolIncomeStatsCards";
import { SchoolExpenditureStatsCards } from "../expenditure/SchoolExpenditureStatsCards";


export const SchoolReportsTemplate = () => {
  const [showAddIncomeDialog, setShowAddIncomeDialog] = useState(false);
  const [showAddExpenditureDialog, setShowAddExpenditureDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("income");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  // Fetch real income and expenditure data
  const { data: incomeData = [] } = useSchoolIncomeList();
  const { data: expenditureData = [] } = useSchoolExpenditureList();
  
  // Fetch dashboard data for financial stats
  const { data: incomeDashboard, error: incomeDashboardError, isLoading: incomeDashboardLoading } = useSchoolIncomeDashboard();
  const { data: expenditureDashboard, error: expenditureDashboardError, isLoading: expenditureDashboardLoading } = useSchoolExpenditureDashboard();

  // Calculate financial metrics from dashboard data
  const totalRevenue = incomeDashboard?.total_income_amount || 0;
  const totalExpenses = expenditureDashboard?.total_expenditure_amount || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  // Handlers
  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Exporting report...");
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
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <BarChart3 className="h-3 w-3" />
            School Financial Reports
          </Badge>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
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

      {/* Financial Overview Cards */}
      {incomeDashboardLoading || expenditureDashboardLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <FinancialStatsCards
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          profitMargin={profitMargin}
          formatCurrency={formatCurrency}
          formatCompactCurrency={formatCompactCurrency}
          incomeDashboard={incomeDashboard}
          expenditureDashboard={expenditureDashboard}
        />
      )}

      {/* Detailed Income Stats Cards - Only show when income tab is active */}
      {activeTab === 'income' && incomeDashboard && (
        <SchoolIncomeStatsCards
          stats={incomeDashboard}
          loading={incomeDashboardLoading}
        />
      )}

      {/* Detailed Expenditure Stats Cards - Only show when expenditure tab is active */}
      {activeTab === 'expenditure' && expenditureDashboard && (
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
            icon: DollarSign,
            content: (
              <IncomeTable
                incomeData={incomeData}
                onExportCSV={() => {}}
                onAddIncome={() => setShowAddIncomeDialog(true)}
              />
            ),
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
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        gridCols="grid-cols-2"
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
                  <SelectItem key="pdf" value="pdf">PDF Document</SelectItem>
                  <SelectItem key="excel" value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem key="csv" value="csv">CSV File</SelectItem>
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
                  <SelectItem key="3months" value="3months">Last 3 Months</SelectItem>
                  <SelectItem key="6months" value="6months">Last 6 Months</SelectItem>
                  <SelectItem key="1year" value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Income Dialog */}
      <AddIncomeDialog
        open={showAddIncomeDialog}
        onOpenChange={setShowAddIncomeDialog}
      />

      {/* Add Expenditure Dialog */}
      <AddExpenditureDialog
        open={showAddExpenditureDialog}
        onOpenChange={setShowAddExpenditureDialog}
      />
    </div>
  );
};
