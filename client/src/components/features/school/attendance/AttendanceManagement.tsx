import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Download, TrendingUp, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabSwitcher } from "@/components/shared";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import { useSchoolAttendanceAllStudents } from "@/lib/hooks/school";
import { useQueryClient } from "@tanstack/react-query";
import AttendanceView from "./AttendanceView";
import AttendanceCreate from "./AttendanceCreate";

const AttendanceManagement = () => {
  const { activeTab, setActiveTab } = useTabNavigation("view");
  
  // Use the same query pattern as AttendanceView to share cached data
  // The query key matches what AttendanceView uses, so React Query will share the cache
  const [selectedDate] = useState<Date | undefined>(new Date());
  const month = selectedDate ? selectedDate.getMonth() + 1 : undefined;
  const year = selectedDate ? selectedDate.getFullYear() : undefined;
  
  // Try to get data from any active query with matching pattern
  // We'll use a query that matches AttendanceView's query key pattern
  const queryClient = useQueryClient();
  
  // Get cached data from AttendanceView's query and subscribe to updates
  const [finalStudents, setFinalStudents] = useState<any[]>([]);
  
  useEffect(() => {
    // Get all queries matching the attendance pattern
    const cachedQueries = queryClient.getQueriesData({
      queryKey: ["school", "attendance"],
      exact: false,
    });
    
    // Find the most recent query with student data
    let students: any[] = [];
    for (const [, queryData] of cachedQueries) {
      const data = queryData as any;
      if (data?.groups?.[0]?.data && Array.isArray(data.groups[0].data)) {
        students = data.groups[0].data;
        break; // Use the first one we find
      }
    }
    
    setFinalStudents(students);
    
    // Subscribe to query cache updates
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === "school" && 
          event?.query?.queryKey?.[1] === "attendance" &&
          event?.query?.queryKey?.[2] === "all-students") {
        const data = event.query.state.data as any;
        if (data?.groups?.[0]?.data && Array.isArray(data.groups[0].data)) {
          setFinalStudents(data.groups[0].data);
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
      lateCount: 0, // Late count not available in current data structure
      presentPercentage,
      absentPercentage,
    };
  }, [finalStudents]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Attendance Management
              </h1>
              <p className="text-slate-600 mt-1">
                Mark daily student attendance in a simple table
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
                className="hover-elevate"
                data-testid="button-export-attendance"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Present Days
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {attendanceStats.presentCount}
                    </p>
                    <p className="text-xs text-green-600">
                      {attendanceStats.presentPercentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <X className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Absent Days</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {attendanceStats.absentCount}
                    </p>
                    <p className="text-xs text-red-600">
                      {attendanceStats.absentPercentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {attendanceStats.totalRecords}
                    </p>
                    {attendanceStats.totalRecords === 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Select class in View tab
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
                label: "Create Attendance",
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
