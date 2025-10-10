import { useEmployeeManagement } from "@/lib/hooks/general/useEmployeeManagement";
import { EmployeeStatsCards } from "../components/EmployeeStatsCards";
import { EmployeeManagementHeader } from "../components/EmployeeManagementHeader";
import { EmployeeManagementTabs } from "../components/EmployeeManagementTabs";
import { EmployeeManagementDialogs } from "../components/EmployeeManagementDialogs";

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
      <EmployeeManagementHeader currentBranch={currentBranch ? { branch_name: currentBranch.branch_name } : undefined} />

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
      <EmployeeManagementTabs
            employees={employees}
        attendance={attendance}
        leaves={leaves}
        advances={advances}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        attendancePage={attendancePage}
        leavesPage={leavesPage}
        advancesPage={advancesPage}
        setAttendancePage={setAttendancePage}
        setLeavesPage={setLeavesPage}
        setAdvancesPage={setAdvancesPage}
        pageSize={pageSize}
        attendanceLoading={attendanceLoading}
        leavesLoading={leavesLoading}
        advancesLoading={advancesLoading}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployeeClick}
            onViewEmployee={handleViewEmployee}
            onUpdateStatus={handleUpdateEmployeeStatusClick}
              onAddAttendance={() => {
                setIsEditingAttendance(false);
                setShowAttendanceForm(true);
              }}
              onEditAttendance={(record: any) => {
                setIsEditingAttendance(true);
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
              onDeleteAttendance={(id: number) => {
                const rec = attendance.find((a: any) => a.attendance_id === id);
                if (rec) {
                  setAttendanceToDelete(rec as any);
                  setShowAttendanceDeleteDialog(true);
                }
              }}
              onViewAttendance={(record: any) => {
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
        onApproveLeave={(leave: any) => {
                setLeaveToApprove(leave);
                setShowLeaveApproveDialog(true);
              }}
        onRejectLeave={(leave: any) => {
                setLeaveToReject(leave);
                setShowLeaveRejectDialog(true);
              }}
        onEditLeave={(leave: any) => {
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
        onDeleteLeave={(leave: any) => {
                setLeaveToDelete(leave);
                setShowLeaveDeleteDialog(true);
              }}
        onApproveAdvance={(advance: any) => {
                setAdvanceToUpdate(advance);
                setShowAdvanceStatusDialog(true);
              }}
        onEditAdvance={(advance: any) => {
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
        onDeleteAdvance={(advance: any) => {
                setAdvanceToDelete(advance);
                setShowAdvanceDeleteDialog(true);
              }}
              onUpdateAmount={(advance: any) => {
                setAdvanceToUpdate(advance);
                setShowAdvanceAmountDialog(true);
              }}
        onRejectAdvance={(advance: any) => {
                setAdvanceToUpdate(advance);
                handleUpdateAdvanceStatus(advance.advance_id, 'REJECTED');
        }}
      />

      {/* All Dialogs */}
      <EmployeeManagementDialogs
        // Employee dialogs
        showEmployeeForm={showEmployeeForm}
        setShowEmployeeForm={setShowEmployeeForm}
        isEditingEmployee={isEditingEmployee}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        showEmployeeDetail={showEmployeeDetail}
        setShowEmployeeDetail={setShowEmployeeDetail}
        showDeleteEmployeeDialog={showDeleteEmployeeDialog}
        setShowDeleteEmployeeDialog={setShowDeleteEmployeeDialog}
        employeeToDelete={employeeToDelete}
        setEmployeeToDelete={setEmployeeToDelete}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        
        // Attendance dialogs
        showAttendanceForm={showAttendanceForm}
        setShowAttendanceForm={setShowAttendanceForm}
        isEditingAttendance={isEditingAttendance}
        attendanceToDelete={attendanceToDelete}
        setAttendanceToDelete={setAttendanceToDelete}
        showAttendanceDeleteDialog={showAttendanceDeleteDialog}
        setShowAttendanceDeleteDialog={setShowAttendanceDeleteDialog}
        attendanceFormData={attendanceFormData}
        setAttendanceFormData={setAttendanceFormData}
        
        // Leave dialogs
        showLeaveForm={showLeaveForm}
        setShowLeaveForm={setShowLeaveForm}
        isEditingLeave={isEditingLeave}
        leaveToDelete={leaveToDelete}
        setLeaveToDelete={setLeaveToDelete}
        showLeaveDeleteDialog={showLeaveDeleteDialog}
        setShowLeaveDeleteDialog={setShowLeaveDeleteDialog}
        showLeaveApproveDialog={showLeaveApproveDialog}
        setShowLeaveApproveDialog={setShowLeaveApproveDialog}
        showLeaveRejectDialog={showLeaveRejectDialog}
        setShowLeaveRejectDialog={setShowLeaveRejectDialog}
        leaveToApprove={leaveToApprove}
        setLeaveToApprove={setLeaveToApprove}
        leaveToReject={leaveToReject}
        setLeaveToReject={setLeaveToReject}
        leaveFormData={leaveFormData}
        setLeaveFormData={setLeaveFormData}
        
        // Advance dialogs
        showAdvanceForm={showAdvanceForm}
        setShowAdvanceForm={setShowAdvanceForm}
        isEditingAdvance={isEditingAdvance}
        advanceToDelete={advanceToDelete}
        setAdvanceToDelete={setAdvanceToDelete}
        showAdvanceDeleteDialog={showAdvanceDeleteDialog}
        setShowAdvanceDeleteDialog={setShowAdvanceDeleteDialog}
        showAdvanceStatusDialog={showAdvanceStatusDialog}
        setShowAdvanceStatusDialog={setShowAdvanceStatusDialog}
        showAdvanceAmountDialog={showAdvanceAmountDialog}
        setShowAdvanceAmountDialog={setShowAdvanceAmountDialog}
        advanceToUpdate={advanceToUpdate}
        setAdvanceToUpdate={setAdvanceToUpdate}
        advanceFormData={advanceFormData}
        setAdvanceFormData={setAdvanceFormData}
        
        // Data
        employees={employees}
        
        // Handlers
        handleCreateEmployee={handleCreateEmployee}
        handleUpdateEmployee={handleUpdateEmployee}
        handleDeleteEmployee={handleDeleteEmployee}
        handleUpdateEmployeeStatus={handleUpdateEmployeeStatus}
        handleCreateLeave={handleCreateLeave}
        handleUpdateLeave={handleUpdateLeave}
        handleDeleteLeave={handleDeleteLeave}
        handleApproveLeave={handleApproveLeave}
        handleRejectLeave={handleRejectLeave}
        handleCreateAdvance={handleCreateAdvance}
        handleUpdateAdvance={handleUpdateAdvance}
        handleUpdateAdvanceStatus={handleUpdateAdvanceStatus}
        handleUpdateAdvanceAmountPaid={handleUpdateAdvanceAmountPaid}
        handleCreateAttendance={handleCreateAttendance}
        handleUpdateAttendance={handleUpdateAttendance}
        handleDeleteAttendance={handleDeleteAttendance}
      />
    </div>
  );
};
