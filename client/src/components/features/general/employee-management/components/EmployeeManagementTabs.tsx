import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeTable } from "./EmployeeTable";
import { AttendanceTable } from "./AttendanceTable";
import { LeavesTable } from "./LeavesTable";
import { AttendanceStatsCards } from "./AttendanceStatsCards";
import EmployeeLeavesList from "../employee/EmployeeLeavesList";
import EmployeeAdvancesList from "../employee/EmployeeAdvancesList";

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
  onUpdateAmount: (advance: any) => void;
  onRejectAdvance: (advance: any) => void;
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
  onUpdateAmount,
  onRejectAdvance,
}: EmployeeManagementTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="leaves">Leaves</TabsTrigger>
        <TabsTrigger value="advances">Advances</TabsTrigger>
      </TabsList>

      <TabsContent value="employees" className="space-y-4">
        <EmployeeTable
          employees={employees}
          isLoading={false}
          onAddEmployee={onAddEmployee}
          onEditEmployee={onEditEmployee}
          onDeleteEmployee={onDeleteEmployee}
          onViewEmployee={onViewEmployee}
          onUpdateStatus={onUpdateStatus}
        />
      </TabsContent>

      <TabsContent value="attendance" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Employee Attendance Management</h2>
              <p className="text-muted-foreground">
                Track employee attendance and working hours
              </p>
            </div>
          </div>

          {/* Attendance Statistics Cards */}
          <AttendanceStatsCards
            totalRecords={attendance.length}
            averageAttendance={attendance.length > 0 ? 
              (attendance.reduce((sum, record) => sum + (record.days_present / record.total_working_days * 100), 0) / attendance.length) : 0
            }
            totalLateArrivals={attendance.reduce((sum, record) => sum + record.late_arrivals, 0)}
            totalEarlyDepartures={attendance.reduce((sum, record) => sum + record.early_departures, 0)}
            totalPaidLeaves={attendance.reduce((sum, record) => sum + record.paid_leaves, 0)}
            totalUnpaidLeaves={attendance.reduce((sum, record) => sum + record.unpaid_leaves, 0)}
          />
          
          <AttendanceTable
            attendance={attendance}
            isLoading={attendanceLoading}
            onAddAttendance={onAddAttendance}
            onEditAttendance={onEditAttendance}
            onDeleteAttendance={onDeleteAttendance}
            onViewAttendance={onViewAttendance}
          />
        </motion.div>
      </TabsContent>

      <TabsContent value="leaves" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          
          <LeavesTable
            leaves={leaves}
            isLoading={leavesLoading}
            onAddLeave={onAddLeave}
            onEditLeave={onEditLeave}
            onDeleteLeave={(id) => onDeleteLeave({ leave_id: id })}
            onViewLeave={onViewLeave}
            onApproveLeave={onApproveLeave}
            onRejectLeave={onRejectLeave}
          />
        </motion.div>
      </TabsContent>

      <TabsContent value="advances" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Employee Advance Management</h2>
              <p className="text-muted-foreground">
                Manage employee advance requests and payments
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button onClick={onAddAdvance}>
                Add Advance
              </Button>
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 border rounded-md text-sm">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <input 
                type="text" 
                placeholder="Search by employee name..." 
                className="px-3 py-2 border rounded-md text-sm w-64"
              />
            </div>
          </div>
          
          <EmployeeAdvancesList
            advances={advances}
            employees={employees}
            onApprove={onApproveAdvance}
            onEdit={onEditAdvance}
            onDelete={onDeleteAdvance}
            onUpdateAmount={onUpdateAmount}
            onReject={onRejectAdvance}
            page={advancesPage}
            pageSize={pageSize}
            total={advances.length}
            setPage={setAdvancesPage}
          />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};
