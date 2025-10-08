import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeeManagement } from "@/lib/hooks/useEmployeeManagement";
import { EmployeeStatsCards } from "../components/EmployeeStatsCards";
import { AttendanceStatsCards } from "../components/AttendanceStatsCards";
import { ConfirmDialog } from "@/components/shared";
import { EmployeeTable } from "../components/EmployeeTable";
import { AttendanceTable } from "../components/AttendanceTable";

import EmployeeLeavesList from "../employee/EmployeeLeavesList";
import LeaveFormDialog from "../Leave/LeaveFormDialog";
import LeaveApproveDialog from "../Leave/LeaveApproveDialog";
import LeaveRejectDialog from "../Leave/LeaveRejectDialog";


import EmployeeAdvancesList from "../employee/EmployeeAdvancesList";
import AdvanceFormDialog from "../Advance/AdvanceFormDialog";
import AdvanceStatusDialog from "../Advance/AdvanceStatusDialog";
import AdvanceAmountDialog from "../Advance/AdvanceAmountDialog";
import AdvanceDeleteDialog from "../Advance/AdvanceDeleteDialog";


import EmployeeFormDialog from "../employee/EmployeeFormDialog";
import EmployeeDetailDialog from "../employee/EmployeeDetailDialog";
import AttendanceFormDialog from "../Attendance/AttendanceFormDialog";
import EmployeeDeleteDialog from "../employee/EmployeeDeleteDialog";

export const EmployeeManagementTemplate = () => {
  const {
    // Data
    employees,
    attendance,
    leaves,
    advances,
    totalEmployees,
    activeEmployees,
    presentToday,
    pendingLeaves,
    pendingAdvances,
    currentBranch,
    
    // UI State
    activeTab,
    setActiveTab,
    attendancePage,
    leavesPage,
    advancesPage,
    setAttendancePage,
    setLeavesPage,
    setAdvancesPage,
    pageSize,
    
    // Loading states
    attendanceLoading,
    leavesLoading,
    advancesLoading,
    
    // Employee state
    showEmployeeForm,
    setShowEmployeeForm,
    isEditingEmployee,
    setIsEditingEmployee,
    selectedEmployee,
    setSelectedEmployee,
    showEmployeeDetail,
    setShowEmployeeDetail,
    showDeleteEmployeeDialog,
    setShowDeleteEmployeeDialog,
    employeeToDelete,
    setEmployeeToDelete,
    newStatus,
    setNewStatus,
    
    // Business logic
    handleCreateEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleUpdateEmployeeStatus,
    handleCreateLeave,
    handleUpdateLeave,
    handleDeleteLeave,
    handleApproveLeave,
    handleRejectLeave,
    handleCreateAdvance,
    handleUpdateAdvance,
    handleUpdateAdvanceStatus,
    handleUpdateAdvanceAmountPaid,
    handleCreateAttendance,
    handleUpdateAttendance,
    handleDeleteAttendance,
    
    // Leave state
    showLeaveForm,
    setShowLeaveForm,
    isEditingLeave,
    setIsEditingLeave,
    leaveToDelete,
    setLeaveToDelete,
    showLeaveDeleteDialog,
    setShowLeaveDeleteDialog,
    showLeaveApproveDialog,
    setShowLeaveApproveDialog,
    showLeaveRejectDialog,
    setShowLeaveRejectDialog,
    leaveToApprove,
    setLeaveToApprove,
    leaveToReject,
    setLeaveToReject,
    leaveFormData,
    setLeaveFormData,
    
    // Attendance state
    showAttendanceForm,
    setShowAttendanceForm,
    isEditingAttendance,
    setIsEditingAttendance,
    attendanceToDelete,
    setAttendanceToDelete,
    showAttendanceDeleteDialog,
    setShowAttendanceDeleteDialog,
    attendanceFormData,
    setAttendanceFormData,
    
    // Advance state
    showAdvanceForm,
    setShowAdvanceForm,
    isEditingAdvance,
    setIsEditingAdvance,
    advanceToDelete,
    setAdvanceToDelete,
    showAdvanceDeleteDialog,
    setShowAdvanceDeleteDialog,
    showAdvanceStatusDialog,
    setShowAdvanceStatusDialog,
    showAdvanceAmountDialog,
    setShowAdvanceAmountDialog,
    advanceToUpdate,
    setAdvanceToUpdate,
    advanceFormData,
    setAdvanceFormData,
    
    // User context
    user,
  } = useEmployeeManagement();


  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEditingEmployee(false);
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditingEmployee(true);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployeeClick = async (id: number) => {
    const employee = employees.find(emp => emp.employee_id === id);
    if (employee) {
      setEmployeeToDelete(employee as any);
      setShowDeleteEmployeeDialog(true);
    }
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  const handleUpdateEmployeeStatusClick = async (id: number, status: string) => {
    try {
      await handleUpdateEmployeeStatus(id, status);
    } catch (error) {
      console.error("Failed to update employee status:", error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">
            Comprehensive employee management and tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Employee Overview Cards */}
      <EmployeeStatsCards
        totalEmployees={totalEmployees}
        activeEmployees={activeEmployees}
        presentToday={presentToday}
        pendingLeaves={pendingLeaves}
        pendingAdvances={pendingAdvances}
        currentBranch={currentBranch ? { branch_name: currentBranch.branch_name } : undefined}
      />

      {/* Main Content Tabs */}
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
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployeeClick}
            onViewEmployee={handleViewEmployee}
            onUpdateStatus={handleUpdateEmployeeStatusClick}
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
                <h2 className="text-2xl font-bold">Attendance Management</h2>
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
              onAddAttendance={() => {
                setIsEditingAttendance(false);
                setShowAttendanceForm(true);
              }}
              onEditAttendance={(record: any) => {
                setIsEditingAttendance(true);
                setShowAttendanceForm(true);
                // Pre-fill basic form data if needed
                setAttendanceFormData({
                  employee_id: record.employee_id,
                  attendance_month: record.attendance_month,
                  total_working_days: record.total_working_days,
                  days_present: record.days_present,
                  days_absent: record.days_absent,
                  paid_leaves: record.paid_leaves,
                  unpaid_leaves: record.unpaid_leaves,
                  late_arrivals: record.late_arrivals,
                  early_departures: record.early_departures,
                });
              }}
              onDeleteAttendance={(id: number) => {
                const rec = attendance.find((a: any) => a.attendance_id === id);
                if (rec) {
                  setAttendanceToDelete(rec as any);
                  setShowAttendanceDeleteDialog(true);
                }
              }}
              onViewAttendance={(record: any) => {
                // For now, reuse edit dialog in read-only style by just opening it
                setIsEditingAttendance(false);
                setShowAttendanceForm(true);
                setAttendanceFormData({
                  employee_id: record.employee_id,
                  attendance_month: record.attendance_month,
                  total_working_days: record.total_working_days,
                  days_present: record.days_present,
                  days_absent: record.days_absent,
                  paid_leaves: record.paid_leaves,
                  unpaid_leaves: record.unpaid_leaves,
                  late_arrivals: record.late_arrivals,
                  early_departures: record.early_departures,
                });
              }}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Leave Management</h2>
                <p className="text-muted-foreground">
                  Manage employee leave requests and approvals
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button onClick={() => setShowLeaveForm(true)}>
                  Add Leave Request
                </Button>
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option value="">All Types</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="vacation">Vacation</option>
                  <option value="emergency">Emergency</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search by employee name..." 
                  className="px-3 py-2 border rounded-md text-sm w-64"
                />
              </div>
            </div>
            
            <EmployeeLeavesList
              leaves={leaves}
              employees={employees}
              onApprove={(leave: any) => {
                setLeaveToApprove(leave);
                setShowLeaveApproveDialog(true);
              }}
              onReject={(leave: any) => {
                setLeaveToReject(leave);
                setShowLeaveRejectDialog(true);
              }}
              onEdit={(leave: any) => {
                setLeaveFormData({
                  employee_id: leave.employee_id,
                  leave_type: leave.leave_type,
                  from_date: leave.from_date,
                  to_date: leave.to_date,
                  reason: leave.reason,
                  total_days: leave.total_days,
                  applied_date: leave.applied_date
                });
                setLeaveToApprove(leave);
                setIsEditingLeave(true);
                setShowLeaveForm(true);
              }}
              onDelete={(leave: any) => {
                setLeaveToDelete(leave);
                setShowLeaveDeleteDialog(true);
              }}
              page={leavesPage}
              pageSize={pageSize}
              total={leaves.length}
              setPage={setLeavesPage}
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
                <h2 className="text-2xl font-bold">Advance Management</h2>
                <p className="text-muted-foreground">
                  Manage employee advance requests and payments
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button onClick={() => setShowAdvanceForm(true)}>
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
              onApprove={(advance: any) => {
                setAdvanceToUpdate(advance);
                setShowAdvanceStatusDialog(true);
              }}
              onEdit={(advance: any) => {
                setAdvanceFormData({
                  employee_id: advance.employee_id,
                  advance_date: advance.advance_date,
                  advance_amount: advance.advance_amount,
                  request_reason: advance.request_reason || ''
                });
                setAdvanceToUpdate(advance);
                setIsEditingAdvance(true);
                setShowAdvanceForm(true);
              }}
              onDelete={(advance: any) => {
                setAdvanceToDelete(advance);
                setShowAdvanceDeleteDialog(true);
              }}
              onUpdateAmount={(advance: any) => {
                setAdvanceToUpdate(advance);
                setShowAdvanceAmountDialog(true);
              }}
              onReject={(advance: any) => {
                setAdvanceToUpdate(advance);
                // You can add a reject dialog or handle it directly
                handleUpdateAdvanceStatus(advance.advance_id, 'REJECTED');
              }}
              page={advancesPage}
              pageSize={pageSize}
              total={advances.length}
              setPage={setAdvancesPage}
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Attendance Delete Confirm Dialog */}
      <ConfirmDialog
        open={showAttendanceDeleteDialog}
        onOpenChange={setShowAttendanceDeleteDialog}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance record? This action cannot be undone."
        onConfirm={async () => {
          if (attendanceToDelete) {
            await handleDeleteAttendance(attendanceToDelete.attendance_id);
          }
          setShowAttendanceDeleteDialog(false);
          setAttendanceToDelete(null as any);
        }}
      />
      
      {/* Leave Form Dialog */}
      <LeaveFormDialog
        open={showLeaveForm}
        onOpenChange={setShowLeaveForm}
        isEditing={isEditingLeave}
        employees={employees}
        formData={leaveFormData}
        onChange={(field, value) => setLeaveFormData(prev => ({ ...prev, [field]: value }))}
        onSubmit={async (e) => {
          e.preventDefault();
          if (isEditingLeave && leaveToApprove) {
            await handleUpdateLeave(leaveToApprove.leave_id, leaveFormData);
          } else {
            await handleCreateLeave(leaveFormData);
          }
        }}
        isCreatePending={false}
        isUpdatePending={false}
        calculateLeaveDays={(fromDate, toDate) => {
          const from = new Date(fromDate);
          const to = new Date(toDate);
          const diffTime = Math.abs(to.getTime() - from.getTime());
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }}
      />
      
      {/* Leave Approve Dialog */}
      <LeaveApproveDialog
        open={showLeaveApproveDialog}
        onOpenChange={setShowLeaveApproveDialog}
        onApprove={async () => {
          if (leaveToApprove) {
            await handleApproveLeave(leaveToApprove.leave_id);
          }
        }}
      />
      
      {/* Leave Reject Dialog */}
      <LeaveRejectDialog
        open={showLeaveRejectDialog}
        onOpenChange={setShowLeaveRejectDialog}
        reason=""
        onReasonChange={(reason) => {
          // You can add state for rejection reason if needed
        }}
        onReject={async () => {
          if (leaveToReject) {
            await handleRejectLeave(leaveToReject.leave_id, "Rejected by admin");
          }
        }}
      />
      
      {/* Advance Form Dialog */}
      <AdvanceFormDialog
        open={showAdvanceForm}
        onOpenChange={setShowAdvanceForm}
        isEditing={isEditingAdvance}
        employees={employees}
        formData={advanceFormData}
        onChange={(field, value) => setAdvanceFormData(prev => ({ ...prev, [field]: value }))}
        onSubmit={async (e) => {
          e.preventDefault();
          if (isEditingAdvance && advanceToUpdate) {
            await handleUpdateAdvance(advanceToUpdate.advance_id, advanceFormData);
          } else {
            await handleCreateAdvance(advanceFormData);
          }
        }}
        isCreatePending={false}
        isUpdatePending={false}
      />
      
      {/* Advance Status Dialog */}
      <AdvanceStatusDialog
        open={showAdvanceStatusDialog}
        onOpenChange={setShowAdvanceStatusDialog}
        onApprove={async () => {
          if (advanceToUpdate) {
            await handleUpdateAdvanceStatus(advanceToUpdate.advance_id, 'APPROVED');
          }
        }}
      />
      
      {/* Advance Amount Dialog */}
      <AdvanceAmountDialog
        open={showAdvanceAmountDialog}
        onOpenChange={setShowAdvanceAmountDialog}
        onUpdate={async (amount) => {
          if (advanceToUpdate) {
            await handleUpdateAdvanceAmountPaid(advanceToUpdate.advance_id, amount);
          }
        }}
      />
      
      {/* Advance Delete Dialog */}
      <AdvanceDeleteDialog
        open={showAdvanceDeleteDialog}
        onOpenChange={setShowAdvanceDeleteDialog}
        onConfirm={async () => {
          if (advanceToDelete) {
            // Add delete handler when available
            setShowAdvanceDeleteDialog(false);
          }
        }}
      />
      
      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        isEditing={isEditingEmployee}
        formData={selectedEmployee as any || {}}
        onChange={(field, value) => {
          if (selectedEmployee) {
            setSelectedEmployee({ ...selectedEmployee, [field]: value } as any);
          }
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (isEditingEmployee && selectedEmployee) {
            await handleUpdateEmployee(selectedEmployee.employee_id, selectedEmployee as any);
          } else {
            await handleCreateEmployee(selectedEmployee as any);
          }
        }}
        isCreatePending={false}
        isUpdatePending={false}
      />
      
      {/* Employee Detail Dialog */}
      <EmployeeDetailDialog
        open={showEmployeeDetail}
        onOpenChange={setShowEmployeeDetail}
        employee={selectedEmployee}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        onUpdateStatus={async () => {
          if (selectedEmployee) {
            await handleUpdateEmployeeStatus(selectedEmployee.employee_id, newStatus);
          }
        }}
        isUpdating={false}
        getStatusColor={(status: string) => {
          switch (status.toUpperCase()) {
            case "ACTIVE":
              return "bg-green-100 text-green-800 border-green-200";
            case "INACTIVE":
              return "bg-red-100 text-red-800 border-red-200";
            case "SUSPENDED":
              return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
              return "bg-gray-100 text-gray-800 border-gray-200";
          }
        }}
        formatCurrency={(amount: number) => {
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(amount);
        }}
      />
      
      {/* Employee Delete Dialog */}
      <EmployeeDeleteDialog
        open={showDeleteEmployeeDialog}
        onOpenChange={setShowDeleteEmployeeDialog}
        employee={employeeToDelete}
        onConfirm={async () => {
          if (employeeToDelete) {
            await handleDeleteEmployee(employeeToDelete.employee_id);
            setShowDeleteEmployeeDialog(false);
            setEmployeeToDelete(null);
          }
        }}
        isPending={false}
      />

      {/* Attendance Form Dialog */}
      <AttendanceFormDialog
        open={showAttendanceForm}
        onOpenChange={setShowAttendanceForm}
        isEditing={isEditingAttendance}
        employees={employees}
        formData={attendanceFormData}
        onChange={(field, value) => {
          setAttendanceFormData(prev => ({
            ...prev,
            [field]: value
          }));
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (isEditingAttendance) {
            // For editing, we need the attendance_id from the selected record
            // This would need to be tracked in the state
            console.log("Update attendance not implemented yet");
          } else {
            // Convert AttendanceFormData to EmployeeAttendanceCreate
            const createData = {
              employee_id: attendanceFormData.employee_id,
              date: attendanceFormData.attendance_month,
              status: attendanceFormData.days_present > 0 ? 'PRESENT' : 'ABSENT'
            };
            await handleCreateAttendance(createData);
          }
          setShowAttendanceForm(false);
        }}
        isCreatePending={false}
        isUpdatePending={false}
      />

      {/* Attendance Delete Dialog */}
      <ConfirmDialog
        open={showAttendanceDeleteDialog}
        onOpenChange={setShowAttendanceDeleteDialog}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance record? This action cannot be undone."
        onConfirm={async () => {
          if (attendanceToDelete) {
            await handleDeleteAttendance(attendanceToDelete.attendance_id);
            setShowAttendanceDeleteDialog(false);
            setAttendanceToDelete(null);
          }
        }}
        isLoading={false}
      />
    </div>
  );
};
