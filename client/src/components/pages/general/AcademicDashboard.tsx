import { motion } from "framer-motion";
import { Link } from "wouter";
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
import { FileText, Calendar, Trophy, GraduationCap } from "lucide-react";

// Academic mock data
const academicCards = [
  { title: "Section Changes Pending", value: 4, color: "text-blue-600" },
  {
    title: "Attendance Pending (month)",
    value: 6,
    color: "text-orange-600",
  },
  { title: "Exams Open", value: 3, color: "text-purple-600" },
];

const duesList = [
  { student: "Kiran P.", class: "VII-B", term: "T1", amount: 6000 },
  {
    student: "Divya M.",
    class: "XII-BiPC",
    term: "T2",
    amount: 12000,
  },
  { student: "Mohan L.", class: "IV-A", term: "Books", amount: 2500 },
  { student: "Rita S.", class: "IX-C", term: "T3", amount: 18000 },
];

const AcademicDashboard = () => {
  const { user, currentBranch } = useAuthStore();
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
              Welcome back, {user?.full_name?.split(" ")[0] || "Academic"}!
            </h1>
            <p className="text-muted-foreground">
              Academic overview for {currentBranch?.branch_name}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {currentBranch?.branch_type || "Education"}
          </Badge>
        </div>
      </motion.div>

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
            {
              title: "Academic",
              href: `${branchPrefix}/academic`,
              icon: FileText,
              color: "bg-indigo-500",
            },
            {
              title: "Attendance",
              href: `${branchPrefix}/attendance`,
              icon: Calendar,
              color: "bg-blue-500",
            },
            {
              title: "Marks Entry",
              href: `${branchPrefix}/marks`,
              icon: Trophy,
              color: "bg-purple-500",
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

      {/* Outstanding Dues (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Students with Outstanding Dues</CardTitle>
          <CardDescription>By class/term (read-only)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2">Student</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Term</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {duesList.map((d, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
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
    </div>
  );
};

export default AcademicDashboard;









