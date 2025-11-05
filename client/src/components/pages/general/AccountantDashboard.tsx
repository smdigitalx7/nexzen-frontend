import { Link, useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  ClipboardList,
  UserCheck,
  BarChart3,
  Receipt,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { useAccountantDashboard } from "@/lib/hooks/general";
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
import {
  DashboardContainer,
  DashboardHeader,
  DashboardError,
} from "@/components/shared/dashboard";

const AccountantDashboard = () => {
  const { user, currentBranch } = useAuthStore();
  const [location] = useLocation();
  const branchPrefix =
    currentBranch?.branch_type === "SCHOOL" ? "/school" : "/college";
  const { data: dashboardData, loading, error } = useAccountantDashboard();

  return (
    <DashboardContainer loading={loading}>
      <DashboardHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Accountant"}!`}
        description={`Financial overview for ${currentBranch?.branch_name}`}
        badge={{
          text: currentBranch?.branch_type || "Education",
          variant: "outline",
        }}
      />

      <DashboardError error={error} />

      {/* Dashboard Content */}
      {!loading && !error && dashboardData && (
        <>
          {/* Financial Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Income Today",
                value: formatCurrency(parseFloat(dashboardData.data.financial_overview.income_today)),
                icon: DollarSign,
                color: "text-green-600",
                desc: "Today's collection",
              },
              {
                title: "Total Income",
                value: formatCurrency(parseFloat(dashboardData.data.financial_overview.total_income)),
                icon: TrendingUp,
                color: "text-blue-600",
                desc: "All time",
              },
              {
                title: "Total Expenditure",
                value: formatCurrency(parseFloat(dashboardData.data.financial_overview.total_expenditure)),
                icon: Receipt,
                color: "text-red-600",
                desc: "All time",
              },
              {
                title: "Net Balance",
                value: formatCurrency(
                  parseFloat(dashboardData.data.financial_overview.total_income) -
                  parseFloat(dashboardData.data.financial_overview.total_expenditure)
                ),
                icon: BarChart3,
                color: "text-purple-600",
                desc: "Income - Expenditure",
              },
            ].map((c) => (
              <Card key={c.title} className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Financial Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
                <CardDescription>Monthly financial summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Income This Month</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(parseFloat(dashboardData.data.financial_overview.income_this_month))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expenditure This Month</span>
                    <span className="text-lg font-semibold text-red-600">
                      {formatCurrency(parseFloat(dashboardData.data.financial_overview.expenditure_this_month))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Net This Month</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(
                        parseFloat(dashboardData.data.financial_overview.income_this_month) -
                        parseFloat(dashboardData.data.financial_overview.expenditure_this_month)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tuition Fees</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.tuition_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transport Fees</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.transport_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Book Fees</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.book_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Application Fees</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(parseFloat(dashboardData.data.income_breakdown.application_fee_income))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Other Income</span>
                    <span className="text-sm font-semibold">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Income Trend</CardTitle>
                    <CardDescription>Monthly income and expenditure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dashboardData.data.charts.income_trend.map((item) => ({
                        month: item.month?.split(' ')[0] || '',
                        income: parseFloat(item.income || '0'),
                        expenditure: parseFloat(item.expenditure || '0'),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                        <Line type="monotone" dataKey="expenditure" stroke="#ef4444" strokeWidth={2} name="Expenditure" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Income by Category Chart */}
              {dashboardData.data.charts.income_by_category && dashboardData.data.charts.income_by_category.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Income by Category</CardTitle>
                    <CardDescription>Breakdown of income sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.data.charts.income_by_category.map((item) => ({
                        category: item.category || 'Other',
                        amount: parseFloat(item.amount || '0'),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Expenditure by Category Chart */}
              {dashboardData.data.charts.expenditure_by_category && dashboardData.data.charts.expenditure_by_category.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Expenditure by Category</CardTitle>
                    <CardDescription>Breakdown of expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.data.charts.expenditure_by_category.map((item) => ({
                        category: item.category || 'Other',
                        amount: parseFloat(item.amount || '0'),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="amount" fill="#ef4444" name="Amount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method Distribution */}
              {dashboardData.data.charts.payment_method_distribution && dashboardData.data.charts.payment_method_distribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Distribution by payment method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
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
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.data.charts.payment_method_distribution.map((entry, index) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Daily Transactions Chart */}
              {dashboardData.data.charts.daily_transactions && dashboardData.data.charts.daily_transactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Transactions</CardTitle>
                    <CardDescription>Daily income and expenditure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dashboardData.data.charts.daily_transactions.map((item) => ({
                        date: new Date(item.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        income: parseFloat(item.income || '0'),
                        expenditure: parseFloat(item.expenditure || '0'),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                        <Line type="monotone" dataKey="expenditure" stroke="#ef4444" strokeWidth={2} name="Expenditure" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Admissions and fee collection</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "New Reservation",
              href: `${branchPrefix}/reservations/new`,
              icon: ClipboardList,
              color: "bg-blue-500",
            },
            {
              title: "Admissions",
              href: `${branchPrefix}/admissions`,
              icon: UserCheck,
              color: "bg-emerald-500",
            },
            {
              title: "Fee Collection",
              href: `${branchPrefix}/fees`,
              icon: IndianRupeeIcon,
              color: "bg-purple-500",
            },
            {
              title: "Financial Reports",
              href: `${branchPrefix}/financial-reports`,
              icon: BarChart3,
              color: "bg-sky-500",
            },
          ].map((a) => (
            <Link key={a.title} href={a.href}>
              <Button
                variant="outline"
                className="justify-start gap-3 h-auto p-3 hover-elevate w-full"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`}
                >
                  <a.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{a.title}</span>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest fee transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2">Transaction ID</th>
                  <th className="py-2">Student</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Payment Method</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.data.recent_transactions.length > 0 ? (
                  dashboardData.data.recent_transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-medium">{transaction.transaction_id || transaction.voucher_no || `#${transaction.id}`}</td>
                      <td className="py-2">{transaction.student_name || transaction.admission_no || 'N/A'}</td>
                      <td className="py-2">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="py-2">{transaction.payment_method || 'N/A'}</td>
                      <td className="py-2">{formatCurrency(parseFloat(transaction.amount))}</td>
                      <td className="py-2">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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

