import { useLocation } from "wouter";
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
  MoreHorizontal,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAcademicDashboard } from "@/lib/hooks/general";
import {
  DashboardContainer,
  DashboardHeader,
  DashboardError,
  StatsCard,
  DashboardGrid,
} from "@/components/shared/dashboard";

const AcademicDashboard = () => {
  const { user, currentBranch } = useAuthStore();
  const [, setLocation] = useLocation();
  const branchPrefix =
    currentBranch?.branch_type === "SCHOOL" ? "/school" : "/college";
  const { data: dashboardData, loading, error } = useAcademicDashboard();

  const quickLinks = [
    {
      title: "Academic",
      href: `${branchPrefix}/academic`,
      icon: FileText,
      color: "text-indigo-600",
    },
    {
      title: "Attendance",
      href: `${branchPrefix}/attendance`,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Marks Entry",
      href: `${branchPrefix}/marks`,
      icon: Trophy,
      color: "text-purple-600",
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
        <DropdownMenuLabel>Academic Tasks</DropdownMenuLabel>
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
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Academic"}!`}
        description="Academic overview and performance metrics"
        showBranchBadge={true}
        rightContent={quickLinksDropdown}
      />

      <DashboardError error={error} />

      {/* Dashboard Content */}
      {!loading && !error && dashboardData && (
        <>
          {/* Overview Statistics */}
          <DashboardGrid columns={6}>
            <StatsCard
              title="Total Students"
              value={dashboardData.data.overview.total_students.toLocaleString()}
              icon={Users}
              color="blue"
              description="Active students"
              size="md"
            />
            <StatsCard
              title="Total Teachers"
              value={dashboardData.data.overview.total_teachers.toLocaleString()}
              icon={GraduationCap}
              color="green"
              description="Teaching staff"
              size="md"
            />
            <StatsCard
              title="Total Classes"
              value={dashboardData.data.overview.total_classes.toLocaleString()}
              icon={BookOpen}
              color="purple"
              description="Active classes"
              size="md"
            />
            <StatsCard
              title="Total Subjects"
              value={dashboardData.data.overview.total_subjects.toLocaleString()}
              icon={FileText}
              color="indigo"
              description="Subjects taught"
              size="md"
            />

            {/* Attendance Metrics */}
            <StatsCard
              title="Student Attendance"
              value={`${parseFloat(dashboardData.data.attendance.student_attendance_rate).toFixed(1)}%`}
              icon={UserCheck}
              color="orange"
              description="This month"
              size="md"
            />
            <StatsCard
              title="Teacher Attendance"
              value={`${parseFloat(dashboardData.data.attendance.teacher_attendance_rate).toFixed(1)}%`}
              icon={UserCheck}
              color="cyan"
              description="This month"
              size="md"
            />
          </DashboardGrid>

          {/* Academic Performance & Exams */}
          <DashboardGrid columns={8}>
            <StatsCard
              title="Total Exams"
              value={dashboardData.data.exams.total_exams.toString()}
              icon={Award}
              color="purple"
              description="All exams"
              size="md"
            />
            <StatsCard
              title="Upcoming Exams"
              value={dashboardData.data.exams.upcoming_exams.toString()}
              icon={Calendar}
              color="blue"
              description="Scheduled"
              size="md"
            />
            <StatsCard
              title="Completed Exams"
              value={dashboardData.data.exams.completed_exams.toString()}
              icon={CheckCircle}
              color="green"
              description="Finished"
              size="md"
            />
            <StatsCard
              title="Exams This Month"
              value={dashboardData.data.exams.exams_this_month.toString()}
              icon={Calendar}
              color="indigo"
              description="Current month"
              size="md"
            />

            {/* Tests & Performance */}
            <StatsCard
              title="Total Tests"
              value={dashboardData.data.tests.total_tests.toString()}
              icon={Trophy}
              color="purple"
              description="All tests"
              size="md"
            />
            <StatsCard
              title="Tests This Month"
              value={dashboardData.data.tests.tests_this_month.toString()}
              icon={Calendar}
              color="blue"
              description="Current month"
              size="md"
            />
            <StatsCard
              title="Average Test Score"
              value={`${parseFloat(dashboardData.data.tests.average_test_score).toFixed(1)}%`}
              icon={TrendingUp}
              color="green"
              description="Average score"
              size="md"
            />
            <StatsCard
              title="Academic Performance"
              value={dashboardData.data.academic_performance.total_exams_conducted.toString()}
              icon={Award}
              color="indigo"
              description="Exams conducted"
              size="md"
            />
          </DashboardGrid>

          {/* Next Exam */}
          {dashboardData.data.exams.next_exam_date && (() => {
            const examDate = new Date(dashboardData.data.exams.next_exam_date);
            const today = new Date();
            const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Determine urgency level and styling
            const getUrgencyStyle = () => {
              if (daysUntilExam === 0) {
                return {
                  bg: "bg-gradient-to-r from-rose-600 to-pink-600",
                  text: "text-white",
                  border: "border-rose-700",
                  shadow: "shadow-lg shadow-rose-500/50",
                  pulse: "animate-pulse",
                  icon: AlertCircle,
                  label: "TODAY",
                };
              } else if (daysUntilExam === 1) {
                return {
                  bg: "bg-gradient-to-r from-violet-600 to-purple-600",
                  text: "text-white",
                  border: "border-violet-700",
                  shadow: "shadow-lg shadow-violet-500/50",
                  pulse: "",
                  icon: AlertCircle,
                  label: "TOMORROW",
                };
              } else if (daysUntilExam <= 3) {
                return {
                  bg: "bg-gradient-to-r from-indigo-600 to-blue-600",
                  text: "text-white",
                  border: "border-indigo-700",
                  shadow: "shadow-md shadow-indigo-500/40",
                  pulse: "",
                  icon: Clock,
                  label: `${daysUntilExam} DAYS LEFT`,
                };
              } else if (daysUntilExam <= 7) {
                return {
                  bg: "bg-gradient-to-r from-cyan-600 to-teal-600",
                  text: "text-white",
                  border: "border-cyan-700",
                  shadow: "shadow-md shadow-cyan-500/30",
                  pulse: "",
                  icon: Clock,
                  label: `${daysUntilExam} DAYS LEFT`,
                };
              } else {
                return {
                  bg: "bg-gradient-to-r from-slate-600 to-gray-600",
                  text: "text-white",
                  border: "border-slate-700",
                  shadow: "shadow-md shadow-slate-500/20",
                  pulse: "",
                  icon: Calendar,
                  label: `${daysUntilExam} DAYS LEFT`,
                };
              }
            };
            
            const urgencyStyle = daysUntilExam >= 0 ? getUrgencyStyle() : null;
            const UrgencyIcon = urgencyStyle?.icon || Calendar;
            
            return (
              <Card className={`border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 ${daysUntilExam <= 3 ? 'ring-2 ring-rose-200 dark:ring-rose-900' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Next Exam
                      </CardTitle>
                      <CardDescription>Upcoming exam information</CardDescription>
                    </div>
                    {urgencyStyle && (
                      <div className={`${urgencyStyle.pulse} ${urgencyStyle.shadow} rounded-lg px-4 py-2.5 ${urgencyStyle.bg} ${urgencyStyle.text} border-2 ${urgencyStyle.border} flex items-center gap-2 font-bold text-sm`}>
                        <UrgencyIcon className="h-4 w-4" />
                        <span>{urgencyStyle.label}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-blue-100 dark:border-blue-900">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Exam Name</p>
                        <p className="text-xl font-semibold text-foreground">
                          {dashboardData.data.exams.next_exam_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-blue-100 dark:border-blue-900">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Exam Date</p>
                          <p className="text-base font-semibold">
                            {examDate.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-blue-100 dark:border-blue-900">
                        <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Exams This Year</p>
                          <p className="text-xl font-bold text-indigo-600">{dashboardData.data.exams.exams_this_year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Academic Performance Summary */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Academic Performance */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Academic Performance</CardTitle>
                    <CardDescription>Overall performance metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Total Exams Conducted</span>
                    <span className="text-2xl font-bold text-purple-600">{dashboardData.data.academic_performance.total_exams_conducted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <span className="text-sm font-medium">Upcoming Exams</span>
                    <span className="text-xl font-bold text-blue-600">{dashboardData.data.academic_performance.upcoming_exams}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <span className="text-sm font-medium">Completed Exams</span>
                    <span className="text-xl font-bold text-green-600">{dashboardData.data.academic_performance.completed_exams}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exams Overview */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Exams Overview</CardTitle>
                    <CardDescription>Exam statistics and timeline</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Total Exams</span>
                    <span className="text-2xl font-bold">{dashboardData.data.exams.total_exams}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <span className="text-sm font-medium">Upcoming</span>
                    <span className="text-xl font-bold text-blue-600">{dashboardData.data.exams.upcoming_exams}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-xl font-bold text-green-600">{dashboardData.data.exams.completed_exams}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">This Month</p>
                      <p className="text-lg font-bold">{dashboardData.data.exams.exams_this_month}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">This Year</p>
                      <p className="text-lg font-bold">{dashboardData.data.exams.exams_this_year}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tests Overview */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                    <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Tests Overview</CardTitle>
                    <CardDescription>Test statistics and performance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Total Tests</span>
                    <span className="text-2xl font-bold">{dashboardData.data.tests.total_tests}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">This Month</p>
                      <p className="text-lg font-bold">{dashboardData.data.tests.tests_this_month}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">This Year</p>
                      <p className="text-lg font-bold">{dashboardData.data.tests.tests_this_year}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Average Score</span>
                      <span className="text-2xl font-bold text-green-600">
                        {parseFloat(dashboardData.data.tests.average_test_score).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {parseFloat(dashboardData.data.tests.average_test_score_change) >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`text-base font-semibold ${parseFloat(dashboardData.data.tests.average_test_score_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(dashboardData.data.tests.average_test_score_change) >= 0 ? '+' : ''}
                        {parseFloat(dashboardData.data.tests.average_test_score_change).toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">from previous period</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

export default AcademicDashboard;










