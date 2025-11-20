import { ConfirmDialog } from "@/components/shared";
import EmployeeFormDialog from "../employee/EmployeeFormDialog";
import EmployeeDetailDialog from "../employee/EmployeeDetailDialog";
import EmployeeDeleteDialog from "../employee/EmployeeDeleteDialog";
import AttendanceFormDialog from "../Attendance/AttendanceFormDialog";
import AttendanceBulkCreateDialog from "../Attendance/AttendanceBulkCreateDialog";
import { AttendanceViewDialog } from "../Attendance/AttendanceViewDialog";
import LeaveFormDialog from "../Leave/LeaveFormDialog";
import { LeaveViewDialog } from "../Leave/LeaveViewDialog";
import LeaveApproveDialog from "../Leave/LeaveApproveDialog";
import LeaveRejectDialog from "../Leave/LeaveRejectDialog";
import AdvanceFormDialog from "../Advance/AdvanceFormDialog";
import { AdvanceViewDialog } from "../Advance/AdvanceViewDialog";
import AdvanceStatusDialog from "../Advance/AdvanceStatusDialog";
import AdvanceAmountDialog from "../Advance/AdvanceAmountDialog";
import { AdvanceVoucherPrintDialog } from "../Advance/AdvanceVoucherPrintDialog";
import { useAuthStore } from "@/store/authStore";
import { generateAdvanceVoucherPDF } from "@/lib/utils/export/advance-voucher-pdf";

interface EmployeeManagementDialogsProps {
  // Employee dialogs
  showEmployeeForm: boolean;
  setShowEmployeeForm: (show: boolean) => void;
  isEditingEmployee: boolean;
  selectedEmployee: any;
  setSelectedEmployee: (employee: any) => void;
  showEmployeeDetail: boolean;
  setShowEmployeeDetail: (show: boolean) => void;
  showDeleteEmployeeDialog: boolean;
  setShowDeleteEmployeeDialog: (show: boolean) => void;
  employeeToDelete: any;
  setEmployeeToDelete: (employee: any) => void;
  newStatus: string;
  setNewStatus: (status: string) => void;
  
  // Attendance dialogs
  showAttendanceForm: boolean;
  setShowAttendanceForm: (show: boolean) => void;
  showAttendanceBulkCreateDialog: boolean;
  setShowAttendanceBulkCreateDialog: (show: boolean) => void;
  isBulkCreatingAttendance: boolean;
  showAttendanceViewDialog: boolean;
  setShowAttendanceViewDialog: (show: boolean) => void;
  attendanceToView: any;
  setAttendanceToView: (attendance: any) => void;
  isEditingAttendance: boolean;
  attendanceToDelete: any;
  setAttendanceToDelete: (attendance: any) => void;
  showAttendanceDeleteDialog: boolean;
  setShowAttendanceDeleteDialog: (show: boolean) => void;
  attendanceFormData: any;
  setAttendanceFormData: (data: any) => void;
  
  // Leave dialogs
  showLeaveForm: boolean;
  setShowLeaveForm: (show: boolean) => void;
  showLeaveViewDialog: boolean;
  setShowLeaveViewDialog: (show: boolean) => void;
  leaveToView: any;
  setLeaveToView: (leave: any) => void;
  isEditingLeave: boolean;
  leaveToDelete: any;
  setLeaveToDelete: (leave: any) => void;
  showLeaveDeleteDialog: boolean;
  setShowLeaveDeleteDialog: (show: boolean) => void;
  showLeaveApproveDialog: boolean;
  setShowLeaveApproveDialog: (show: boolean) => void;
  showLeaveRejectDialog: boolean;
  setShowLeaveRejectDialog: (show: boolean) => void;
  leaveToApprove: any;
  setLeaveToApprove: (leave: any) => void;
  leaveToReject: any;
  setLeaveToReject: (leave: any) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  leaveFormData: any;
  setLeaveFormData: (data: any) => void;
  
  // Advance dialogs
  showAdvanceForm: boolean;
  setShowAdvanceForm: (show: boolean) => void;
  showAdvanceViewDialog: boolean;
  setShowAdvanceViewDialog: (show: boolean) => void;
  advanceToView: any;
  setAdvanceToView: (advance: any) => void;
  isEditingAdvance: boolean;
  showAdvanceStatusDialog: boolean;
  setShowAdvanceStatusDialog: (show: boolean) => void;
  showAdvanceAmountDialog: boolean;
  setShowAdvanceAmountDialog: (show: boolean) => void;
  showAdvanceVoucherDialog: boolean;
  setShowAdvanceVoucherDialog: (show: boolean) => void;
  advanceForVoucher: any;
  setAdvanceForVoucher: (advance: any) => void;
  advanceToUpdate: any;
  setAdvanceToUpdate: (advance: any) => void;
  advanceStatus: string;
  setAdvanceStatus: (status: string) => void;
  advanceStatusReason: string;
  setAdvanceStatusReason: (reason: string) => void;
  advanceFormData: any;
  setAdvanceFormData: (data: any) => void;
  
  // Data
  employees: any[];
  
  // Handlers
  handleCreateEmployee: (data: any) => Promise<void>;
  handleUpdateEmployee: (id: number, data: any) => Promise<void>;
  handleDeleteEmployee: (id: number) => Promise<void>;
  handleUpdateEmployeeStatus: (id: number, status: string) => Promise<void>;
  handleCreateLeave: (data: any) => Promise<void>;
  handleUpdateLeave: (id: number, data: any) => Promise<void>;
  handleDeleteLeave: (id: number) => Promise<void>;
  handleApproveLeave: (id: number) => Promise<void>;
  handleRejectLeave: (id: number, reason: string) => Promise<void>;
  handleCreateAdvance: (data: any) => Promise<any>;
  handleUpdateAdvance: (id: number, data: any) => Promise<void>;
  handleUpdateAdvanceStatus: (id: number, status: string, reason?: string) => Promise<void>;
  handleUpdateAdvanceAmountPaid: (id: number, amount: number) => Promise<void>;
  handleCreateAttendance: (data: any) => Promise<void>;
  handleBulkCreateAttendance: (data: { total_working_days: number; month: number; year: number }) => Promise<void>;
  handleUpdateAttendance: (employeeId: number, month: number, year: number) => Promise<void>;
  handleUpdateAttendanceBulk: (data: { total_working_days: number; month: number; year: number }) => Promise<void>;
  handleDeleteAttendance: (id: number) => Promise<void>;
  
  // Loading states
  createEmployeePending?: boolean;
  updateEmployeePending?: boolean;
  approveLeavePending?: boolean;
  rejectLeavePending?: boolean;
}

export const EmployeeManagementDialogs = ({
  // Employee dialogs
  showEmployeeForm,
  setShowEmployeeForm,
  isEditingEmployee,
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
  
  // Attendance dialogs
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
  attendanceToDelete,
  setAttendanceToDelete,
  showAttendanceDeleteDialog,
  setShowAttendanceDeleteDialog,
  attendanceFormData,
  setAttendanceFormData,
  
  // Leave dialogs
  showLeaveForm,
  setShowLeaveForm,
  showLeaveViewDialog,
  setShowLeaveViewDialog,
  leaveToView,
  setLeaveToView,
  isEditingLeave,
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
  
  // Advance dialogs
  showAdvanceForm,
  setShowAdvanceForm,
  showAdvanceViewDialog,
  setShowAdvanceViewDialog,
  advanceToView,
  setAdvanceToView,
  isEditingAdvance,
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
  
  // Data
  employees,
  
  // Handlers
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
  handleBulkCreateAttendance,
  handleUpdateAttendance,
  handleUpdateAttendanceBulk,
  handleDeleteAttendance,
  createEmployeePending = false,
  updateEmployeePending = false,
  approveLeavePending = false,
  rejectLeavePending = false,
}: EmployeeManagementDialogsProps) => {
  return (
    <>
      {/* Attendance View Dialog */}
      <AttendanceViewDialog
        open={showAttendanceViewDialog}
        onOpenChange={setShowAttendanceViewDialog}
        attendance={attendanceToView}
        employee={attendanceToView ? employees.find((e: any) => e.employee_id === attendanceToView.employee_id) : null}
      />
      
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
      
      {/* Leave View Dialog */}
      <LeaveViewDialog
        open={showLeaveViewDialog}
        onOpenChange={setShowLeaveViewDialog}
        leave={leaveToView}
        employee={leaveToView ? employees.find((e: any) => e.employee_id === leaveToView.employee_id) : null}
        onApprove={(id) => {
          // ✅ CRITICAL: Close view dialog immediately (critical for smooth transition)
          setShowLeaveViewDialog(false);
          
          // ✅ DEFER: Set leave data and open approve dialog (non-critical, defer to next tick)
          setTimeout(() => {
            setLeaveToApprove({ ...leaveToView, leave_id: id });
            setShowLeaveApproveDialog(true);
          }, 0);
        }}
        onReject={(id) => {
          // ✅ CRITICAL: Close view dialog immediately (critical for smooth transition)
          setShowLeaveViewDialog(false);
          
          // ✅ DEFER: Set leave data and open reject dialog (non-critical, defer to next tick)
          setTimeout(() => {
            setLeaveToReject({ ...leaveToView, leave_id: id });
            setShowLeaveRejectDialog(true);
          }, 0);
        }}
      />
      
      {/* Leave Form Dialog */}
      <LeaveFormDialog
        open={showLeaveForm}
        onOpenChange={setShowLeaveForm}
        isEditing={isEditingLeave}
        employees={employees}
        formData={leaveFormData}
        onChange={(field, value) => setLeaveFormData((prev: any) => ({ ...prev, [field]: value }))}
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
        leaveStatus={leaveToApprove?.leave_status}
      />
      
      {/* Leave Approve Dialog */}
      <LeaveApproveDialog
        open={showLeaveApproveDialog}
        onOpenChange={setShowLeaveApproveDialog}
        onApprove={() => {
          if (leaveToApprove) {
            handleApproveLeave(leaveToApprove.leave_id);
          }
        }}
        isLoading={approveLeavePending}
      />
      
      {/* Leave Reject Dialog */}
      <LeaveRejectDialog
        open={showLeaveRejectDialog}
        onOpenChange={setShowLeaveRejectDialog}
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
        onReject={() => {
          if (leaveToReject) {
            handleRejectLeave(leaveToReject.leave_id, rejectionReason);
          }
        }}
        isLoading={rejectLeavePending}
      />
      
      {/* Leave Delete Confirm Dialog */}
      <ConfirmDialog
        open={showLeaveDeleteDialog}
        onOpenChange={setShowLeaveDeleteDialog}
        title="Delete Leave Request"
        description="Are you sure you want to delete this leave request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (leaveToDelete) {
            await handleDeleteLeave(leaveToDelete.leave_id);
            setShowLeaveDeleteDialog(false);
            setLeaveToDelete(null);
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
        onChange={(field, value) => setAdvanceFormData((prev: any) => ({ ...prev, [field]: value }))}
        onSubmit={async (e) => {
          e.preventDefault();
          if (isEditingAdvance && advanceToUpdate) {
            // Only send updateable fields for PUT /api/v1/advances/{id}
            await handleUpdateAdvance(advanceToUpdate.advance_id, {
              advance_amount: advanceFormData.advance_amount,
              request_reason: advanceFormData.request_reason
            });
          } else {
            try {
              const createdAdvance = await handleCreateAdvance(advanceFormData);
              
              // Show voucher print dialog after successful creation
              if (createdAdvance) {
                setAdvanceForVoucher(createdAdvance);
                setShowAdvanceVoucherDialog(true);
              }
            } catch (error) {
              // Error handling is done in handleCreateAdvance
              console.error("Error creating advance:", error);
            }
          }
        }}
        isCreatePending={false}
        isUpdatePending={false}
        advanceStatus={advanceToUpdate?.status}
      />
      
      {/* Advance View Dialog */}
      <AdvanceViewDialog
        open={showAdvanceViewDialog}
        onOpenChange={setShowAdvanceViewDialog}
        advance={advanceToView}
        employee={advanceToView ? employees.find((e: any) => e.employee_id === advanceToView.employee_id) : null}
        onChangeStatus={(id) => {
          // ✅ CRITICAL: Close view dialog immediately (critical for smooth transition)
          setShowAdvanceViewDialog(false);
          
          // ✅ DEFER: Set advance data and open status dialog (non-critical, defer to next tick)
          setTimeout(() => {
            setAdvanceToUpdate(advanceToView);
            setAdvanceStatus(advanceToView?.status || "");
            setShowAdvanceStatusDialog(true);
          }, 0);
        }}
        onUpdateAmount={(id) => {
          // ✅ CRITICAL: Close view dialog immediately (critical for smooth transition)
          setShowAdvanceViewDialog(false);
          
          // ✅ DEFER: Set advance data and open amount dialog (non-critical, defer to next tick)
          setTimeout(() => {
            setAdvanceToUpdate(advanceToView);
            setShowAdvanceAmountDialog(true);
          }, 0);
        }}
        onPrintVoucher={(advance) => {
          // ✅ CRITICAL: Close view dialog immediately (critical for smooth transition)
          setShowAdvanceViewDialog(false);
          
          // ✅ DEFER: Set advance data and open voucher dialog (non-critical, defer to next tick)
          setTimeout(() => {
            setAdvanceForVoucher(advance);
            setShowAdvanceVoucherDialog(true);
          }, 0);
        }}
      />
      
      {/* Advance Status Dialog */}
      <AdvanceStatusDialog
        open={showAdvanceStatusDialog}
        onOpenChange={setShowAdvanceStatusDialog}
        status={advanceStatus}
        onStatusChange={setAdvanceStatus}
        reason={advanceStatusReason}
        onReasonChange={setAdvanceStatusReason}
        onConfirm={async () => {
          if (advanceToUpdate && advanceStatus) {
            const reason = (advanceStatus === "REJECTED" || advanceStatus === "CANCELLED") ? advanceStatusReason : undefined;
            await handleUpdateAdvanceStatus(advanceToUpdate.advance_id, advanceStatus, reason);
          }
        }}
      />
      
      {/* Advance Amount Dialog */}
      <AdvanceAmountDialog
        open={showAdvanceAmountDialog}
        onOpenChange={setShowAdvanceAmountDialog}
        advance={advanceToUpdate}
        onUpdate={async (amount) => {
          if (advanceToUpdate) {
            await handleUpdateAdvanceAmountPaid(advanceToUpdate.advance_id, amount);
          }
        }}
      />
      
      {/* Advance Voucher Print Dialog */}
      <AdvanceVoucherPrintDialog
        open={showAdvanceVoucherDialog}
        onOpenChange={setShowAdvanceVoucherDialog}
        advance={advanceForVoucher}
        employeeName={
          advanceForVoucher
            ? employees.find((e: any) => e.employee_id === advanceForVoucher.employee_id)?.employee_name || 'Unknown Employee'
            : ''
        }
        onPrint={() => {
          if (advanceForVoucher) {
            const { user, currentBranch } = useAuthStore.getState();
            const selectedEmployee = employees.find((e: any) => e.employee_id === advanceForVoucher.employee_id);
            
            if (selectedEmployee && currentBranch && user) {
              generateAdvanceVoucherPDF({
                advance: advanceForVoucher,
                employeeName: selectedEmployee.employee_name || 'Unknown Employee',
                employeeSalary: selectedEmployee.salary || 0,
                branchName: currentBranch.branch_name || 'Branch',
                appliedByUserName: user.full_name || 'System User'
              });
            }
          }
        }}
      />
      
      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={showEmployeeForm}
        onOpenChange={(open) => {
          setShowEmployeeForm(open);
          if (!open) {
            setSelectedEmployee(null);
          }
        }}
        isEditing={isEditingEmployee}
        formData={selectedEmployee || {
          employee_name: '',
          employee_type: '',
          designation: '',
          date_of_joining: new Date().toISOString().split('T')[0],
          salary: 0,
          gender: '',
          date_of_birth: '',
          aadhar_no: '',
          mobile_no: '',
          email: '',
          address: '',
          qualification: '',
          experience_years: 0,
          bank_account_number: '',
          bank_name: '',
          bank_ifsc_code: '',
        }}
        onChange={(field, value) => {
          setSelectedEmployee((prev: any) => ({
            ...(prev || {}),
            [field]: value,
          }));
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          const { currentBranch } = useAuthStore.getState();
          if (isEditingEmployee && selectedEmployee?.employee_id) {
            // For update, exclude status and employee_id from payload (status is managed separately)
            const { status, employee_id, ...updateData } = selectedEmployee;
            await handleUpdateEmployee(selectedEmployee.employee_id, updateData);
          } else {
            // For create, add branch_id and exclude status
            // employee_code is auto-generated by the backend
            const { status, employee_id, employee_code, ...createData } = selectedEmployee;
            await handleCreateEmployee({
              ...createData,
              branch_id: currentBranch?.branch_id || 1, // Fallback to 1 if no branch selected
            });
          }
        }}
        isCreatePending={createEmployeePending}
        isUpdatePending={updateEmployeePending}
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
            case "TERMINATED":
              return "bg-red-100 text-red-800 border-red-200";
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

      {/* Attendance Bulk Create Dialog */}
      <AttendanceBulkCreateDialog
        open={showAttendanceBulkCreateDialog}
        onOpenChange={setShowAttendanceBulkCreateDialog}
        onSubmit={async (data) => {
          await handleBulkCreateAttendance(data);
        }}
        isPending={isBulkCreatingAttendance}
      />

      {/* Attendance Form Dialog */}
      <AttendanceFormDialog
        open={showAttendanceForm}
        onOpenChange={setShowAttendanceForm}
        isEditing={isEditingAttendance}
        employees={employees}
        formData={attendanceFormData}
        onChange={(field, value) => {
          setAttendanceFormData((prev: any) => ({
            ...prev,
            [field]: value
          }));
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (isEditingAttendance) {
            // For editing, use individual update with employee_id, month, year
            if (attendanceFormData.employee_id && attendanceFormData.attendance_month) {
              const dateStr = attendanceFormData.attendance_month as string;
              const date = new Date(dateStr);
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              
              await handleUpdateAttendance(
                attendanceFormData.employee_id,
                month,
                year
              );
            }
          } else {
            // Convert AttendanceFormData to IndividualAttendanceCreateRequest
            // attendance_month is in format "YYYY-MM-DD"
            if (attendanceFormData.employee_id && attendanceFormData.attendance_month && attendanceFormData.total_working_days) {
              const dateStr = attendanceFormData.attendance_month as string;
              const date = new Date(dateStr);
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              
              const createData = {
                employee_id: attendanceFormData.employee_id,
                total_working_days: attendanceFormData.total_working_days,
                month,
                year,
              };
              await handleCreateAttendance(createData);
            }
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
    </>
  );
};
