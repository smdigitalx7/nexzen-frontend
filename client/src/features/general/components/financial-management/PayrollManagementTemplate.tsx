import { motion } from "framer-motion";
import { CreditCard, Plus, Download, Users, Eye } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { TabSwitcher, MonthYearFilter } from "@/common/components/shared";
import {
  usePayrollManagement,
  usePayrollDashboard,
} from "@/features/general/hooks/usePayrollManagement";
import { formatCurrency } from "@/common/utils";
import { PayrollStatsCards as OldPayrollStatsCards } from "./components/PayrollStatsCards";
import { PayrollStatsCards } from "./PayrollStatsCards";
import { EmployeePayrollTable } from "./components/EmployeePayrollTable";
import { SalaryCalculationForm } from "./components/SalaryCalculationForm";
import { EditPayrollForm } from "./components/EditPayrollForm";
import { memo, useMemo, useCallback } from "react";
import type { Branch } from "@/core/auth/authStore";
import type { EmployeeRead } from "@/features/general/types/employees";
import type {
  PayrollRead,
  DetailedPayrollRead,
} from "@/features/general/types/payrolls";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number;
  payroll_year: number;
}

// Memoized header component
const PayrollHeader = memo(
  ({ currentBranch }: { currentBranch: Branch | null }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Payroll Management
        </h1>
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
  )
);

PayrollHeader.displayName = "PayrollHeader";

// Memoized employee info section component
const EmployeeInfoSection = memo(
  ({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => {
    if (!detailedPayroll) return null;
    return (
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
              {new Date(
                detailedPayroll.payroll_year,
                detailedPayroll.payroll_month - 1
              ).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

EmployeeInfoSection.displayName = "EmployeeInfoSection";

// Memoized payroll summary section component
const PayrollSummarySection = memo(
  ({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => {
    if (!detailedPayroll) return null;
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Payroll Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Gross Pay:</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.gross_pay)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Previous Balance:</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.previous_balance)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Deductions:</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.total_deductions)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Net Pay:</span>
            <span className="text-lg font-bold">
              {formatCurrency(detailedPayroll.net_pay)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

PayrollSummarySection.displayName = "PayrollSummarySection";

// Memoized deductions breakdown section component
const DeductionsBreakdownSection = memo(
  ({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => {
    if (!detailedPayroll) return null;
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Deductions Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Loss of Pay (LOP):</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.lop)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Advance Deduction:</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.advance_deduction)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Other Deductions:</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.other_deductions)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Deductions:</span>
            <span className="font-bold">
              {formatCurrency(detailedPayroll.total_deductions)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

DeductionsBreakdownSection.displayName = "DeductionsBreakdownSection";

// Memoized payment info section component
const PaymentInfoSection = memo(
  ({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => {
    if (!detailedPayroll) return null;
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Paid Amount:</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.paid_amount)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Carryover Balance:</span>
            <span className="font-medium">
              {formatCurrency(detailedPayroll.carryover_balance)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-medium">
              {detailedPayroll.payment_method}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium">
              <Badge
                variant={
                  detailedPayroll.status === "PAID"
                    ? "default"
                    : detailedPayroll.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                }
              >
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
    );
  }
);

PaymentInfoSection.displayName = "PaymentInfoSection";

// Memoized record info section component
const RecordInfoSection = memo(
  ({ detailedPayroll }: { detailedPayroll: DetailedPayrollRead }) => {
    if (!detailedPayroll) return null;
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Record Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Generated At:</span>
            <span className="font-medium">
              {new Date(detailedPayroll.generated_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Updated At:</span>
            <span className="font-medium">
              {detailedPayroll.updated_at
                ? new Date(detailedPayroll.updated_at).toLocaleString()
                : "Never"}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

RecordInfoSection.displayName = "RecordInfoSection";

// Memoized action buttons component
const ActionButtons = memo(
  ({ onDownloadPayslip }: { onDownloadPayslip: () => void }) => (
    <div className="flex justify-end gap-2 pt-4 border-t">
      <Button variant="outline" onClick={onDownloadPayslip}>
        <Download className="h-4 w-4 mr-2" />
        Download Payslip
      </Button>
    </div>
  )
);

ActionButtons.displayName = "ActionButtons";

export const PayrollManagementTemplateComponent = () => {
  // Dashboard stats hook
  const { data: dashboardStats, isLoading: dashboardLoading } =
    usePayrollDashboard();

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
    return managementData.employees.filter(
      (emp): emp is EmployeeRead =>
        typeof emp === "object" && emp !== null && "employee_id" in emp
    );
  }, [managementData.employees]);

  // Statistics are computed numbers from the hook, ensure type safety
  const totalPayrolls =
    typeof managementData.totalPayrolls === "number"
      ? managementData.totalPayrolls
      : 0;
  const totalAmount =
    typeof managementData.totalAmount === "number"
      ? managementData.totalAmount
      : 0;
  const paidAmount =
    typeof managementData.paidAmount === "number"
      ? managementData.paidAmount
      : 0;
  const pendingAmount =
    typeof managementData.pendingAmount === "number"
      ? managementData.pendingAmount
      : 0;

  const {
    // UI State
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedStatus: _selectedStatus,
    setSelectedStatus: _setSelectedStatus,
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
    handleUpdateStatus: _handleUpdateStatus,
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
    // ✅ FIX: Clear selectedPayroll when opening create dialog to ensure create path is taken
    setSelectedPayroll(null);
    setShowCreateDialog(true);
  }, [setShowCreateDialog, setSelectedPayroll]);

  // Removed unused handleCloseDialogs - using individual handlers instead

  const handleClosePayslipDialog = useCallback(
    (open: boolean) => {
      setShowPayslipDialog(open);
      if (!open) {
        setSelectedPayrollId(null);
        setSelectedPayroll(null);
      }
    },
    [setShowPayslipDialog, setSelectedPayrollId, setSelectedPayroll]
  );

  const handleDownloadPayslip = useCallback(() => {
    // Download payslip functionality to be implemented
  }, []);

  // Memoized tabs configuration
  const tabsConfig = useMemo(
    () => [
      {
        value: "payrolls",
        label: "Payrolls",
        icon: Users,
        content: (
          <div className="space-y-4">
            {/* Month/Year Filter */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  Filter by month and year:
                </p>
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
    ],
    [
      payrolls,
      isLoading,
      handleEditPayroll,
      handleViewPayslip,
      getStatusColor,
      getStatusText,
      handleCreatePayrollClick,
      selectedMonth,
      selectedYear,
      setSelectedMonth,
      setSelectedYear,
    ]
  );

  // Memoized stats cards
  const statsCards = useMemo(() => {
    if (dashboardStats) {
      return (
        <PayrollStatsCards stats={dashboardStats} loading={dashboardLoading} />
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
      <PayrollHeader currentBranch={currentBranch} />

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
        onClose={() => {
          setShowCreateDialog(false);
          // ✅ FIX: Clear selectedPayroll when closing create dialog to ensure create path is taken
          setSelectedPayroll(null);
        }}
        onSubmit={async (data) => {
          // ✅ FIX: Ensure selectedPayroll is null before submitting (force create path)
          if (selectedPayroll) {
            setSelectedPayroll(null);
          }
          await handleFormSubmit(data);
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
                <div className="text-sm text-muted-foreground">
                  Loading payroll details...
                </div>
              </div>
            ) : !detailedPayroll ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  No payroll data available
                </div>
              </div>
            ) : (
              (() => {
                // ✅ FIX: Properly type the detailed payroll response
                // The API returns PayrollRead which we need to transform to DetailedPayrollRead
                if (!detailedPayroll || !selectedPayroll) return null;

                const payroll = detailedPayroll;

                // Extract month and year from payroll_month string or use generated_at
                let payrollMonth = 1;
                let payrollYear = new Date().getFullYear();

                if (payroll.payroll_month) {
                  if (typeof payroll.payroll_month === "string") {
                    const date = new Date(payroll.payroll_month);
                    payrollMonth = date.getMonth() + 1;
                    payrollYear = date.getFullYear();
                  } else if (typeof payroll.payroll_month === "number") {
                    payrollMonth = payroll.payroll_month;
                  }
                }

                // If year is invalid, use generated_at
                if (payrollYear < 2000 && payroll.generated_at) {
                  const date = new Date(payroll.generated_at);
                  payrollYear = date.getFullYear();
                  if (!payrollMonth || payrollMonth < 1 || payrollMonth > 12) {
                    payrollMonth = date.getMonth() + 1;
                  }
                }

                const detailedPayrollData: DetailedPayrollRead = {
                  payroll_id: payroll.payroll_id,
                  employee_id: payroll.employee_id,
                  previous_balance: payroll.previous_balance,
                  gross_pay: payroll.gross_pay,
                  lop: payroll.lop,
                  advance_deduction: payroll.advance_deduction,
                  other_deductions: payroll.other_deductions,
                  total_deductions: payroll.total_deductions,
                  net_pay: payroll.net_pay,
                  paid_amount: payroll.paid_amount,
                  carryover_balance: payroll.carryover_balance,
                  payment_method: payroll.payment_method,
                  payment_notes: payroll.payment_notes,
                  status: payroll.status,
                  generated_at: payroll.generated_at,
                  updated_at: payroll.updated_at,
                  generated_by: payroll.generated_by,
                  updated_by: payroll.updated_by,
                  employee_name:
                    selectedPayroll.employee_name || "Unknown Employee",
                  employee_type: selectedPayroll.employee_type || "Unknown",
                  payroll_month: payrollMonth,
                  payroll_year: payrollYear,
                };

                return (
                  <div className="space-y-6">
                    <EmployeeInfoSection
                      detailedPayroll={detailedPayrollData}
                    />
                    <PayrollSummarySection
                      detailedPayroll={detailedPayrollData}
                    />
                    <DeductionsBreakdownSection
                      detailedPayroll={detailedPayrollData}
                    />
                    <PaymentInfoSection detailedPayroll={detailedPayrollData} />
                    <RecordInfoSection detailedPayroll={detailedPayrollData} />
                    <ActionButtons onDownloadPayslip={handleDownloadPayslip} />
                  </div>
                );
              })()
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const PayrollManagementTemplate = PayrollManagementTemplateComponent;
export default PayrollManagementTemplateComponent;
