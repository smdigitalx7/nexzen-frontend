import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Leave Request" : "Add Leave Request"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leave_employee_id">Employee *</Label>
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
                  <SelectItem value="SICK">Sick Leave</SelectItem>
                  <SelectItem value="CASUAL">Casual Leave</SelectItem>
                  <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                  <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                  <SelectItem value="PATERNITY">Paternity Leave</SelectItem>                  
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from_date">From Date *</Label>
              <Input
                id="from_date"
                type="date"
                value={formData.from_date}
                onChange={(e) => {
                  onChange("from_date", e.target.value);
                  if (formData.to_date) {
                    const days = calculateLeaveDays(e.target.value, formData.to_date);
                    onChange("total_days", days);
                  }
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="to_date">To Date *</Label>
              <Input
                id="to_date"
                type="date"
                value={formData.to_date}
                onChange={(e) => {
                  onChange("to_date", e.target.value);
                  if (formData.from_date) {
                    const days = calculateLeaveDays(formData.from_date, e.target.value);
                    onChange("total_days", days);
                  }
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_days">Total Days *</Label>
              <Input
                id="total_days"
                type="number"
                value={formData.total_days}
                onChange={(e) => onChange("total_days", parseFloat(e.target.value) || 0)}
                min="0.5"
                step="0.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="applied_date">Applied Date *</Label>
              <Input
                id="applied_date"
                type="date"
                value={formData.applied_date}
                onChange={(e) => onChange("applied_date", e.target.value)}
                required
              />
            </div>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatePending || isUpdatePending}>
              {isCreatePending || isUpdatePending
                ? "Saving..."
                : isEditing
                ? "Update Leave"
                : "Add Leave"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(LeaveFormDialog);


