import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Receipt,
  TrendingUp,
  AlertCircle,
  Calculator,
  Users,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EnhancedDataTable } from "@/components/EnhancedDataTable";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { usePayrolls, usePayrollsByBranch, useCreatePayroll, useUpdatePayroll, useUpdatePayrollStatus } from "@/lib/hooks/usePayrolls";
import { useEmployeesByBranch, useEmployeesByInstitute } from "@/lib/hooks/useEmployees";
import type { PayrollRead, PayrollCreate, PayrollUpdate } from "@/lib/types/payrolls";
import { PayrollStatusEnum, PaymentMethodEnum } from "@/lib/types/payrolls";

const payrollCreateSchema = z.object({
  employee_id: z.number().min(1, "Employee is required"),
  payroll_month: z.string().min(1, "Payroll month is required"),
  previous_balance: z.number().min(0).optional(),
  gross_pay: z.number().min(0, "Gross pay must be positive"),
  lop: z.number().min(0).optional(),
  advance_deduction: z.number().min(0).optional(),
  other_deductions: z.number().min(0).optional(),
});

const payrollUpdateSchema = z.object({
  previous_balance: z.number().min(0).optional(),
  gross_pay: z.number().min(0).optional(),
  lop: z.number().min(0).optional(),
  advance_deduction: z.number().min(0).optional(),
  other_deductions: z.number().min(0).optional(),
  paid_amount: z.number().min(0).optional(),
  payment_method: z.nativeEnum(PaymentMethodEnum).optional(),
  payment_notes: z.string().optional(),
  status: z.nativeEnum(PayrollStatusEnum).optional(),
});

type PayrollCreateFormData = z.infer<typeof payrollCreateSchema>;
type PayrollUpdateFormData = z.infer<typeof payrollUpdateSchema>;

const PayrollManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const [viewMode, setViewMode] = useState<"branch" | "institute">("branch");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRead | null>(null);
  const [activeTab, setActiveTab] = useState("payrolls");
  const { toast } = useToast();

  // API Hooks
  const { data: branchEmployees = [], isLoading: branchEmployeesLoading } = useEmployeesByBranch();
  const { data: instituteEmployees = [], isLoading: instituteEmployeesLoading } = useEmployeesByInstitute();
  
  const payrollQuery = {
    limit: 50,
    offset: 0,
    month: selectedMonth,
    year: selectedYear,
    status: selectedStatus,
  };

  const { data: branchPayrollsResponse, isLoading: branchPayrollsLoading } = usePayrollsByBranch(payrollQuery);
  const { data: institutePayrollsResponse, isLoading: institutePayrollsLoading } = usePayrolls(payrollQuery);

  const branchPayrolls = branchPayrollsResponse?.data || [];
  const institutePayrolls = institutePayrollsResponse?.data || [];

  // Use the selected view mode
  const employees = viewMode === "branch" ? branchEmployees : instituteEmployees;
  const payrolls = viewMode === "branch" ? branchPayrolls : institutePayrolls;
  const isLoading = viewMode === "branch" ? branchPayrollsLoading : institutePayrollsLoading;

  // Mutations
  const createPayrollMutation = useCreatePayroll();
  const updatePayrollMutation = useUpdatePayroll();
  const updateStatusMutation = useUpdatePayrollStatus();

  // Forms
  const createForm = useForm<PayrollCreateFormData>({
    resolver: zodResolver(payrollCreateSchema),
    defaultValues: {
      employee_id: 0,
      payroll_month: "",
      previous_balance: 0,
      gross_pay: 0,
      lop: 0,
      advance_deduction: 0,
      other_deductions: 0,
    },
  });

  const updateForm = useForm<PayrollUpdateFormData>({
    resolver: zodResolver(payrollUpdateSchema),
    defaultValues: {
      previous_balance: 0,
      gross_pay: 0,
      lop: 0,
      advance_deduction: 0,
      other_deductions: 0,
      paid_amount: 0,
      payment_method: undefined,
      payment_notes: "",
      status: undefined,
    },
  });

  // Handler functions
  const handleCreatePayroll = (values: PayrollCreateFormData) => {
    createPayrollMutation.mutate(values, {
      onSuccess: () => {
        createForm.reset();
        setShowCreateDialog(false);
      },
    });
  };

  const handleUpdatePayroll = (values: PayrollUpdateFormData) => {
    if (!selectedPayroll) return;
    
    updatePayrollMutation.mutate({
      id: selectedPayroll.payroll_id,
      payload: values,
    }, {
      onSuccess: () => {
        updateForm.reset();
        setShowUpdateDialog(false);
        setSelectedPayroll(null);
      },
    });
  };

  const handleStatusUpdate = (payrollId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: payrollId,
      status: newStatus,
    });
  };

  const handleEditPayroll = (payroll: PayrollRead) => {
    setSelectedPayroll(payroll);
    updateForm.reset({
      previous_balance: payroll.previous_balance,
      gross_pay: payroll.gross_pay,
      lop: payroll.lop,
      advance_deduction: payroll.advance_deduction,
      other_deductions: payroll.other_deductions,
      paid_amount: payroll.paid_amount,
      payment_method: payroll.payment_method,
      payment_notes: payroll.payment_notes || "",
      status: payroll.status,
    });
    setShowUpdateDialog(true);
  };

  const handleViewPayslip = (payroll: PayrollRead) => {
    setSelectedPayroll(payroll);
    setShowPayslipDialog(true);
  };

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "HOLD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "PENDING":
        return <Clock className="h-3 w-3 mr-1" />;
      case "HOLD":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <AlertCircle className="h-3 w-3 mr-1" />;
    }
  };

  // Filter payrolls based on search
  const filteredPayrolls = useMemo(() => {
    if (!searchQuery) return payrolls;
    
    return payrolls.filter((payroll) => {
      const employee = employees.find(emp => emp.employee_id === payroll.employee_id);
      if (!employee) return false;
      
      return (
        employee.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employee_id.toString().includes(searchQuery) ||
        payroll.payroll_id.toString().includes(searchQuery)
      );
    });
  }, [payrolls, employees, searchQuery]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalPayrolls = filteredPayrolls.length;
    const totalAmount = filteredPayrolls.reduce((sum, payroll) => sum + payroll.net_pay, 0);
    const paidAmount = filteredPayrolls.reduce((sum, payroll) => sum + payroll.paid_amount, 0);
    const pendingAmount = totalAmount - paidAmount;
    const paidCount = filteredPayrolls.filter(p => p.status === "PAID").length;

    return {
      totalPayrolls,
      totalAmount,
      paidAmount,
      pendingAmount,
      paidCount,
    };
  }, [filteredPayrolls]);

  // Payroll columns for data table
  const payrollColumns = [
    {
      key: "payroll_id",
      header: "Payroll ID",
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-slate-900">#{value}</div>
      ),
    },
    {
      key: "employee_id",
      header: "Employee",
      sortable: true,
      render: (value: number) => {
        const employee = employees.find(emp => emp.employee_id === value);
        return (
          <div>
            <div className="font-medium text-slate-900">
              {employee?.employee_name || `Employee ${value}`}
            </div>
            <div className="text-sm text-slate-500">
              {employee?.designation || "Unknown"}
            </div>
          </div>
        );
      },
    },
    {
      key: "payroll_month",
      header: "Month",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
        </div>
      ),
    },
    {
      key: "gross_pay",
      header: "Gross Pay",
      sortable: true,
      render: (value: number, row: PayrollRead) => (
        <div className="text-right">
          <div className="font-medium text-slate-900">
            ₹{value.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            Net: ₹{row.net_pay.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "total_deductions",
      header: "Deductions",
      sortable: true,
      render: (value: number, row: PayrollRead) => (
        <div className="text-right">
          <div className="font-medium text-red-600">
            ₹{value.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            LOP: ₹{row.lop.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "paid_amount",
      header: "Paid Amount",
      sortable: true,
      render: (value: number, row: PayrollRead) => (
        <div className="text-right">
          <div className="font-semibold text-green-600">
            ₹{value.toLocaleString()}
          </div>
          {row.carryover_balance > 0 && (
            <div className="text-xs text-orange-600">
              Carryover: ₹{row.carryover_balance.toLocaleString()}
          </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {getStatusIcon(value)}
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (value: any, row: PayrollRead) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewPayslip(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditPayroll(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.status === "PENDING" && (
          <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(row.payroll_id, "PAID")}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
          </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
          {/* Header */}
      <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
              <p className="text-slate-600 mt-1">
            Manage employee payroll, salary processing, and payment tracking
              </p>
            </div>
        <div className="flex items-center gap-3">
              <Button
                variant="outline"
            onClick={() => setViewMode(viewMode === "branch" ? "institute" : "branch")}
              >
            <Building className="h-4 w-4 mr-2" />
            {viewMode === "branch" ? "Branch View" : "Institute View"}
              </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Payroll
                  </Button>
                                    </div>
                                    </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-slate-600">Total Payrolls</p>
                    <p className="text-2xl font-bold text-slate-900">
                  {summaryStats.totalPayrolls}
                    </p>
                  </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-slate-600">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900">
                  ₹{summaryStats.totalAmount.toLocaleString()}
                    </p>
                  </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

        <Card>
          <CardContent className="p-6">
                <div className="flex items-center justify-between">
                          <div>
                <p className="text-sm font-medium text-slate-600">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{summaryStats.paidAmount.toLocaleString()}
                </p>
                            </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

        <Card>
          <CardContent className="p-6">
                <div className="flex items-center justify-between">
                          <div>
                <p className="text-sm font-medium text-slate-600">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{summaryStats.pendingAmount.toLocaleString()}
                </p>
                          </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                </div>

                {/* Filters */}
      <Card>
        <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                  placeholder="Search payrolls, employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
            </div>
            <Select value={selectedMonth?.toString() || "all"} onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2024, i).toLocaleDateString("en-US", { month: "long" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            <Select value={selectedYear?.toString() || "all"} onValueChange={(value) => setSelectedYear(value === "all" ? undefined : parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
            <Select value={selectedStatus || "all"} onValueChange={(value) => setSelectedStatus(value === "all" ? undefined : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="HOLD">Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payroll Records
            <Badge variant="secondary" className="ml-auto">
              {filteredPayrolls.length} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
                <EnhancedDataTable
            data={filteredPayrolls}
            columns={payrollColumns}
            searchKey="payroll_id"
          />
        </CardContent>
      </Card>

      {/* Create Payroll Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Payroll Record</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreatePayroll)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                              {employee.employee_name} - {employee.designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="payroll_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payroll Month</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="gross_pay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Pay</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="previous_balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Balance</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={createForm.control}
                  name="lop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LOP (Loss of Pay)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="advance_deduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Deduction</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="other_deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Deductions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPayrollMutation.isPending}>
                  {createPayrollMutation.isPending ? "Creating..." : "Create Payroll"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Update Payroll Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Payroll Record</DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleUpdatePayroll)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="gross_pay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Pay</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="paid_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={updateForm.control}
                  name="lop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LOP (Loss of Pay)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="advance_deduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Deduction</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="other_deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Deductions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="HOLD">Hold</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={updateForm.control}
                name="payment_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Notes</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional payment notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowUpdateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePayrollMutation.isPending}>
                  {updatePayrollMutation.isPending ? "Updating..." : "Update Payroll"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

          {/* Payslip Dialog */}
          <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
        <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Employee Payslip</DialogTitle>
              </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                      <div>
                  <h3 className="font-semibold text-slate-900">Employee Details</h3>
                  <p className="text-sm text-slate-600">
                    {employees.find(emp => emp.employee_id === selectedPayroll.employee_id)?.employee_name || `Employee ${selectedPayroll.employee_id}`}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Payroll Month</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(selectedPayroll.payroll_month).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                        </p>
                      </div>
                      </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Salary Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                    <span>Gross Pay:</span>
                    <span>₹{selectedPayroll.gross_pay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                    <span>Previous Balance:</span>
                    <span>₹{selectedPayroll.previous_balance.toLocaleString()}</span>
                        </div>
                  <div className="flex justify-between text-red-600">
                    <span>LOP:</span>
                    <span>-₹{selectedPayroll.lop.toLocaleString()}</span>
                        </div>
                  <div className="flex justify-between text-red-600">
                    <span>Advance Deduction:</span>
                    <span>-₹{selectedPayroll.advance_deduction.toLocaleString()}</span>
                      </div>
                  <div className="flex justify-between text-red-600">
                    <span>Other Deductions:</span>
                    <span>-₹{selectedPayroll.other_deductions.toLocaleString()}</span>
                    </div>
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Total Deductions:</span>
                    <span>-₹{selectedPayroll.total_deductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Net Pay:</span>
                      <span>₹{selectedPayroll.net_pay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                      <span>Paid Amount:</span>
                      <span>₹{selectedPayroll.paid_amount.toLocaleString()}</span>
                        </div>
                    {selectedPayroll.carryover_balance > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Carryover Balance:</span>
                        <span>₹{selectedPayroll.carryover_balance.toLocaleString()}</span>
                        </div>
                    )}
                      </div>
                    </div>
                  </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowPayslipDialog(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
    </div>
  );
};

export default PayrollManagement;
