import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, Calendar, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useCollegeIncomeList, useCollegeIncomeDashboard, useCollegeIncome } from "@/lib/hooks/college/use-college-income";
import { useCollegeExpenditureList, useCollegeExpenditureDashboard } from "@/lib/hooks/college/use-college-expenditure";
import { FinancialStatsCards } from "./components/FinancialStatsCards";
import { IncomeTable } from "./components/IncomeTable";
import { ExpenditureTable } from "./components/ExpenditureTable";
import { AddIncomeDialog } from "./components/AddIncomeDialog";
import { AddExpenditureDialog } from "./components/AddExpenditureDialog";
import { ViewIncomeDialog } from "./components/ViewIncomeDialog";
import { CollegeIncomeStatsCards } from "../income/CollegeIncomeStatsCards";
import { CollegeExpenditureStatsCards } from "../expenditure/CollegeExpenditureStatsCards";

export const CollegeReportsTemplate = () => {
  const [showAddIncomeDialog, setShowAddIncomeDialog] = useState(false);
  const [showAddExpenditureDialog, setShowAddExpenditureDialog] = useState(false);
  const [showViewIncomeDialog, setShowViewIncomeDialog] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("income");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  // Filter states
  const [filters, setFilters] = useState({
    admission_no: "",
    purpose: "all",
    start_date: "",
    end_date: "",
  });

  // Fetch real income and expenditure data with filters
  const { data: incomeData = [], isLoading: incomeLoading, error: incomeError } = useCollegeIncomeList({
    admission_no: filters.admission_no || undefined,
    purpose: filters.purpose === "all" ? undefined : filters.purpose || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
  });
  const { data: expenditureData = [], isLoading: expenditureLoading, error: expenditureError } = useCollegeExpenditureList({
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
  });

  // Fetch dashboard data for financial stats
  const { data: incomeDashboard, error: incomeDashboardError, isLoading: incomeDashboardLoading } = useCollegeIncomeDashboard();
  const { data: expenditureDashboard, error: expenditureDashboardError, isLoading: expenditureDashboardLoading } = useCollegeExpenditureDashboard();

  // Fetch individual income data for view dialog
  const { data: selectedIncome, error: selectedIncomeError, isLoading: selectedIncomeLoading } = useCollegeIncome(selectedIncomeId);

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

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      admission_no: "",
      purpose: "all",
      start_date: "",
      end_date: "",
    });
  };

  // Handlers
  const handleViewIncome = (income: any) => {
    setSelectedIncomeId(income.income_id);
    setShowViewIncomeDialog(true);
  };

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
            College Financial Reports
          </Badge>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg border shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="admission_no">Admission Number</Label>
            <Input
              id="admission_no"
              placeholder="Enter admission number"
              value={filters.admission_no}
              onChange={(e) => handleFilterChange("admission_no", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {incomeData.length} income records
            {filters.admission_no && ` for admission: ${filters.admission_no}`}
            {filters.start_date && ` from: ${filters.start_date}`}
            {filters.end_date && ` to: ${filters.end_date}`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </motion.div>

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
        <CollegeIncomeStatsCards
          stats={incomeDashboard}
          loading={incomeDashboardLoading}
        />
      )}

      {/* Detailed Expenditure Stats Cards - Only show when expenditure tab is active */}
      {activeTab === 'expenditure' && expenditureDashboard && (
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
            icon: DollarSign,
            content: incomeLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : incomeError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading income data: {incomeError.message}</p>
              </div>
            ) : (
              <IncomeTable
                incomeData={incomeData}
                onViewIncome={handleViewIncome}
                onExportCSV={() => {}}
                onAddIncome={() => setShowAddIncomeDialog(true)}
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
                <p className="text-red-600">Error loading expenditure data: {expenditureError.message}</p>
              </div>
            ) : (
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
