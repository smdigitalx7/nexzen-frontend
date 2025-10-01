import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AttendanceFormData {
  employee_id: number;
  attendance_month: string;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Attendance Record" : "Add Attendance Record"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">Employee *</Label>
              <Select
                value={formData.employee_id.toString()}
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
                value={formData.attendance_month.slice(0, 7)}
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
              <Label htmlFor="late_arrivals">Late Arrivals</Label>
              <Input
                id="late_arrivals"
                type="number"
                value={formData.late_arrivals}
                onChange={(e) => onChange("late_arrivals", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
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
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatePending || isUpdatePending}>
              {isCreatePending || isUpdatePending
                ? "Saving..."
                : isEditing
                ? "Update Attendance"
                : "Add Attendance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AttendanceFormDialog);


