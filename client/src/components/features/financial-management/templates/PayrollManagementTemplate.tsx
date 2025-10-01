import { motion } from "framer-motion";
import { CreditCard, Plus, Download, Users, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayrollManagement } from "@/lib/hooks/usePayrollManagement";
import { 
  PayrollStatsCards, 
  EmployeePayrollTable, 
  SalaryCalculationForm 
} from "../components";

export const PayrollManagementTemplate = () => {
  const {
    // Data
    payrolls,
    employees,
    
    // Statistics
    totalPayrolls,
    totalAmount,
    paidAmount,
    pendingAmount,
    
    // UI State
    viewMode,
    setViewMode,
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
    
    // Utilities
    formatCurrency,
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

      {/* View Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="font-medium">View Mode:</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "branch" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("branch")}
          >
            <Building className="h-4 w-4 mr-2" />
            Branch Only
          </Button>
          <Button
            variant={viewMode === "institute" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("institute")}
          >
            <Users className="h-4 w-4 mr-2" />
            All Institute
          </Button>
        </div>
      </motion.div>

      {/* Payroll Overview Cards */}
      <PayrollStatsCards
        totalPayrolls={totalPayrolls}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        pendingAmount={pendingAmount}
        formatCurrency={formatCurrency}
        currentBranch={currentBranch}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="payrolls">Payrolls</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="payrolls" className="space-y-4">
          <EmployeePayrollTable
            payrolls={payrolls}
            isLoading={isLoading}
            onEditPayroll={handleEditPayroll}
            onViewPayslip={handleViewPayslip}
            onUpdateStatus={handleUpdateStatus}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-semibold">Payroll Reports</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-semibold">Payroll Settings</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Salary Calculation Form Dialog */}
      <SalaryCalculationForm
        isOpen={showCreateDialog || showUpdateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setShowUpdateDialog(false);
          setSelectedPayroll(null);
        }}
        onSubmit={selectedPayroll ? handleUpdatePayroll : handleCreatePayroll}
        employees={employees}
        selectedPayroll={selectedPayroll}
        formatCurrency={formatCurrency}
      />

      {/* Payslip Dialog */}
      {showPayslipDialog && selectedPayroll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payslip - {selectedPayroll.employee_name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPayslipDialog(false)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{selectedPayroll.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pay Period</p>
                  <p className="font-medium">{selectedPayroll.payroll_month}/{selectedPayroll.payroll_year}</p>
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
                  <span>{formatCurrency(selectedPayroll.net_salary)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
