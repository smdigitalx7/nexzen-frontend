import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        {employee && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold">
                  {employee.employee_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {employee.employee_code || "EMP"} • {employee.designation || "-"}
                </div>
              </div>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Employee Code:</strong> {employee.employee_code}
              </div>
              <div>
                <strong>Type:</strong> {employee.employee_type}
              </div>
              <div>
                <strong>Experience:</strong> {employee.experience_years ?? "-"} years
              </div>
              <div>
                <strong>Qualification:</strong> {employee.qualification || "-"}
              </div>
              <div>
                <strong>Mobile:</strong> {employee.mobile_no || "-"}
              </div>
              <div>
                <strong>Email:</strong> {employee.email || "-"}
              </div>
              <div>
                <strong>Joined:</strong> {new Date(employee.date_of_joining).toLocaleDateString()}
              </div>
              <div>
                <strong>Salary:</strong> {formatCurrency(employee.salary)}
              </div>
              <div className="col-span-2">
                <strong>Address:</strong> {employee.address || "-"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Update Status</div>
              <div className="flex items-center gap-3">
                <Select value={newStatus} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="ON_LEAVE">ON_LEAVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={onUpdateStatus} disabled={isUpdating || newStatus === employee.status}>
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(EmployeeDetailDialog);
