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

// Mock data for employees across both School and College
const mockEmployeesData = [
  {
    employee_id: "EMP001",
    employee_name: "Dr. Rajesh Kumar",
    designation: "Principal",
    employee_type: "teaching",
    department: "Administration",
    base_salary: 75000,
    allowances: 15000,
    deductions: 8000,
    net_salary: 82000,
    branch: "Nexzen School",
    status: "active",
    joining_date: "2020-06-15",
    bank_account: "HDFC-****1234",
    pan_number: "ABCPD1234E",
  },
  {
    employee_id: "EMP002",
    employee_name: "Prof. Sarah Johnson",
    designation: "HOD Computer Science",
    employee_type: "teaching",
    department: "Computer Science",
    base_salary: 65000,
    allowances: 12000,
    deductions: 6500,
    net_salary: 70500,
    branch: "Velocity College",
    status: "active",
    joining_date: "2019-08-01",
    bank_account: "ICICI-****5678",
    pan_number: "XYZPD5678F",
  },
  {
    employee_id: "EMP003",
    employee_name: "Ms. Priya Singh",
    designation: "Mathematics Teacher",
    employee_type: "teaching",
    department: "Mathematics",
    base_salary: 45000,
    allowances: 8000,
    deductions: 4500,
    net_salary: 48500,
    branch: "Nexzen School",
    status: "active",
    joining_date: "2021-04-10",
    bank_account: "SBI-****9012",
    pan_number: "PQRPD9012G",
  },
  {
    employee_id: "EMP004",
    employee_name: "Mr. Robert Miller",
    designation: "Lab Assistant",
    employee_type: "non_teaching",
    department: "Laboratory",
    base_salary: 25000,
    allowances: 3000,
    deductions: 2000,
    net_salary: 26000,
    branch: "Velocity College",
    status: "active",
    joining_date: "2022-01-15",
    bank_account: "PNB-****3456",
    pan_number: "LMNPD3456H",
  },
];

// Mock data for payroll history
const mockPayrollHistory = [
  {
    payroll_id: 1,
    month: "2024-01",
    month_name: "January 2024",
    total_employees: 45,
    total_amount: 1850000,
    processed_count: 45,
    pending_count: 0,
    status: "completed",
    processed_date: "2024-01-31",
    processed_by: "Emily Rodriguez",
  },
  {
    payroll_id: 2,
    month: "2024-02",
    month_name: "February 2024",
    total_employees: 46,
    total_amount: 1920000,
    processed_count: 46,
    pending_count: 0,
    status: "completed",
    processed_date: "2024-02-29",
    processed_by: "Michael Chen",
  },
  {
    payroll_id: 3,
    month: "2024-03",
    month_name: "March 2024",
    total_employees: 47,
    total_amount: 1980000,
    processed_count: 42,
    pending_count: 5,
    status: "processing",
    processed_date: null,
    processed_by: null,
  },
];

const salaryProcessingSchema = z.object({
  month: z.string().min(1, "Month is required"),
  employee_ids: z
    .array(z.string())
    .min(1, "At least one employee must be selected"),
});

type PayrollFormData = z.infer<typeof salaryProcessingSchema>;

const PayrollManagement = () => {
  const [employees] = useState(mockEmployeesData);
  const [payrollHistory, setPayrollHistory] = useState(mockPayrollHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("employees");
  const [salaryStructures, setSalaryStructures] = useState<any[]>([
    {
      id: 1,
      title: "Teaching Staff",
      base: 40000,
      hra: 8000,
      da: 4000,
      created: "2024-04-01",
    },
    {
      id: 2,
      title: "Non-Teaching",
      base: 25000,
      hra: 5000,
      da: 2500,
      created: "2024-04-01",
    },
  ]);
  const [leaveAllocations, setLeaveAllocations] = useState<any[]>([
    { id: 1, role: "teaching", annual: 12, casual: 8, sick: 6 },
    { id: 2, role: "non_teaching", annual: 10, casual: 6, sick: 6 },
  ]);
  const { toast } = useToast();

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(salaryProcessingSchema),
    defaultValues: {
      month: "",
      employee_ids: [],
    },
  });

  // Get unique values for dropdowns
  const branches = Array.from(new Set(employees.map((emp) => emp.branch)));
  const departments = Array.from(
    new Set(employees.map((emp) => emp.department))
  );
  const employeeTypes = ["teaching", "non_teaching", "administrative"];

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-600 border-green-200";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "pending":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "failed":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Filtered employee data
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.employee_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        employee.employee_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        selectedBranch === "all" || employee.branch === selectedBranch;
      const matchesDepartment =
        selectedDepartment === "all" ||
        employee.department === selectedDepartment;
      const matchesType =
        selectedEmployeeType === "all" ||
        employee.employee_type === selectedEmployeeType;

      return matchesSearch && matchesBranch && matchesDepartment && matchesType;
    });
  }, [
    employees,
    searchQuery,
    selectedBranch,
    selectedDepartment,
    selectedEmployeeType,
  ]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalEmployees = employees.length;
    const schoolEmployees = employees.filter((e) =>
      e.branch.includes("School")
    ).length;
    const collegeEmployees = employees.filter((e) =>
      e.branch.includes("College")
    ).length;
    const totalSalaryBudget = employees.reduce(
      (sum, emp) => sum + emp.net_salary,
      0
    );
    const teachingStaff = employees.filter(
      (e) => e.employee_type === "teaching"
    ).length;
    const nonTeachingStaff = employees.filter(
      (e) => e.employee_type === "non_teaching"
    ).length;

    const currentMonth = payrollHistory.find(
      (p) => p.status === "processing" || p.status === "pending"
    );
    const lastProcessed = payrollHistory.find((p) => p.status === "completed");

    return {
      totalEmployees,
      schoolEmployees,
      collegeEmployees,
      totalSalaryBudget,
      teachingStaff,
      nonTeachingStaff,
      currentMonth,
      lastProcessed,
    };
  }, [employees, payrollHistory]);

  const employeeColumns = [
    {
      key: "employee_name",
      header: "Employee Details",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {value
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <div className="font-semibold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">
              {row.employee_id} • {row.designation}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "branch",
      header: "Branch & Department",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{row.department}</div>
        </div>
      ),
    },
    {
      key: "employee_type",
      header: "Type",
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "base_salary",
      header: "Salary Breakdown",
      sortable: true,
      render: (value: number, row: any) => (
        <div className="text-right">
          <div className="font-semibold text-slate-900">
            ₹{row.net_salary.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            Base: ₹{value.toLocaleString()} + ₹{row.allowances.toLocaleString()}{" "}
            - ₹{row.deductions.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value: string) => (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            value
          )}`}
        >
          {getStatusIcon(value)}
          <span className="capitalize">{value}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedEmployee(row);
              setShowPayslipDialog(true);
            }}
            className="hover-elevate"
            data-testid={`button-view-payslip-${row.employee_id}`}
          >
            <Receipt className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover-elevate"
            data-testid={`button-edit-salary-${row.employee_id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover-elevate"
            data-testid={`button-view-employee-${row.employee_id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const payrollHistoryColumns = [
    {
      key: "month_name",
      header: "Month",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-semibold text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">
            {row.total_employees} employees
          </div>
        </div>
      ),
    },
    {
      key: "total_amount",
      header: "Total Amount",
      sortable: true,
      render: (value: number) => (
        <div className="font-bold text-lg text-slate-900">
          ₹{value.toLocaleString()}
        </div>
      ),
    },
    {
      key: "processed_count",
      header: "Progress",
      sortable: true,
      render: (value: number, row: any) => (
        <div>
          <div className="font-medium">
            {value}/{row.total_employees} processed
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${(value / row.total_employees) * 100}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value: string) => (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            value
          )}`}
        >
          {getStatusIcon(value)}
          <span className="capitalize">{value}</span>
        </div>
      ),
    },
    {
      key: "processed_date",
      header: "Processed",
      sortable: true,
      render: (value: string | null, row: any) => (
        <div className="text-sm">
          {value ? (
            <>
              <div>{new Date(value).toLocaleDateString()}</div>
              <div className="text-slate-500">by {row.processed_by}</div>
            </>
          ) : (
            <span className="text-slate-400">Pending</span>
          )}
        </div>
      ),
    },
  ];

  const handleProcessPayroll = (values: any) => {
    const selectedEmployees = employees.filter((emp) =>
      values.employee_ids.includes(emp.employee_id)
    );
    const totalAmount = selectedEmployees.reduce(
      (sum, emp) => sum + emp.net_salary,
      0
    );

    const newPayroll = {
      payroll_id: Date.now(),
      month: values.month,
      month_name: new Date(values.month + "-01").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
      total_employees: selectedEmployees.length,
      total_amount: totalAmount,
      processed_count: selectedEmployees.length,
      pending_count: 0,
      status: "completed",
      processed_date: new Date().toISOString().split("T")[0],
      processed_by: "Current User",
    };

    setPayrollHistory([newPayroll, ...payrollHistory]);

    toast({
      title: "Payroll Processed Successfully",
      description: `Processed salary for ${
        selectedEmployees.length
      } employees - ₹${totalAmount.toLocaleString()}`,
    });

    form.reset();
    setShowProcessDialog(false);
    console.log(
      "Payroll processed:",
      values,
      "Selected employees:",
      selectedEmployees
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Payroll Management
              </h1>
              <p className="text-slate-600 mt-1">
                Manage employee salaries across School and College
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => console.log("Export payroll data")}
                variant="outline"
                className="hover-elevate"
                data-testid="button-export-payroll"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog
                open={showProcessDialog}
                onOpenChange={setShowProcessDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    className="hover-elevate"
                    data-testid="button-process-payroll"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Process Payroll
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Process Monthly Payroll</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleProcessPayroll)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="month"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Month</FormLabel>
                            <FormControl>
                              <Input
                                type="month"
                                {...field}
                                data-testid="input-payroll-month"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="employee_ids"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Employees</FormLabel>
                            <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                              {employees.map((employee) => (
                                <label
                                  key={employee.employee_id}
                                  className="flex items-center space-x-3 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    value={employee.employee_id}
                                    checked={field.value.includes(
                                      employee.employee_id
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([
                                          ...field.value,
                                          employee.employee_id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== employee.employee_id
                                          )
                                        );
                                      }
                                    }}
                                    className="rounded"
                                    data-testid={`checkbox-employee-${employee.employee_id}`}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {employee.employee_name}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      {employee.branch} • ₹
                                      {employee.net_salary.toLocaleString()}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.reset();
                            setShowProcessDialog(false);
                          }}
                          data-testid="button-cancel-payroll"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          data-testid="button-submit-payroll"
                        >
                          Process Payroll
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Staff
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {statistics.totalEmployees}
                    </p>
                    <p className="text-xs text-slate-500">
                      School: {statistics.schoolEmployees} • College:{" "}
                      {statistics.collegeEmployees}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Monthly Budget
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      ₹{(statistics.totalSalaryBudget / 100000).toFixed(1)}L
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Teaching Staff
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {statistics.teachingStaff}
                    </p>
                    <p className="text-xs text-slate-500">
                      Non-teaching: {statistics.nonTeachingStaff}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Last Processed
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {statistics.lastProcessed?.month_name || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="employees" data-testid="tab-employees">
                  Employee Salaries
                </TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">
                  Payroll History
                </TabsTrigger>
                <TabsTrigger value="structures" data-testid="tab-structures">
                  Salary Structures
                </TabsTrigger>
                <TabsTrigger value="leaves" data-testid="tab-leaves">
                  Leave Allocations
                </TabsTrigger>
              </TabsList>
              {/* Salary Structures Tab */}
              <TabsContent value="structures" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Configure base and allowances by role
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      setSalaryStructures([
                        ...salaryStructures,
                        {
                          id: Date.now(),
                          title: "New Structure",
                          base: 0,
                          hra: 0,
                          da: 0,
                          created: new Date().toISOString().slice(0, 10),
                        },
                      ])
                    }
                  >
                    Add Structure
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {salaryStructures.map((s) => (
                    <Card key={s.id} className="hover-elevate">
                      <CardHeader>
                        <CardTitle className="text-base">{s.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Base</span>
                            <div className="font-semibold">
                              ₹{s.base.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">HRA</span>
                            <div className="font-semibold">
                              ₹{s.hra.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">DA</span>
                            <div className="font-semibold">
                              ₹{s.da.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          Created: {s.created}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Leave Allocations Tab */}
              <TabsContent value="leaves" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Annual leave entitlements by role
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      setLeaveAllocations([
                        ...leaveAllocations,
                        {
                          id: Date.now(),
                          role: "administrative",
                          annual: 10,
                          casual: 6,
                          sick: 6,
                        },
                      ])
                    }
                  >
                    Add Allocation
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {leaveAllocations.map((l) => (
                    <Card key={l.id} className="hover-elevate">
                      <CardHeader>
                        <CardTitle className="text-base capitalize">
                          {l.role.replace("_", " ")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Annual</span>
                            <div className="font-semibold">{l.annual} days</div>
                          </div>
                          <div>
                            <span className="text-slate-500">Casual</span>
                            <div className="font-semibold">{l.casual} days</div>
                          </div>
                          <div>
                            <span className="text-slate-500">Sick</span>
                            <div className="font-semibold">{l.sick} days</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Employee Salaries Tab */}
              <TabsContent value="employees" className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search employees, IDs, designations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-employees"
                    />
                  </div>
                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
                  >
                    <SelectTrigger
                      className="w-full sm:w-[150px]"
                      data-testid="select-filter-branch"
                    >
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger
                      className="w-full sm:w-[150px]"
                      data-testid="select-filter-department"
                    >
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedEmployeeType}
                    onValueChange={setSelectedEmployeeType}
                  >
                    <SelectTrigger
                      className="w-full sm:w-[150px]"
                      data-testid="select-filter-type"
                    >
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {employeeTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Table */}
                <EnhancedDataTable
                  data={filteredEmployees}
                  columns={employeeColumns}
                  exportable={true}
                />
              </TabsContent>

              {/* Payroll History Tab */}
              <TabsContent value="history" className="space-y-6">
                <EnhancedDataTable
                  data={payrollHistory}
                  columns={payrollHistoryColumns}
                  exportable={true}
                />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Payslip Dialog */}
          <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Employee Payslip</DialogTitle>
              </DialogHeader>
              {selectedEmployee && (
                <div className="space-y-6">
                  {/* Employee Details */}
                  <div className="border-b pb-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedEmployee.employee_name}
                        </h3>
                        <p className="text-slate-600">
                          {selectedEmployee.designation}
                        </p>
                        <p className="text-sm text-slate-500">
                          {selectedEmployee.employee_id} •{" "}
                          {selectedEmployee.branch}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Pay Period</p>
                        <p className="font-medium">March 2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Salary Breakdown */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-green-700 mb-3">
                        Earnings
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Basic Salary</span>
                          <span>
                            ₹{selectedEmployee.base_salary.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Allowances</span>
                          <span>
                            ₹{selectedEmployee.allowances.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t pt-2 font-semibold flex justify-between">
                          <span>Gross Salary</span>
                          <span>
                            ₹
                            {(
                              selectedEmployee.base_salary +
                              selectedEmployee.allowances
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-3">
                        Deductions
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tax Deduction</span>
                          <span>
                            ₹
                            {Math.floor(
                              selectedEmployee.deductions * 0.7
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>PF Contribution</span>
                          <span>
                            ₹
                            {Math.floor(
                              selectedEmployee.deductions * 0.3
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t pt-2 font-semibold flex justify-between">
                          <span>Total Deductions</span>
                          <span>
                            ₹{selectedEmployee.deductions.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Salary */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Net Salary</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{selectedEmployee.net_salary.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="text-sm text-slate-600">
                    <p>
                      <strong>Bank Account:</strong>{" "}
                      {selectedEmployee.bank_account}
                    </p>
                    <p>
                      <strong>PAN Number:</strong> {selectedEmployee.pan_number}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => console.log("Download payslip")}
                      data-testid="button-download-payslip"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => setShowPayslipDialog(false)}
                      data-testid="button-close-payslip"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
