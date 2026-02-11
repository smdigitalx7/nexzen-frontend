import { TabSwitcher, MonthYearFilter } from "@/common/components/shared";
import { EmployeeTable } from "./EmployeeTable";
import { AttendanceTable } from "./AttendanceTable";
import { LeavesTable } from "./LeavesTable";
import { AdvancesTable } from "../Advance/AdvancesTable";
import { Users, Calendar, FileText } from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import type { TabItem } from "@/common/components/shared/TabSwitcher";
import type { LucideIcon } from "lucide-react";
import type { EmployeeLeaveRead } from "@/features/general/types/employee-leave";

// Using local types from child components for compatibility
// These types are more minimal but match what the child components expect
type EmployeeRead = {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  email?: string | null;
  mobile_no?: string | null;
  designation: string;
  department?: string;
  date_of_joining: string;
  salary: number;
  status: string;
  branch_id?: number;
  created_at: string;
  updated_at?: string | null;
};

type EmployeeAttendanceRead = {
  attendance_id: number;
  employee_id: number;
  employee_name?: string;
  attendance_month: number;
  attendance_year: number;
  total_working_days: number;
  days_present: number;
  paid_leaves: number;
  unpaid_leaves: number;
};

// Use the lib type which matches what the API returns and what AdvancesTable expects
import type { AdvanceRead } from "@/features/general/types/advances";

// Transform to match AdvancesTable expectations (status is required string, not optional)
// AdvancesTable interface doesn't include created_at, so we make it optional for compatibility
type EmployeeAdvanceRead = {
  advance_id: number;
  employee_id: number;
  employee_name?: string;
  advance_amount: number;
  advance_date: string;
  request_reason?: string;
  status: string; // Required, not optional
  total_repayment_amount?: number;
  remaining_balance?: number;
  created_at?: string; // Optional for component compatibility
  updated_at?: string;
  created_by?: number | null;
  approved_by?: number | null;
  approved_at?: string | null;
  reason?: string | null;
  updated_by?: number | null;
};

interface EmployeeManagementTabsProps {
  // Data
  employees: EmployeeRead[];
  attendance: EmployeeAttendanceRead[];
  leaves: EmployeeLeaveRead[];
  advances: EmployeeAdvanceRead[];
  
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  employeesPage: number;
  setEmployeesPage: (page: number) => void;
  totalEmployees: number;
  totalAttendance: number; // Added
  totalLeaves: number; // Added
  totalAdvances: number; // Added
  attendancePage: number;
  leavesPage: number;
  advancesPage: number;
  setAttendancePage: (page: number) => void;
  setLeavesPage: (page: number) => void;
  setAdvancesPage: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  
  // Loading states
  attendanceLoading: boolean;
  leavesLoading: boolean;
  advancesLoading: boolean;
  
  // Employee handlers
  onAddEmployee: () => void;
  onEditEmployee: (employee: EmployeeRead) => void;
  onDeleteEmployee: (id: number) => void;
  onViewEmployee: (employee: EmployeeRead) => void;
  onUpdateStatus: (id: number, status: string) => void;
  
  // Attendance handlers
  onAddAttendance: () => void;
  onBulkCreateAttendance?: () => void;
  onEditAttendance: (record: EmployeeAttendanceRead) => void;
  onDeleteAttendance: (id: number) => void;
  onViewAttendance: (record: EmployeeAttendanceRead) => void;
  
  // Leave handlers
  onAddLeave: () => void;
  onApproveLeave: (leave: EmployeeLeaveRead) => void;
  onRejectLeave: (leave: EmployeeLeaveRead) => void;
  onEditLeave: (leave: EmployeeLeaveRead) => void;
  onDeleteLeave: (id: number) => void;
  onViewLeave: (leave: EmployeeLeaveRead) => void;
  
  // Advance handlers
  onAddAdvance: () => void;
  onApproveAdvance: (advance: EmployeeAdvanceRead) => void;
  onEditAdvance: (advance: EmployeeAdvanceRead) => void;
  onViewAdvance: (advance: EmployeeAdvanceRead) => void;
  onUpdateAmount: (advance: EmployeeAdvanceRead) => void;
  onRejectAdvance: (advance: EmployeeAdvanceRead) => void;
  
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
  employeesPage,
  setEmployeesPage,
  totalEmployees,
  totalAttendance, // Added
  totalLeaves, // Added
  totalAdvances, // Added
  attendancePage,
  leavesPage,
  advancesPage,
  setAttendancePage,
  setLeavesPage,
  setAdvancesPage,
  pageSize,
  onPageSizeChange,
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
          currentPage={employeesPage}
          totalCount={totalEmployees}
          onPageChange={setEmployeesPage}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      ),
    },
    {
      value: "leaves",
      label: "Leaves",
      icon: FileText,
      content: (
        <LeavesTable
          leaves={leaves}
          isLoading={leavesLoading}
          onAddLeave={onAddLeave}
          onEditLeave={onEditLeave}
          onDeleteLeave={onDeleteLeave}
          onViewLeave={onViewLeave}
          onApproveLeave={onApproveLeave}
          onRejectLeave={onRejectLeave}
          currentPage={leavesPage}
          totalCount={totalLeaves}
          onPageChange={setLeavesPage}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          showSearch={true}
          headerContent={
            <MonthYearFilter
              label="Period:"
              month={leaveMonth}
              year={leaveYear}
              onMonthChange={setLeaveMonth}
              onYearChange={setLeaveYear}
              monthId="leave-month"
              yearId="leave-year"
              showLabels={false}
              monthWidth="140px"
              labelClassName="text-blue-900"
              monthClassName="text-blue-700 font-semibold"
              yearClassName="text-blue-700 font-semibold"
            />
          }
        />
      ),
    },
    {
      value: "attendance",
      label: "Attendance",
      icon: Calendar,
      content: (
        <AttendanceTable
          attendance={attendance}
          isLoading={attendanceLoading}
          onAddAttendance={onAddAttendance}
          onBulkCreateAttendance={onBulkCreateAttendance}
          onEditAttendance={onEditAttendance}
          onDeleteAttendance={onDeleteAttendance}
          onViewAttendance={onViewAttendance}
          currentPage={attendancePage}
          totalCount={totalAttendance}
          onPageChange={setAttendancePage}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          showSearch={true}
          headerContent={
            <MonthYearFilter
              label="Period:"
              month={attendanceMonth}
              year={attendanceYear}
              onMonthChange={setAttendanceMonth}
              onYearChange={setAttendanceYear}
              monthId="attendance-month"
              yearId="attendance-year"
              showLabels={false}
              monthWidth="140px"
              labelClassName="text-blue-900"
              monthClassName="text-blue-700 font-semibold"
              yearClassName="text-blue-700 font-semibold"
            />
          }
        />
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
          onViewAdvance={onViewAdvance}
          onApproveAdvance={onApproveAdvance}
          onRejectAdvance={onRejectAdvance}
          onUpdateAmount={onUpdateAmount}
          showSearch={true}
          currentPage={advancesPage}
          totalCount={totalAdvances}
          onPageChange={setAdvancesPage}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
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
