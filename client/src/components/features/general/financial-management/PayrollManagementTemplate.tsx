import { motion } from "framer-motion";
import { CreditCard, Plus, Download, X, Users, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabSwitcher } from "@/components/shared";
import { usePayrollManagement } from "@/lib/hooks/general/usePayrollManagement";
import { usePayrollDashboard } from "@/lib/hooks/general/usePayrollManagement";
import { formatCurrency } from "@/lib/utils";
import { PayrollStatsCards as OldPayrollStatsCards } from "./components/PayrollStatsCards";
import { PayrollStatsCards } from "./PayrollStatsCards";
import { EmployeePayrollTable } from "./components/EmployeePayrollTable";
import { SalaryCalculationForm } from "./components/SalaryCalculationForm";
import { BulkPayrollOperations } from "./components/BulkPayrollOperations";

export const PayrollManagementTemplate = () => {
  // Dashboard stats hook
  const { data: dashboardStats, isLoading: dashboardLoading } = usePayrollDashboard();
  
  const {
    // Data
    payrolls,
    employees,
    
    // Statistics
    totalPayrolls,
    totalAmount,
    paidAmount,
    pendingAmount,
    pendingCount,
    
    // UI State
    searchQuery,
    setSearchQuery,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedStatus,
    setSelectedStatus,
    showCreateDialog,
    setShowCreateDialog,
    showUpdateDialog,
    setShowUpdateDialog,
    showPayslipDialog,
    setShowPayslipDialog,
    selectedPayroll,
    setSelectedPayroll,
    activeTab,
    setActiveTab,
    
    // Loading states
    isLoading,
    
    // Handlers
    handleCreatePayroll,
    handleUpdatePayroll,
    handleUpdateStatus,
    handleViewPayslip,
    handleEditPayroll,
    handleFormSubmit,
    
    // Bulk operations
    handleBulkCreate,
    handleBulkExport,
    
    // Utilities
    getStatusColor,
    getStatusText,
    
    // User context
    user,
    currentBranch,
  } = usePayrollManagement();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Comprehensive payroll processing and employee salary management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CreditCard className="h-3 w-3" />
            {currentBranch?.branch_name || "Branch Name"}
          </Badge>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payroll
          </Button>
        </div>
      </motion.div>


      {/* Payroll Overview Cards */}
      {dashboardStats ? (
        <PayrollStatsCards
          stats={dashboardStats}
          loading={dashboardLoading}
        />
      ) : (
        <OldPayrollStatsCards
          totalPayrolls={totalPayrolls}
          totalAmount={totalAmount}
          paidAmount={paidAmount}
          pendingAmount={pendingAmount}
          pendingCount={pendingCount}
          currentBranch={currentBranch}
        />
      )}

      {/* Main Content Tabs */}
      <TabSwitcher
        tabs={[
          {
            value: "payrolls",
            label: "Payrolls",
            icon: Users,
            content: (
              <div className="space-y-4">
                {/* Filter Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-lg border shadow-sm"
                >
                  <div className="flex flex-wrap gap-4 items-end">
                    {/* Month Filter */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Month</label>
                      <select
                        value={selectedMonth || ""}
                        onChange={(e) => {
                          const month = e.target.value ? parseInt(e.target.value) : undefined;
                          setSelectedMonth(month);
                          // Clear year if month is cleared, or set current year if month is selected
                          if (!month) {
                            setSelectedYear(undefined);
                          } else if (!selectedYear) {
                            setSelectedYear(new Date().getFullYear());
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div className="flex-1 min-w-[100px]">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
                      <select
                        value={selectedYear || ""}
                        onChange={(e) => {
                          const year = e.target.value ? parseInt(e.target.value) : undefined;
                          setSelectedYear(year);
                          // Clear month if year is cleared, or set current month if year is selected
                          if (!year) {
                            setSelectedMonth(undefined);
                          } else if (!selectedMonth) {
                            setSelectedMonth(new Date().getMonth() + 1);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">All Years</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                      <select
                        value={selectedStatus || ""}
                        onChange={(e) => setSelectedStatus(e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="HOLD">On Hold</option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                      onClick={() => {
                        setSelectedMonth(undefined);
                        setSelectedYear(undefined);
                        setSelectedStatus(undefined);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      Clear Filters
                    </button>
                  </div>

                  {/* Help Text */}
                  <div className="mt-3 text-xs text-gray-500">
                    💡 <strong>Tip:</strong> Month and year filters work together. Selecting a month will automatically set the current year, and selecting a year will set the current month.
                  </div>

                  {/* Filter Summary */}
                  {(selectedMonth || selectedYear || selectedStatus) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Active filters:</span>
                      {selectedMonth && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Month: {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })}
                        </span>
                      )}
                      {selectedYear && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Year: {selectedYear}
                        </span>
                      )}
                      {selectedStatus && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Status: {selectedStatus}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>

                <EmployeePayrollTable
                  payrolls={payrolls}
                  isLoading={isLoading}
                  onEditPayroll={handleEditPayroll}
                  onViewPayslip={handleViewPayslip}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              </div>
            ),
          },
          {
            value: "bulk",
            label: "Bulk Operations",
            icon: Calculator,
            content: (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-2xl font-bold">Bulk Operations</h2>
                  <p className="text-muted-foreground">
                    Process multiple payrolls efficiently with bulk operations
                  </p>
                </div>
                
                <BulkPayrollOperations
                  employees={employees}
                  onBulkCreate={handleBulkCreate}
                  onBulkExport={handleBulkExport}
                  isLoading={isLoading}
                />
              </motion.div>
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        gridCols="grid-cols-2"
      />

      {/* Salary Calculation Form Dialog */}
      <SalaryCalculationForm
        isOpen={showCreateDialog || showUpdateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setShowUpdateDialog(false);
          setSelectedPayroll(null);
        }}
        onSubmit={handleFormSubmit}
        employees={employees}
        selectedPayroll={selectedPayroll}
      />

      {/* Payslip Dialog */}
      {showPayslipDialog && selectedPayroll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPayslipDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payslip - Employee {selectedPayroll.employee_id}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Add download functionality here
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPayslipDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{selectedPayroll.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pay Period</p>
                  <p className="font-medium">{new Date(selectedPayroll.payroll_month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gross Pay:</span>
                  <span>{formatCurrency(selectedPayroll.gross_pay)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span>{formatCurrency((selectedPayroll.lop || 0) + (selectedPayroll.advance_deduction || 0) + (selectedPayroll.other_deductions || 0))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Net Pay:</span>
                  <span>{formatCurrency(selectedPayroll.net_pay)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
