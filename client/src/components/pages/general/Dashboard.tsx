import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
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
} from "recharts";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  School,
  Building2,
  Bus,
  BookOpen,
  Calendar,
  Award,
  Receipt,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

// Mock data for dashboard - Enhanced for NexGen system
const mockDashboardData = {
  instituteOverview: {
    totalInstitutes: 3,
    totalBranches: 8,
    activeUsers: 156,
    totalStudents: 3247,
    totalEmployees: 287,
  },
  kpis: [
    {
      title: "Total Students",
      value: "3,247",
      change: "+15%",
      trend: "up",
      icon: GraduationCap,
      color: "text-blue-600",
      description: "Across all branches",
    },
    {
      title: "Active Employees",
      value: "287",
      change: "+8%",
      trend: "up",
      icon: UserCheck,
      color: "text-green-600",
      description: "Teaching & non-teaching",
    },
    {
      title: "Monthly Revenue",
      value: "₹8.2M",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      description: "Fee collection",
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-orange-600",
      description: "Student attendance",
    },
    {
      title: "Transport Routes",
      value: "24",
      change: "+2",
      trend: "up",
      icon: Bus,
      color: "text-cyan-600",
      description: "Active routes",
    },
    {
      title: "Pending Fees",
      value: "₹1.8M",
      change: "-5%",
      trend: "down",
      icon: Receipt,
      color: "text-red-600",
      description: "Outstanding amount",
    },
  ],
  branchPerformance: [
    {
      branch: "Main Campus",
      students: 1247,
      revenue: 3200000,
      attendance: 94.2,
      type: "school",
    },
    {
      branch: "North Branch",
      students: 856,
      revenue: 2100000,
      attendance: 92.8,
      type: "school",
    },
    {
      branch: "Science College",
      students: 642,
      revenue: 1800000,
      attendance: 96.1,
      type: "college",
    },
    {
      branch: "Evening College",
      students: 502,
      revenue: 1100000,
      attendance: 89.5,
      type: "college",
    },
  ],
  classDistribution: [
    { name: "Pre-Primary", value: 480, color: "#8884d8" },
    { name: "Lower Primary", value: 1120, color: "#82ca9d" },
    { name: "Upper Primary", value: 980, color: "#ffc658" },
    { name: "Secondary", value: 667, color: "#ff7c7c" },
  ],
  feeCollection: [
    { month: "Jan", collected: 6500000, pending: 1200000 },
    { month: "Feb", collected: 7200000, pending: 980000 },
    { month: "Mar", collected: 7800000, pending: 850000 },
    { month: "Apr", collected: 8200000, pending: 1800000 },
    { month: "May", collected: 8500000, pending: 1200000 },
  ],
  recentActivities: [
    {
      id: 1,
      type: "student",
      message: "25 new student admissions across branches",
      time: "2 hours ago",
      status: "success",
      branch: "Multiple",
    },
    {
      id: 2,
      type: "fee",
      message: "₹1.8M pending fee payments",
      time: "4 hours ago",
      status: "warning",
      branch: "All Branches",
    },
    {
      id: 3,
      type: "attendance",
      message: "Attendance marked for 15 classes",
      time: "1 day ago",
      status: "info",
      branch: "Main Campus",
    },
    {
      id: 4,
      type: "employee",
      message: "5 new staff members joined",
      time: "2 days ago",
      status: "success",
      branch: "Multiple",
    },
    {
      id: 5,
      type: "transport",
      message: "New route added: City Center",
      time: "3 days ago",
      status: "info",
      branch: "Main Campus",
    },
    {
      id: 6,
      type: "exam",
      message: "Half-yearly exams completed",
      time: "1 week ago",
      status: "success",
      branch: "All Schools",
    },
  ],
  quickActions: [
    {
      title: "Add Student",
      icon: GraduationCap,
      href: "/students",
      color: "bg-blue-500",
    },
    {
      title: "Mark Attendance",
      icon: Calendar,
      href: "/attendance",
      color: "bg-green-500",
    },
    {
      title: "Process Fees",
      icon: Receipt,
      href: "/fees",
      color: "bg-purple-500",
    },
    {
      title: "Add Employee",
      icon: UserCheck,
      href: "/employees",
      color: "bg-orange-500",
    },
    {
      title: "Create Announcement",
      icon: Award,
      href: "/announcements",
      color: "bg-cyan-500",
    },
    {
      title: "Manage Transport",
      icon: Bus,
      href: "/transport",
      color: "bg-red-500",
    },
  ],
};

const Dashboard = () => {
  const { user, currentBranch } = useAuthStore();
  const [selectedMetric, setSelectedMetric] = useState("students");
  const role = user?.role || "institute_admin";

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

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  const getBranchTypeIcon = (type: string) => {
    return type === "school" ? (
      <School className="h-4 w-4" />
    ) : (
      <Building2 className="h-4 w-4" />
    );
  };

  // Accountant mock data
  const accountantCounters = [
    { title: "New Reservations (today)", value: 12, color: "text-blue-600" },
    { title: "Pending Admissions", value: 7, color: "text-orange-600" },
    {
      title: "Fees Collected (today)",
      value: "₹2.4L",
      color: "text-green-600",
    },
    { title: "Dues This Week", value: "₹8.7L", color: "text-red-600" },
  ];
  const recentPayments = [
    {
      id: "PMT-10231",
      student: "Aarav S.",
      class: "8-A",
      mode: "Cash",
      amount: 12000,
      date: "2025-09-14",
    },
    {
      id: "PMT-10230",
      student: "Ishita R.",
      class: "10-B",
      mode: "Bank Transfer",
      amount: 22000,
      date: "2025-09-14",
    },
    {
      id: "PMT-10229",
      student: "Rahul K.",
      class: "XI-MPC",
      mode: "DD",
      amount: 35000,
      date: "2025-09-13",
    },
    {
      id: "PMT-10228",
      student: "Sneha T.",
      class: "V-C",
      mode: "Cash",
      amount: 8000,
      date: "2025-09-13",
    },
  ];

  // Academic mock data
  const academicCards = [
    { title: "Section Changes Pending", value: 4, color: "text-blue-600" },
    { title: "Attendance Pending (month)", value: 6, color: "text-orange-600" },
    { title: "Exams Open", value: 3, color: "text-purple-600" },
  ];
  const duesList = [
    { student: "Kiran P.", class: "VII-B", term: "T1", amount: 6000 },
    { student: "Divya M.", class: "XII-BiPC", term: "T2", amount: 12000 },
    { student: "Mohan L.", class: "IV-A", term: "Books", amount: 2500 },
    { student: "Rita S.", class: "IX-C", term: "T3", amount: 18000 },
  ];

  const AdminView = () => (
    <>
      {/* KPI Cards (Admin): Fee Collection %, Employee Headcount, Active Routes, Attendance Trend */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Fee Collection",
            value: "92%",
            icon: DollarSign,
            color: "text-emerald-600",
            desc: "Collected this term",
          },
          {
            title: "Employee Headcount",
            value: "287",
            icon: UserCheck,
            color: "text-blue-600",
            desc: "Active employees",
          },
          {
            title: "Active Routes",
            value: "24",
            icon: Bus,
            color: "text-cyan-600",
            desc: "Transport fleet",
          },
          {
            title: "Attendance",
            value: "94.2%",
            icon: TrendingUp,
            color: "text-orange-600",
            desc: "This month",
          },
        ].map((kpi) => (
          <Card key={kpi.title} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.desc}</p>
              {kpi.title === "Attendance" && (
                <div className="mt-3">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart
                      data={[
                        { m: "W1", v: 92 },
                        { m: "W2", v: 93 },
                        { m: "W3", v: 94.2 },
                        { m: "W4", v: 94 },
                      ]}
                    >
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="#fb923c"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities & Quick Links (Admin) */}
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
                {mockDashboardData.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
                  >
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {activity.branch}
                        </Badge>
                      </div>
                    </div>
                    <Badge
                      variant={
                        activity.status === "warning"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {activity.type}
                    </Badge>
                  </div>
                ))}
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
                  icon: DollarSign,
                  color: "bg-purple-500",
                },
                {
                  title: "Transport",
                  href: "/transport",
                  icon: Bus,
                  color: "bg-cyan-500",
                },
                {
                  title: "Global Settings",
                  href: "/institutes",
                  icon: Building2,
                  color: "bg-indigo-500",
                },
                {
                  title: "Reports",
                  href: "/financial-reports",
                  icon: Receipt,
                  color: "bg-sky-500",
                },
              ].map((link) => (
                <Button
                  key={link.title}
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
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  const AccountantView = () => (
    <>
      {/* Counters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accountantCounters.map((c) => (
          <Card key={c.title} className="hover-elevate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              href: "/school/reservations/new",
              color: "bg-blue-500",
            },
            {
              title: "New Admission",
              href: "/admissions/new",
              color: "bg-emerald-500",
            },
            { title: "Fee Collection", href: "/fees", color: "bg-purple-500" },
            {
              title: "Reports",
              href: "/financial-reports",
              color: "bg-sky-500",
            },
          ].map((a) => (
            <Button
              key={a.title}
              variant="outline"
              className="justify-start gap-3 h-auto p-3 hover-elevate"
            >
              <div className={`w-8 h-8 rounded-lg ${a.color}`}></div>
              <span className="text-sm font-medium">{a.title}</span>
            </Button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Receipt</th>
                  <th className="py-2">Student</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Mode</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 font-medium">{p.id}</td>
                    <td className="py-2">{p.student}</td>
                    <td className="py-2">{p.class}</td>
                    <td className="py-2">{p.mode}</td>
                    <td className="py-2">{formatCurrency(p.amount)}</td>
                    <td className="py-2">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const AcademicView = () => (
    <>
      {/* Academic Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {academicCards.map((c) => (
          <Card key={c.title} className="hover-elevate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Academic tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            { title: "Section Mapping", href: "/classes" },
            { title: "Attendance Upload", href: "/attendance" },
            { title: "Marks Entry", href: "/marks" },
          ].map((a) => (
            <Button
              key={a.title}
              variant="outline"
              className="justify-start gap-3 h-auto p-3 hover-elevate"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500"></div>
              <span className="text-sm font-medium">{a.title}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Outstanding Dues (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Students with Outstanding Dues</CardTitle>
          <CardDescription>By class/term</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Student</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Term</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {duesList.map((d, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2">{d.student}</td>
                    <td className="py-2">{d.class}</td>
                    <td className="py-2">{d.term}</td>
                    <td className="py-2">{formatCurrency(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening at {currentBranch?.branch_name} today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getBranchTypeIcon(currentBranch?.branch_type || "school")}
            <Badge variant="outline" className="capitalize">
              {currentBranch?.branch_type || "Education"}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Top 4 Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fee Collection
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2.4M</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1.2M</div>
            <p className="text-xs text-muted-foreground">
              156 students pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>
      </motion.div>

      {role === "institute_admin" && <AdminView />}
      {role === "accountant" && <AccountantView />}
      {role === "academic" && <AcademicView />}
    </div>
  );
};

export default Dashboard;
