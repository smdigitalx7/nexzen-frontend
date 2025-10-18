import React from "react";
import { FormDialog } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, DollarSign, Briefcase } from "lucide-react";

interface EmployeeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any | null;
  newStatus: string;
  onStatusChange: (value: string) => void;
  onUpdateStatus: () => void;
  isUpdating: boolean;
  getStatusColor: (status: string) => string;
  formatCurrency: (n: number) => string;
}

const EmployeeDetailDialog = ({ open, onOpenChange, employee, newStatus, onStatusChange, onUpdateStatus, isUpdating, getStatusColor, formatCurrency }: EmployeeDetailDialogProps) => {
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
      onSave={handleSave}
      saveText="Update Status"
      cancelText="Close"
      disabled={newStatus === employee?.status}
      showStatusUpdate={true}
      currentStatus={employee?.status}
      newStatus={newStatus}
      onStatusChange={onStatusChange}
      getStatusColor={getStatusColor}
      statusUpdateText="Update Status"
    >
      {employee && (
        <div className="space-y-6">
          {/* Employee Header */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {employee.employee_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {employee.employee_code || "EMP"} • {employee.designation || "-"}
                </p>
              </div>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status}
              </Badge>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Code</label>
                <p className="text-lg font-semibold">{employee.employee_code || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Type</label>
                <p className="text-lg font-semibold">{employee.employee_type || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Experience</label>
                <p className="text-lg font-semibold">{employee.experience_years ?? "0"} years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Qualification</label>
                <p className="text-lg font-semibold">{employee.qualification || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Mobile Number</label>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {employee.mobile_no || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {employee.email || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</label>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {employee.address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Employment Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date of Joining</label>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(employee.date_of_joining).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Salary</label>
                <p className="text-lg font-semibold flex items-center gap-1 text-green-600">
                  <DollarSign className="h-4 w-4" />
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
