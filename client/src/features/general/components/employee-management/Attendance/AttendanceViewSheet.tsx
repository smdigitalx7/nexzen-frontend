import React from "react";
import {
  User,
  Clock,
  CheckCircle,
  CalendarDays,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/common/utils";
import { FormSheet } from "@/common/components/shared";

interface AttendanceViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: any;
  employee: any;
}

function getMonthName(monthValue: unknown): string {
  let month: number | null = null;
  if (typeof monthValue === "number") {
    month = monthValue;
  } else if (typeof monthValue === "string") {
    const dateMatch = /^(\d{4})-(\d{2})/.exec(monthValue);
    if (dateMatch) {
      month = Number.parseInt(dateMatch[2], 10);
    } else {
      const parsed = Number.parseInt(monthValue, 10);
      if (!Number.isNaN(parsed)) month = parsed;
    }
  }
  if (month != null && month >= 1 && month <= 12) {
    const names = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return names[month - 1];
  }
  return "N/A";
}

function getYearValue(attendance: any): number | string {
  if (typeof attendance.attendance_year === "number") {
    return attendance.attendance_year;
  }
  if (typeof attendance.attendance_year === "string") {
    const parsed = Number.parseInt(attendance.attendance_year, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  if (typeof attendance.attendance_month === "string") {
    const m = attendance.attendance_month.match(/^(\d{4})/);
    if (m) return Number.parseInt(m[1], 10);
  }
  return "N/A";
}

export const AttendanceViewSheet = ({
  open,
  onOpenChange,
  attendance,
  employee,
}: AttendanceViewSheetProps) => {
  if (!attendance) return null;

  const total = attendance.total_working_days || 0;
  const present = attendance.days_present || 0;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const periodLabel = `${getMonthName(attendance.attendance_month)} ${getYearValue(attendance)}`;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Attendance record"
      description="Monthly attendance summary."
      size="large"
      showFooter={false}
    >
      <div className="space-y-6 pb-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                percentage >= 90 && "bg-emerald-100 text-emerald-700",
                percentage >= 75 && percentage < 90 && "bg-amber-100 text-amber-700",
                percentage < 75 && "bg-red-100 text-red-700"
              )}
            >
              <Clock className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">
                {percentage}% attendance
              </h2>
              <p className="text-sm text-slate-500">{periodLabel}</p>
            </div>
          </div>
        </div>

        {/* Employee */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {attendance.employee_name || employee?.employee_name || "Employee"}
            </p>
            <p className="text-xs text-slate-500">
              {employee?.designation || "—"} · {employee?.employee_code || "—"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                Working days
              </span>
              <Briefcase className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {attendance.total_working_days ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-700">
                Present
              </span>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xl font-semibold text-emerald-800">
              {attendance.days_present ?? 0}
            </p>
            {total > 0 && (
              <p className="text-xs text-emerald-600 mt-0.5">
                {Math.round((present / total) * 100)}%
              </p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                Paid leaves
              </span>
              <CalendarDays className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {attendance.paid_leaves ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                Unpaid leaves
              </span>
              <AlertCircle className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {attendance.unpaid_leaves ?? 0}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Attendance</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentage >= 90 && "bg-emerald-500",
                percentage >= 75 && percentage < 90 && "bg-amber-500",
                percentage < 75 && "bg-red-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Last updated</span>
          <span>
            {attendance.updated_at
              ? new Date(attendance.updated_at).toLocaleString()
              : "N/A"}
          </span>
        </div>
      </div>
    </FormSheet>
  );
};
