import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AdvanceFormData {
  employee_id: number;
  advance_date: string;
  advance_amount: number;
  request_reason: string;
}

interface AdvanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  employees: any[];
  formData: AdvanceFormData;
  onChange: (field: keyof AdvanceFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreatePending: boolean;
  isUpdatePending: boolean;
}

const AdvanceFormDialog = ({ open, onOpenChange, isEditing, employees, formData, onChange, onSubmit, isCreatePending, isUpdatePending }: AdvanceFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Advance" : "Add Advance"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">Employee</Label>
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
                      {employee.employee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="advance_date">Advance Date</Label>
              <Input
                id="advance_date"
                type="date"
                value={formData.advance_date}
                onChange={(e) => onChange("advance_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="advance_amount">Amount (₹)</Label>
            <Input
              id="advance_amount"
              type="number"
              value={formData.advance_amount}
              onChange={(e) => onChange("advance_amount", parseFloat(e.target.value) || 0)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="request_reason">Reason for Advance</Label>
            <Textarea
              id="request_reason"
              value={formData.request_reason}
              onChange={(e) => onChange("request_reason", e.target.value)}
              placeholder="Enter reason for advance request..."
              required
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatePending || isUpdatePending}>
              {isCreatePending || isUpdatePending
                ? "Saving..."
                : isEditing
                ? "Update Advance"
                : "Add Advance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AdvanceFormDialog);


