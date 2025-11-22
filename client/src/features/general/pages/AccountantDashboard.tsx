import { useMemo } from "react";
import { useLocation } from "wouter";
import { formatCurrency } from "@/common/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useAuthStore } from "@/core/auth/authStore";
import {
  ClipboardList,
  UserCheck,
  BarChart3,
  Receipt,
  TrendingUp,
  DollarSign,
  MoreHorizontal,
  TrendingDown,
  BookOpen,
  Bus,
  FileText,
  CreditCard,
  Calendar,
  User,
  PieChart as PieChartIcon,
} from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { useAccountantDashboard } from "@/features/general/hooks";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardContainer } from "@/common/components/shared/dashboard/DashboardContainer";
import { DashboardHeader } from "@/common/components/shared/dashboard/DashboardHeader";
import { DashboardError } from "@/common/components/shared/dashboard/DashboardError";
import { StatsCard } from "@/common/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/common/components/shared/dashboard/DashboardGrid";

const AccountantDashboard = () => {
  const { user, currentBranch } = useAuthStore();
  const [, setLocation] = useLocation();
  const branchPrefix =
    currentBranch?.branch_type === "SCHOOL" ? "/school" : "/college";
  const { data: dashboardData, loading, error } = useAccountantDashboard();

  const quickLinks = useMemo(() => [
    {
      title: "New Reservation",
      href: `${branchPrefix}/reservations/new`,
      icon: ClipboardList,
      color: "text-blue-600",
    },
    {
      title: "Admissions",
      href: `${branchPrefix}/admissions`,
      icon: UserCheck,
      color: "text-emerald-600",
    },
    {
      title: "Fee Collection",
      href: `${branchPrefix}/fees`,
      icon: IndianRupeeIcon,
      color: "text-purple-600",
    },
    {
      title: "Financial Reports",
      href: `${branchPrefix}/financial-reports`,
      icon: BarChart3,
      color: "text-sky-600",
    },
  ], [branchPrefix]);

  const quickLinksDropdown = useMemo(() => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <MoreHorizontal className="h-4 w-4 mr-2" />
          Quick Links
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <DropdownMenuItem
              key={link.title}
              onClick={() => setLocation(link.href)}
              className="cursor-pointer"
            >
              <Icon className={`h-4 w-4 mr-2 ${link.color}`} />
              <span>{link.title}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  ), [quickLinks, setLocation]);

  return (
    <DashboardContainer loading={loading}>
      <DashboardHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Accountant"}!`}
        description="Financial overview and transaction management"
        showBranchBadge={true}
        rightContent={quickLinksDropdown}
      />

      <DashboardError error={error} />

      {/* Dashboard Content */}
      {!loading && !error && dashboardData && (
        <>
          {/* Financial Overview Cards */}
          <DashboardGrid columns={4}>
            <StatsCard
              title="Income Today"
              value={formatCurrency(parseFloat(dashboardData.data.financial_overview.income_today))}
              icon={DollarSign}
              color="green"
              description="Today's collection"
              size="md"
            />
            <StatsCard
              title="Total Income"
              value={formatCurrency(parseFloat(dashboardData.data.financial_overview.total_income))}
              icon={TrendingUp}
              color="blue"
              description="All time"
              size="md"
            />
            <StatsCard
              title="Total Expenditure"
              value={formatCurrency(parseFloat(dashboardData.data.financial_overview.total_expenditure))}
              icon={Receipt}
              color="red"
              description="All time"
              size="md"
            />
            <StatsCard
              title="Net Balance"
              value={formatCurrency(
                parseFloat(dashboardData.data.financial_overview.total_income) -
                parseFloat(dashboardData.data.financial_overview.total_expenditure)
              )}
              icon={BarChart3}
              color="purple"
              description="Income - Expenditure"
              size="md"
            />
          </DashboardGrid>

          {/* Recent Payments */}
          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest fee transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase">Transaction ID</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase">Payment Method</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Amount</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.data.recent_transactions.length > 0 ? (
                      dashboardData.data.recent_transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {transaction.transaction_id || transaction.voucher_no || `#${transaction.id}`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{transaction.student_name || transaction.admission_no || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge 
                              variant={transaction.type === 'income' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {transaction.type}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <span className="text-sm">{transaction.payment_method || 'N/A'}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`text-base font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(parseFloat(transaction.amount))}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(transaction.transaction_date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Receipt className="h-8 w-8 text-muted-foreground/50" />
                            <p>No recent transactions</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Financial Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">This Month</CardTitle>
                    <CardDescription>Monthly financial summary</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Income This Month</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(parseFloat(dashboardData.data.financial_overview.income_this_month))}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Expenditure This Month</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(parseFloat(dashboardData.data.financial_overview.expenditure_this_month))}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Net This Month</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            parseFloat(dashboardData.data.financial_overview.income_this_month) -
                            parseFloat(dashboardData.data.financial_overview.expenditure_this_month)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Income Breakdown</CardTitle>
                    <CardDescription>By category</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium">Tuition Fees</span>
                    </div>
                    <span className="text-base font-bold text-indigo-600">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.tuition_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900">
                        <Bus className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <span className="text-sm font-medium">Transport Fees</span>
                    </div>
                    <span className="text-base font-bold text-cyan-600">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.transport_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium">Book Fees</span>
                    </div>
                    <span className="text-base font-bold text-emerald-600">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.book_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900">
                        <ClipboardList className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium">Application Fees</span>
                    </div>
                    <span className="text-base font-bold text-amber-600">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.application_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-800 mt-2 pt-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700">
                        <DollarSign className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="text-sm font-semibold">Other Income</span>
                    </div>
                    <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.other_income))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {dashboardData.data.charts && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Income Trend Chart */}
              {dashboardData.data.charts.income_trend && dashboardData.data.charts.income_trend.length > 0 && (
                <Card className="hover-elevate">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Income Trend</CardTitle>
                        <CardDescription>Monthly income and expenditure</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={dashboardData.data.charts.income_trend.map((item) => ({
                        month: item.month?.split(' ')[0] || '',
                        income: parseFloat(item.income || '0'),
                        expenditure: parseFloat(item.expenditure || '0'),
                      }))} margin={{ bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                        />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} name="Income" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="expenditure" stroke="#ef4444" strokeWidth={2.5} name="Expenditure" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Income by Category Chart */}
              {dashboardData.data.charts.income_by_category && dashboardData.data.charts.income_by_category.length > 0 && (
                <Card className="hover-elevate">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Income by Category</CardTitle>
                        <CardDescription>Breakdown of income sources</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={dashboardData.data.charts.income_by_category.map((item) => ({
                        category: item.category || 'Other',
                        amount: parseFloat(item.amount || '0'),
                      }))} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="category" 
                          tick={{ fontSize: 9 }} 
                          height={40}
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                        />
                        <Bar dataKey="amount" fill="#3b82f6" name="Amount" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Expenditure by Category Chart */}
              {dashboardData.data.charts.expenditure_by_category && dashboardData.data.charts.expenditure_by_category.length > 0 && (
                <Card className="hover-elevate">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Expenditure by Category</CardTitle>
                        <CardDescription>Breakdown of expenses</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={dashboardData.data.charts.expenditure_by_category.map((item) => ({
                        category: item.category || 'Other',
                        amount: parseFloat(item.amount || '0'),
                      }))} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="category" 
                          tick={{ fontSize: 9 }} 
                          height={40}
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                        />
                        <Bar dataKey="amount" fill="#ef4444" name="Amount" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method Distribution */}
              {dashboardData.data.charts.payment_method_distribution && dashboardData.data.charts.payment_method_distribution.length > 0 && (
                <Card className="hover-elevate">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <PieChartIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Payment Methods</CardTitle>
                        <CardDescription>Distribution by payment method</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={dashboardData.data.charts.payment_method_distribution.map((item) => ({
                            name: item.method || 'Other',
                            value: parseFloat(item.amount || '0'),
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.data.charts.payment_method_distribution.map((entry, index) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Daily Transactions Chart */}
              {dashboardData.data.charts.daily_transactions && dashboardData.data.charts.daily_transactions.length > 0 && (
                <Card className="hover-elevate">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Daily Transactions</CardTitle>
                        <CardDescription>Daily income and expenditure</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 pb-4">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={dashboardData.data.charts.daily_transactions.map((item) => ({
                        date: new Date(item.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        income: parseFloat(item.income || '0'),
                        expenditure: parseFloat(item.expenditure || '0'),
                      }))} margin={{ bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 9 }} 
                          height={30}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                        />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} name="Income" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="expenditure" stroke="#ef4444" strokeWidth={2.5} name="Expenditure" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Fallback for when no dashboard data is available */}
      {!loading && !error && !dashboardData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">No dashboard data available</div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default AccountantDashboard;

