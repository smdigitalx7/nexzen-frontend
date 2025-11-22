import React from "react";
import { FormDialog } from "@/common/components/shared";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Info } from "lucide-react";

interface AttendanceFormData {
  employee_id: number | null;
  attendance_month: string | null;
  total_working_days: number;
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
  // Validation
  const isFormValid = () => {
    return (
      (!isEditing ? (formData.employee_id && formData.employee_id > 0) : true) &&
      formData.attendance_month && typeof formData.attendance_month === 'string' && formData.attendance_month.trim() !== "" &&
      (!isEditing ? formData.total_working_days > 0 : true)
    );
  };

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
          {!isEditing && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Paid and unpaid leaves will be automatically calculated from approved leave records. 
                Days present and absent will be calculated based on the total working days.
              </AlertDescription>
            </Alert>
          )}
          
          {isEditing && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                This will update the attendance record for the selected employee. 
                Paid and unpaid leaves will be automatically recalculated from approved leave records based on the existing total working days.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">Employee *</Label>
              <Select
                value={formData.employee_id ? formData.employee_id.toString() : ""}
                onValueChange={(value) => onChange("employee_id", parseInt(value))}
                disabled={isEditing}
                required={!isEditing}
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
                disabled={isEditing}
              />
            </div>
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="total_working_days">Total Working Days *</Label>
              <Input
                id="total_working_days"
                type="number"
                value={formData.total_working_days}
                onChange={(e) => onChange("total_working_days", parseInt(e.target.value) || 0)}
                min="1"
                required
                placeholder="Enter total working days in the month"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Total number of working days in the selected month
              </p>
            </div>
          )}
          
          {isEditing && formData.total_working_days > 0 && (
            <div>
              <Label htmlFor="total_working_days">Total Working Days (Read-only)</Label>
              <Input
                id="total_working_days"
                type="number"
                value={formData.total_working_days}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Total working days cannot be changed when updating individual attendance. Only paid and unpaid leaves will be recalculated.
              </p>
            </div>
          )}

        </form>
    </FormDialog>
  );
};

export default React.memo(AttendanceFormDialog);
