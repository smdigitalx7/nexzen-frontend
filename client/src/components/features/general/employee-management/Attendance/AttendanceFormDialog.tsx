import React, { useEffect } from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface AttendanceFormData {
  employee_id: number | null;
  attendance_month: string | null;
  total_working_days: number;
  days_present: number;
  days_absent: number;
  paid_leaves: number;
  unpaid_leaves: number;
  late_arrivals: number;
  early_departures: number;
}

interface AttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  employees: any[];
  formData: AttendanceFormData;
  onChange: (field: keyof AttendanceFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreatePending: boolean;
  isUpdatePending: boolean;
}

const AttendanceFormDialog = ({ open, onOpenChange, isEditing, employees, formData, onChange, onSubmit, isCreatePending, isUpdatePending }: AttendanceFormDialogProps) => {
  // Auto-calculate days_absent when other values change
  useEffect(() => {
    const totalDays = formData.total_working_days || 0;
    const presentDays = formData.days_present || 0;
    const paidLeaves = formData.paid_leaves || 0;
    const unpaidLeaves = formData.unpaid_leaves || 0;
    
    const calculatedAbsent = totalDays - presentDays - paidLeaves - unpaidLeaves;
    
    if (calculatedAbsent !== formData.days_absent && calculatedAbsent >= 0) {
      onChange("days_absent", calculatedAbsent);
    }
  }, [formData.total_working_days, formData.days_present, formData.paid_leaves, formData.unpaid_leaves, formData.days_absent, onChange]);

  // Validation
  const isFormValid = () => {
    const totalDays = formData.total_working_days || 0;
    const presentDays = formData.days_present || 0;
    const paidLeaves = formData.paid_leaves || 0;
    const unpaidLeaves = formData.unpaid_leaves || 0;
    const calculatedTotal = presentDays + paidLeaves + unpaidLeaves + (formData.days_absent || 0);
    
    return (
      formData.employee_id && formData.employee_id > 0 &&
      formData.attendance_month && typeof formData.attendance_month === 'string' && formData.attendance_month.trim() !== "" &&
      totalDays > 0 &&
      calculatedTotal === totalDays &&
      presentDays >= 0 &&
      paidLeaves >= 0 &&
      unpaidLeaves >= 0 &&
      (formData.days_absent || 0) >= 0
    );
  };

  const getValidationMessage = () => {
    const totalDays = formData.total_working_days || 0;
    const presentDays = formData.days_present || 0;
    const paidLeaves = formData.paid_leaves || 0;
    const unpaidLeaves = formData.unpaid_leaves || 0;
    const calculatedTotal = presentDays + paidLeaves + unpaidLeaves + (formData.days_absent || 0);
    
    if (calculatedTotal !== totalDays) {
      return `Total days (${calculatedTotal}) must equal working days (${totalDays})`;
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  const isLoading = isCreatePending || isUpdatePending;
  
  const handleSave = () => {
    const form = document.getElementById('attendance-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Attendance Record" : "Add Attendance Record"}
      description={isEditing ? "Update attendance information" : "Create a new attendance record"}
      size="LARGE"
      isLoading={isLoading}
      onSave={handleSave}
      saveText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
    >
      <form id="attendance-form" onSubmit={onSubmit} className="space-y-4">
          {validationMessage && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">Employee *</Label>
              <Select
                value={formData.employee_id ? formData.employee_id.toString() : ""}
                onValueChange={(value) => onChange("employee_id", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                      {employee.employee_name} ({employee.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="attendance_month">Month *</Label>
              <Input
                id="attendance_month"
                type="month"
                value={formData.attendance_month && typeof formData.attendance_month === 'string' ? formData.attendance_month.slice(0, 7) : ""}
                onChange={(e) => onChange("attendance_month", e.target.value + "-01")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_working_days">Total Working Days *</Label>
              <Input
                id="total_working_days"
                type="number"
                value={formData.total_working_days}
                onChange={(e) => onChange("total_working_days", parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="days_present">Days Present *</Label>
              <Input
                id="days_present"
                type="number"
                value={formData.days_present}
                onChange={(e) => onChange("days_present", parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paid_leaves">Paid Leaves</Label>
              <Input
                id="paid_leaves"
                type="number"
                value={formData.paid_leaves}
                onChange={(e) => onChange("paid_leaves", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="unpaid_leaves">Unpaid Leaves</Label>
              <Input
                id="unpaid_leaves"
                type="number"
                value={formData.unpaid_leaves}
                onChange={(e) => onChange("unpaid_leaves", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="days_absent">Days Absent (Auto-calculated)</Label>
              <Input
                id="days_absent"
                type="number"
                value={formData.days_absent}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="late_arrivals">Late Arrivals</Label>
              <Input
                id="late_arrivals"
                type="number"
                value={formData.late_arrivals}
                onChange={(e) => onChange("late_arrivals", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="early_departures">Early Departures</Label>
              <Input
                id="early_departures"
                type="number"
                value={formData.early_departures}
                onChange={(e) => onChange("early_departures", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div></div>
          </div>

        </form>
    </FormDialog>
  );
};

export default React.memo(AttendanceFormDialog);
