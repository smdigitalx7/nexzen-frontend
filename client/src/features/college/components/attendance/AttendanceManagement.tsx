import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Download, TrendingUp, Eye, Plus, Users, Clock } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { TabSwitcher } from "@/common/components/shared";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";
import { useQueryClient } from "@tanstack/react-query";
import AttendanceView from "./AttendanceView";
import AttendanceCreate from "./AttendanceCreate";

const AttendanceManagement = () => {
  const { activeTab, setActiveTab } = useTabNavigation("view");
  const queryClient = useQueryClient();
  
  // Get cached data from AttendanceView's query and subscribe to updates
  const [finalStudents, setFinalStudents] = useState<any[]>([]);
  
  useEffect(() => {
    // Get all queries matching the attendance pattern
    const cachedQueries = queryClient.getQueriesData({
      queryKey: ["college-attendance-all"],
      exact: false,
    });
    
    // Find the most recent query with student data
    let students: any[] = [];
    for (const [, queryData] of cachedQueries) {
      const data = queryData as any;
      if (data?.[0]?.attendance?.[0]?.students && Array.isArray(data[0].attendance[0].students)) {
        students = data[0].attendance[0].students;
        break; // Use the first one we find
      }
    }
    
    setFinalStudents(students);
    
    // Subscribe to query cache updates
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === "college-attendance-all") {
        const data = event.query.state.data;
        if (data?.[0]?.attendance?.[0]?.students && Array.isArray(data[0].attendance[0].students)) {
          setFinalStudents(data[0].attendance[0].students);
        }
      }
    });
    
    return () => unsubscribe();
  }, [queryClient]);

  const attendanceStats = useMemo(() => {
    if (!finalStudents || finalStudents.length === 0) {
      return {
        totalRecords: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        presentPercentage: "0",
        absentPercentage: "0",
      };
    }

    const totalRecords = finalStudents.length;
    let totalPresentDays = 0;
    let totalAbsentDays = 0;
    let totalWorkingDays = 0;

    finalStudents.forEach((student: any) => {
      const workingDays = student.total_working_days || 0;
      const presentDays = student.present_days || 0;
      const absentDays = student.absent_days || 0;
      
      totalWorkingDays += workingDays;
      totalPresentDays += presentDays;
      totalAbsentDays += absentDays;
    });

    const presentPercentage = totalWorkingDays > 0 
      ? ((totalPresentDays / totalWorkingDays) * 100).toFixed(1)
      : "0";
    const absentPercentage = totalWorkingDays > 0
      ? ((totalAbsentDays / totalWorkingDays) * 100).toFixed(1)
      : "0";

    return {
      totalRecords,
      presentCount: totalPresentDays,
      absentCount: totalAbsentDays,
      lateCount: 0,
      presentPercentage,
      absentPercentage,
    };
  }, [finalStudents]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Attendance Management
              </h1>
              <p className="text-slate-500 mt-1">
                Oversee student attendance, track presence, and manage records
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (import.meta.env.DEV) {
                    console.log("Export attendance data");
                  }
                }}
                variant="outline"
                className="bg-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {/* Total Students Card */}
            <Card className="hover:shadow-md transition-all duration-200 border border-blue-200 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-slate-600">
                   Total Students
                 </CardTitle>
                 <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                   <Users className="h-4 w-4 text-blue-600" />
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-blue-600">{attendanceStats.totalRecords}</div>
                 <p className="text-xs text-slate-500 mt-1">
                   {attendanceStats.totalRecords === 0 
                     ? "Select class to view data" 
                     : "Total active records"}
                 </p>
               </CardContent>
            </Card>

            {/* Present Card */}
            <Card className="hover:shadow-md transition-all duration-200 border border-green-200 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-slate-600">
                   Present Days
                 </CardTitle>
                 <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                   <Check className="h-4 w-4 text-green-600" />
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-green-600">{attendanceStats.presentCount}</div>
                 <p className="text-xs text-slate-500 mt-1">
                   {attendanceStats.presentPercentage}% attendance rate
                 </p>
               </CardContent>
            </Card>

             {/* Absent Card */}
            <Card className="hover:shadow-md transition-all duration-200 border border-red-200 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-slate-600">
                   Absent Days
                 </CardTitle>
                 <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                   <X className="h-4 w-4 text-red-600" />
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-red-600">{attendanceStats.absentCount}</div>
                 <p className="text-xs text-slate-500 mt-1">
                   {attendanceStats.absentPercentage}% absence rate
                 </p>
               </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <TabSwitcher
            tabs={[
              {
                value: "view",
                label: "View Attendance",
                icon: Eye,
                content: <AttendanceView />,
              },
              {
                value: "create",
                label: "Mark Attendance",
                icon: Plus,
                content: <AttendanceCreate />,
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
