import { motion } from "framer-motion";
import { CreditCard, Plus, Download, Users, Calculator, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TabSwitcher } from "@/components/shared";
import { usePayrollManagement, usePayrollDashboard } from "@/lib/hooks/general/usePayrollManagement";
import { formatCurrency } from "@/lib/utils";
import { PayrollStatsCards as OldPayrollStatsCards } from "./components/PayrollStatsCards";
import { PayrollStatsCards } from "./PayrollStatsCards";
import { EmployeePayrollTable } from "./components/EmployeePayrollTable";
import { SalaryCalculationForm } from "./components/SalaryCalculationForm";
import { BulkPayrollOperations } from "./components/BulkPayrollOperations";
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
  currentBranch, 
  onCreatePayroll 
}: { 
  currentBranch: Branch | null;
  onCreatePayroll: () => void;
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
      <Button onClick={onCreatePayroll}>
        <Plus className="h-4 w-4 mr-2" />
        Add Payroll
      </Button>
    </div>
  </motion.div>
));

PayrollHeader.displayName = "PayrollHeader";

// Memoized filter controls component
const FilterControls = memo(({ 
  selectedMonth, 
  setSelectedMonth, 
  selectedYear, 
  setSelectedYear, 
  selectedStatus, 
  setSelectedStatus 
}: { 
  selectedMonth: number | undefined;
  setSelectedMonth: (month: number | undefined) => void;
  selectedYear: number | undefined;
  setSelectedYear: (year: number | undefined) => void;
  selectedStatus: string | undefined;
  setSelectedStatus: (status: string | undefined) => void;
}) => {
  const handleMonthChange = useCallback((value: string) => {
    const month = value && value !== "all" ? parseInt(value) : undefined;
    setSelectedMonth(month);
    if (!month) {
      setSelectedYear(undefined);
    } else if (!selectedYear) {
      setSelectedYear(new Date().getFullYear());
    }
  }, [selectedYear, setSelectedMonth, setSelectedYear]);

  const handleYearChange = useCallback((value: string) => {
    const year = value && value !== "all" ? parseInt(value) : undefined;
    setSelectedYear(year);
    if (!year) {
      setSelectedMonth(undefined);
    } else if (!selectedMonth) {
      setSelectedMonth(new Date().getMonth() + 1);
    }
  }, [selectedMonth, setSelectedYear, setSelectedMonth]);

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value && value !== "all" ? value : undefined);
  }, [setSelectedStatus]);

  const clearFilters = useCallback(() => {
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
    setSelectedStatus(undefined);
  }, [setSelectedMonth, setSelectedYear, setSelectedStatus]);

  const monthOptions = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(0, i).toLocaleString('default', { month: 'long' })
    })), []);

  const yearOptions = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => {
      const year = new Date().getFullYear() - 5 + i;
      return { value: year, label: year.toString() };
    }), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
    >
      {/* Filter Controls Row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Month Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Month:</label>
          <Select
            value={selectedMonth?.toString() || "all"}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
            {monthOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value.toString()}>
                {label}
                </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Year:</label>
          <Select
            value={selectedYear?.toString() || "all"}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
            {yearOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value.toString()}>
                {label}
                </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select
            value={selectedStatus || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          Clear Filters
        </Button>
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
  );
});

FilterControls.displayName = "FilterControls";

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

// Memoized bulk operations content component
const BulkOperationsContent = memo(({ 
  employees, 
  onBulkCreate, 
  onBulkExport, 
  isLoading 
}: { 
  employees: EmployeeRead[];
  onBulkCreate: (data: unknown) => void;
  onBulkExport: () => void;
  isLoading: boolean;
}) => {
  const handleBulkCreateWrapper = useCallback((data: unknown[]) => {
    void onBulkCreate(data as unknown);
  }, [onBulkCreate]);

  const handleBulkExportWrapper = useCallback(() => {
    void onBulkExport();
  }, [onBulkExport]);

  return (
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
        onBulkCreate={handleBulkCreateWrapper}
        onBulkExport={handleBulkExportWrapper}
        isLoading={isLoading}
      />
    </motion.div>
  );
});

BulkOperationsContent.displayName = "BulkOperationsContent";

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
  const pendingCount = typeof managementData.pendingCount === 'number' 
    ? managementData.pendingCount 
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
    
    // Bulk operations
    handleBulkCreate,
    handleBulkExport,
    
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
          <FilterControls
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
          <EmployeePayrollTable
            payrolls={payrolls}
            isLoading={isLoading}
            onEditPayroll={handleEditPayroll}
            onViewPayslip={handleViewPayslip}
            onUpdateStatus={(id: number, status: string) => {
              void handleUpdateStatus(id, status);
            }}
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
        <BulkOperationsContent
          employees={employees}
          onBulkCreate={(data: unknown) => {
            void handleBulkCreate(Array.isArray(data) ? data : []);
          }}
          onBulkExport={() => {
            void handleBulkExport();
          }}
          isLoading={isLoading}
        />
      ),
    },
  ], [
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedStatus,
    setSelectedStatus,
    payrolls,
    isLoading,
    handleEditPayroll,
    handleViewPayslip,
    handleUpdateStatus,
    getStatusColor,
    getStatusText,
    employees,
    handleBulkCreate,
    handleBulkExport,
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
        pendingCount={pendingCount}
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
    pendingCount,
    currentBranch,
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PayrollHeader
        currentBranch={currentBranch}
        onCreatePayroll={handleCreatePayrollClick}
      />

      {/* Payroll Overview Cards */}
      {statsCards}

      {/* Main Content Tabs */}
      <TabSwitcher
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Salary Calculation Form Dialog */}
      <SalaryCalculationForm
        isOpen={showCreateDialog || showUpdateDialog}
        onClose={handleCloseDialogs}
        onSubmit={(data) => {
          void handleFormSubmit(data);
        }}
        employees={employees}
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
