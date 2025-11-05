import { Link } from "wouter";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import {
  TrendingUp,
  UserCheck,
  Bus,
  CheckCircle,
  AlertTriangle,
  Building2,
  Receipt,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
} from "lucide-react";
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
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAdminDashboard } from "@/lib/hooks/general";
import { formatCurrency } from "@/lib/utils";
import {
  DashboardContainer,
  DashboardHeader,
  StatsCard,
  DashboardGrid,
  DashboardError,
} from "@/components/shared/dashboard";

const AdminDashboard = () => {
  const { user, currentBranch } = useAuthStore();
  const { data: dashboardData, loading, error } = useAdminDashboard();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <DashboardContainer loading={loading}>
      <DashboardHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
        description={`Here's what's happening at ${currentBranch?.branch_name} today.`}
        badge={{
          text: currentBranch?.branch_type || "Education",
          variant: "outline",
        }}
      />

      <DashboardError error={error} />

      {/* Dashboard Content */}
      {!loading && !error && dashboardData && (
        <>
          {/* All Stats Cards */}
          <DashboardGrid columns={5}>
            {/* Overview Statistics */}
            <StatsCard
              title="Total Students"
              value={dashboardData.data.overview.total_students.toLocaleString()}
              icon={Users}
              color="blue"
              description="Across all branches"
              size="md"
            />
            <StatsCard
              title="Total Teachers"
              value={dashboardData.data.overview.total_teachers.toLocaleString()}
              icon={GraduationCap}
              color="purple"
              description="Teaching staff"
              size="md"
            />
            <StatsCard
              title="Total Classes"
              value={dashboardData.data.overview.total_classes.toLocaleString()}
              icon={BookOpen}
              color="indigo"
              description="Active classes"
              size="md"
            />
            <StatsCard
              title="Total Branches"
              value={dashboardData.data.overview.total_branches.toLocaleString()}
              icon={Building2}
              color="cyan"
              description="Institute branches"
              size="md"
            />
            
            {/* Financial Overview - All Time */}
            <StatsCard
              title="Total Income"
              value={formatCurrency(parseFloat(dashboardData.data.financial.total_income))}
              icon={IndianRupeeIcon}
              color="emerald"
              description="All time"
              size="md"
            />
            <StatsCard
              title="Total Expenditure"
              value={formatCurrency(parseFloat(dashboardData.data.financial.total_expenditure))}
              icon={Receipt}
              color="red"
              description="All time"
              size="md"
            />
            <StatsCard
              title="Net Profit"
              value={formatCurrency(parseFloat(dashboardData.data.financial.net_profit))}
              icon={TrendingUp}
              color="green"
              description="Income - Expenditure"
              size="md"
            />
            <StatsCard
              title="Income This Year"
              value={formatCurrency(parseFloat(dashboardData.data.financial.income_this_year))}
              icon={TrendingUp}
              color="blue"
              description="Current year"
              size="md"
            />
            
            {/* Financial Overview - This Month & Year */}
            <StatsCard
              title="Income This Month"
              value={formatCurrency(parseFloat(dashboardData.data.financial.income_this_month))}
              icon={IndianRupeeIcon}
              color="emerald"
              description="Current month"
              size="md"
            />
            <StatsCard
              title="Expenditure This Month"
              value={formatCurrency(parseFloat(dashboardData.data.financial.expenditure_this_month))}
              icon={Receipt}
              color="red"
              description="Current month"
              size="md"
            />
            <StatsCard
              title="Expenditure This Year"
              value={formatCurrency(parseFloat(dashboardData.data.financial.expenditure_this_year))}
              icon={Receipt}
              color="orange"
              description="Current year"
              size="md"
            />
            
            {/* Attendance & Academic Metrics */}
            <StatsCard
              title="Attendance Rate"
              value={`${parseFloat(dashboardData.data.attendance.average_attendance_rate).toFixed(1)}%`}
              icon={TrendingUp}
              color="orange"
              description="Average rate"
              size="md"
            />
            <StatsCard
              title="Total Exams"
              value={dashboardData.data.academic.total_exams.toString()}
              icon={Award}
              color="purple"
              description="All exams"
              size="md"
            />
            <StatsCard
              title="Upcoming Exams"
              value={dashboardData.data.academic.upcoming_exams.toString()}
              icon={Calendar}
              color="blue"
              description="Scheduled"
              size="md"
            />
            <StatsCard
              title="Pass Rate"
              value={`${parseFloat(dashboardData.data.academic.average_pass_rate).toFixed(1)}%`}
              icon={TrendingUp}
              color="green"
              description="Average pass rate"
              size="md"
            />
          </DashboardGrid>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Income Trend Chart */}
            {dashboardData.data.charts.income_trend.length > 0 && (
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

            {/* Enrollment Trend Chart */}
            {dashboardData.data.charts.enrollment_trend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Trend</CardTitle>
                  <CardDescription>Monthly enrollment statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.data.charts.enrollment_trend.map((item) => ({
                      month: item.month?.split(' ')[0] || '',
                      enrollments: parseInt(item.enrollments || '0'),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="enrollments" fill="#3b82f6" name="Enrollments" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Income by Category Chart */}
          {dashboardData.data.charts.income_by_category.length > 0 && (
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
                    <Bar dataKey="amount" fill="#8b5cf6" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Enrollments & Reservations Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrollments Overview</CardTitle>
                <CardDescription>Enrollment statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Enrollments</span>
                    <span className="text-lg font-semibold">{dashboardData.data.enrollments.total_enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confirmed</span>
                    <span className="text-lg font-semibold text-green-600">{dashboardData.data.enrollments.confirmed_enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="text-lg font-semibold text-yellow-600">{dashboardData.data.enrollments.pending_enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cancelled</span>
                    <span className="text-lg font-semibold text-red-600">{dashboardData.data.enrollments.cancelled_enrollments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reservations Overview</CardTitle>
                <CardDescription>Reservation statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Reservations</span>
                    <span className="text-lg font-semibold">{dashboardData.data.reservations.total_reservations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confirmed</span>
                    <span className="text-lg font-semibold text-green-600">{dashboardData.data.reservations.confirmed_reservations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="text-lg font-semibold text-yellow-600">{dashboardData.data.reservations.pending_reservations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cancelled</span>
                    <span className="text-lg font-semibold text-red-600">{dashboardData.data.reservations.cancelled_reservations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities & Quick Links */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    Latest updates from your institute
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.data.enrollments.pending_enrollments > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {dashboardData.data.enrollments.pending_enrollments} pending enrollments
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              Requires attention
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">enrollment</Badge>
                      </div>
                    )}
                    {dashboardData.data.reservations.pending_reservations > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {dashboardData.data.reservations.pending_reservations} pending reservations
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              Requires attention
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">reservation</Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {dashboardData.data.overview.total_students} total students enrolled
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {dashboardData.data.enrollments.confirmed_enrollments} confirmed
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">students</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {dashboardData.data.reservations.total_reservations} total reservations
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {dashboardData.data.reservations.confirmed_reservations} confirmed
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">reservations</Badge>
                    </div>
                    {dashboardData.data.academic.upcoming_exams > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {dashboardData.data.academic.upcoming_exams} upcoming exams
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {dashboardData.data.academic.completed_exams} completed
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">exams</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Admin modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "Employee Management",
                  href: "/employees",
                  icon: UserCheck,
                  color: "bg-emerald-500",
                },
                {
                  title: "Payroll",
                  href: "/payroll",
                  icon: IndianRupeeIcon,
                  color: "bg-purple-500",
                },
                {
                  title: "Transport",
                  href: "/transport",
                  icon: Bus,
                  color: "bg-cyan-500",
                },
                {
                  title: "User Management",
                  href: "/users",
                  icon: UserCheck,
                  color: "bg-indigo-500",
                },
                {
                  title: "Audit Log",
                  href: "/audit-log",
                  icon: Receipt,
                  color: "bg-sky-500",
                },
              ].map((link) => (
                <Link key={link.title} href={link.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto p-3 hover-elevate"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.color}`}
                    >
                      <link.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{link.title}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
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

export default AdminDashboard;
