import { motion } from "framer-motion";
import { CreditCard, Plus, Download, Users, Eye, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/sheet";
import { GeneratePayrollPage } from "./components/GeneratePayrollPage";
import { PayrollsService } from "@/features/general/services/payrolls.service";
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
  PayrollCreate,
} from "@/features/general/types/payrolls";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number | string;
  payroll_year?: number;
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

// Memoized detailed payslip view component
const PayslipDetailView = memo(
  ({
    detailedPayroll,
    onDownload,
  }: {
    detailedPayroll: DetailedPayrollRead;
    onDownload: () => void;
  }) => {
    if (!detailedPayroll) return null;

    const periodLabel = new Date(
      detailedPayroll.payroll_year,
      detailedPayroll.payroll_month - 1
    ).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    return (
      <div className="max-w-3xl mx-auto bg-white p-2">
        {/* Payslip Card */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 p-6 border-b border-gray-200 text-center">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest">
              Payslip
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {periodLabel}
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Employee Name
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {detailedPayroll.employee_name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Designation
                </span>
                <span className="text-base font-medium text-gray-700">
                  {detailedPayroll.employee_type}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Status
                </span>
                <Badge
                  variant="outline"
                  className={
                    detailedPayroll.status === "PAID"
                      ? "text-green-600 border-green-200 bg-green-50"
                      : "text-yellow-600 border-yellow-200 bg-yellow-50"
                  }
                >
                  {detailedPayroll.status}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Generated On
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {new Date(detailedPayroll.generated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Financial Table */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="grid grid-cols-2 text-sm">
                {/* Earnings */}
                <div className="border-r border-gray-200">
                  <div className="bg-gray-50 p-3 border-b border-gray-200 font-semibold text-gray-600 uppercase text-xs">
                    Earnings
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gross Salary</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(detailedPayroll.gross_pay)}
                      </span>
                    </div>
                    {/* Spacer for alignment */}
                    <div className="h-6"></div>
                    <div className="h-6"></div>
                  </div>
                  <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(detailedPayroll.gross_pay)}
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <div className="bg-gray-50 p-3 border-b border-gray-200 font-semibold text-gray-600 uppercase text-xs">
                    Deductions
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Loss of Pay</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(detailedPayroll.lop)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Advance</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(detailedPayroll.advance_deduction)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Other</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(detailedPayroll.other_deductions)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(detailedPayroll.total_deductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="flex justify-between items-end p-6 bg-slate-900 rounded-lg text-white shadow-lg">
              <div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                  Net Payable
                </div>
                <div className="text-xs text-slate-400">
                  Paid via{" "}
                  <span className="text-white capitalize">
                    {detailedPayroll.payment_method?.toLowerCase() || "cash"}
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(detailedPayroll.net_pay)}
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <Button
                className="w-full border-dashed border-2 hover:bg-slate-50"
                variant="outline"
                size="lg"
                onClick={onDownload}
              >
                <Download className="mr-2 h-4 w-4" /> Download Official Payslip
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PayslipDetailView.displayName = "PayslipDetailView";

export const PayrollManagementTemplateComponent = () => {
  const [initialEmployeeId, setInitialEmployeeId] = useState<number | null>(null);

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
    const rawEmployees: any = managementData.employees;
    if (!Array.isArray(rawEmployees)) {
      return [];
    }
    // Type guard: ensure all items are EmployeeRead
    return rawEmployees.filter(
      (emp: any): emp is EmployeeRead =>
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

    // Pagination
    payrollPage,
    setPayrollPage,
    totalCount,
    pageSize,
    setPageSize,

    // Handlers
    handleUpdateStatus,
    handleViewPayslip,
    handleEditPayroll,
    handleFormSubmit,
    handleCreatePayroll,

    // Utilities
    getStatusColor,
    getStatusText,

    // User context
    currentBranch,
  } = managementData as any;

  // Memoized handlers
  const handleCreatePayrollClick = useCallback(() => {
    setActiveTab("generate_payroll");
  }, [setActiveTab]);

  const handleGeneratePayroll = useCallback((employeeId: number) => {
    setInitialEmployeeId(employeeId);
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
    if (!detailedPayroll?.payroll_id) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Helper for currency in PDF (standard font doesn't support ₹ symbol)
      const formatForPdf = (amount: number) => {
        return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      // Header Section
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const branchName = currentBranch?.branch_name || "Velonex ERP";
      doc.text(branchName.toUpperCase(), pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL PAYSLIP", pageWidth / 2, 28, { align: "center" });

      // Period
      const periodLabel = new Date(
        detailedPayroll.payroll_year,
        detailedPayroll.payroll_month - 1
      ).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      
      doc.setFontSize(11);
      doc.text(`Period: ${periodLabel}`, pageWidth / 2, 35, { align: "center" });
      
      // Line separator
      doc.setLineWidth(0.5);
      doc.line(15, 40, pageWidth - 15, 40);

      // Employee Details
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Employee Details", 15, 50);
      
      autoTable(doc, {
        startY: 55,
        head: [],
        body: [
          ["Employee Name:", detailedPayroll.employee_name],
          ["Designation:", detailedPayroll.employee_type || "-"],
          ["Employee ID:", detailedPayroll.employee_id.toString()],
          ["Generated On:", new Date(detailedPayroll.generated_at).toLocaleDateString()],
          ["Status:", detailedPayroll.status],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1.5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
        },
      });

      // Salary Details Header
      const salaryStartY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Salary Details", 15, salaryStartY);

      // Earnings & Deductions Table
      autoTable(doc, {
        startY: salaryStartY + 5,
        head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
        body: [
          ['Basic & Allowances', formatForPdf(detailedPayroll.gross_pay), 'Loss of Pay (LOP)', formatForPdf(detailedPayroll.lop)],
          ['', '', 'Advance Deduction', formatForPdf(detailedPayroll.advance_deduction)],
          ['', '', 'Other Deductions', formatForPdf(detailedPayroll.other_deductions)],
          // Total Row
          ['Total Earnings', formatForPdf(detailedPayroll.gross_pay), 'Total Deductions', formatForPdf(detailedPayroll.total_deductions)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
        columnStyles: {
          1: { halign: 'right' },
          3: { halign: 'right' },
        },
        didParseCell: (data) => {
             // Highlight total row
             if (data.row.index === 3) {
                 data.cell.styles.fontStyle = 'bold';
                 data.cell.styles.fillColor = [240, 240, 240];
             }
        }
      });

      // Net Pay Section
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(15, finalY, pageWidth - 30, 25, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text("Net Payable Amount", 25, finalY + 16);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(formatForPdf(detailedPayroll.net_pay), pageWidth - 25, finalY + 16, { align: "right" });
      
      // Payment Method
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Paid via ${detailedPayroll.payment_method?.toLowerCase() || 'cash'}`, 25, finalY + 32);

      // Footer
      const footerY = finalY + 45;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      doc.text("This is a computer-generated document and does not require a signature.", pageWidth / 2, footerY, { align: "center" });
      
      const generatedDate = new Date().toLocaleString();
      doc.text(`Generated on: ${generatedDate}`, pageWidth - 15, footerY, { align: "right" });

      // Save
      doc.save(`Payslip-${detailedPayroll.employee_name}-${periodLabel}.pdf`);

    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  }, [detailedPayroll, currentBranch]);

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
              onUpdateStatus={handleUpdateStatus}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              currentPage={payrollPage}
              totalCount={totalCount}
              onPageChange={setPayrollPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        ),
      },
      {
        value: "generate_payroll",
        label: "Generate Payroll",
        icon: FileSpreadsheet,
        content: (
          <GeneratePayrollPage
            onGenerate={handleGeneratePayroll}
            onView={(payroll) => {
              setSelectedPayroll(payroll as any);
              setSelectedPayrollId(payroll.payroll_id);
              setShowPayslipDialog(true);
            }}
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
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
      payrollPage,
      setPayrollPage,
      totalCount,
      pageSize,
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
          // ✅ FIX: Directly call handleCreatePayroll for create operation (don't rely on selectedPayroll state)
          // This ensures the create path is always taken, avoiding race conditions with state updates
          await handleCreatePayroll(data);
        }}
        employees={employees}
        initialEmployeeId={initialEmployeeId}
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

      {/* Detailed Payroll View Sheet */}
      <Sheet open={showPayslipDialog} onOpenChange={handleClosePayslipDialog}>
        <SheetContent className="w-full sm:max-w-[800px] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Payroll Details
            </SheetTitle>
          </SheetHeader>

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
                  <PayslipDetailView
                    detailedPayroll={detailedPayrollData}
                    onDownload={handleDownloadPayslip}
                  />
                );
              })()
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export const PayrollManagementTemplate = PayrollManagementTemplateComponent;
export default PayrollManagementTemplateComponent;
