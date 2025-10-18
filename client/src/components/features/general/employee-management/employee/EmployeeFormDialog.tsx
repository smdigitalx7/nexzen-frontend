import React from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmployeeFormData {
  employee_name: string;
  employee_type: string;
  employee_code: string;
  aadhar_no?: string;
  mobile_no?: string;
  email?: string;
  address?: string;
  date_of_joining: string;
  designation: string;
  qualification?: string;
  experience_years?: number;
  status: string;
  salary: number;
}

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: EmployeeFormData;
  onChange: (field: keyof EmployeeFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreatePending: boolean;
  isUpdatePending: boolean;
}

const EmployeeFormDialog = ({ open, onOpenChange, isEditing, formData, onChange, onSubmit, isCreatePending, isUpdatePending }: EmployeeFormDialogProps) => {
  const isLoading = isCreatePending || isUpdatePending;
  
  const handleSave = () => {
    const form = document.getElementById('employee-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };
  
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Employee" : "Add New Employee"}
      description={isEditing ? "Update employee information" : "Create a new employee record"}
      size="LARGE"
      isLoading={isLoading}
      onSave={handleSave}
      saveText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
    >
      <form id="employee-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_name">Employee Name *</Label>
              <Input
                id="employee_name"
                value={formData.employee_name}
                onChange={(e) => onChange("employee_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_code">Employee Code *</Label>
              <Input
                id="employee_code"
                value={formData.employee_code}
                onChange={(e) => onChange("employee_code", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_type">Employee Type *</Label>
              <Select
                value={formData.employee_type}
                onValueChange={(value) => onChange("employee_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="non_teaching">Non-Teaching</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => onChange("designation", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile_no">Mobile Number</Label>
              <Input
                id="mobile_no"
                value={formData.mobile_no || ""}
                onChange={(e) => onChange("mobile_no", e.target.value)}
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email || ""}
                onChange={(e) => onChange("email", e.target.value)}
                type="email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhar_no">Aadhar Number</Label>
              <Input
                id="aadhar_no"
                value={formData.aadhar_no || ""}
                onChange={(e) => onChange("aadhar_no", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_joining">Date of Joining *</Label>
              <Input
                id="date_of_joining"
                value={formData.date_of_joining}
                onChange={(e) => onChange("date_of_joining", e.target.value)}
                type="date"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification || ""}
                onChange={(e) => onChange("qualification", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Experience (Years)</Label>
              <Input
                id="experience_years"
                value={formData.experience_years || 0}
                onChange={(e) => onChange("experience_years", parseInt(e.target.value) || 0)}
                type="number"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary *</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => onChange("salary", parseFloat(e.target.value) || 0)}
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => onChange("address", e.target.value)}
              rows={3}
            />
          </div>

        </form>
    </FormDialog>
  );
};

export default React.memo(EmployeeFormDialog);


