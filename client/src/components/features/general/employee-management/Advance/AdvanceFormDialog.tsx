import React from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const isLoading = isCreatePending || isUpdatePending;
  
  const handleSave = () => {
    const form = document.getElementById('advance-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };
  
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Advance" : "Add Advance"}
      description={isEditing ? "Update advance request details" : "Create a new advance request"}
      size="LARGE"
      isLoading={isLoading}
      onSave={handleSave}
      saveText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
    >
      <form id="advance-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">Employee</Label>
              {isEditing ? (
                <Input
                  id="employee_id_display"
                  value={employees.find(e => e.employee_id === formData.employee_id)?.employee_name || 'Unknown Employee'}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              ) : (
                <Select
                  value={formData.employee_id > 0 ? formData.employee_id.toString() : ""}
                  onValueChange={(value) => onChange("employee_id", parseInt(value))}
                  required
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
              )}
            </div>
            <div>
              <Label htmlFor="advance_date">Advance Date</Label>
              {isEditing ? (
                <Input
                  id="advance_date_display"
                  type="date"
                  value={formData.advance_date}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              ) : (
                <Input
                  id="advance_date"
                  type="date"
                  value={formData.advance_date}
                  onChange={(e) => onChange("advance_date", e.target.value)}
                  required
                />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="advance_amount">Amount (₹)</Label>
            <Input
              id="advance_amount"
              type="number"
              value={formData.advance_amount || ''}
              onChange={(e) => onChange("advance_amount", parseFloat(e.target.value) || 0)}
              required
              min="1"
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
        </form>
    </FormDialog>
  );
};

export default React.memo(AdvanceFormDialog);


