import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface CollegeFinancialAnalyticsProps {
  incomeDashboard: any;
  expenditureDashboard: any;
  loading?: boolean;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#a855f7",
  pink: "#ec4899",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

export const CollegeFinancialAnalytics = ({
  incomeDashboard,
  expenditureDashboard,
  loading,
}: CollegeFinancialAnalyticsProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!incomeDashboard || !expenditureDashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available for analytics</p>
      </div>
    );
  }

  // Prepare Income by Category Data
  const incomeByCategory = [
    {
      name: "Tuition Fees",
      value: incomeDashboard.tuition_fee_income || 0,
      color: COLORS.primary,
    },
    {
      name: "Transport Fees",
      value: incomeDashboard.transport_fee_income || 0,
      color: COLORS.secondary,
    },
    {
      name: "Book Fees",
      value: incomeDashboard.book_fee_income || 0,
      color: COLORS.info,
    },
    {
      name: "Reservation Fees",
      value: incomeDashboard.reservation_fee_income || 0,
      color: COLORS.success,
    },
    {
      name: "Other Income",
      value: incomeDashboard.other_income || 0,
      color: COLORS.warning,
    },
  ].filter(item => item.value > 0);

  // Prepare Expenditure by Payment Status
  const expenditureByCategory = [
    {
      name: "Paid",
      value: expenditureDashboard.total_paid_amount || 0,
      color: COLORS.success,
    },
    {
      name: "Unpaid",
      value: expenditureDashboard.total_unpaid_amount || 0,
      color: COLORS.danger,
    },
  ].filter(item => item.value > 0);

  // Prepare Income vs Expenditure Comparison
  const incomeVsExpenditure = [
    {
      name: "Total",
      income: incomeDashboard.total_income_amount || 0,
      expenditure: expenditureDashboard.total_expenditure_amount || 0,
    },
  ];

  // Monthly Trend Data (Mock - can be replaced with real monthly data)
  const monthlyTrend = [
    { month: "Jan", income: 85000, expenditure: 62000 },
    { month: "Feb", income: 92000, expenditure: 64000 },
    { month: "Mar", income: 88000, expenditure: 66000 },
    { month: "Apr", income: 101000, expenditure: 68000 },
    { month: "May", income: 95000, expenditure: 65000 },
    { month: "Jun", income: 107000, expenditure: 70000 },
  ];

  // Calculate net profit
  const netProfit = (incomeDashboard.total_income_amount || 0) - (expenditureDashboard.total_expenditure_amount || 0);
  const profitPercentage = incomeDashboard.total_income_amount 
    ? ((netProfit / incomeDashboard.total_income_amount) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{(incomeDashboard.total_income_amount || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All income sources
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenditure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    ₹{(expenditureDashboard.total_expenditure_amount || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All expenses
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`border-l-4 ${netProfit >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ₹{netProfit.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profitPercentage}% of income
                  </p>
                </div>
                <Wallet className={`h-8 w-8 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Income Distribution</CardTitle>
              <CardDescription>Breakdown of income by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenditure Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Expenditure by Payment Status</CardTitle>
              <CardDescription>Breakdown of paid vs unpaid expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenditureByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenditureByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income vs Expenditure Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenditure</CardTitle>
              <CardDescription>Overall comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeVsExpenditure}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill={COLORS.success} name="Income" />
                  <Bar dataKey="expenditure" fill={COLORS.danger} name="Expenditure" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Trend Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
              <CardDescription>6-month income and expenditure trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke={COLORS.success} 
                    strokeWidth={2}
                    name="Income"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenditure" 
                    stroke={COLORS.danger} 
                    strokeWidth={2}
                    name="Expenditure"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Income Categories Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Income Categories Breakdown</CardTitle>
            <CardDescription>Detailed view of all income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={incomeByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="value" fill={COLORS.primary} name="Amount">
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Area Chart for Cumulative View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Financial Flow Overview</CardTitle>
            <CardDescription>Monthly income and expenditure flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenditure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke={COLORS.success} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)"
                  name="Income"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenditure" 
                  stroke={COLORS.danger} 
                  fillOpacity={1} 
                  fill="url(#colorExpenditure)"
                  name="Expenditure"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

