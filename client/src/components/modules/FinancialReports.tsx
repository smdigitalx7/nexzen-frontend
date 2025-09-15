import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  FileText,
  Receipt,
  CreditCard,
  Banknote,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/authStore";

// Mock data for financial reports
const mockIncomeData = [
  {
    month: "Jan",
    tuition: 6500000,
    transport: 480000,
    books: 350000,
    admission: 200000,
    other: 150000,
  },
  {
    month: "Feb",
    tuition: 7200000,
    transport: 520000,
    books: 380000,
    admission: 180000,
    other: 120000,
  },
  {
    month: "Mar",
    tuition: 7800000,
    transport: 560000,
    books: 420000,
    admission: 220000,
    other: 180000,
  },
  {
    month: "Apr",
    tuition: 8200000,
    transport: 600000,
    books: 450000,
    admission: 250000,
    other: 200000,
  },
  {
    month: "May",
    tuition: 8500000,
    transport: 620000,
    books: 480000,
    admission: 200000,
    other: 160000,
  },
];

const mockExpenseData = [
  {
    month: "Jan",
    salary: 3200000,
    maintenance: 450000,
    utilities: 180000,
    transport: 350000,
    other: 220000,
  },
  {
    month: "Feb",
    salary: 3200000,
    maintenance: 420000,
    utilities: 190000,
    transport: 380000,
    other: 200000,
  },
  {
    month: "Mar",
    salary: 3200000,
    maintenance: 480000,
    utilities: 200000,
    transport: 400000,
    other: 250000,
  },
  {
    month: "Apr",
    salary: 3200000,
    maintenance: 500000,
    utilities: 210000,
    transport: 420000,
    other: 280000,
  },
  {
    month: "May",
    salary: 3200000,
    maintenance: 520000,
    utilities: 220000,
    transport: 450000,
    other: 300000,
  },
];

const mockFeeCollectionData = [
  { month: "Jan", collected: 6500000, pending: 1200000, overdue: 300000 },
  { month: "Feb", collected: 7200000, pending: 980000, overdue: 250000 },
  { month: "Mar", collected: 7800000, pending: 850000, overdue: 200000 },
  { month: "Apr", collected: 8200000, pending: 1800000, overdue: 400000 },
  { month: "May", collected: 8500000, pending: 1200000, overdue: 350000 },
];

const mockBranchPerformance = [
  {
    branch: "Main Campus",
    revenue: 3200000,
    expenses: 1800000,
    profit: 1400000,
    students: 1247,
  },
  {
    branch: "North Branch",
    revenue: 2100000,
    expenses: 1200000,
    profit: 900000,
    students: 856,
  },
  {
    branch: "Science College",
    revenue: 1800000,
    expenses: 1100000,
    profit: 700000,
    students: 642,
  },
  {
    branch: "Evening College",
    revenue: 1100000,
    expenses: 800000,
    profit: 300000,
    students: 502,
  },
];

const mockIncomeBreakdown = [
  { name: "Tuition Fees", value: 38200000, color: "#3b82f6" },
  { name: "Transport Fees", value: 2780000, color: "#10b981" },
  { name: "Book Fees", value: 2080000, color: "#f59e0b" },
  { name: "Admission Fees", value: 1050000, color: "#ef4444" },
  { name: "Other Income", value: 810000, color: "#8b5cf6" },
];

const mockExpenseBreakdown = [
  { name: "Salaries", value: 16000000, color: "#3b82f6" },
  { name: "Maintenance", value: 2370000, color: "#10b981" },
  { name: "Transport", value: 2000000, color: "#f59e0b" },
  { name: "Utilities", value: 1000000, color: "#ef4444" },
  { name: "Other Expenses", value: 1250000, color: "#8b5cf6" },
];

const mockOutstandingFees = [
  {
    id: 1,
    student_id: "STU2024156",
    student_name: "Priya Patel",
    class_name: "Class 8",
    total_fee: 23500,
    paid_amount: 12833,
    outstanding: 10667,
    days_overdue: 15,
    last_payment: "2024-12-15",
  },
  {
    id: 2,
    student_id: "STU2024157",
    student_name: "Arjun Sharma",
    class_name: "Class 9",
    total_fee: 26500,
    paid_amount: 26000,
    outstanding: 500,
    days_overdue: 5,
    last_payment: "2024-12-20",
  },
  {
    id: 3,
    student_id: "STU2024158",
    student_name: "Sneha Reddy",
    class_name: "1st Year MPC",
    total_fee: 36000,
    paid_amount: 18000,
    outstanding: 18000,
    days_overdue: 25,
    last_payment: "2024-11-30",
  },
];

const FinancialReports = () => {
  const { user, currentBranch } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
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

  const calculateTotalIncome = () => {
    return mockIncomeData.reduce(
      (sum, month) =>
        sum +
        month.tuition +
        month.transport +
        month.books +
        month.admission +
        month.other,
      0
    );
  };

  const calculateTotalExpenses = () => {
    return mockExpenseData.reduce(
      (sum, month) =>
        sum +
        month.salary +
        month.maintenance +
        month.utilities +
        month.transport +
        month.other,
      0
    );
  };

  const calculateNetProfit = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const calculateProfitMargin = () => {
    return (calculateNetProfit() / calculateTotalIncome()) * 100;
  };

  const totalIncome = calculateTotalIncome();
  const totalExpenses = calculateTotalExpenses();
  const netProfit = calculateNetProfit();
  const profitMargin = calculateProfitMargin();
  const totalOutstanding = mockOutstandingFees.reduce(
    (sum, fee) => sum + fee.outstanding,
    0
  );

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial analysis and reporting dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const rows = [
                ["Section", "Metric", "Value"],
                ["Totals", "Income", String(calculateTotalIncome())],
                ["Totals", "Expenses", String(calculateTotalExpenses())],
                ["Totals", "Net Profit", String(calculateNetProfit())],
                [
                  "Totals",
                  "Profit Margin %",
                  String(calculateProfitMargin().toFixed(2)),
                ],
              ];
              const csv = rows.map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `financial_report_${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const data = document.body.innerHTML; // simple print of current view
              const frame = document.createElement("iframe");
              frame.style.position = "fixed";
              frame.style.right = "0";
              frame.style.bottom = "0";
              frame.style.width = "0";
              frame.style.height = "0";
              frame.style.border = "0";
              document.body.appendChild(frame);
              const frameDoc = frame.contentWindow || frame.contentDocument;
              const doc = (frameDoc as any).document || frameDoc;
              doc.open();
              doc.write(
                `<html><head><title>Financial Report</title></head><body>${data}</body></html>`
              );
              doc.close();
              (frame as any).contentWindow.focus();
              (frame as any).contentWindow.print();
              setTimeout(() => document.body.removeChild(frame), 1000);
            }}
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Financial Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCompactCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCompactCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCompactCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Fees
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCompactCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockOutstandingFees.length} students
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="period">Period:</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="branch">Branch:</Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="main">Main Campus</SelectItem>
                    <SelectItem value="north">North Branch</SelectItem>
                    <SelectItem value="science">Science College</SelectItem>
                    <SelectItem value="evening">Evening College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="start-date">From:</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="end-date">To:</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income Analysis</TabsTrigger>
            <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses Trend</CardTitle>
                  <CardDescription>
                    Monthly comparison of income and expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockIncomeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) => formatCompactCurrency(value)}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Area
                        type="monotone"
                        dataKey="tuition"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        name="Tuition"
                      />
                      <Area
                        type="monotone"
                        dataKey="transport"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        name="Transport"
                      />
                      <Area
                        type="monotone"
                        dataKey="books"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        name="Books"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branch Performance</CardTitle>
                  <CardDescription>
                    Revenue and profit by branch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockBranchPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch" />
                      <YAxis
                        tickFormatter={(value) => formatCompactCurrency(value)}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                      <Bar dataKey="profit" fill="#10b981" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Income Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of income sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockIncomeBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockIncomeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of expense categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockExpenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockExpenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Income Analysis Tab */}
          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Trend Analysis</CardTitle>
                <CardDescription>
                  Detailed income breakdown by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockIncomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) => formatCompactCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Bar dataKey="tuition" fill="#3b82f6" name="Tuition Fees" />
                    <Bar
                      dataKey="transport"
                      fill="#10b981"
                      name="Transport Fees"
                    />
                    <Bar dataKey="books" fill="#f59e0b" name="Book Fees" />
                    <Bar
                      dataKey="admission"
                      fill="#ef4444"
                      name="Admission Fees"
                    />
                    <Bar dataKey="other" fill="#8b5cf6" name="Other Income" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {mockIncomeBreakdown.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCompactCurrency(item.value)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((item.value / totalIncome) * 100).toFixed(1)}% of total
                      income
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Expense Analysis Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Trend Analysis</CardTitle>
                <CardDescription>
                  Detailed expense breakdown by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) => formatCompactCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Bar dataKey="salary" fill="#3b82f6" name="Salaries" />
                    <Bar
                      dataKey="maintenance"
                      fill="#10b981"
                      name="Maintenance"
                    />
                    <Bar dataKey="transport" fill="#f59e0b" name="Transport" />
                    <Bar dataKey="utilities" fill="#ef4444" name="Utilities" />
                    <Bar dataKey="other" fill="#8b5cf6" name="Other Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {mockExpenseBreakdown.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCompactCurrency(item.value)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((item.value / totalExpenses) * 100).toFixed(1)}% of
                      total expenses
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profit Margin Trend</CardTitle>
                  <CardDescription>
                    Monthly profit margin analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockFeeCollectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="collected"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Collected"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branch Profitability</CardTitle>
                  <CardDescription>Profit margin by branch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBranchPerformance.map((branch, index) => {
                      const margin = (branch.profit / branch.revenue) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{branch.branch}</span>
                            <span className="text-green-600 font-bold">
                              {margin.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={margin} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Profit: {formatCompactCurrency(branch.profit)}
                            </span>
                            <span>
                              Revenue: {formatCompactCurrency(branch.revenue)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Outstanding Tab */}
          <TabsContent value="outstanding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Fee Collection</CardTitle>
                <CardDescription>
                  Students with pending fee payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Fee</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOutstandingFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {fee.student_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {fee.student_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{fee.class_name}</TableCell>
                        <TableCell>{formatCurrency(fee.total_fee)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(fee.paid_amount)}
                        </TableCell>
                        <TableCell className="text-red-600 font-bold">
                          {formatCurrency(fee.outstanding)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              fee.days_overdue > 30
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {fee.days_overdue} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(fee.last_payment).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Receipt className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default FinancialReports;
