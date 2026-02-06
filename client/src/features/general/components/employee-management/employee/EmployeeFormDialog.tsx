import React from "react";
import { FormDialog } from "@/common/components/shared";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Textarea } from "@/common/components/ui/textarea";
import { SmartSelect } from "@/common/components/ui/smart-select";

interface EmployeeFormData {
  employee_name: string;
  employee_type: string;
  employee_code: string;
  gender?: string;
  date_of_birth?: string;
  aadhar_no?: string;
  mobile_no?: string;
  email?: string;
  address?: string;
  date_of_joining: string;
  designation: string;
  qualification?: string;
  experience_years?: number;
  status?: string; // Only for edit/view, not for create
  salary: number;
  bank_account_number?: string;
  bank_name?: string;
  bank_ifsc_code?: string;
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
                value={formData.employee_name || ''}
                onChange={(e) => onChange("employee_name", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_type">Employee Type *</Label>
              <SmartSelect
                items={[
                  { value: "TEACHING", label: "Teaching" },
                  { value: "NON_TEACHING", label: "Non-Teaching" },
                  { value: "OFFICE", label: "Administrative" },
                  { value: "DRIVER", label: "Driver" },
                ]}
                value={formData.employee_type || ''}
                onSelect={(value: string) => onChange("employee_type", value)}
                placeholder="Select type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <SmartSelect
                items={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" },
                ]}
                value={formData.gender || ''}
                onSelect={(value: string) => onChange("gender", value)}
                placeholder="Select gender"
                radioLayout="horizontal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation || ''}
                onChange={(e) => onChange("designation", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <DatePicker
                id="date_of_birth"
                value={formData.date_of_birth || ''}
                onChange={(value) => onChange("date_of_birth", value)}
                placeholder="Select date of birth"
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
              <DatePicker
                id="date_of_joining"
                value={formData.date_of_joining || ''}
                onChange={(value) => onChange("date_of_joining", value)}
                placeholder="Select date of joining"
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
                value={formData.salary || 0}
                onChange={(e) => onChange("salary", parseFloat(e.target.value) || 0)}
                type="number"
                min="0"
                required
              />
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <SmartSelect
                  items={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "TERMINATED", label: "Terminated" },
                  ]}
                  value={formData.status || 'ACTIVE'}
                  onSelect={(value: string) => onChange("status", value)}
                  placeholder="Select status"
                  radioLayout="horizontal"
                />
              </div>
            )}
          </div>

          {/* Bank Details Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Bank Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Bank Account Number</Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number || ''}
                  onChange={(e) => onChange("bank_account_number", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name || ''}
                  onChange={(e) => onChange("bank_name", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_ifsc_code">Bank IFSC Code</Label>
                <Input
                  id="bank_ifsc_code"
                  value={formData.bank_ifsc_code || ''}
                  onChange={(e) => onChange("bank_ifsc_code", e.target.value)}
                  placeholder="e.g., ABCD0123456"
                />
              </div>
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
