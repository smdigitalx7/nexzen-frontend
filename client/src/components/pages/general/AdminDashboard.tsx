import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  DollarSign,
  TrendingUp,
  UserCheck,
  Bus,
  CheckCircle,
  AlertTriangle,
  Building2,
  Receipt,
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
import { ResponsiveContainer, LineChart, Line } from "recharts";

const mockDashboardData = {
  recentActivities: [
    {
      id: 1,
      message: "25 new student admissions across branches",
      time: "2 hours ago",
      branch: "Multiple",
      type: "student",
      status: "success",
    },
  ],
};

const AdminDashboard = () => {
  const { user, currentBranch } = useAuthStore();

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
              Welcome back, {user?.full_name?.split(" ")[0] || "Admin"}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening at {currentBranch?.branch_name} today.
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {currentBranch?.branch_type || "Education"}
          </Badge>
        </div>
      </motion.div>

      {/* KPI Cards */}
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
    </div>
  );
};

export default AdminDashboard;



