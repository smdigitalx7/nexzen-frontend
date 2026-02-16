import React from "react";
import { FormDialog } from "@/common/components/shared";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Textarea } from "@/common/components/ui/textarea";
import { SmartSelect } from "@/common/components/ui/smart-select";
import { User, Mail, Briefcase, Landmark } from "lucide-react";

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
  status?: string;
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

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Field = ({
  id,
  label,
  required,
  children,
  fullWidth,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div className={fullWidth ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
    <Label htmlFor={id} className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {children}
  </div>
);

const EmployeeFormDialog = ({
  open,
  onOpenChange,
  isEditing,
  formData,
  onChange,
  onSubmit,
  isCreatePending,
  isUpdatePending,
}: EmployeeFormDialogProps) => {
  const isLoading = isCreatePending || isUpdatePending;

  const handleSave = () => {
    const form = document.getElementById("employee-form") as HTMLFormElement;
    if (form) form.requestSubmit();
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit employee" : "Add employee"}
      description={
        isEditing
          ? "Update employee information."
          : "Enter details to add a new employee."
      }
      size="LARGE"
      isLoading={isLoading}
      onSave={handleSave}
      saveText={isEditing ? "Save changes" : "Create employee"}
      cancelText="Cancel"
    >
      <form
        id="employee-form"
        onSubmit={onSubmit}
        className="space-y-6 py-1"
      >
        <Section title="Basic information" icon={User}>
          <Field id="employee_name" label="Full name" required>
            <Input
              id="employee_name"
              value={formData.employee_name || ""}
              onChange={(e) => onChange("employee_name", e.target.value)}
              placeholder="e.g. John Doe"
              className="h-9 bg-white border-slate-200"
              required
            />
          </Field>
          <Field id="employee_type" label="Employee type" required>
            <SmartSelect
              items={[
                { value: "TEACHING", label: "Teaching" },
                { value: "NON_TEACHING", label: "Non-teaching" },
                { value: "OFFICE", label: "Office" },
                { value: "DRIVER", label: "Driver" },
              ]}
              value={formData.employee_type || ""}
              onSelect={(value: string) => onChange("employee_type", value)}
              placeholder="Select type"
            />
          </Field>
          <Field id="designation" label="Designation" required>
            <Input
              id="designation"
              value={formData.designation || ""}
              onChange={(e) => onChange("designation", e.target.value)}
              placeholder="e.g. Senior Faculty"
              className="h-9 bg-white border-slate-200"
              required
            />
          </Field>
          <Field id="gender" label="Gender">
            <SmartSelect
              items={[
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "OTHER", label: "Other" },
              ]}
              value={formData.gender || ""}
              onSelect={(value: string) => onChange("gender", value)}
              placeholder="Select"
              radioLayout="horizontal"
            />
          </Field>
          <Field id="date_of_birth" label="Date of birth">
            <DatePicker
              id="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={(value) => onChange("date_of_birth", value)}
              placeholder="Select date"
            />
          </Field>
          <Field id="qualification" label="Qualification">
            <Input
              id="qualification"
              value={formData.qualification || ""}
              onChange={(e) => onChange("qualification", e.target.value)}
              placeholder="e.g. PhD, M.Tech"
              className="h-9 bg-white border-slate-200"
            />
          </Field>
        </Section>

        <Section title="Contact" icon={Mail}>
          <Field id="email" label="Email">
            <Input
              id="email"
              value={formData.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="email@example.com"
              className="h-9 bg-white border-slate-200"
              type="email"
            />
          </Field>
          <Field id="mobile_no" label="Mobile">
            <Input
              id="mobile_no"
              value={formData.mobile_no || ""}
              onChange={(e) => onChange("mobile_no", e.target.value)}
              placeholder="10-digit number"
              className="h-9 bg-white border-slate-200"
              type="tel"
            />
          </Field>
          <Field id="aadhar_no" label="Aadhar number">
            <Input
              id="aadhar_no"
              value={formData.aadhar_no || ""}
              onChange={(e) => onChange("aadhar_no", e.target.value)}
              placeholder="12-digit Aadhar"
              className="h-9 bg-white border-slate-200"
            />
          </Field>
          <Field id="address" label="Address" fullWidth>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Full address"
              className="bg-white border-slate-200 resize-none min-h-[80px]"
              rows={3}
            />
          </Field>
        </Section>

        <Section title="Employment" icon={Briefcase}>
          <Field id="date_of_joining" label="Joining date" required>
            <DatePicker
              id="date_of_joining"
              value={formData.date_of_joining || ""}
              onChange={(value) => onChange("date_of_joining", value)}
              placeholder="Select date"
              required
            />
          </Field>
          <Field id="experience_years" label="Experience (years)">
            <Input
              id="experience_years"
              value={formData.experience_years ?? ""}
              onChange={(e) =>
                onChange("experience_years", Number.parseInt(e.target.value, 10) || 0)
              }
              className="h-9 bg-white border-slate-200"
              type="number"
              min={0}
              placeholder="0"
            />
          </Field>
          {isEditing && (
            <Field id="status" label="Status" required>
              <SmartSelect
                items={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "TERMINATED", label: "Terminated" },
                ]}
                value={formData.status || "ACTIVE"}
                onSelect={(value: string) => onChange("status", value)}
                placeholder="Select status"
                radioLayout="horizontal"
              />
            </Field>
          )}
        </Section>

        <Section title="Bank & salary" icon={Landmark}>
          <Field id="salary" label="Monthly salary (₹)" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                ₹
              </span>
              <Input
                id="salary"
                value={formData.salary || ""}
                onChange={(e) =>
                  onChange("salary", Number.parseFloat(e.target.value) || 0)
                }
                className="h-9 pl-7 bg-white border-slate-200"
                type="number"
                min={0}
                required
              />
            </div>
          </Field>
          <Field id="bank_name" label="Bank name">
            <Input
              id="bank_name"
              value={formData.bank_name || ""}
              onChange={(e) => onChange("bank_name", e.target.value)}
              placeholder="e.g. HDFC Bank"
              className="h-9 bg-white border-slate-200"
            />
          </Field>
          <Field id="bank_account_number" label="Account number">
            <Input
              id="bank_account_number"
              value={formData.bank_account_number || ""}
              onChange={(e) => onChange("bank_account_number", e.target.value)}
              placeholder="Account number"
              className="h-9 bg-white border-slate-200 font-mono text-sm"
            />
          </Field>
          <Field id="bank_ifsc_code" label="IFSC code">
            <Input
              id="bank_ifsc_code"
              value={formData.bank_ifsc_code || ""}
              onChange={(e) => onChange("bank_ifsc_code", e.target.value)}
              placeholder="e.g. HDFC0001234"
              className="h-9 bg-white border-slate-200 font-mono text-sm uppercase"
            />
          </Field>
        </Section>
      </form>
    </FormDialog>
  );
};

export default React.memo(EmployeeFormDialog);
