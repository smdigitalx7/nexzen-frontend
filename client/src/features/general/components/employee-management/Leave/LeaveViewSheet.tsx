import React from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/common/components/ui/sheet";
import { useCanViewUIComponent } from "@/core/permissions";
import { Calendar, User, FileText, Clock, CalendarDays, Check, X, ClipboardList } from "lucide-react";
import { cn } from "@/common/utils";
import { useUser } from "@/features/general/hooks/useUsers";

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
    onReject
}: LeaveViewSheetProps) => {
    const approvedById = (leave?.approved_by && leave.approved_by > 0) ? leave.approved_by : 0;

    const canApproveLeave = useCanViewUIComponent("employee_leaves", "button", "leave-approve");
    const canRejectLeave = useCanViewUIComponent("employee_leaves", "button", "leave-reject");

    const { data: approverUser } = useUser(approvedById);
    const approverName = approverUser?.full_name || (leave?.approved_by ? "Admin" : undefined);

    if (!leave) return null;

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "APPROVED":
                return "bg-green-100 text-green-800 border-green-200";
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getLeaveTypeColor = (leaveType: string) => {
        switch (leaveType?.toUpperCase()) {
            case "PAID":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "UNPAID":
                return "bg-orange-100 text-orange-800 border-orange-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const isPending = (leave.leave_status === "PENDING" || leave.status === "PENDING");

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="bg-white !w-full sm:!max-w-[600px] flex flex-col p-0 shadow-2xl"
            >
                <SheetHeader className="px-6 py-5 border-b bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight">Leave Request</SheetTitle>
                                <SheetDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                                    View leave details and take actions
                                </SheetDescription>
                            </div>
                        </div>
                        {isPending && (onApprove || onReject) && (canApproveLeave || canRejectLeave) && (
                            <div className="flex items-center gap-2">
                                {onReject && canRejectLeave && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onReject(leave.leave_id)}
                                        className="h-9 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                                    >
                                        <X className="h-4 w-4 mr-1.5" />
                                        Reject
                                    </Button>
                                )}
                                {onApprove && canApproveLeave && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => onApprove(leave.leave_id)}
                                        className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm"
                                    >
                                        <Check className="h-4 w-4 mr-1.5" />
                                        Approve
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    <div className="space-y-6">
                        {/* Employee Information Card */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm border border-slate-200 dark:border-slate-700">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                                        {leave.employee_name || employee?.employee_name || "Employee Profile"}
                                    </h3>
                                    <p className="text-sm text-primary font-semibold mt-1.5 uppercase tracking-wider">
                                        {employee?.employee_code || "EMP"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Leave Meta Info */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Status</label>
                                <Badge className={cn("px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-none", getStatusColor(leave.leave_status || leave.status))}>
                                    {leave.leave_status || leave.status}
                                </Badge>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                                <Badge className={cn("px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-none", getLeaveTypeColor(leave.leave_type))}>
                                    {leave.leave_type}
                                </Badge>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Duration</label>
                                <div className="text-sm font-black text-blue-600">
                                    {leave.total_days || leave.days} {(leave.total_days || leave.days) === 1 ? 'Day' : 'Days'}
                                </div>
                            </div>
                        </div>

                        {/* Date Details */}
                        <div className="p-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Schedule
                            </h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">From Date</label>
                                    <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                        {new Date(leave.from_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">To Date</label>
                                    <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                        {new Date(leave.to_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </p>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-slate-50">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Applied On</label>
                                    <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                        {new Date(leave.applied_date).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reason Section */}
                        {leave.reason && (
                            <div className="p-1">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Reason for Leave
                                </h4>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                                        "{leave.reason}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Approval Info */}
                        {leave.approved_by && (
                            <div className="p-1">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Approval Information
                                </h4>
                                <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100/50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved By</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{approverName || "Admin"}</p>
                                        </div>
                                        {leave.approved_date && (
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved On</label>
                                                <p className="text-sm font-bold text-slate-900 mt-1">
                                                    {new Date(leave.approved_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rejection Info */}
                        {leave.rejection_reason && (
                            <div className="p-1">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                    <X className="h-4 w-4 text-red-500" />
                                    Rejection Information
                                </h4>
                                <div className="bg-red-50/30 p-5 rounded-2xl border border-red-100/50">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</label>
                                        <p className="text-sm font-medium text-red-700 mt-1 whitespace-pre-wrap">{leave.rejection_reason}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-5 border-t bg-slate-50/80 backdrop-blur-sm sticky bottom-0 z-10 flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="font-bold border-2 hover:bg-slate-100 transition-colors px-10"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default React.memo(LeaveViewSheet);
