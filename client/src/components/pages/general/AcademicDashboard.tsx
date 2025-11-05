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
import {
  FileText,
  Calendar,
  Trophy,
  GraduationCap,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Award,
  CheckCircle,
} from "lucide-react";
import { useAcademicDashboard } from "@/lib/hooks/general";
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
import {
  DashboardContainer,
  DashboardHeader,
  DashboardError,
} from "@/components/shared/dashboard";

const AcademicDashboard = () => {
  const { user, currentBranch } = useAuthStore();
  const branchPrefix =
    currentBranch?.branch_type === "SCHOOL" ? "/school" : "/college";
  const { data: dashboardData, loading, error } = useAcademicDashboard();

  return (
    <DashboardContainer loading={loading}>
      <DashboardHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Academic"}!`}
        description={`Academic overview for ${currentBranch?.branch_name}`}
        badge={{
          text: currentBranch?.branch_type || "Education",
          variant: "outline",
        }}
      />

      <DashboardError error={error} />

      {/* Dashboard Content */}
      {!loading && !error && dashboardData && (
        <>
          {/* Overview Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Students",
                value: dashboardData.data.overview.total_students.toLocaleString(),
                icon: Users,
                color: "text-blue-600",
                desc: "Active students",
              },
              {
                title: "Total Teachers",
                value: dashboardData.data.overview.total_teachers.toLocaleString(),
                icon: GraduationCap,
                color: "text-green-600",
                desc: "Teaching staff",
              },
              {
                title: "Total Classes",
                value: dashboardData.data.overview.total_classes.toLocaleString(),
                icon: BookOpen,
                color: "text-purple-600",
                desc: "Active classes",
              },
              {
                title: "Total Subjects",
                value: dashboardData.data.overview.total_subjects.toLocaleString(),
                icon: FileText,
                color: "text-indigo-600",
                desc: "Subjects taught",
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

          {/* Attendance Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Student Attendance",
                value: `${parseFloat(dashboardData.data.attendance.student_attendance_rate).toFixed(1)}%`,
                icon: UserCheck,
                color: "text-orange-600",
                desc: "This month",
              },
              {
                title: "Teacher Attendance",
                value: `${parseFloat(dashboardData.data.attendance.teacher_attendance_rate).toFixed(1)}%`,
                icon: UserCheck,
                color: "text-cyan-600",
                desc: "This month",
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

          {/* Academic Performance & Exams */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Exams",
                value: dashboardData.data.exams.total_exams.toString(),
                icon: Award,
                color: "text-purple-600",
                desc: "All exams",
              },
              {
                title: "Upcoming Exams",
                value: dashboardData.data.exams.upcoming_exams.toString(),
                icon: Calendar,
                color: "text-blue-600",
                desc: "Scheduled",
              },
              {
                title: "Completed Exams",
                value: dashboardData.data.exams.completed_exams.toString(),
                icon: CheckCircle,
                color: "text-green-600",
                desc: "Finished",
              },
              {
                title: "Exams This Month",
                value: dashboardData.data.exams.exams_this_month.toString(),
                icon: Calendar,
                color: "text-indigo-600",
                desc: "Current month",
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

          {/* Tests & Performance */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Tests",
                value: dashboardData.data.tests.total_tests.toString(),
                icon: Trophy,
                color: "text-purple-600",
                desc: "All tests",
              },
              {
                title: "Tests This Month",
                value: dashboardData.data.tests.tests_this_month.toString(),
                icon: Calendar,
                color: "text-blue-600",
                desc: "Current month",
              },
              {
                title: "Average Test Score",
                value: `${parseFloat(dashboardData.data.tests.average_test_score).toFixed(1)}%`,
                change: parseFloat(dashboardData.data.tests.average_test_score_change),
                icon: TrendingUp,
                color: "text-green-600",
                desc: "Average score",
              },
              {
                title: "Academic Performance",
                value: `${dashboardData.data.academic_performance.total_exams_conducted}`,
                icon: Award,
                color: "text-indigo-600",
                desc: "Exams conducted",
              },
            ].map((c) => (
              <Card key={c.title} className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                    {c.change !== undefined && (
                      <span className={`text-xs flex items-center gap-1 ${c.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {c.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(c.change).toFixed(1)}%
                      </span>
                    )}
                  </div>
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

          {/* Exam Details */}
          {dashboardData.data.exams.next_exam_date && (
            <Card>
              <CardHeader>
                <CardTitle>Next Exam</CardTitle>
                <CardDescription>Upcoming exam information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exam Name</span>
                    <span className="text-sm font-semibold">{dashboardData.data.exams.next_exam_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exam Date</span>
                    <span className="text-sm font-semibold">
                      {new Date(dashboardData.data.exams.next_exam_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exams This Year</span>
                    <span className="text-sm font-semibold">{dashboardData.data.exams.exams_this_year}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance Summary</CardTitle>
              <CardDescription>Exams and tests overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Academic Performance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Exams Conducted</span>
                      <span className="text-sm font-semibold">{dashboardData.data.academic_performance.total_exams_conducted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Upcoming Exams</span>
                      <span className="text-sm font-semibold text-blue-600">{dashboardData.data.academic_performance.upcoming_exams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed Exams</span>
                      <span className="text-sm font-semibold text-green-600">{dashboardData.data.academic_performance.completed_exams}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Exams</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Exams</span>
                      <span className="text-sm font-semibold">{dashboardData.data.exams.total_exams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Upcoming</span>
                      <span className="text-sm font-semibold text-blue-600">{dashboardData.data.exams.upcoming_exams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="text-sm font-semibold text-green-600">{dashboardData.data.exams.completed_exams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="text-sm font-semibold">{dashboardData.data.exams.exams_this_month}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Year</span>
                      <span className="text-sm font-semibold">{dashboardData.data.exams.exams_this_year}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Tests</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Tests</span>
                      <span className="text-sm font-semibold">{dashboardData.data.tests.total_tests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="text-sm font-semibold">{dashboardData.data.tests.tests_this_month}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Year</span>
                      <span className="text-sm font-semibold">{dashboardData.data.tests.tests_this_year}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Score</span>
                      <span className="text-sm font-semibold text-green-600">
                        {parseFloat(dashboardData.data.tests.average_test_score).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score Change</span>
                      <span className={`text-sm font-semibold flex items-center gap-1 ${parseFloat(dashboardData.data.tests.average_test_score_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(dashboardData.data.tests.average_test_score_change) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(parseFloat(dashboardData.data.tests.average_test_score_change)).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
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

export default AcademicDashboard;







