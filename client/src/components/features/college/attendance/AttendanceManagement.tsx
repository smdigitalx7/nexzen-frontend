import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Download, Clock, TrendingUp, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabSwitcher } from "@/components/shared";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import AttendanceView from "./AttendanceView";
import AttendanceCreate from "./AttendanceCreate";

const AttendanceManagement = () => {
  const [selectedDate] = useState<Date | undefined>(new Date());
  const { activeTab, setActiveTab } = useTabNavigation("view");
  const attendanceStats = {
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    presentPercentage: "0",
    absentPercentage: "0",
  };

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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Present
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
                  <div>
                    <p className="text-sm font-medium text-slate-600">Absent</p>
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
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Late</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {attendanceStats.lateCount}
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
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Records
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {attendanceStats.totalRecords}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
