import { motion } from "framer-motion";
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
import { ClipboardList, UserCheck, BarChart3 } from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";

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

const AccountantDashboard = () => {
  const { user, currentBranch } = useAuthStore();
  const [location] = useLocation();
  const branchPrefix =
    currentBranch?.branch_type === "SCHOOL" ? "/school" : "/college";

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
              Welcome back, {user?.full_name?.split(" ")[0] || "Accountant"}!
            </h1>
            <p className="text-muted-foreground">
              Financial overview for {currentBranch?.branch_name}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {currentBranch?.branch_type || "Education"}
          </Badge>
        </div>
      </motion.div>

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
                  <tr key={p.id} className="border-b hover:bg-muted/50">
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
    </div>
  );
};

export default AccountantDashboard;

