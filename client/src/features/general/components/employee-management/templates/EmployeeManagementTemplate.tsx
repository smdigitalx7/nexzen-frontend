import { useCallback, useMemo } from "react";
import { useEmployeeManagement, useEmployeeDashboard, useAttendanceDashboard, useLeaveDashboard, useAdvanceDashboard } from "@/features/general/hooks";
import type { EmployeeRead as HookEmployeeRead, EmployeeAttendanceRead, EmployeeLeaveRead as HookEmployeeLeaveRead } from "@/features/general/hooks/useEmployeeManagement";
import type { AdvanceRead } from "@/features/general/types/advances";
import type { EmployeeLeaveRead } from "@/features/general/types/employee-leave";
import type { EmployeeRead as LibEmployeeRead } from "@/features/general/types/employees";

// Local types for component compatibility (matches EmployeeManagementTabs expectations)
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
  // Additional fields needed for detail view
  employee_type?: string;
  qualification?: string | null;
  experience_years?: number | null;
};

type EmployeeAdvanceRead = Omit<AdvanceRead, 'status'> & {
  status: string; // Required, not optional
};
import { EmployeeManagementHeader } from "../components/EmployeeManagementHeader";
import { EmployeeManagementTabs } from "../components/EmployeeManagementTabs";
import { EmployeeManagementDialogs } from "../components/EmployeeManagementDialogs";
import { EmployeeStatsCards } from "../employee/EmployeeStatsCards";
import { AttendanceStatsCards } from "../Attendance/AttendanceStatsCards";
import { LeaveStatsCards } from "../Leave/LeaveStatsCards";
import { AdvanceStatsCards } from "../Advance/AdvanceStatsCards";

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
    handleViewLeave,
    handleCreateAdvance,
    handleUpdateAdvance,
    handleUpdateAdvanceStatus,
    handleUpdateAdvanceAmountPaid,
    handleCreateAttendance,
    handleBulkCreateAttendance,
    handleUpdateAttendance,
    handleUpdateAttendanceBulk,
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
    rejectionReason,
    setRejectionReason,
    leaveFormData,
    setLeaveFormData,
    
    // Attendance state
    showAttendanceForm,
    setShowAttendanceForm,
    showAttendanceBulkCreateDialog,
    setShowAttendanceBulkCreateDialog,
    isBulkCreatingAttendance,
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
    showAdvanceStatusDialog,
    setShowAdvanceStatusDialog,
    showAdvanceAmountDialog,
    setShowAdvanceAmountDialog,
    showAdvanceVoucherDialog,
    setShowAdvanceVoucherDialog,
    advanceForVoucher,
    setAdvanceForVoucher,
    advanceToUpdate,
    setAdvanceToUpdate,
    advanceStatus,
    setAdvanceStatus,
    advanceStatusReason,
    setAdvanceStatusReason,
    advanceFormData,
    setAdvanceFormData,
    
    // User context
    user,
    createEmployeePending,
    updateEmployeePending,
    approveLeavePending,
    rejectLeavePending,
    
    // Leave filters
    leaveMonth,
    setLeaveMonth,
    leaveYear,
    setLeaveYear,
    
    // Attendance filters
    attendanceMonth,
    setAttendanceMonth,
    attendanceYear,
    setAttendanceYear,
  } = useEmployeeManagement();

  // employees from hook is now LibEmployeeRead[] (the actual API type)
  // We need to transform it to match component expectations (EmployeeRead with phone, department, branch_id)
  // Note: HookEmployeeRead is now an alias to LibEmployeeRead, so we need to create a compatible type
  // Memoize to prevent unnecessary recalculations
  const employeesData = useMemo(() => employees.map((emp: LibEmployeeRead): EmployeeRead => ({
    employee_id: emp.employee_id,
    employee_name: emp.employee_name,
    employee_code: emp.employee_code,
    email: emp.email || null,
    mobile_no: emp.mobile_no || null,
    designation: emp.designation,
    department: undefined, // Not in API type
    date_of_joining: emp.date_of_joining,
    salary: emp.salary,
    status: emp.status,
    branch_id: undefined, // Not in API type
    created_at: emp.created_at,
    updated_at: emp.updated_at || null,
    // Include missing fields that are needed for the detail view
    employee_type: emp.employee_type,
    qualification: emp.qualification || null,
    experience_years: emp.experience_years || null,
  })), [employees]);

  // ✅ CRITICAL FIX: Only fetch dashboard stats for the active tab
  // This prevents all 4 dashboard APIs from being called at once
  const { data: dashboardStats, isLoading: dashboardLoading } = useEmployeeDashboard(
    activeTab === "employees" // Only fetch when employees tab is active
  );
  const { data: attendanceDashboardStats, isLoading: attendanceDashboardLoading } = useAttendanceDashboard(
    activeTab === "attendance" // Only fetch when attendance tab is active
  );
  const { data: leaveDashboardStats, isLoading: leaveDashboardLoading } = useLeaveDashboard(
    activeTab === "leaves" // Only fetch when leaves tab is active
  );
  const { data: advanceDashboardStats, isLoading: advanceDashboardLoading } = useAdvanceDashboard(
    activeTab === "advances" // Only fetch when advances tab is active
  );

  // ✅ FIX: Get loading state for the currently active tab only
  const isDashboardLoading = useMemo(() => {
    if (activeTab === "employees") return dashboardLoading;
    if (activeTab === "attendance") return attendanceDashboardLoading;
    if (activeTab === "leaves") return leaveDashboardLoading;
    if (activeTab === "advances") return advanceDashboardLoading;
    return false;
  }, [activeTab, dashboardLoading, attendanceDashboardLoading, leaveDashboardLoading, advanceDashboardLoading]);

  const handleAddEmployee = () => {
    // Initialize with default form values using LibEmployeeRead (API type)
    setSelectedEmployee({
      employee_id: 0,
      institute_id: 0,
      employee_name: '',
      employee_type: 'TEACHING',
      employee_code: '',
      email: null,
      mobile_no: null,
      designation: '',
      date_of_joining: new Date().toISOString().split('T')[0],
      salary: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: null,
    } as LibEmployeeRead);
    setIsEditingEmployee(false);
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee: EmployeeRead) => {
    // Transform component's EmployeeRead to LibEmployeeRead (API type)
    const hookEmployee: LibEmployeeRead = {
      ...employee,
      // Map component's mobile_no to API's mobile_no
      mobile_no: employee.mobile_no || null,
      // API type doesn't have department or branch_id, so we omit them
    } as LibEmployeeRead;
    setSelectedEmployee(hookEmployee);
    setIsEditingEmployee(true);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployeeClick = async (id: number) => {
    // employees is LibEmployeeRead[] from the hook
    const employee = employees.find(emp => emp.employee_id === id);
    if (employee) {
      // setEmployeeToDelete expects LibEmployeeRead (HookEmployeeRead is now an alias)
      setEmployeeToDelete(employee);
      setShowDeleteEmployeeDialog(true);
    }
  };

  const handleViewEmployee = (employee: EmployeeRead) => {
    // Find the full employee data from the original employees array to get all fields
    const fullEmployee = employees.find(emp => emp.employee_id === employee.employee_id);
    if (fullEmployee) {
      // Use the full employee data from API which includes all fields
      setSelectedEmployee(fullEmployee);
    } else {
      // Fallback: Transform component's EmployeeRead to LibEmployeeRead (API type)
      const hookEmployee: LibEmployeeRead = {
        ...employee,
        // Map component's mobile_no to API's mobile_no
        mobile_no: employee.mobile_no || null,
        // Include missing fields with defaults
        employee_type: (employee as any).employee_type || 'TEACHING',
        qualification: (employee as any).qualification || null,
        experience_years: (employee as any).experience_years || null,
        // API type doesn't have department or branch_id, so we omit them
      } as LibEmployeeRead;
      setSelectedEmployee(hookEmployee);
    }
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
            teaching_staff: employees.filter((emp: LibEmployeeRead) => emp.employee_type === 'teaching').length,
            non_teaching_staff: employees.filter((emp: LibEmployeeRead) => emp.employee_type === 'non_teaching').length,
            office_staff: employees.filter((emp: LibEmployeeRead) => emp.employee_type === 'office').length,
            drivers: employees.filter((emp: LibEmployeeRead) => emp.employee_type === 'driver').length,
            employees_joined_this_month: 0,
            employees_joined_this_year: 0,
            total_salary_expense: employees.reduce((sum: number, emp: LibEmployeeRead) => sum + emp.salary, 0),
          }}
          loading={dashboardLoading}
        />
      )}

      {/* Attendance Statistics Cards - Only show when attendance tab is active */}
      {activeTab === 'attendance' && attendanceDashboardStats && (
        <AttendanceStatsCards
          stats={attendanceDashboardStats}
          loading={attendanceDashboardLoading}
        />
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
            employees={employeesData}
        attendance={attendance.map(att => {
          // Transform attendance data to component's expected format (number month, number year)
          // Backend API returns attendance_month as number (1-12), but handle both number and string formats
          let month: number | null = null;
          let year: number | null = null;
          
          // Handle attendance_month - can be number (1-12) or string (YYYY-MM-DD)
          if (typeof att.attendance_month === 'number' && att.attendance_month >= 1 && att.attendance_month <= 12) {
            month = att.attendance_month;
          } else if (typeof att.attendance_month === 'string') {
            // Try to parse string format (YYYY-MM-DD)
            const dateMatch = att.attendance_month.match(/^(\d{4})-(\d{2})/);
            if (dateMatch) {
              month = parseInt(dateMatch[2], 10);
              year = parseInt(dateMatch[1], 10);
            }
          }
          
          // Handle attendance_year - can be number or string
          if (year === null) {
            if (typeof att.attendance_year === 'number' && att.attendance_year > 0) {
              year = att.attendance_year;
            } else if (typeof att.attendance_year === 'string') {
              const parsedYear = parseInt(att.attendance_year, 10);
              if (!isNaN(parsedYear) && parsedYear > 0) {
                year = parsedYear;
              }
            }
          }
          
          // Fallback: use current month/year if parsing fails or values are invalid
          const now = new Date();
          return {
            attendance_id: att.attendance_id,
            employee_id: att.employee_id,
            employee_name: att.employee_name,
            attendance_month: (month && month >= 1 && month <= 12) ? month : now.getMonth() + 1,
            attendance_year: (year && year > 0) ? year : now.getFullYear(),
            total_working_days: att.total_working_days,
            days_present: att.days_present,
            paid_leaves: att.paid_leaves,
            unpaid_leaves: att.unpaid_leaves,
          };
        })}
        leaves={leaves.map(leave => ({
          ...leave,
          updated_at: leave.updated_at || leave.created_at || new Date().toISOString(),
        }))}
        advances={advances.map(adv => ({
          ...adv,
          status: adv.status || 'REQUESTED',
          // created_at is required in AdvanceRead but optional in EmployeeAdvanceRead
          // We keep it for compatibility but it won't be used by AdvancesTable
        } as EmployeeAdvanceRead & { created_at: string }))}
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
              onBulkCreateAttendance={() => {
                setShowAttendanceBulkCreateDialog(true);
              }}
              onEditAttendance={(record: { attendance_id: number; employee_id: number; employee_name?: string; attendance_month: number; attendance_year: number; total_working_days: number; days_present: number; paid_leaves: number; unpaid_leaves: number }) => {
                setIsEditingAttendance(true);
                setShowAttendanceForm(true);
                // Format month as YYYY-MM-DD for the month input
                const monthStr = `${record.attendance_year}-${String(record.attendance_month).padStart(2, '0')}-01`;
                setAttendanceFormData({
                  employee_id: record.employee_id,
                  attendance_month: monthStr,
                  total_working_days: record.total_working_days,
                });
              }}
              onDeleteAttendance={(id: number) => {
                const rec = attendance.find((a) => a.attendance_id === id);
                if (rec) {
                  setAttendanceToDelete(rec);
                  setShowAttendanceDeleteDialog(true);
                }
              }}
              onViewAttendance={(record) => {
                // Pass the record directly with number format (month and year as numbers)
                // The view dialog can handle both number and string formats
                const hookAttendance: EmployeeAttendanceRead = {
                  attendance_id: record.attendance_id,
                  employee_id: record.employee_id,
                  employee_name: record.employee_name,
                  attendance_month: record.attendance_month, // Keep as number (1-12)
                  attendance_year: record.attendance_year, // Keep as number
                  total_working_days: record.total_working_days,
                  days_present: record.days_present,
                  days_absent: 0, // Not available in component format
                  paid_leaves: record.paid_leaves,
                  unpaid_leaves: record.unpaid_leaves,
                  late_arrivals: 0, // Not available in component format
                  early_departures: 0, // Not available in component format
                };
                handleViewAttendance(hookAttendance);
              }}
        onAddLeave={() => {
                setIsEditingLeave(false);
                setShowLeaveForm(true);
                setLeaveFormData({
                  employee_id: 0,
                  leave_type: 'PAID',
                  from_date: new Date().toISOString().split('T')[0],
                  to_date: new Date().toISOString().split('T')[0],
                  reason: '',
                  total_days: 1,
                  applied_date: new Date().toISOString().split('T')[0]
                });
              }}
        onApproveLeave={(leave: EmployeeLeaveRead) => {
                // Transform lib's EmployeeLeaveRead to hook's HookEmployeeLeaveRead
                const hookLeave: HookEmployeeLeaveRead = {
                  ...leave,
                  updated_at: leave.updated_at || leave.created_at || new Date().toISOString(),
                };
                setLeaveToApprove(hookLeave);
                setShowLeaveApproveDialog(true);
              }}
        onRejectLeave={(leave: EmployeeLeaveRead) => {
                // Transform lib's EmployeeLeaveRead to hook's HookEmployeeLeaveRead
                const hookLeave: HookEmployeeLeaveRead = {
                  ...leave,
                  updated_at: leave.updated_at || leave.created_at || new Date().toISOString(),
                };
                setLeaveToReject(hookLeave);
                setShowLeaveRejectDialog(true);
              }}
        onEditLeave={(leave: EmployeeLeaveRead) => {
                setLeaveFormData({
                  employee_id: leave.employee_id,
                  leave_type: leave.leave_type,
                  from_date: leave.from_date,
                  to_date: leave.to_date,
                  reason: leave.reason,
                  total_days: leave.total_days,
                  applied_date: leave.applied_date
                });
                // Transform lib's EmployeeLeaveRead to hook's HookEmployeeLeaveRead
                const hookLeave: HookEmployeeLeaveRead = {
                  ...leave,
                  updated_at: leave.updated_at || leave.created_at || new Date().toISOString(),
                };
                setLeaveToApprove(hookLeave);
                setIsEditingLeave(true);
                setShowLeaveForm(true);
              }}
        onDeleteLeave={(id: number) => {
          const leave = leaves.find((l) => l.leave_id === id);
          if (leave) {
            // Transform lib's EmployeeLeaveRead to hook's HookEmployeeLeaveRead
            const hookLeave: HookEmployeeLeaveRead = {
              ...leave,
              updated_at: leave.updated_at || leave.created_at || new Date().toISOString(),
            };
            setLeaveToDelete(hookLeave);
            setShowLeaveDeleteDialog(true);
          }
        }}
        onViewLeave={(leave: EmployeeLeaveRead) => {
          // Transform lib's EmployeeLeaveRead to hook's HookEmployeeLeaveRead
          const hookLeave: HookEmployeeLeaveRead = {
            ...leave,
            updated_at: leave.updated_at || leave.created_at || new Date().toISOString(),
          };
          handleViewLeave(hookLeave);
        }}
        onAddAdvance={useCallback(() => {
                setIsEditingAdvance(false);
                setShowAdvanceForm(true);
                setAdvanceFormData({
                  employee_id: 0,
                  advance_date: new Date().toISOString().split('T')[0],
                  advance_amount: 0,
                  request_reason: ''
                });
              }, [setIsEditingAdvance, setShowAdvanceForm, setAdvanceFormData])}
        onApproveAdvance={useCallback((advance) => {
                // Transform EmployeeAdvanceRead (without created_at) back to AdvanceRead for hook
                const fullAdvance: AdvanceRead = {
                  ...advance,
                  created_at: advance.created_at || new Date().toISOString(),
                };
                setAdvanceToUpdate(fullAdvance);
                setAdvanceStatus(advance.status || "");
                setShowAdvanceStatusDialog(true);
              }, [setAdvanceToUpdate, setAdvanceStatus, setShowAdvanceStatusDialog])}
        onEditAdvance={useCallback((advance) => {
                setAdvanceFormData({
                  employee_id: advance.employee_id,
                  advance_date: advance.advance_date,
                  advance_amount: advance.advance_amount,
                  request_reason: advance.request_reason || ''
                });
                // Transform EmployeeAdvanceRead (without created_at) back to AdvanceRead for hook
                const fullAdvance: AdvanceRead = {
                  ...advance,
                  created_at: advance.created_at || new Date().toISOString(),
                };
                setAdvanceToUpdate(fullAdvance);
                setIsEditingAdvance(true);
                setShowAdvanceForm(true);
              }, [setAdvanceFormData, setAdvanceToUpdate, setIsEditingAdvance, setShowAdvanceForm])}
        onViewAdvance={useCallback((advance) => {
                // Transform EmployeeAdvanceRead (without created_at) back to AdvanceRead for hook
                const fullAdvance: AdvanceRead = {
                  ...advance,
                  created_at: advance.created_at || new Date().toISOString(),
                };
                setAdvanceToView(fullAdvance);
                setShowAdvanceViewDialog(true);
              }, [setAdvanceToView, setShowAdvanceViewDialog])}
              onUpdateAmount={useCallback((advance) => {
                // Transform EmployeeAdvanceRead (without created_at) back to AdvanceRead for hook
                const fullAdvance: AdvanceRead = {
                  ...advance,
                  created_at: advance.created_at || new Date().toISOString(),
                };
                setAdvanceToUpdate(fullAdvance);
                setShowAdvanceAmountDialog(true);
              }, [setAdvanceToUpdate, setShowAdvanceAmountDialog])}
        onRejectAdvance={useCallback((advance) => {
                // Transform EmployeeAdvanceRead (without created_at) back to AdvanceRead for hook
                const fullAdvance: AdvanceRead = {
                  ...advance,
                  created_at: advance.created_at || new Date().toISOString(),
                };
                setAdvanceToUpdate(fullAdvance);
                setAdvanceStatus("REJECTED");
                setShowAdvanceStatusDialog(true);
              }, [setAdvanceToUpdate, setAdvanceStatus, setShowAdvanceStatusDialog])}
        leaveMonth={leaveMonth}
        setLeaveMonth={setLeaveMonth}
        leaveYear={leaveYear}
        setLeaveYear={setLeaveYear}
        attendanceMonth={attendanceMonth}
        setAttendanceMonth={setAttendanceMonth}
        attendanceYear={attendanceYear}
        setAttendanceYear={setAttendanceYear}
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
        showAttendanceBulkCreateDialog={showAttendanceBulkCreateDialog}
        setShowAttendanceBulkCreateDialog={setShowAttendanceBulkCreateDialog}
        isBulkCreatingAttendance={isBulkCreatingAttendance}
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
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
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
        showAdvanceStatusDialog={showAdvanceStatusDialog}
        setShowAdvanceStatusDialog={setShowAdvanceStatusDialog}
        showAdvanceAmountDialog={showAdvanceAmountDialog}
        setShowAdvanceAmountDialog={setShowAdvanceAmountDialog}
        showAdvanceVoucherDialog={showAdvanceVoucherDialog}
        setShowAdvanceVoucherDialog={setShowAdvanceVoucherDialog}
        advanceForVoucher={advanceForVoucher}
        setAdvanceForVoucher={setAdvanceForVoucher}
        advanceToUpdate={advanceToUpdate}
        setAdvanceToUpdate={setAdvanceToUpdate}
        advanceStatus={advanceStatus}
        setAdvanceStatus={setAdvanceStatus}
        advanceStatusReason={advanceStatusReason}
        setAdvanceStatusReason={setAdvanceStatusReason}
        advanceFormData={advanceFormData}
        setAdvanceFormData={setAdvanceFormData}
        
        // Data
        employees={employeesData}
        
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
        handleBulkCreateAttendance={handleBulkCreateAttendance}
        handleUpdateAttendance={handleUpdateAttendance}
        handleUpdateAttendanceBulk={handleUpdateAttendanceBulk}
        handleDeleteAttendance={handleDeleteAttendance}
        createEmployeePending={createEmployeePending}
        updateEmployeePending={updateEmployeePending}
        approveLeavePending={approveLeavePending}
        rejectLeavePending={rejectLeavePending}
      />
    </div>
  );
};
