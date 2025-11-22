import React from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

interface EmployeeLeavesListProps {
  leaves: any[];
  employees: any[];
  onApprove: (leave: any) => void;
  onReject: (leave: any) => void;
  onEdit: (leave: any) => void;
  onDelete: (leave: any) => void;
  page: number;
  pageSize: number;
  total: number;
  setPage: (updater: (p: number) => number) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-yellow-100 text-yellow-800";
    case "APPROVED": return "bg-green-100 text-green-800";
    case "REJECTED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const EmployeeLeavesList = ({ leaves, employees, onApprove, onReject, onEdit, onDelete, page, pageSize, total, setPage }: EmployeeLeavesListProps) => {
  return (
    <div className="space-y-4">
      {leaves.map((leave) => {
        const employee = employees.find((e: any) => e.employee_id === leave.employee_id);
        return (
          <div key={leave.leave_id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{employee?.employee_name || `Employee ${leave.employee_id}`}</h3>
                <p className="text-sm text-muted-foreground">
                  {leave.leave_type} • {leave.total_days} day{leave.total_days !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor(leave.leave_status)}>
                  {leave.leave_status}
                </Badge>
                <div className="flex items-center gap-1">
                  {leave.leave_status === "PENDING" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onApprove(leave)} className="text-green-600 hover:text-green-700" title="Approve Leave">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onReject(leave)} className="text-red-600 hover:text-red-700" title="Reject Leave">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onEdit(leave)} title="Edit Leave">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(leave)} className="text-red-600 hover:text-red-700" title="Delete Leave">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">From:</span>
                <span className="ml-2 font-medium">{new Date(leave.from_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">To:</span>
                <span className="ml-2 font-medium">{new Date(leave.to_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Applied:</span>
                <span className="ml-2 font-medium">{new Date(leave.applied_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium capitalize">{leave.leave_type}</span>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Reason:</span>
              <span className="ml-2">{leave.reason}</span>
            </div>

            {leave.approved_date && (
              <div className="text-sm text-green-600">
                Approved on: {new Date(leave.approved_date).toLocaleDateString()}
              </div>
            )}

            {leave.rejection_reason && (
              <div className="text-sm text-red-600">
                Rejection reason: {leave.rejection_reason}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EmployeeLeavesList);
