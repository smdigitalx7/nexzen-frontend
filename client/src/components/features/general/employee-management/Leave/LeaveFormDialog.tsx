import React from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { EmployeeSelect } from "@/components/ui/employee-select";

interface LeaveFormData {
  employee_id: number | null;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  total_days: number;
  applied_date: string;
}

interface LeaveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  employees: any[];
  formData: LeaveFormData;
  onChange: (field: keyof LeaveFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreatePending: boolean;
  isUpdatePending: boolean;
  calculateLeaveDays: (fromDate: string, toDate: string) => number;
}

const LeaveFormDialog = ({ open, onOpenChange, isEditing, employees, formData, onChange, onSubmit, isCreatePending, isUpdatePending, calculateLeaveDays }: LeaveFormDialogProps) => {
  const isLoading = isCreatePending || isUpdatePending;
  
  const handleSave = () => {
    const form = document.getElementById('leave-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };
  
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Leave Request" : "Add Leave Request"}
      description={isEditing ? "Update leave request details" : "Create a new leave request"}
      size="LARGE"
      isLoading={isLoading}
      onSave={handleSave}
      saveText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
    >
      <form id="leave-form" onSubmit={onSubmit} className="space-y-4">
          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leave_employee_id">Employee *</Label>
                <EmployeeSelect
                  value={formData.employee_id && formData.employee_id > 0 ? formData.employee_id.toString() : ""}
                  onValueChange={(value) => onChange("employee_id", value ? parseInt(value) : 0)}
                  placeholder="Search and select employee..."
                />
              </div>
              <div>
                <Label htmlFor="leave_type">Leave Type *</Label>
                <Select
                  value={formData.leave_type}
                  onValueChange={(value) => onChange("leave_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid Leave</SelectItem>
                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {!isEditing && formData.leave_type === "PAID" && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-900/50 dark:text-blue-100">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription>
                Paid leave is for a single day only. Please ensure your from date and to date are the same.
              </AlertDescription>
            </Alert>
          )}
          
          {isEditing && (
            <div>
              <Label htmlFor="leave_type">Leave Type *</Label>
              <Select
                value={formData.leave_type}
                onValueChange={(value) => onChange("leave_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Paid Leave</SelectItem>
                  <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from_date">From Date *</Label>
              <DatePicker
                id="from_date"
                value={formData.from_date}
                onChange={(value) => {
                  onChange("from_date", value);
                  if (formData.to_date) {
                    const days = calculateLeaveDays(value, formData.to_date);
                    onChange("total_days", days);
                  }
                }}
                placeholder="Select from date"
                required
              />
            </div>
            <div>
              <Label htmlFor="to_date">To Date *</Label>
              <DatePicker
                id="to_date"
                value={formData.to_date}
                onChange={(value) => {
                  onChange("to_date", value);
                  if (formData.from_date) {
                    const days = calculateLeaveDays(formData.from_date, value);
                    onChange("total_days", days);
                  }
                }}
                placeholder="Select to date"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="applied_date">Applied Date *</Label>
            <DatePicker
              id="applied_date"
              value={formData.applied_date}
              onChange={(value) => onChange("applied_date", value)}
              placeholder="Select applied date"
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              placeholder="Please provide a reason for the leave request..."
              rows={3}
              required
            />
          </div>
        </form>
    </FormDialog>
  );
};

export default React.memo(LeaveFormDialog);


