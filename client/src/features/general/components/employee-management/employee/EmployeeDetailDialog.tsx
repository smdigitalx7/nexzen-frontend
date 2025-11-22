import React from "react";
import { FormDialog } from "@/common/components/shared";
import { Badge } from "@/common/components/ui/badge";
import { useCanViewUIComponent } from "@/core/permissions";
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react";

interface EmployeeDetailDialogProps {
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

const EmployeeDetailDialog = ({ open, onOpenChange, employee, newStatus, onStatusChange, onUpdateStatus, isUpdating, getStatusColor, statusOptions, formatCurrency }: EmployeeDetailDialogProps) => {
  const canUpdateStatus = useCanViewUIComponent("employees", "button", "employee-update-status");
  
  const handleSave = () => {
    onUpdateStatus();
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Employee Details"
      description="View employee information and update status"
      size="LARGE"
      isLoading={isUpdating}
      onSave={canUpdateStatus ? handleSave : undefined}
      saveText="Update Status"
      showCancelButton={false}
      disabled={newStatus === employee?.status}
      showStatusUpdate={canUpdateStatus}
      currentStatus={employee?.status}
      newStatus={newStatus}
      onStatusChange={onStatusChange}
      getStatusColor={getStatusColor}
      statusOptions={statusOptions}
      statusUpdateText="Update Status"
    >
      {employee && (
        <div className="space-y-3">
          {/* Employee Header */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {employee.employee_name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {employee.employee_code || "EMP"} • {employee.designation || "-"}
                </p>
              </div>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status}
              </Badge>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <h3 className="font-semibold text-base mb-2 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Employee Code</label>
                <p className="text-base font-semibold mt-0.5">{employee.employee_code || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Employee Type</label>
                <p className="text-base font-semibold mt-0.5">{employee.employee_type || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Experience</label>
                <p className="text-base font-semibold mt-0.5">{employee.experience_years ?? "0"} years</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Qualification</label>
                <p className="text-base font-semibold mt-0.5">{employee.qualification || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <h3 className="font-semibold text-base mb-2 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Mobile Number</label>
                <p className="text-base font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="h-3.5 w-3.5" />
                  {employee.mobile_no || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                <p className="text-base font-semibold flex items-center gap-1 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {employee.email || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Address</label>
                <p className="text-base font-semibold flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {employee.address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <h3 className="font-semibold text-base mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Employment Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Date of Joining</label>
                <p className="text-base font-semibold flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(employee.date_of_joining).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Salary</label>
                <p className="text-base font-semibold flex items-center gap-1 text-green-600 mt-0.5">
                  <span className="text-xs font-bold">₹</span>
                  {formatCurrency(employee.salary)}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </FormDialog>
  );
};

export default React.memo(EmployeeDetailDialog);
