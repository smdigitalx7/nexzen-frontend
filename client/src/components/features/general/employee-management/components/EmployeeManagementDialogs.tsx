import { ConfirmDialog } from "@/components/shared";
import EmployeeFormDialog from "../employee/EmployeeFormDialog";
import EmployeeDetailDialog from "../employee/EmployeeDetailDialog";
import EmployeeDeleteDialog from "../employee/EmployeeDeleteDialog";
import AttendanceFormDialog from "../Attendance/AttendanceFormDialog";
import LeaveFormDialog from "../Leave/LeaveFormDialog";
import LeaveApproveDialog from "../Leave/LeaveApproveDialog";
import LeaveRejectDialog from "../Leave/LeaveRejectDialog";
import AdvanceFormDialog from "../Advance/AdvanceFormDialog";
import AdvanceStatusDialog from "../Advance/AdvanceStatusDialog";
import AdvanceAmountDialog from "../Advance/AdvanceAmountDialog";
import AdvanceDeleteDialog from "../Advance/AdvanceDeleteDialog";

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
  leaveFormData: any;
  setLeaveFormData: (data: any) => void;
  
  // Advance dialogs
  showAdvanceForm: boolean;
  setShowAdvanceForm: (show: boolean) => void;
  isEditingAdvance: boolean;
  advanceToDelete: any;
  setAdvanceToDelete: (advance: any) => void;
  showAdvanceDeleteDialog: boolean;
  setShowAdvanceDeleteDialog: (show: boolean) => void;
  showAdvanceStatusDialog: boolean;
  setShowAdvanceStatusDialog: (show: boolean) => void;
  showAdvanceAmountDialog: boolean;
  setShowAdvanceAmountDialog: (show: boolean) => void;
  advanceToUpdate: any;
  setAdvanceToUpdate: (advance: any) => void;
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
  handleCreateAdvance: (data: any) => Promise<void>;
  handleUpdateAdvance: (id: number, data: any) => Promise<void>;
  handleUpdateAdvanceStatus: (id: number, status: string) => Promise<void>;
  handleUpdateAdvanceAmountPaid: (id: number, amount: number) => Promise<void>;
  handleCreateAttendance: (data: any) => Promise<void>;
  handleUpdateAttendance: (id: number, data: any) => Promise<void>;
  handleDeleteAttendance: (id: number) => Promise<void>;
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
  leaveFormData,
  setLeaveFormData,
  
  // Advance dialogs
  showAdvanceForm,
  setShowAdvanceForm,
  isEditingAdvance,
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
  handleUpdateAttendance,
  handleDeleteAttendance,
}: EmployeeManagementDialogsProps) => {
  return (
    <>
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
        onChange={(field, value) => setAdvanceFormData((prev: any) => ({ ...prev, [field]: value }))}
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
          setAttendanceFormData((prev: any) => ({
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
    </>
  );
};
