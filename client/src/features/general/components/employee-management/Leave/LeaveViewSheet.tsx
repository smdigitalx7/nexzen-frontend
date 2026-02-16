import React from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { CalendarDays, User, Check, X, FileText } from "lucide-react";
import { cn } from "@/common/utils";
import { useCanViewUIComponent } from "@/core/permissions";
import { useUser } from "@/features/general/hooks/useUsers";
import { FormSheet } from "@/common/components/shared";

interface LeaveViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: any;
  employee: any;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export const LeaveViewSheet = ({
  open,
  onOpenChange,
  leave,
  employee,
  onApprove,
  onReject,
}: LeaveViewSheetProps) => {
  const approvedById =
    leave?.approved_by && leave.approved_by > 0 ? leave.approved_by : 0;
  const canApproveLeave = useCanViewUIComponent(
    "employee_leaves",
    "button",
    "leave-approve"
  );
  const canRejectLeave = useCanViewUIComponent(
    "employee_leaves",
    "button",
    "leave-reject"
  );
  const { data: approverUser } = useUser(approvedById);
  const approverName =
    approverUser?.full_name || (leave?.approved_by ? "Admin" : undefined);

  if (!leave) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType?.toUpperCase()) {
      case "PAID":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "UNPAID":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const status = leave.leave_status || leave.status;
  const isPending = status === "PENDING";

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Leave request"
      description="View and manage leave details."
      size="large"
      showFooter={false}
    >
      <div className="space-y-6 pb-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {leave.employee_name || employee?.employee_name || "Employee"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {employee?.employee_code && (
                  <span className="font-medium text-slate-600">
                    {employee.employee_code}
                  </span>
                )}
                {employee?.employee_code && leave.leave_id && " · "}
                {leave.leave_id && (
                  <span className="text-slate-500">#{leave.leave_id}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="secondary"
              className={cn(
                "border text-xs font-medium",
                getLeaveTypeColor(leave.leave_type)
              )}
            >
              {leave.leave_type}
            </Badge>
            <Badge
              className={cn(
                "border text-xs font-medium",
                getStatusColor(status)
              )}
            >
              {status}
            </Badge>
          </div>
        </div>

        {/* Dates & duration */}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              Duration
            </h3>
            <p className="text-2xl font-semibold text-slate-900">
              {leave.total_days ?? leave.days ?? 0}{" "}
              <span className="text-sm font-normal text-slate-500">
                {(leave.total_days ?? leave.days ?? 0) === 1 ? "day" : "days"}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Applied on{" "}
              {new Date(
                leave.applied_date || leave.created_at
              ).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              From – To
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">
                {new Date(leave.from_date).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(leave.to_date).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </section>
        </div>

        {/* Reason */}
        <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-slate-500" />
            Reason
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {leave.reason || "No reason provided."}
          </p>
        </section>

        {/* Approver */}
        {leave.approved_by && (
          <section
            className={cn(
              "rounded-xl border p-4",
              status === "APPROVED"
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-red-50/50 border-red-200"
            )}
          >
            <h3
              className={cn(
                "text-sm font-semibold flex items-center gap-2 mb-2",
                status === "APPROVED" ? "text-emerald-800" : "text-red-800"
              )}
            >
              {status === "APPROVED" ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
              {status === "APPROVED" ? "Approved by" : "Rejected by"}
            </h3>
            <p className="text-sm font-medium text-slate-900">
              {approverName || "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {leave.approved_date
                ? new Date(leave.approved_date).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })
                : "—"}
            </p>
            {leave.rejection_reason && (
              <p className="mt-2 text-sm text-red-700 italic">
                "{leave.rejection_reason}"
              </p>
            )}
          </section>
        )}

        {/* Actions */}
        {isPending &&
          (onApprove || onReject) &&
          (canApproveLeave || canRejectLeave) && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200">
              {onReject && canRejectLeave && (
                <Button
                  variant="outline"
                  onClick={() => onReject(leave.leave_id)}
                  className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
              {onApprove && canApproveLeave && (
                <Button
                  onClick={() => onApprove(leave.leave_id)}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
            </div>
          )}
      </div>
    </FormSheet>
  );
};

export default React.memo(LeaveViewSheet);
