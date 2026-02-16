import React from "react";
import { useCanViewUIComponent } from "@/core/permissions";
import { Switch } from "@/common/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import {
  Mail,
  Phone,
  Briefcase,
  Landmark,
  Calendar,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { cn } from "@/common/utils";
import { FormSheet } from "@/common/components/shared";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";

interface EmployeeDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any | null;
  newStatus: string;
  onStatusChange: (value: string) => void;
  onUpdateStatus: () => void;
  isUpdating: boolean;
  getStatusColor: (status: string) => string;
  statusOptions?: Array<{ value: string; label: string; color?: string }>;
  formatCurrency: (n: number) => string;
}

const DetailRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
    {Icon && (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value ?? "—"}</p>
    </div>
  </div>
);

const EmployeeDetailSheet = ({
  open,
  onOpenChange,
  employee,
  newStatus,
  onStatusChange,
  onUpdateStatus,
  isUpdating,
  getStatusColor,
  statusOptions = [
    { value: "ACTIVE", label: "Active", color: "bg-green-50 text-green-700 border-green-100" },
    { value: "TERMINATED", label: "Terminated", color: "bg-red-50 text-red-700 border-red-100" },
  ],
  formatCurrency,
}: EmployeeDetailSheetProps) => {
  const canUpdateStatus = useCanViewUIComponent(
    "employees",
    "button",
    "employee-update-status"
  );

  const handleSave = () => onUpdateStatus();

  const currentStatus = employee?.status;
  const [showStatusAlert, setShowStatusAlert] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);

  const handleStatusToggle = (checked: boolean) => {
    setPendingStatus(checked ? "ACTIVE" : "TERMINATED");
    setShowStatusAlert(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatus) onStatusChange(pendingStatus);
    setShowStatusAlert(false);
  };

  const effectiveStatus = newStatus || currentStatus;
  const isActive = effectiveStatus === "ACTIVE";

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Employee details"
      description="View and manage employee information."
      size="large"
      showFooter={true}
      onSave={handleSave}
      saveText={isUpdating ? "Saving…" : "Save changes"}
      isLoading={isUpdating}
      disabled={!canUpdateStatus || newStatus === currentStatus}
    >
      {employee ? (
        <div className="space-y-6 pb-2">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="h-16 w-16 shrink-0 rounded-xl border-2 border-slate-100 shadow-sm">
                <AvatarFallback className="rounded-xl bg-slate-800 text-lg font-semibold text-white">
                  {employee.employee_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-slate-900 truncate">
                  {employee.employee_name}
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  {employee.designation || "No designation"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 sm:ml-4">
              {employee.employee_code && (
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {employee.employee_code}
                </span>
              )}
              {canUpdateStatus && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={handleStatusToggle}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <span
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      isActive ? "text-emerald-600" : "text-slate-500"
                    )}
                  >
                    {isActive ? "Active" : "Terminated"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Contact */}
            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                Contact
              </h3>
              <div className="mt-3 space-y-0">
                <DetailRow
                  label="Email"
                  value={employee.email}
                  icon={Mail}
                />
                <DetailRow
                  label="Phone"
                  value={employee.mobile_no}
                  icon={Phone}
                />
                <DetailRow
                  label="Address"
                  value={employee.address}
                  icon={MapPin}
                />
              </div>
            </section>

            {/* Personal */}
            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-500" />
                Personal
              </h3>
              <div className="mt-3 space-y-0">
                <DetailRow
                  label="Date of birth"
                  value={
                    employee.date_of_birth
                      ? new Date(employee.date_of_birth).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : null
                  }
                  icon={Calendar}
                />
                <DetailRow
                  label="Gender"
                  value={employee.gender?.toLowerCase()}
                />
                <DetailRow
                  label="Aadhar"
                  value={employee.aadhar_no}
                />
              </div>
            </section>

            {/* Compensation & bank */}
            <section className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-slate-500" />
                Compensation & bank
              </h3>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Monthly salary</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-0.5">
                    {formatCurrency(employee.salary)}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 sm:max-w-md sm:ml-8">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Bank</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">
                      {employee.bank_name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Account no.</p>
                    <p className="text-sm font-mono font-medium text-slate-900 mt-0.5">
                      {employee.bank_account_number || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">IFSC</p>
                    <p className="text-sm font-mono font-medium text-slate-900 mt-0.5">
                      {employee.bank_ifsc_code || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tenure & education */}
            <section className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                Tenure & education
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Joining date</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">
                    {employee.date_of_joining
                      ? new Date(employee.date_of_joining).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Experience</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">
                    {employee.experience_years
                      ? `${employee.experience_years} years`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Qualification</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">
                    {employee.qualification || "—"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center animate-pulse mb-3">
            <Briefcase className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">Loading profile…</p>
          <p className="text-xs text-slate-500 mt-1">Fetching employee details.</p>
        </div>
      )}

      <AlertDialog open={showStatusAlert} onOpenChange={setShowStatusAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === "ACTIVE"
                ? "Activate this employee?"
                : "Terminate this employee?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "ACTIVE"
                ? "They will be able to log in and use the system again."
                : "Access will be revoked. You can reactivate them later if needed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={cn(
                pendingStatus === "ACTIVE"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {pendingStatus === "ACTIVE" ? "Activate" : "Terminate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormSheet>
  );
};

export default React.memo(EmployeeDetailSheet);
