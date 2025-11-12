import { motion } from "framer-motion";
import { CreditCard, Plus, Download, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TabSwitcher, MonthYearFilter } from "@/components/shared";
import { usePayrollManagement, usePayrollDashboard } from "@/lib/hooks/general/usePayrollManagement";
import { formatCurrency } from "@/lib/utils";
import { PayrollStatsCards as OldPayrollStatsCards } from "./components/PayrollStatsCards";
import { PayrollStatsCards } from "./PayrollStatsCards";
import { EmployeePayrollTable } from "./components/EmployeePayrollTable";
import { SalaryCalculationForm } from "./components/SalaryCalculationForm";
import { EditPayrollForm } from "./components/EditPayrollForm";
import { memo, useMemo, useCallback } from "react";
import type { Branch } from "@/store/authStore";
import type { EmployeeRead } from "@/lib/types/general/employees";
import type { PayrollRead } from "@/lib/types/general/payrolls";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number;
  payroll_year: number;
}

// Memoized header component
const PayrollHeader = memo(({ 
  currentBranch
}: { 
  currentBranch: Branch | null;
}) => (
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
    </div>
  </motion.div>
));

PayrollHeader.displayName = "PayrollHeader";


// Memoized employee info section component
const EmployeeInfoSection = memo(({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => (
  <div className="bg-slate-50 p-4 rounded-lg">
    <h3 className="font-semibold text-lg mb-3">Employee Information</h3>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground">Employee Name:</span> 
        <span className="font-medium">{detailedPayroll.employee_name}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Employee Type:</span> 
        <span className="font-medium">{detailedPayroll.employee_type}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Pay Period:</span> 
        <span className="font-medium">
          {new Date(detailedPayroll.payroll_year, detailedPayroll.payroll_month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </span>
      </div>
    </div>
  </div>
));

EmployeeInfoSection.displayName = "EmployeeInfoSection";

// Memoized payroll summary section component
const PayrollSummarySection = memo(({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h3 className="font-semibold text-lg mb-3">Payroll Summary</h3>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground">Gross Pay:</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.gross_pay)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Previous Balance:</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.previous_balance)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Total Deductions:</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.total_deductions)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Net Pay:</span> 
        <span className="text-lg font-bold">{formatCurrency(detailedPayroll.net_pay)}</span>
      </div>
    </div>
  </div>
));

PayrollSummarySection.displayName = "PayrollSummarySection";

// Memoized deductions breakdown section component
const DeductionsBreakdownSection = memo(({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => (
  <div className="bg-red-50 p-4 rounded-lg">
    <h3 className="font-semibold text-lg mb-3">Deductions Breakdown</h3>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground">Loss of Pay (LOP):</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.lop)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Advance Deduction:</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.advance_deduction)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Other Deductions:</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.other_deductions)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Total Deductions:</span> 
        <span className="font-bold">{formatCurrency(detailedPayroll.total_deductions)}</span>
      </div>
    </div>
  </div>
));

DeductionsBreakdownSection.displayName = "DeductionsBreakdownSection";

// Memoized payment info section component
const PaymentInfoSection = memo(({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => (
  <div className="bg-green-50 p-4 rounded-lg">
    <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground">Paid Amount:</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.paid_amount)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Carryover Balance:</span> 
        <span className="font-medium">{formatCurrency(detailedPayroll.carryover_balance)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Payment Method:</span> 
        <span className="font-medium">{detailedPayroll.payment_method}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Status:</span> 
        <span className="font-medium">
          <Badge variant={detailedPayroll.status === 'PAID' ? 'default' : detailedPayroll.status === 'PENDING' ? 'secondary' : 'destructive'}>
            {detailedPayroll.status}
          </Badge>
        </span>
      </div>
    </div>
    {detailedPayroll.payment_notes && (
      <div className="mt-3">
        <span className="text-muted-foreground">Payment Notes:</span>
        <p className="font-medium mt-1">{detailedPayroll.payment_notes}</p>
      </div>
    )}
  </div>
));

PaymentInfoSection.displayName = "PaymentInfoSection";

// Memoized record info section component
const RecordInfoSection = memo(({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="font-semibold text-lg mb-3">Record Information</h3>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground">Generated At:</span> 
        <span className="font-medium">{new Date(detailedPayroll.generated_at).toLocaleString()}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Updated At:</span> 
        <span className="font-medium">{detailedPayroll.updated_at ? new Date(detailedPayroll.updated_at).toLocaleString() : 'Never'}</span>
      </div>
    </div>
  </div>
));

RecordInfoSection.displayName = "RecordInfoSection";

// Memoized action buttons component
const ActionButtons = memo(({ 
  onDownloadPayslip
}: { 
  onDownloadPayslip: () => void;
}) => (
  <div className="flex justify-end gap-2 pt-4 border-t">
    <Button variant="outline" onClick={onDownloadPayslip}>
      <Download className="h-4 w-4 mr-2" />
      Download Payslip
    </Button>
  </div>
));

ActionButtons.displayName = "ActionButtons";

// Interface for detailed payroll response that includes employee information
interface DetailedPayrollRead {
  payroll_id: number;
  employee_id: number;
  employee_name: string;
  employee_type: string;
  payroll_month: number;
  payroll_year: number;
  previous_balance: number;
  gross_pay: number;
  lop: number;
  advance_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  paid_amount: number;
  carryover_balance: number;
  payment_method?: string;
  payment_notes?: string;
  status: string;
  generated_at: string;
  updated_at?: string;
  generated_by?: number | null;
  updated_by?: number | null;
}

export const PayrollManagementTemplateComponent = () => {
  // Dashboard stats hook
  const { data: dashboardStats, isLoading: dashboardLoading } = usePayrollDashboard();
  
  const managementData = usePayrollManagement();
  
  // Extract and type-safe destructure with proper type guards, wrapped in useMemo for stability
  const payrolls: PayrollWithEmployee[] = useMemo(() => {
    return Array.isArray(managementData.payrolls) 
      ? (managementData.payrolls as PayrollWithEmployee[])
      : [];
  }, [managementData.payrolls]);
  
  const employees: EmployeeRead[] = useMemo(() => {
    if (!Array.isArray(managementData.employees)) {
      return [];
    }
    // Type guard: ensure all items are EmployeeRead
    return managementData.employees.filter((emp): emp is EmployeeRead => 
      typeof emp === 'object' && emp !== null && 'employee_id' in emp
    );
  }, [managementData.employees]);
  
  // Statistics are computed numbers from the hook, ensure type safety
  const totalPayrolls = typeof managementData.totalPayrolls === 'number' 
    ? managementData.totalPayrolls 
    : 0;
  const totalAmount = typeof managementData.totalAmount === 'number' 
    ? managementData.totalAmount 
    : 0;
  const paidAmount = typeof managementData.paidAmount === 'number' 
    ? managementData.paidAmount 
    : 0;
  const pendingAmount = typeof managementData.pendingAmount === 'number' 
    ? managementData.pendingAmount 
    : 0;
  
  const {
    // UI State
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
    selectedPayrollId: _selectedPayrollId,
    setSelectedPayrollId,
    detailedPayroll,
    detailedPayrollLoading,
    activeTab,
    setActiveTab,
    
    // Loading states
    isLoading,
    
    // Handlers
    handleUpdateStatus,
    handleViewPayslip,
    handleEditPayroll,
    handleFormSubmit,
    
    // Utilities
    getStatusColor,
    getStatusText,
    
    // User context
    currentBranch,
  } = managementData;

  // Memoized handlers
  const handleCreatePayrollClick = useCallback(() => {
    setShowCreateDialog(true);
  }, [setShowCreateDialog]);

  const handleCloseDialogs = useCallback(() => {
    setShowCreateDialog(false);
    setShowUpdateDialog(false);
    setSelectedPayroll(null);
  }, [setShowCreateDialog, setShowUpdateDialog, setSelectedPayroll]);

  const handleClosePayslipDialog = useCallback((open: boolean) => {
    setShowPayslipDialog(open);
    if (!open) {
      setSelectedPayrollId(null);
      setSelectedPayroll(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShowPayslipDialog, setSelectedPayroll]);

  const handleDownloadPayslip = useCallback(() => {
    // Download payslip functionality to be implemented
  }, []);

  // Memoized tabs configuration
  const tabsConfig = useMemo(() => [
    {
      value: "payrolls",
      label: "Payrolls",
      icon: Users,
      content: (
        <div className="space-y-4">
          {/* Month/Year Filter */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground whitespace-nowrap">Filter by month and year:</p>
              <MonthYearFilter
                month={selectedMonth}
                year={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                monthId="payroll-month"
                yearId="payroll-year"
                showLabels={false}
                className="flex-1 items-center"
              />
              <Button
                onClick={handleCreatePayrollClick}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Preview Payroll
              </Button>
            </div>
          </div>
          
          <EmployeePayrollTable
            payrolls={payrolls}
            isLoading={isLoading}
            onEditPayroll={handleEditPayroll}
            onViewPayslip={handleViewPayslip}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        </div>
      ),
    },
  ], [
    payrolls,
    isLoading,
    handleEditPayroll,
    handleViewPayslip,
    handleUpdateStatus,
    getStatusColor,
    getStatusText,
    handleCreatePayrollClick,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  ]);

  // Memoized stats cards
  const statsCards = useMemo(() => {
    if (dashboardStats) {
      return (
        <PayrollStatsCards
          stats={dashboardStats}
          loading={dashboardLoading}
        />
      );
    }
    return (
      <OldPayrollStatsCards
        totalPayrolls={totalPayrolls}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        pendingAmount={pendingAmount}
        currentBranch={currentBranch}
      />
    );
  }, [
    dashboardStats,
    dashboardLoading,
    totalPayrolls,
    totalAmount,
    paidAmount,
    pendingAmount,
    currentBranch,
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PayrollHeader
        currentBranch={currentBranch}
      />

      {/* Payroll Overview Cards */}
      {statsCards}

      {/* Main Content Tabs */}
      <TabSwitcher
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Create Payroll Form Dialog */}
      <SalaryCalculationForm
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={(data) => {
          void handleFormSubmit(data);
        }}
        employees={employees}
      />

      {/* Edit Payroll Form Dialog */}
      <EditPayrollForm
        isOpen={showUpdateDialog}
        onClose={() => {
          setShowUpdateDialog(false);
          setSelectedPayroll(null);
        }}
        onSubmit={(data) => {
          if (selectedPayroll) {
            void handleFormSubmit(data);
          }
        }}
        selectedPayroll={selectedPayroll}
      />

      {/* Detailed Payroll View Dialog */}
      <Dialog open={showPayslipDialog} onOpenChange={handleClosePayslipDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Payroll Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
            {detailedPayrollLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading payroll details...</div>
              </div>
            ) : !detailedPayroll ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">No payroll data available</div>
              </div>
            ) : (
              <div className="space-y-6">
                <EmployeeInfoSection detailedPayroll={detailedPayroll as unknown as DetailedPayrollRead} />
                <PayrollSummarySection detailedPayroll={detailedPayroll as unknown as DetailedPayrollRead} />
                <DeductionsBreakdownSection detailedPayroll={detailedPayroll as unknown as DetailedPayrollRead} />
                <PaymentInfoSection detailedPayroll={detailedPayroll as unknown as DetailedPayrollRead} />
                <RecordInfoSection detailedPayroll={detailedPayroll as unknown as DetailedPayrollRead} />
                <ActionButtons
                  onDownloadPayslip={handleDownloadPayslip}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const PayrollManagementTemplate = PayrollManagementTemplateComponent;
export default PayrollManagementTemplateComponent;
