import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { 
  ExternalLink, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Users, 
  Clock, 
  ShieldAlert,
  Server,
  RefreshCw
} from "lucide-react";
import DailyReportPage from "../pages/DailyReportPage";
import { useBiometricDailyReport } from "../hooks/useBiometricReports";
import { cn } from "@/common/utils";

interface DeviceRecord {
  deviceSName: string;
  deviceFName: string;
  serialNo: string;
  location: string;
  lastPing: string;
  status: "Online" | "Offline";
}

const MOCK_DEVICES: DeviceRecord[] = [
  {
    deviceSName: "Main Entrance Bio",
    deviceFName: "eSSL X990-1",
    serialNo: "ESSL938204921",
    location: "Main Gate Academic Block",
    lastPing: "2026-06-15 16:25:31",
    status: "Online",
  },
  {
    deviceSName: "Office Bio-Punch",
    deviceFName: "eSSL F18-2",
    serialNo: "ESSL819382941",
    location: "Administration Building",
    lastPing: "2026-06-15 12:10:04",
    status: "Offline",
  }
];

export const EsslDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState<"punches" | "devices" | "late">("punches");
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  
  // Fetch today's punches to count present and late employees
  const { data: todayReport, isLoading, refetch } = useBiometricDailyReport({
    attendanceDate: todayStr,
    page: 1,
    pageSize: 100,
  });

  const todayPunches = useMemo(() => todayReport?.data || [], [todayReport]);

  const stats = useMemo(() => {
    const presentCount = todayPunches.filter(p => p.status_code?.toUpperCase() === "P").length;
    const lateCount = todayPunches.filter(p => p.late_by_minutes > 0).length;
    const onlineDevices = MOCK_DEVICES.filter(d => d.status === "Online").length;
    const offlineDevices = MOCK_DEVICES.filter(d => d.status === "Offline").length;

    return {
      registered: todayPunches.length || 1, // Fallback if no records returned
      active: todayPunches.length || 1,
      present: presentCount,
      late: lateCount,
      online: onlineDevices,
      offline: offlineDevices
    };
  }, [todayPunches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
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
              <CardTitle className="text-xl font-bold text-white tracking-tight">eSSL eTimeTrackLite Server Console</CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                Connected to local biometric database. Live sync console runs on port 85 of your local intranet.
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={() => window.open("http://localhost:85/iclock/Main.aspx", "_blank", "noopener,noreferrer")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition-colors flex items-center gap-2"
          >
            Launch eSSL Web Server
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Colored Status Cards (Matching screenshot layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Registered Employees */}
        <Card className="bg-amber-500 text-white border-none shadow-sm overflow-hidden relative">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="text-3xl font-extrabold">{stats.registered}</div>
            <div className="text-xs font-semibold tracking-wider uppercase text-amber-100 flex items-center justify-between">
              Registered Employees
              <Users className="h-4 w-4 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Active Employees */}
        <Card className="bg-blue-500 text-white border-none shadow-sm overflow-hidden relative">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="text-3xl font-extrabold">{stats.active}</div>
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-100 flex items-center justify-between">
              Active Employees
              <CheckCircle2 className="h-4 w-4 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Present Employees */}
        <Card className="bg-emerald-500 text-white border-none shadow-sm overflow-hidden relative">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="text-3xl font-extrabold">{stats.present}</div>
            <div className="text-xs font-semibold tracking-wider uppercase text-emerald-100 flex items-center justify-between">
              Present Employees
              <Clock className="h-4 w-4 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Online Devices */}
        <Card className="bg-amber-700 text-white border-none shadow-sm overflow-hidden relative">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="text-3xl font-extrabold">{stats.online}</div>
            <div className="text-xs font-semibold tracking-wider uppercase text-amber-100 flex items-center justify-between">
              Online Devices
              <Server className="h-4 w-4 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Offline Devices */}
        <Card className="bg-red-600 text-white border-none shadow-sm overflow-hidden relative">
          <CardContent className="p-5 flex flex-col justify-between h-28">
            <div className="text-3xl font-extrabold">{stats.offline}</div>
            <div className="text-xs font-semibold tracking-wider uppercase text-red-100 flex items-center justify-between">
              Offline Devices
              <XCircle className="h-4 w-4 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Interface */}
      <Card>
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Biometric eSSL Console</CardTitle>
              <CardDescription>View live punches, local machine register, and late login exceptions.</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex border rounded-md p-1 bg-white shadow-2xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-3 text-xs font-medium rounded-sm", activeSubTab === "punches" && "bg-slate-100 text-slate-900")}
                  onClick={() => setActiveSubTab("punches")}
                >
                  Live Punches
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-3 text-xs font-medium rounded-sm", activeSubTab === "devices" && "bg-slate-100 text-slate-900")}
                  onClick={() => setActiveSubTab("devices")}
                >
                  Devices ({MOCK_DEVICES.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-3 text-xs font-medium rounded-sm", activeSubTab === "late" && "bg-slate-100 text-slate-900")}
                  onClick={() => setActiveSubTab("late")}
                >
                  Late Arrivals ({stats.late})
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleRefresh}
                disabled={isLoading || refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 text-slate-500", (isLoading || refreshing) && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeSubTab === "punches" && (
            <div className="-m-6">
              <DailyReportPage />
            </div>
          )}

          {activeSubTab === "devices" && (
            <div className="overflow-x-auto scrollbar-thin rounded-md border">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                  <tr>
                    <th scope="col" className="px-6 py-3">Device Name</th>
                    <th scope="col" className="px-6 py-3">Device Model</th>
                    <th scope="col" className="px-6 py-3">Serial No</th>
                    <th scope="col" className="px-6 py-3">Location</th>
                    <th scope="col" className="px-6 py-3">Last Ping</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DEVICES.map((device) => (
                    <tr key={device.serialNo} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-slate-400" />
                        {device.deviceSName}
                      </td>
                      <td className="px-6 py-4">{device.deviceFName}</td>
                      <td className="px-6 py-4 font-mono text-xs">{device.serialNo}</td>
                      <td className="px-6 py-4">{device.location}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{device.lastPing}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={device.status === "Online" ? "default" : "destructive"}
                          className={cn(
                            device.status === "Online" 
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200" 
                              : "bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200"
                          )}
                        >
                          {device.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
