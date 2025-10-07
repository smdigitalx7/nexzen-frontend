import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, Filter, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialReports } from "@/lib/hooks/useFinancialReports";
import { useIncome, useExpenditure } from "@/lib/hooks/useIncomeExpenditure";
import { 
  FinancialStatsCards, 
  RevenueChart, 
  ExpenseChart, 
  ProfitLossTable 
} from "../components";
import { IncomeTable } from "../components/IncomeTable";
import { ExpenditureTable } from "../components/ExpenditureTable";
import { AddIncomeDialog } from "../components/AddIncomeDialog";
import { AddExpenditureDialog } from "../components/AddExpenditureDialog";

export const FinancialReportsTemplate = () => {
  const [showAddIncomeDialog, setShowAddIncomeDialog] = useState(false);
  const [showAddExpenditureDialog, setShowAddExpenditureDialog] = useState(false);

  const {
    // Data
    incomeData: mockIncomeData,
    expenseData,
    profitLossData,
    expenseBreakdown,
    revenueTrends,
    
    // Computed values
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    
    // UI State
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    selectedBranch,
    setSelectedBranch,
    showExportDialog,
    setShowExportDialog,
    exportFormat,
    setExportFormat,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    
    // Handlers
    handleExportReport,
    handleDateRangeChange,
    handleBranchChange,
    handleCategoryFilter,
    handleSearch,
    
    // Utilities
    formatCurrency,
    formatCompactCurrency,
    
    // User context
    user,
    currentBranch,
  } = useFinancialReports();

  // Fetch real income and expenditure data
  const { data: incomeData = [] } = useIncome();
  const { data: expenditureData = [] } = useExpenditure();

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
            {currentBranch?.branch_name || "Branch Name"}
          </Badge>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Label htmlFor="date-range">Date Range</Label>
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label htmlFor="branch">Branch</Label>
          <Select value={selectedBranch} onValueChange={handleBranchChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="main">Main Branch</SelectItem>
              <SelectItem value="north">North Campus</SelectItem>
              <SelectItem value="south">South Campus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-48"
          />
        </div>
      </motion.div>

      {/* Financial Overview Cards */}
      <FinancialStatsCards
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        profitMargin={profitMargin}
        formatCurrency={formatCurrency}
        formatCompactCurrency={formatCompactCurrency}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenditure">Expenditure</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
          <TabsTrigger value="profitloss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-6">
          <IncomeTable
            incomeData={incomeData}
            onExportCSV={() => {}}
            onAddIncome={() => setShowAddIncomeDialog(true)}
          />
        </TabsContent>

        <TabsContent value="expenditure" className="space-y-6">
          <ExpenditureTable
            expenditureData={expenditureData}
            onExportCSV={() => {}}
            onAddExpenditure={() => setShowAddExpenditureDialog(true)}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={mockIncomeData} formatCurrency={formatCurrency} />
            <ExpenseChart data={expenseData} formatCurrency={formatCurrency} />
          </div>
          <ProfitLossTable
            profitLossData={profitLossData}
            expenseBreakdown={expenseBreakdown}
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueChart data={mockIncomeData} formatCurrency={formatCurrency} />
          <ProfitLossTable
            profitLossData={profitLossData}
            expenseBreakdown={[]}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <ExpenseChart data={expenseData} formatCurrency={formatCurrency} />
          <ProfitLossTable
            profitLossData={[]}
            expenseBreakdown={expenseBreakdown}
          />
        </TabsContent>

        <TabsContent value="profitloss" className="space-y-6">
          <ProfitLossTable
            profitLossData={profitLossData}
            expenseBreakdown={expenseBreakdown}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">Trends Analysis</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

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
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
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
