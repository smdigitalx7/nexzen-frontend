import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEmployeesByBranch, useEmployee, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useUpdateEmployeeStatus } from '@/lib/hooks/useEmployees';
import { useAttendanceAll, useAttendanceByBranch, useAttendance, useCreateAttendance, useUpdateAttendance, useDeleteAttendance } from '@/lib/hooks/useAttendance';
import { useEmployeeLeaves, useEmployeeLeavesByBranch, useEmployeeLeaveById, useCreateEmployeeLeave, useUpdateEmployeeLeave, useApproveEmployeeLeave, useRejectEmployeeLeave, useDeleteEmployeeLeave } from '@/lib/hooks/useEmployeeLeave';
import { useAdvancesAll, useAdvancesByBranch, useAdvance, useCreateAdvance, useUpdateAdvance, useUpdateAdvanceStatus, useUpdateAdvanceAmountPaid } from '@/lib/hooks/useAdvances';
import { EmployeeCreate, EmployeeUpdate } from '@/lib/types/employees';
import { EmployeeAttendanceCreate, EmployeeAttendanceUpdate } from '@/lib/types/attendance';
import { EmployeeLeaveCreate, EmployeeLeaveUpdate, EmployeeLeaveReject } from '@/lib/types/employee-leave';
import { AdvanceCreate, AdvanceUpdate } from '@/lib/types/advances';

// Types
export interface EmployeeRead {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  date_of_joining: string;
  salary: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  branch_id: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  branch_id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLeaveRead {
  leave_id: number;
  employee_id: number;
  leave_type: 'SICK' | 'CASUAL' | 'ANNUAL' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY';
  from_date: string;
  to_date: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  applied_date: string;
  approved_date?: string;
  rejected_date?: string;
  approved_by?: number;
  rejected_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvanceRead {
  advance_id: number;
  employee_id: number;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  requested_date: string;
  approved_date?: string;
  paid_date?: string;
  amount_paid?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeManagement = (viewMode: "branch" | "institute" = "branch") => {
  const { user, currentBranch } = useAuthStore();
  
  // Data hooks
  const { data: employees = [], isLoading, error } = useEmployeesByBranch();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendanceByBranch();
  const { data: leaves = [], isLoading: leavesLoading } = useEmployeeLeavesByBranch();
  const { data: advancesData, isLoading: advancesLoading } = useAdvancesByBranch();
  const advances = advancesData?.data || [];

  console.log('🔍 useEmployeeManagement: Data status:', {
    employeesCount: employees?.length || 0,
    attendanceCount: attendance?.length || 0,
    leavesCount: leaves?.length || 0,
    advancesCount: advances?.length || 0,
    isLoading,
    attendanceLoading,
    leavesLoading,
    advancesLoading
  });

  console.log('🔍 useEmployeeManagement: Raw data samples:', {
    employees: employees?.slice(0, 2),
    attendance: attendance?.slice(0, 2),
    leaves: leaves?.slice(0, 2),
    advances: advances?.slice(0, 2)
  });
  
  // Mutation hooks
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const updateStatusMutation = useUpdateEmployeeStatus();
  
  const createAttendanceMutation = useCreateAttendance();
  const updateAttendanceMutation = useUpdateAttendance();
  const deleteAttendanceMutation = useDeleteAttendance();
  
  const createLeaveMutation = useCreateEmployeeLeave();
  const updateLeaveMutation = useUpdateEmployeeLeave();
  const deleteLeaveMutation = useDeleteEmployeeLeave();
  const approveLeaveMutation = useApproveEmployeeLeave();
  const rejectLeaveMutation = useRejectEmployeeLeave();
  
  const createAdvanceMutation = useCreateAdvance();
  const updateAdvanceMutation = useUpdateAdvance();
  const updateAdvanceStatusMutation = useUpdateAdvanceStatus();
  const updateAdvanceAmountPaidMutation = useUpdateAdvanceAmountPaid();
  
  // UI State
  const [activeTab, setActiveTab] = useState("employees");
  const [attendancePage, setAttendancePage] = useState(1);
  const [leavesPage, setLeavesPage] = useState(1);
  const [advancesPage, setAdvancesPage] = useState(1);
  const pageSize = 20;
  
  // Employee form state
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [showDeleteEmployeeDialog, setShowDeleteEmployeeDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRead | null>(null);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");
  
  // Attendance form state
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<EmployeeAttendanceRead | null>(null);
  const [showAttendanceDeleteDialog, setShowAttendanceDeleteDialog] = useState(false);
  const [attendanceFormData, setAttendanceFormData] = useState<EmployeeAttendanceCreate>({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT'
  });
  
  // Leave form state
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [isEditingLeave, setIsEditingLeave] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<EmployeeLeaveRead | null>(null);
  const [showLeaveDeleteDialog, setShowLeaveDeleteDialog] = useState(false);
  const [showLeaveApproveDialog, setShowLeaveApproveDialog] = useState(false);
  const [showLeaveRejectDialog, setShowLeaveRejectDialog] = useState(false);
  const [leaveToApprove, setLeaveToApprove] = useState<EmployeeLeaveRead | null>(null);
  const [leaveToReject, setLeaveToReject] = useState<EmployeeLeaveRead | null>(null);
  const [leaveFormData, setLeaveFormData] = useState<EmployeeLeaveCreate>({
    employee_id: 0,
    leave_type: 'CASUAL',
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    reason: '',
    total_days: 1,
    applied_date: new Date().toISOString().split('T')[0]
  });
  
  // Advance form state
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [isEditingAdvance, setIsEditingAdvance] = useState(false);
  const [advanceToDelete, setAdvanceToDelete] = useState<AdvanceRead | null>(null);
  const [showAdvanceDeleteDialog, setShowAdvanceDeleteDialog] = useState(false);
  const [showAdvanceStatusDialog, setShowAdvanceStatusDialog] = useState(false);
  const [showAdvanceAmountDialog, setShowAdvanceAmountDialog] = useState(false);
  const [advanceToUpdate, setAdvanceToUpdate] = useState<AdvanceRead | null>(null);
  const [advanceFormData, setAdvanceFormData] = useState<AdvanceCreate>({
    employee_id: 0,
    advance_date: new Date().toISOString().split('T')[0],
    advance_amount: 0,
    request_reason: ''
  });
  
  // Enrich attendance data with employee names
  const enrichedAttendance = attendance.map(attendanceRecord => {
    const employee = employees.find(emp => emp.employee_id === attendanceRecord.employee_id);
    return {
      ...attendanceRecord,
      employee_name: employee?.employee_name || `Employee ${attendanceRecord.employee_id}`
    };
  });

  // Computed values
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE').length;
  const totalAttendance = attendance.length;
  const presentToday = attendance.filter(att => 
    att.date === new Date().toISOString().split('T')[0] && att.status === 'PRESENT'
  ).length;
  const pendingLeaves = leaves.filter(leave => leave.leave_status === 'PENDING').length;
  const totalAdvances = Array.isArray(advances) ? advances.length : 0;
  const pendingAdvances = Array.isArray(advances) ? advances.filter((adv: any) => adv.status === 'PENDING').length : 0;
  
  // Pagination
  const paginatedAttendance = useMemo(() => {
    const start = (attendancePage - 1) * pageSize;
    return enrichedAttendance.slice(start, start + pageSize);
  }, [enrichedAttendance, attendancePage, pageSize]);
  
  const paginatedLeaves = useMemo(() => {
    const start = (leavesPage - 1) * pageSize;
    return leaves.slice(start, start + pageSize);
  }, [leaves, leavesPage, pageSize]);
  
  const paginatedAdvances = useMemo(() => {
    const start = (advancesPage - 1) * pageSize;
    return Array.isArray(advances) ? advances.slice(start, start + pageSize) : [];
  }, [advances, advancesPage, pageSize]);
  
  // Business logic functions
  const handleCreateEmployee = async (data: EmployeeCreate) => {
    try {
      await createEmployeeMutation.mutateAsync(data);
      setShowEmployeeForm(false);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };
  
  const handleUpdateEmployee = async (id: number, data: EmployeeUpdate) => {
    try {
      await updateEmployeeMutation.mutateAsync({ id, payload: data });
      setShowEmployeeForm(false);
      setIsEditingEmployee(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };
  
  const handleDeleteEmployee = async (id: number) => {
    try {
      await deleteEmployeeMutation.mutateAsync(id);
      setShowDeleteEmployeeDialog(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };
  
  const handleUpdateEmployeeStatus = async (id: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch (error) {
      console.error('Error updating employee status:', error);
    }
  };
  
  const handleCreateAttendance = async (data: EmployeeAttendanceCreate) => {
    try {
      await createAttendanceMutation.mutateAsync(data);
      setShowAttendanceForm(false);
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };
  
  const handleUpdateAttendance = async (id: number, data: EmployeeAttendanceUpdate) => {
    try {
      await updateAttendanceMutation.mutateAsync({ id, payload: data });
      setShowAttendanceForm(false);
      setIsEditingAttendance(false);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };
  
  const handleDeleteAttendance = async (id: number) => {
    try {
      await deleteAttendanceMutation.mutateAsync(id);
      setShowAttendanceDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
  };
  
  const handleCreateLeave = async (data: EmployeeLeaveCreate) => {
    try {
      await createLeaveMutation.mutateAsync(data);
      setShowLeaveForm(false);
    } catch (error) {
      console.error('Error creating leave:', error);
    }
  };
  
  const handleUpdateLeave = async (id: number, data: EmployeeLeaveUpdate) => {
    try {
      await updateLeaveMutation.mutateAsync({ id, data });
      setShowLeaveForm(false);
      setIsEditingLeave(false);
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };
  
  const handleDeleteLeave = async (id: number) => {
    try {
      await deleteLeaveMutation.mutateAsync(id);
      setShowLeaveDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting leave:', error);
    }
  };
  
  const handleApproveLeave = async (id: number, notes?: string) => {
    try {
      await approveLeaveMutation.mutateAsync(id);
      setShowLeaveApproveDialog(false);
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };
  
  const handleRejectLeave = async (id: number, reason: string) => {
    try {
      await rejectLeaveMutation.mutateAsync({ id, data: { rejection_reason: reason } });
      setShowLeaveRejectDialog(false);
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };
  
  const handleCreateAdvance = async (data: AdvanceCreate) => {
    try {
      await createAdvanceMutation.mutateAsync(data);
      setShowAdvanceForm(false);
    } catch (error) {
      console.error('Error creating advance:', error);
    }
  };
  
  const handleUpdateAdvance = async (id: number, data: AdvanceUpdate) => {
    try {
      await updateAdvanceMutation.mutateAsync({ id, payload: data });
      setShowAdvanceForm(false);
      setIsEditingAdvance(false);
    } catch (error) {
      console.error('Error updating advance:', error);
    }
  };
  
  const handleUpdateAdvanceStatus = async (id: number, status: string) => {
    try {
      await updateAdvanceStatusMutation.mutateAsync({ id, status });
      setShowAdvanceStatusDialog(false);
    } catch (error) {
      console.error('Error updating advance status:', error);
    }
  };
  
  const handleUpdateAdvanceAmountPaid = async (id: number, amount: number) => {
    try {
      await updateAdvanceAmountPaidMutation.mutateAsync({ id, amount_paid: amount });
      setShowAdvanceAmountDialog(false);
    } catch (error) {
      console.error('Error updating advance amount:', error);
    }
  };
  
  return {
    // Data
    employees,
    attendance: paginatedAttendance,
    leaves: paginatedLeaves,
    advances: paginatedAdvances,
    
    // Loading states
    isLoading,
    error,
    attendanceLoading,
    leavesLoading,
    advancesLoading,
    
    // Computed values
    totalEmployees,
    activeEmployees,
    totalAttendance,
    presentToday,
    pendingLeaves,
    totalAdvances,
    pendingAdvances,
    
    // UI State
    activeTab,
    setActiveTab,
    attendancePage,
    setAttendancePage,
    leavesPage,
    setLeavesPage,
    advancesPage,
    setAdvancesPage,
    pageSize,
    
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
    
    // Business logic
    handleCreateEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleUpdateEmployeeStatus,
    handleCreateAttendance,
    handleUpdateAttendance,
    handleDeleteAttendance,
    handleCreateLeave,
    handleUpdateLeave,
    handleDeleteLeave,
    handleApproveLeave,
    handleRejectLeave,
    handleCreateAdvance,
    handleUpdateAdvance,
    handleUpdateAdvanceStatus,
    handleUpdateAdvanceAmountPaid,
    
    // User context
    user,
    currentBranch,
  };
};