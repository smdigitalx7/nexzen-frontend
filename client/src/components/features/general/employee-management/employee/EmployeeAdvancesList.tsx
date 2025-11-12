import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, CheckCircle, XCircle } from "lucide-react";

interface EmployeeAdvancesListProps {
  advances: any[];
  employees: any[];
  onApprove: (advance: any) => void;
  onEdit: (advance: any) => void;
  onUpdateAmount?: (advance: any) => void;
  onReject?: (advance: any) => void;
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

const EmployeeAdvancesList = ({ advances, employees, onApprove, onEdit, onUpdateAmount, onReject, page, pageSize, total, setPage }: EmployeeAdvancesListProps) => {
  return (
    <div className="space-y-4">
      {advances.map((advance) => {
        const employee = employees.find((e: any) => e.employee_id === advance.employee_id);
        return (
          <div key={advance.advance_id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{employee?.employee_name || `Employee ${advance.employee_id}`}</h3>
                <p className="text-sm text-muted-foreground">Advance ID: {advance.advance_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor(advance.status)}>{advance.status}</Badge>
                <div className="flex items-center gap-1">
                  {advance.status === "PENDING" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onApprove(advance)} className="text-green-600 hover:text-green-700" title="Approve">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      {onReject && (
                        <Button variant="ghost" size="sm" onClick={() => onReject(advance)} className="text-red-600 hover:text-red-700" title="Reject">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {advance.status === "APPROVED" && onUpdateAmount && (
                    <Button variant="ghost" size="sm" onClick={() => onUpdateAmount(advance)} className="text-blue-600 hover:text-blue-700" title="Update Amount Paid">
                      <span className="text-sm font-bold">₹</span>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onEdit(advance)} title="Edit">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-2 font-medium">₹{advance.advance_amount?.toLocaleString() || '0'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 font-medium">{new Date(advance.advance_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Paid:</span>
                <span className="ml-2 font-medium">₹{advance.total_repayment_amount?.toLocaleString() || '0'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Balance:</span>
                <span className="ml-2 font-medium">₹{advance.remaining_balance?.toLocaleString() || advance.advance_amount?.toLocaleString() || '0'}</span>
              </div>
            </div>
            
            {advance.request_reason && (
              <div className="text-sm">
                <span className="text-muted-foreground">Reason:</span>
                <span className="ml-2">{advance.request_reason}</span>
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

export default React.memo(EmployeeAdvancesList);


