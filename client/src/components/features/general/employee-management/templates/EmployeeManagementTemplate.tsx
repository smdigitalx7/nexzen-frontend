import { useEmployeeManagement } from "@/lib/hooks/general/useEmployeeManagement";
import { useEmployeeDashboard } from "@/lib/hooks/general/useEmployees";
import { useAttendanceDashboard } from "@/lib/hooks/general/useEmployeeAttendance";
import { useLeaveDashboard } from "@/lib/hooks/general/useEmployeeLeave";
import { useAdvanceDashboard } from "@/lib/hooks/general/useAdvances";
import { EmployeeManagementHeader } from "../components/EmployeeManagementHeader";
import { EmployeeManagementTabs } from "../components/EmployeeManagementTabs";
import { AttendanceStatsCards as OldAttendanceStatsCards } from "../components/AttendanceStatsCards";
import { EmployeeManagementDialogs } from "../components/EmployeeManagementDialogs";
import { EmployeeStatsCards } from "../EmployeeStatsCards";
import { AttendanceStatsCards } from "../AttendanceStatsCards";
import { LeaveStatsCards } from "../LeaveStatsCards";
import { AdvanceStatsCards } from "../AdvanceStatsCards";

export const EmployeeManagementTemplate = () => {
  // Dashboard stats hooks
  const { data: dashboardStats, isLoading: dashboardLoading } = useEmployeeDashboard();
  const { data: attendanceDashboardStats, isLoading: attendanceDashboardLoading } = useAttendanceDashboard();
  const { data: leaveDashboardStats, isLoading: leaveDashboardLoading } = useLeaveDashboard();
  const { data: advanceDashboardStats, isLoading: advanceDashboardLoading } = useAdvanceDashboard();
  
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
    handleViewLeave,
    handleCreateAdvance,
    handleUpdateAdvance,
    handleUpdateAdvanceStatus,
    handleUpdateAdvanceAmountPaid,
    handleCreateAttendance,
    handleUpdateAttendance,
    handleDeleteAttendance,
    handleViewAttendance,
    
    // Leave state
    showLeaveForm,
    setShowLeaveForm,
    showLeaveViewDialog,
    setShowLeaveViewDialog,
    leaveToView,
    setLeaveToView,
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
    showAttendanceViewDialog,
    setShowAttendanceViewDialog,
    attendanceToView,
    setAttendanceToView,
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
    showAdvanceViewDialog,
    setShowAdvanceViewDialog,
    advanceToView,
    setAdvanceToView,
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

      {/* Employee Dashboard Stats - Only show on employees tab */}
      {activeTab === 'employees' && (
        <EmployeeStatsCards 
          stats={dashboardStats || {
            total_employees: totalEmployees,
            active_employees: activeEmployees,
            terminated_employees: totalEmployees - activeEmployees,
            teaching_staff: employees.filter(emp => emp.employee_type === 'teaching').length,
            non_teaching_staff: employees.filter(emp => emp.employee_type === 'non_teaching').length,
            office_staff: employees.filter(emp => emp.employee_type === 'office').length,
            drivers: employees.filter(emp => emp.employee_type === 'driver').length,
            employees_joined_this_month: 0,
            employees_joined_this_year: 0,
            total_salary_expense: employees.reduce((sum, emp) => sum + emp.salary, 0),
          }}
          loading={dashboardLoading}
        />
      )}

      {/* Attendance Statistics Cards - Only show when attendance tab is active */}
      {activeTab === 'attendance' && (
        attendanceDashboardStats ? (
          <AttendanceStatsCards
            stats={attendanceDashboardStats}
            loading={attendanceDashboardLoading}
          />
        ) : (
          <OldAttendanceStatsCards
            totalRecords={attendance.length}
            averageAttendance={attendance.length > 0 ? 
              (attendance.reduce((sum, record) => sum + (record.days_present / record.total_working_days * 100), 0) / attendance.length) : 0
            }
            totalLateArrivals={attendance.reduce((sum, record) => sum + record.late_arrivals, 0)}
            totalEarlyDepartures={attendance.reduce((sum, record) => sum + record.early_departures, 0)}
            totalPaidLeaves={attendance.reduce((sum, record) => sum + record.paid_leaves, 0)}
            totalUnpaidLeaves={attendance.reduce((sum, record) => sum + record.unpaid_leaves, 0)}
          />
        )
      )}

      {/* Leave Statistics Cards - Only show when leaves tab is active */}
      {activeTab === 'leaves' && (
        leaveDashboardStats ? (
          <LeaveStatsCards
            stats={leaveDashboardStats}
            loading={leaveDashboardLoading}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Leave dashboard data not available. Using table view.</p>
          </div>
        )
      )}

      {/* Advance Statistics Cards - Only show when advances tab is active */}
      {activeTab === 'advances' && (
        advanceDashboardStats ? (
          <AdvanceStatsCards
            stats={advanceDashboardStats}
            loading={advanceDashboardLoading}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Advance dashboard data not available. Using table view.</p>
          </div>
        )
      )}

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
              onViewAttendance={handleViewAttendance}
        onAddLeave={() => {
                setIsEditingLeave(false);
                setShowLeaveForm(true);
                setLeaveFormData({
                  employee_id: 0,
                  leave_type: 'CASUAL',
                  from_date: new Date().toISOString().split('T')[0],
                  to_date: new Date().toISOString().split('T')[0],
                  reason: '',
                  total_days: 1,
                  applied_date: new Date().toISOString().split('T')[0]
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
        onViewLeave={handleViewLeave}
        onAddAdvance={() => {
                setIsEditingAdvance(false);
                setShowAdvanceForm(true);
                setAdvanceFormData({
                  employee_id: 0,
                  advance_date: new Date().toISOString().split('T')[0],
                  advance_amount: 0,
                  request_reason: ''
                });
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
        onViewAdvance={(advance: any) => {
                setAdvanceToView(advance);
                setShowAdvanceViewDialog(true);
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
        showAttendanceViewDialog={showAttendanceViewDialog}
        setShowAttendanceViewDialog={setShowAttendanceViewDialog}
        attendanceToView={attendanceToView}
        setAttendanceToView={setAttendanceToView}
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
        showLeaveViewDialog={showLeaveViewDialog}
        setShowLeaveViewDialog={setShowLeaveViewDialog}
        leaveToView={leaveToView}
        setLeaveToView={setLeaveToView}
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
        showAdvanceViewDialog={showAdvanceViewDialog}
        setShowAdvanceViewDialog={setShowAdvanceViewDialog}
        advanceToView={advanceToView}
        setAdvanceToView={setAdvanceToView}
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
