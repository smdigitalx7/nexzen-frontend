import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Clock, 
  ShieldAlert,
  Server,
  RefreshCw
} from "lucide-react";
import DailyReportPage from "../pages/DailyReportPage";
import { useBiometricDailyReport } from "../hooks/useBiometricReports";
import { useEmployeeDashboard } from "@/features/general/hooks/useEmployees";
import { cn } from "@/common/utils";

export const EsslDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState<"punches" | "late">("punches");
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  
  // Fetch today's punches to count present and late employees
  const { data: todayReport, isLoading: isBiometricLoading, refetch } = useBiometricDailyReport({
    attendanceDate: todayStr,
    page: 1,
    pageSize: 100,
  });

  // Fetch real employee counts from Dashboard API
  const { data: employeeDashboardStats, isLoading: isDashboardStatsLoading, refetch: refetchDashboard } = useEmployeeDashboard();

  const todayPunches = useMemo(() => todayReport?.data || [], [todayReport]);

  const stats = useMemo(() => {
    const presentCount = todayPunches.filter(p => p.status_code?.toUpperCase() === "P").length;
    const lateCount = todayPunches.filter(p => p.late_by_minutes > 0).length;

    return {
      registered: employeeDashboardStats?.total_employees || 0,
      active: employeeDashboardStats?.active_employees || 0,
      present: presentCount,
      late: lateCount,
    };
  }, [todayPunches, employeeDashboardStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchDashboard()]);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* Launch Server Banner */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md border-slate-800">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/20">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white tracking-tight">Biometric Attendance Server Console</CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                Connected to local biometric database. Live sync console runs on port 85 of your local intranet.
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={() => window.open("http://localhost:85/iclock/Main.aspx", "_blank", "noopener,noreferrer")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition-colors flex items-center gap-2"
          >
            Launch Attendance Server
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Colored Status Cards (Dynamic metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Registered Employees */}
        <Card className="bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Registered Employees</span>
              <div className="p-2 bg-amber-50 text-amber-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isDashboardStatsLoading ? "..." : stats.registered}
            </div>
          </CardContent>
        </Card>

        {/* Active Employees */}
        <Card className="bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Active Employees</span>
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isDashboardStatsLoading ? "..." : stats.active}
            </div>
          </CardContent>
        </Card>

        {/* Present Employees */}
        <Card className="bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Present Today</span>
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isBiometricLoading ? "..." : stats.present}
            </div>
          </CardContent>
        </Card>

        {/* Late Arrivals */}
        <Card className="bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Late Arrivals</span>
              <div className="p-2 bg-rose-50 text-rose-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isBiometricLoading ? "..." : stats.late}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Interface */}
      <Card>
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Biometric Attendance Console</CardTitle>
              <CardDescription>View live punches and late login exceptions for today.</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex border rounded-md p-1 bg-white shadow-2xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-3 text-xs font-medium rounded-sm", activeSubTab === "punches" && "bg-slate-100 text-slate-900")}
                  onClick={() => setActiveSubTab("punches")}
                >
                  Daily Attendance Report
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-3 text-xs font-medium rounded-sm", activeSubTab === "late" && "bg-slate-100 text-slate-900")}
                  onClick={() => setActiveSubTab("late")}
                >
                  Late Arrivals ({isBiometricLoading ? "..." : stats.late})
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleRefresh}
                disabled={isBiometricLoading || refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 text-slate-500", (isBiometricLoading || refreshing) && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeSubTab === "punches" && (
            <div className="pt-2">
              <DailyReportPage isEmbedded />
            </div>
          )}

          {activeSubTab === "late" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>Today's Late Arrivals / Exceptions</span>
              </div>
              
              {todayPunches.filter(p => p.late_by_minutes > 0).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No late arrivals logged today. Keep up the good work!
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin rounded-md border">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                      <tr>
                        <th scope="col" className="px-6 py-3">Code</th>
                        <th scope="col" className="px-6 py-3">Employee Name</th>
                        <th scope="col" className="px-6 py-3">Department</th>
                        <th scope="col" className="px-6 py-3">Designation</th>
                        <th scope="col" className="px-6 py-3">Log-In Time</th>
                        <th scope="col" className="px-6 py-3">Minutes Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayPunches.filter(p => p.late_by_minutes > 0).map((record) => (
                        <tr key={record.employee_id} className="bg-white border-b hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono text-xs">{record.employee_code}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{record.employee_name}</td>
                          <td className="px-6 py-4">{record.department_sname}</td>
                          <td className="px-6 py-4">{record.designation}</td>
                          <td className="px-6 py-4 text-rose-600 font-semibold">{record.in_time}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold px-2 py-0.5 bg-rose-50 border border-rose-100 rounded text-xs">
                              <Clock className="h-3 w-3" />
                              {record.late_by_minutes} mins
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
