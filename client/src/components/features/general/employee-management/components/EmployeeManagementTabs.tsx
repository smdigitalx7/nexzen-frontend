import { TabSwitcher, MonthYearFilter } from "@/components/shared";
import { EmployeeTable } from "./EmployeeTable";
import { AttendanceTable } from "./AttendanceTable";
import { LeavesTable } from "./LeavesTable";
import { AdvancesTable } from "../Advance/AdvancesTable";
import { Users, Calendar, FileText } from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import type { TabItem } from "@/components/shared/TabSwitcher";
import type { LucideIcon } from "lucide-react";

interface EmployeeManagementTabsProps {
  // Data
  employees: any[];
  attendance: any[];
  leaves: any[];
  advances: any[];
  
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  attendancePage: number;
  leavesPage: number;
  advancesPage: number;
  setAttendancePage: (updater: (p: number) => number) => void;
  setLeavesPage: (updater: (p: number) => number) => void;
  setAdvancesPage: (updater: (p: number) => number) => void;
  pageSize: number;
  
  // Loading states
  attendanceLoading: boolean;
  leavesLoading: boolean;
  advancesLoading: boolean;
  
  // Employee handlers
  onAddEmployee: () => void;
  onEditEmployee: (employee: any) => void;
  onDeleteEmployee: (id: number) => void;
  onViewEmployee: (employee: any) => void;
  onUpdateStatus: (id: number, status: string) => void;
  
  // Attendance handlers
  onAddAttendance: () => void;
  onBulkCreateAttendance?: () => void;
  onEditAttendance: (record: any) => void;
  onDeleteAttendance: (id: number) => void;
  onViewAttendance: (record: any) => void;
  
  // Leave handlers
  onAddLeave: () => void;
  onApproveLeave: (leave: any) => void;
  onRejectLeave: (leave: any) => void;
  onEditLeave: (leave: any) => void;
  onDeleteLeave: (leave: any) => void;
  onViewLeave: (leave: any) => void;
  
  // Advance handlers
  onAddAdvance: () => void;
  onApproveAdvance: (advance: any) => void;
  onEditAdvance: (advance: any) => void;
  onDeleteAdvance: (advance: any) => void;
  onViewAdvance: (advance: any) => void;
  onUpdateAmount: (advance: any) => void;
  onRejectAdvance: (advance: any) => void;
  
  // Leave filters
  leaveMonth: number;
  setLeaveMonth: (month: number) => void;
  leaveYear: number;
  setLeaveYear: (year: number) => void;
  
  // Attendance filters
  attendanceMonth: number;
  setAttendanceMonth: (month: number) => void;
  attendanceYear: number;
  setAttendanceYear: (year: number) => void;
}

export const EmployeeManagementTabs = ({
  employees,
  attendance,
  leaves,
  advances,
  activeTab,
  setActiveTab,
  attendancePage,
  leavesPage,
  advancesPage,
  setAttendancePage,
  setLeavesPage,
  setAdvancesPage,
  pageSize,
  attendanceLoading,
  leavesLoading,
  advancesLoading,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployee,
  onUpdateStatus,
  onAddAttendance,
  onBulkCreateAttendance,
  onEditAttendance,
  onDeleteAttendance,
  onViewAttendance,
  onAddLeave,
  onApproveLeave,
  onRejectLeave,
  onEditLeave,
  onDeleteLeave,
  onViewLeave,
  onAddAdvance,
  onApproveAdvance,
  onEditAdvance,
  onDeleteAdvance,
  onViewAdvance,
  onUpdateAmount,
  onRejectAdvance,
  leaveMonth,
  setLeaveMonth,
  leaveYear,
  setLeaveYear,
  attendanceMonth,
  setAttendanceMonth,
  attendanceYear,
  setAttendanceYear,
}: EmployeeManagementTabsProps) => {
  const tabs: TabItem[] = [
    {
      value: "employees",
      label: "Employees",
      icon: Users,
      content: (
        <EmployeeTable
          employees={employees}
          isLoading={false}
          onAddEmployee={onAddEmployee}
          onEditEmployee={onEditEmployee}
          onDeleteEmployee={onDeleteEmployee}
          onViewEmployee={onViewEmployee}
          onUpdateStatus={onUpdateStatus}
          showSearch={true}
        />
      ),
    },
    {
      value: "leaves",
      label: "Leaves",
      icon: FileText,
      content: (
        <div className="space-y-4">
          {/* Month/Year Filter */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground whitespace-nowrap">Filter by month and year:</p>
              <MonthYearFilter
                month={leaveMonth}
                year={leaveYear}
                onMonthChange={setLeaveMonth}
                onYearChange={setLeaveYear}
                monthId="leave-month"
                yearId="leave-year"
                showLabels={false}
                className="flex-1 items-center"
              />
            </div>
          </div>
          
          <LeavesTable
            leaves={leaves}
            isLoading={leavesLoading}
            onAddLeave={onAddLeave}
            onEditLeave={onEditLeave}
            onDeleteLeave={(id) => onDeleteLeave({ leave_id: id })}
            onViewLeave={onViewLeave}
            onApproveLeave={onApproveLeave}
            onRejectLeave={onRejectLeave}
            showSearch={true}
          />
        </div>
      ),
    },
    {
      value: "attendance",
      label: "Attendance",
      icon: Calendar,
      content: (
        <div className="space-y-4">
          {/* Month/Year Filter */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground whitespace-nowrap">Filter by month and year:</p>
              <MonthYearFilter
                month={attendanceMonth}
                year={attendanceYear}
                onMonthChange={setAttendanceMonth}
                onYearChange={setAttendanceYear}
                monthId="attendance-month"
                yearId="attendance-year"
                showLabels={false}
                className="flex-1 items-center"
              />
            </div>
          </div>
          
          <AttendanceTable
            attendance={attendance}
            isLoading={attendanceLoading}
            onAddAttendance={onAddAttendance}
            onBulkCreateAttendance={onBulkCreateAttendance}
            onEditAttendance={onEditAttendance}
            onDeleteAttendance={onDeleteAttendance}
            onViewAttendance={onViewAttendance}
            showSearch={true}
          />
        </div>
      ),
    },
    {
      value: "advances",
      label: "Advances",
      icon: IndianRupeeIcon as LucideIcon,
      content: (
        <AdvancesTable
          advances={advances}
          isLoading={advancesLoading}
          onAddAdvance={onAddAdvance}
          onEditAdvance={onEditAdvance}
          onDeleteAdvance={onDeleteAdvance}
          onViewAdvance={onViewAdvance}
          onApproveAdvance={onApproveAdvance}
          onRejectAdvance={onRejectAdvance}
          onUpdateAmount={onUpdateAmount}
          showSearch={true}
        />
      ),
    },
  ];

  return (
    <TabSwitcher
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      size="md"
    />
  );
};
