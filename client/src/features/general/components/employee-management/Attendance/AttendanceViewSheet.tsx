import React from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/common/components/ui/sheet";
import { Calendar, User, Clock, CheckCircle, CalendarDays, TrendingUp, Presentation } from "lucide-react";
import { cn } from "@/common/utils";

interface AttendanceViewSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendance: any;
    employee: any;
}

export const AttendanceViewSheet = ({ open, onOpenChange, attendance, employee }: AttendanceViewSheetProps) => {
    if (!attendance) return null;

    const calculateAttendancePercentage = () => {
        if (!attendance.total_working_days || attendance.total_working_days === 0) return 0;
        return Math.round((attendance.days_present / attendance.total_working_days) * 100);
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 75) return "text-yellow-600";
        return "text-red-600";
    };

    const getMonthName = (monthValue: any) => {
        let month: number | null = null;

        if (typeof monthValue === 'number') {
            month = monthValue;
        } else if (typeof monthValue === 'string') {
            const dateMatch = monthValue.match(/^(\d{4})-(\d{2})/);
            if (dateMatch) {
                month = parseInt(dateMatch[2], 10);
            } else {
                const parsed = parseInt(monthValue, 10);
                if (!isNaN(parsed)) {
                    month = parsed;
                }
            }
        }

        if (month && month >= 1 && month <= 12) {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            return monthNames[month - 1];
        }
        return 'N/A';
    };

    const getYearValue = (attendance: any) => {
        let year: number | null = null;

        if (typeof attendance.attendance_year === 'number') {
            year = attendance.attendance_year;
        } else if (typeof attendance.attendance_year === 'string') {
            const parsed = parseInt(attendance.attendance_year, 10);
            if (!isNaN(parsed) && parsed > 0) {
                year = parsed;
            }
        } else if (typeof attendance.attendance_month === 'string') {
            const dateMatch = attendance.attendance_month.match(/^(\d{4})-(\d{2})/);
            if (dateMatch) {
                year = parseInt(dateMatch[1], 10);
            }
        }

        return (year && year > 0) ? year : 'N/A';
    };

    const percentage = calculateAttendancePercentage();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="bg-white !w-full sm:!max-w-[600px] flex flex-col p-0 shadow-2xl"
            >
                <SheetHeader className="px-6 py-5 border-b bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <Presentation className="h-5 w-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold tracking-tight">Attendance Record</SheetTitle>
                            <SheetDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                                Detailed monthly attendance statistics
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    <div className="space-y-6">
                        {/* Summary Header Card */}
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                        <TrendingUp className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest leading-none mb-2">Performance</h3>
                                        <div className={cn("text-3xl font-black", getPercentageColor(percentage))}>
                                            {percentage}%
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Period</div>
                                    <div className="text-lg font-black text-slate-900">
                                        {getMonthName(attendance.attendance_month)} {getYearValue(attendance)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                                    <span>Attendance Health</span>
                                    <span>{percentage < 75 ? "Action Required" : "Good Standing"}</span>
                                </div>
                                <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-primary/10">
                                    <div
                                        className={cn("h-full transition-all duration-500",
                                            percentage >= 90 ? "bg-green-500" : percentage >= 75 ? "bg-yellow-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Employee Information */}
                        <div className="p-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Employee Details
                            </h4>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {attendance.employee_name || employee?.employee_name || "Employee Profile"}
                                    </div>
                                    <div className="text-xs font-semibold text-primary uppercase mt-0.5">
                                        {employee?.employee_code || "EMP"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Stats Grid */}
                        <div className="p-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Working Days</div>
                                    <div className="text-2xl font-black text-blue-600">{attendance.total_working_days || 0}</div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days Present</div>
                                    <div className="text-2xl font-black text-green-600">{attendance.days_present || 0}</div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paid Leaves</div>
                                    <div className="text-2xl font-black text-purple-600">{attendance.paid_leaves || 0}</div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unpaid Leaves</div>
                                    <div className="text-2xl font-black text-orange-600">{attendance.unpaid_leaves || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Record Audit */}
                        {(attendance.created_at || attendance.updated_at || attendance.created_by) && (
                            <div className="p-1">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Audit Information
                                </h4>
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        {attendance.created_at && (
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Created On</label>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {new Date(attendance.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </p>
                                            </div>
                                        )}
                                        {attendance.created_by && (
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Created By</label>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {attendance.created_by_name || "Admin"}
                                                </p>
                                            </div>
                                        )}
                                        {attendance.updated_at && (
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Modified</label>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {new Date(attendance.updated_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </p>
                                            </div>
                                        )}
                                        {attendance.updated_by && (
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Modified By</label>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {attendance.updated_by_name || "Admin"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter className="px-6 py-5 border-t bg-slate-50/80 backdrop-blur-sm sticky bottom-0 z-10 flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="font-bold border-2 hover:bg-slate-100 transition-colors px-10"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
