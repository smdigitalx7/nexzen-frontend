import { Link, useLocation } from "wouter";
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
  MoreHorizontal,
  BarChart3,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [, setLocation] = useLocation();

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

  const quickLinks = [
    {
      title: "Employee Management",
      href: "/employees",
      icon: UserCheck,
      color: "text-emerald-600",
    },
    {
      title: "Payroll",
      href: "/payroll",
      icon: IndianRupeeIcon,
      color: "text-purple-600",
    },
    {
      title: "Transport",
      href: "/transport",
      icon: Bus,
      color: "text-cyan-600",
    },
    {
      title: "User Management",
      href: "/users",
      icon: UserCheck,
      color: "text-indigo-600",
    },
    {
      title: "Audit Log",
      href: "/audit-log",
      icon: Receipt,
      color: "text-sky-600",
    },
  ];

  const quickLinksDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <MoreHorizontal className="h-4 w-4 mr-2" />
          Quick Links
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Admin Modules</DropdownMenuLabel>
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
  );

  return (
    <DashboardContainer loading={loading}>
      <DashboardHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
        description="Here's what's happening today."
        showBranchBadge={true}
        rightContent={quickLinksDropdown}
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

          {/* Recent Activities */}
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

          {/* Enrollments & Reservations Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Enrollments Overview</CardTitle>
                    <CardDescription>Enrollment statistics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                        <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium">Total Enrollments</span>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">{dashboardData.data.enrollments.total_enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium">Confirmed</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{dashboardData.data.enrollments.confirmed_enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{dashboardData.data.enrollments.pending_enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{dashboardData.data.enrollments.cancelled_enrollments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Reservations Overview</CardTitle>
                    <CardDescription>Reservation statistics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium">Total Reservations</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{dashboardData.data.reservations.total_reservations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium">Confirmed</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{dashboardData.data.reservations.confirmed_reservations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{dashboardData.data.reservations.pending_reservations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{dashboardData.data.reservations.cancelled_reservations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {/* Income by Category Chart */}
          {dashboardData.data.charts.income_by_category.length > 0 && (
            <Card className="hover-elevate">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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
                    <Bar dataKey="amount" fill="#8b5cf6" name="Amount" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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

export default AdminDashboard;
