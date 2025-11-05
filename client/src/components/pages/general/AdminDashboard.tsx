import { useLocation } from "wouter";
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
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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
  DashboardError,
} from "@/components/shared/dashboard";

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { data: dashboardData, loading, error } = useAdminDashboard();
  const [, setLocation] = useLocation();

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

  if (loading) {
    return (
      <DashboardContainer loading={loading}>
        <DashboardHeader
          title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
          description="Here's what's happening today."
          showBranchBadge={true}
          rightContent={quickLinksDropdown}
        />
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer loading={false}>
        <DashboardHeader
          title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
          description="Here's what's happening today."
          showBranchBadge={true}
          rightContent={quickLinksDropdown}
        />
        <DashboardError error={error} />
      </DashboardContainer>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardContainer loading={false}>
        <DashboardHeader
          title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
          description="Here's what's happening today."
          showBranchBadge={true}
          rightContent={quickLinksDropdown}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            No dashboard data available
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer loading={false}>
      <DashboardHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
        description="Here's what's happening today."
        showBranchBadge={true}
        rightContent={quickLinksDropdown}
      />

      <DashboardError error={error} />

      <div className="space-y-8">
        {/* Overview Section - Enhanced Design */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100/50 shadow-sm">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          <div className="relative px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Institutional Overview
                </h2>
                <p className="text-sm text-slate-600">
                  Key metrics at a glance
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Students
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {dashboardData.data.overview.total_students.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Across all branches</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Teachers
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {dashboardData.data.overview.total_teachers.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Teaching staff</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Classes
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {dashboardData.data.overview.total_classes.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Active classes</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-6 w-6 text-teal-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Branches
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {dashboardData.data.overview.total_branches.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Institute branches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Performance - Enhanced Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Financials */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-lg font-semibold text-slate-900">
                Financial Performance
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete financial overview
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Income
                    </p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {formatCurrency(
                        parseFloat(dashboardData.data.financial.total_income)
                      )}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-600 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-50/50 border border-red-100">
                <div className="flex items-center gap-4">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Expenditure
                    </p>
                    <p className="text-2xl font-bold text-red-700 mt-1">
                      {formatCurrency(
                        parseFloat(
                          dashboardData.data.financial.total_expenditure
                        )
                      )}
                    </p>
                  </div>
                </div>
                <ArrowDownRight className="h-5 w-5 text-red-600 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 border-2 border-slate-200">
                <div className="flex items-center gap-4">
                  <BarChart3 className="h-6 w-6 text-slate-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Net Profit
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {formatCurrency(
                        parseFloat(dashboardData.data.financial.net_profit)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Period Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-lg font-semibold text-slate-900">
                Current Period
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Monthly & yearly breakdown
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">
                    This Month
                  </span>
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Income</span>
                    <span className="text-base font-bold text-emerald-700">
                      {formatCurrency(
                        parseFloat(
                          dashboardData.data.financial.income_this_month
                        )
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Expenditure</span>
                    <span className="text-base font-bold text-red-700">
                      {formatCurrency(
                        parseFloat(
                          dashboardData.data.financial.expenditure_this_month
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">
                    This Year
                  </span>
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div className="space-y-3 pl-2 border-l-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Income</span>
                    <span className="text-base font-bold text-emerald-700">
                      {formatCurrency(
                        parseFloat(
                          dashboardData.data.financial.income_this_year
                        )
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Expenditure</span>
                    <span className="text-base font-bold text-red-700">
                      {formatCurrency(
                        parseFloat(
                          dashboardData.data.financial.expenditure_this_year
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic & Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Academic Performance
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Exams and pass rates
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50/50 border border-purple-100">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total Exams</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {dashboardData.data.academic.total_exams}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Upcoming</p>
                  <p className="text-lg font-semibold text-purple-700">
                    {dashboardData.data.academic.upcoming_exams}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Completed</p>
                  <p className="text-sm font-medium text-slate-600">
                    {dashboardData.data.academic.completed_exams}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-slate-600">Average Pass Rate</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {parseFloat(
                        dashboardData.data.academic.average_pass_rate
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Attendance
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Student attendance metrics
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-6 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Average Rate
                    </p>
                    <p className="text-4xl font-bold text-teal-700 mt-2">
                      {parseFloat(
                        dashboardData.data.attendance.average_attendance_rate
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollments & Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Enrollments
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enrollment status overview
              </p>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {dashboardData.data.enrollments.total_enrollments}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Confirmed
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-700">
                  {dashboardData.data.enrollments.confirmed_enrollments}
                </span>
              </div>
              {dashboardData.data.enrollments.pending_enrollments > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Pending
                    </span>
                  </div>
                  <span className="text-lg font-bold text-amber-700">
                    {dashboardData.data.enrollments.pending_enrollments}
                  </span>
                </div>
              )}
              {dashboardData.data.enrollments.cancelled_enrollments > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <span className="text-sm font-medium text-slate-700">
                    Cancelled
                  </span>
                  <span className="text-lg font-bold text-red-700">
                    {dashboardData.data.enrollments.cancelled_enrollments}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Reservations
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Reservation status overview
              </p>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {dashboardData.data.reservations.total_reservations}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Confirmed
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-700">
                  {dashboardData.data.reservations.confirmed_reservations}
                </span>
              </div>
              {dashboardData.data.reservations.pending_reservations > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Pending
                    </span>
                  </div>
                  <span className="text-lg font-bold text-amber-700">
                    {dashboardData.data.reservations.pending_reservations}
                  </span>
                </div>
              )}
              {dashboardData.data.reservations.cancelled_reservations > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <span className="text-sm font-medium text-slate-700">
                    Cancelled
                  </span>
                  <span className="text-lg font-bold text-red-700">
                    {dashboardData.data.reservations.cancelled_reservations}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {dashboardData.data.charts.income_by_category.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Income by Category
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Breakdown of income sources
              </p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={dashboardData.data.charts.income_by_category.map(
                    (item) => ({
                      category: item.category || "Other",
                      amount: parseFloat(item.amount || "0"),
                    })
                  )}
                  margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000)
                        return `₹${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000)
                        return `₹${(value / 1000).toFixed(0)}K`;
                      return `₹${value}`;
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "white",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    name="Amount"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Income Trend Chart */}
        {dashboardData.data.charts.income_trend.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Income & Expenditure Trend
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monthly financial trends
              </p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={dashboardData.data.charts.income_trend.map((item) => ({
                    month: item.month?.split(" ")[0] || "",
                    income: parseFloat(item.income || "0"),
                    expenditure: parseFloat(item.expenditure || "0"),
                  }))}
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000)
                        return `₹${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000)
                        return `₹${(value / 1000).toFixed(0)}K`;
                      return `₹${value}`;
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "white",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#6366f1"
                    strokeWidth={3}
                    name="Income"
                    dot={false}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenditure"
                    stroke="#94a3b8"
                    strokeWidth={3}
                    name="Expenditure"
                    dot={false}
                    activeDot={{ r: 5, fill: "#94a3b8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardContainer>
  );
};

export default AdminDashboard;
