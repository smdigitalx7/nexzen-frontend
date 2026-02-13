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
import { useCanViewUIComponent } from "@/core/permissions";
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, X, Printer, IndianRupee, Landmark } from "lucide-react";
import { cn } from "@/common/utils";

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
    onPrintVoucher
}: AdvanceViewSheetProps) => {
    const canChangeStatus = useCanViewUIComponent("employee_advances", "button", "advance-change-status");
    const canUpdateAmount = useCanViewUIComponent("employee_advances", "button", "advance-update-amount");

    if (!advance) return null;

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "REQUESTED":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "APPROVED":
                return "bg-green-100 text-green-800 border-green-200";
            case "ACTIVE":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200";
            case "CANCELLED":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "REPAID":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

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
                                <IndianRupee className="h-5 w-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight">Advance Details</SheetTitle>
                                <SheetDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                                    Salary advance request and repayment overview
                                </SheetDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {onPrintVoucher && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPrintVoucher(advance)}
                                    className="h-9 px-3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 font-bold"
                                >
                                    <Printer className="h-4 w-4 mr-1.5" />
                                    Print
                                </Button>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    <div className="space-y-6">
                        {/* Employee Card */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm border border-slate-200 dark:border-slate-700">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                                        {advance.employee_name || employee?.employee_name || "Employee Profile"}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <p className="text-sm text-primary font-semibold uppercase tracking-wider">
                                            {advance.employee_code || employee?.employee_code || "EMP"}
                                        </p>
                                        {(advance.designation || employee?.designation) && (
                                            <>
                                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                <p className="text-xs font-medium text-slate-500">{advance.designation || employee?.designation}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Advance Status</label>
                                <Badge className={cn("px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-none", getStatusColor(advance.status))}>
                                    {advance.status}
                                </Badge>
                                <IndianRupee className="absolute -right-4 -bottom-4 h-16 w-16 text-slate-50 -rotate-12" />
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Advance Amount</label>
                                <div className="text-2xl font-black text-green-600">
                                    ₹{advance.advance_amount?.toLocaleString() || '0'}
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="p-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Payment & Balance
                            </h4>
                            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="grid grid-cols-2 gap-8 relative">
                                    <div className="absolute left-1/2 top-4 bottom-4 w-px bg-slate-200 hidden sm:block" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Amount Paid</div>
                                        <div className="text-xl font-black text-blue-600">
                                            ₹{advance.total_repayment_amount?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Remaining Balance</div>
                                        <div className="text-xl font-black text-red-600">
                                            ₹{(advance.remaining_balance ?? advance.advance_amount)?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repayment Progress</span>
                                        <span className="text-xs font-black text-slate-700">
                                            {Math.round(((advance.total_repayment_amount || 0) / (advance.advance_amount || 1)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${Math.round(((advance.total_repayment_amount || 0) / (advance.advance_amount || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Repayment History */}
                        {advance.repayments && advance.repayments.length > 0 && (
                            <div className="p-1">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                    <Landmark className="h-4 w-4" />
                                    Repayment History
                                </h4>
                                <div className="space-y-3">
                                    {advance.repayments.map((repayment: any) => (
                                        <div key={repayment.repayment_id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">₹{repayment.repaid_amount?.toLocaleString()}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(repayment.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                        {repayment.payment_mode || 'Manual'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                                                Received By
                                                <div className="text-slate-600 normal-case mt-0.5">{repayment.created_by_name || 'Admin'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Request Details */}
                        <div className="p-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Request Details
                            </h4>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Request Date</label>
                                        <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            {new Date(advance.advance_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Created By</label>
                                        <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-slate-400" />
                                            {advance.created_by_name || 'Admin'}
                                        </p>
                                    </div>
                                </div>
                                {advance.request_reason && (
                                    <div className="pt-4 border-t border-slate-50">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Reason for Advance</label>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap italic">
                                            "{advance.request_reason}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audit Info */}
                        {(advance.approved_by_name || advance.reason || advance.rejection_reason || advance.status === "REJECTED" || advance.status === "CANCELLED") && (
                            <div className="p-1">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                    {advance.status === "REJECTED" || advance.status === "CANCELLED" ? (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    Audit & Action Info
                                </h4>
                                <div className={cn(
                                    "p-5 rounded-2xl border",
                                    advance.status === "REJECTED" || advance.status === "CANCELLED"
                                        ? "bg-red-50/30 border-red-100/50"
                                        : "bg-slate-50/50 border-slate-100"
                                )}>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {advance.approved_by_name && (
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Approved By</label>
                                                <p className="text-sm font-bold text-slate-900 mt-1">{advance.approved_by_name}</p>
                                            </div>
                                        )}
                                        {advance.approved_at && (
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Approved At</label>
                                                <p className="text-sm font-bold text-slate-900 mt-1">
                                                    {new Date(advance.approved_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {(advance.reason || advance.rejection_reason) && (
                                        <div className="pt-4 border-t border-slate-200/30">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                                                {advance.status === "REJECTED" ? "Rejection Reason" : "Notes"}
                                            </label>
                                            <p className={cn(
                                                "text-sm font-medium mt-2 italic leading-relaxed whitespace-pre-wrap",
                                                advance.status === "REJECTED" ? "text-red-700" : "text-slate-700"
                                            )}>
                                                {advance.reason || advance.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter className="px-6 py-5 border-t bg-slate-50/80 backdrop-blur-sm sticky bottom-0 z-10">
                    <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2">
                            {onChangeStatus && canChangeStatus && (
                                <Button
                                    variant="outline"
                                    onClick={() => onChangeStatus(advance.advance_id)}
                                    className="h-10 px-4 font-bold border-2 hover:bg-slate-100"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Change Status
                                </Button>
                            )}
                            {onUpdateAmount && canUpdateAmount && (
                                <Button
                                    variant="default"
                                    onClick={() => onUpdateAmount(advance.advance_id)}
                                    className="h-10 px-4 font-bold bg-primary hover:bg-primary/90 text-white shadow-sm"
                                >
                                    <Landmark className="h-4 w-4 mr-2" />
                                    Update Payment
                                </Button>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            className="font-bold text-slate-500 hover:text-slate-900"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
