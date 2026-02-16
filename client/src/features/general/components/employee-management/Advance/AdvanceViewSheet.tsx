import React from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  User,
  FileText,
  CheckCircle,
  IndianRupee,
  Landmark,
  History,
  Printer,
} from "lucide-react";
import { cn } from "@/common/utils";
import { useCanViewUIComponent } from "@/core/permissions";
import { FormSheet } from "@/common/components/shared";

interface AdvanceViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advance: any;
  employee: any;
  onChangeStatus?: (id: number) => void;
  onUpdateAmount?: (id: number) => void;
  onPrintVoucher?: (advance: any) => void;
}

export const AdvanceViewSheet = ({
  open,
  onOpenChange,
  advance,
  employee,
  onChangeStatus,
  onUpdateAmount,
  onPrintVoucher,
}: AdvanceViewSheetProps) => {
  const canChangeStatus = useCanViewUIComponent(
    "employee_advances",
    "button",
    "advance-change-status"
  );
  const canUpdateAmount = useCanViewUIComponent(
    "employee_advances",
    "button",
    "advance-update-amount"
  );

  if (!advance) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPROVED":
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "REPAID":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const principal = advance.advance_amount || 0;
  const repaid = advance.total_repayment_amount || 0;
  const outstanding = advance.remaining_balance ?? principal;
  const progress = principal > 0 ? Math.round((repaid / principal) * 100) : 0;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Advance details"
      description="View advance and repayment summary."
      size="large"
      showFooter={false}
    >
      <div className="space-y-6 pb-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">
                Advance #{advance.advance_id}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {new Date(advance.advance_date).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onPrintVoucher && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrintVoucher(advance)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
            <Badge
              className={cn(
                "border text-xs font-medium",
                getStatusColor(advance.status)
              )}
            >
              {advance.status}
            </Badge>
          </div>
        </div>

        {/* Employee */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {advance.employee_name || employee?.employee_name || "Employee"}
            </p>
            <p className="text-xs text-slate-500">
              {advance.employee_code || employee?.employee_code || "—"} ·{" "}
              {advance.designation || employee?.designation || "—"}
            </p>
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Principal</p>
            <p className="text-lg font-semibold text-slate-900">
              ₹{principal.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-xs font-medium text-emerald-700 mb-1">Repaid</p>
            <p className="text-lg font-semibold text-emerald-800">
              ₹{repaid.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Outstanding</p>
            <p className="text-lg font-semibold text-slate-900">
              ₹{outstanding.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Repayment progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress >= 100 ? "bg-emerald-500" : "bg-slate-400"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Repayments */}
        {advance.repayments && advance.repayments.length > 0 && (
          <section className="rounded-xl border border-slate-200 overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50">
              <History className="h-4 w-4 text-slate-500" />
              Repayment history
            </h3>
            <div className="divide-y divide-slate-100">
              {advance.repayments.map((repayment: any) => (
                <div
                  key={repayment.repayment_id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(repayment.created_at).toLocaleDateString(
                          undefined,
                          { dateStyle: "medium" }
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {repayment.payment_mode || "Manual"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">
                    + ₹{repayment.repaid_amount?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Submission & approval */}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-slate-500" />
              Submission
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted</span>
                <span className="font-medium text-slate-900">
                  {new Date(advance.advance_date).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created by</span>
                <span className="font-medium text-slate-900">
                  {advance.created_by_name || "—"}
                </span>
              </div>
              {advance.request_reason && (
                <p className="text-slate-600 pt-2 border-t border-slate-200 italic">
                  "{advance.request_reason}"
                </p>
              )}
            </div>
          </section>
          {(advance.approved_by_name ||
            advance.reason ||
            advance.rejection_reason ||
            advance.status === "REJECTED" ||
            advance.status === "CANCELLED") && (
            <section
              className={cn(
                "rounded-xl border p-4",
                advance.status === "REJECTED" || advance.status === "CANCELLED"
                  ? "bg-red-50/50 border-red-200"
                  : "bg-slate-50/50 border-slate-200"
              )}
            >
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Approver
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reviewed by</span>
                  <span className="font-medium text-slate-900">
                    {advance.approved_by_name || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">
                    {advance.approved_at
                      ? new Date(advance.approved_at).toLocaleDateString(
                          undefined,
                          { dateStyle: "medium" }
                        )
                      : "—"}
                  </span>
                </div>
                {(advance.reason || advance.rejection_reason) && (
                  <p
                    className={cn(
                      "pt-2 border-t italic",
                      advance.status === "REJECTED" ||
                        advance.status === "CANCELLED"
                        ? "border-red-200 text-red-700"
                        : "border-slate-200 text-slate-600"
                    )}
                  >
                    "{advance.reason || advance.rejection_reason}"
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200">
          {onChangeStatus && canChangeStatus && (
            <Button
              variant="outline"
              onClick={() => onChangeStatus(advance.advance_id)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update status
            </Button>
          )}
          {onUpdateAmount && canUpdateAmount && (
            <Button
              onClick={() => onUpdateAmount(advance.advance_id)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Landmark className="h-4 w-4 mr-2" />
              Record repayment
            </Button>
          )}
        </div>
      </div>
    </FormSheet>
  );
};
