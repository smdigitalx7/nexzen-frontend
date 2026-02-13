import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/common/components/ui/sheet";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { useCanViewUIComponent } from "@/core/permissions";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, ScrollText } from "lucide-react";
import { cn } from "@/common/utils";

interface EmployeeDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: any | null;
    newStatus: string;
    onStatusChange: (value: string) => void;
    onUpdateStatus: () => void;
    isUpdating: boolean;
    getStatusColor: (status: string) => string;
    statusOptions?: Array<{ value: string; label: string; color?: string }>;
    formatCurrency: (n: number) => string;
}

const EmployeeDetailSheet = ({
    open,
    onOpenChange,
    employee,
    newStatus,
    onStatusChange,
    onUpdateStatus,
    isUpdating,
    getStatusColor,
    statusOptions = [
        { value: 'ACTIVE', label: 'ACTIVE', color: 'bg-green-100 text-green-800 border-green-200' },
        { value: 'TERMINATED', label: 'TERMINATED', color: 'bg-red-100 text-red-800 border-red-200' },
    ],
    formatCurrency
}: EmployeeDetailSheetProps) => {
    const canUpdateStatus = useCanViewUIComponent("employees", "button", "employee-update-status");

    const handleSave = () => {
        onUpdateStatus();
    };

    const currentStatus = employee?.status;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="bg-white !w-full sm:!max-w-[600px] flex flex-col p-0 shadow-2xl"
            >
                <SheetHeader className="px-6 py-5 border-b bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <ScrollText className="h-5 w-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold tracking-tight">Employee Details</SheetTitle>
                            <SheetDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                                {employee ? `Viewing profile of ${employee.employee_name}` : 'Detailed employee profile information'}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    {employee ? (
                        <div className="space-y-6">
                            {/* Profile Overview Card */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm border border-slate-200 dark:border-slate-700">
                                            <User className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none">
                                                {employee.employee_name}
                                            </h3>
                                            <p className="text-sm text-primary font-semibold mt-1.5 uppercase tracking-wider">
                                                {employee.employee_code || "EMP"}
                                            </p>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                {employee.designation || "No Designation"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={cn("px-3 py-1 rounded-full font-bold text-xs shadow-sm", getStatusColor(employee.status))}>
                                        {employee.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* Information Grid */}
                            <div className="grid gap-5">
                                {/* Professional Information */}
                                <div className="p-1">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Professional Info
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{employee.employee_type || "N/A"}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{employee.experience_years ?? "0"} years</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qualification</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1 leading-relaxed">{employee.qualification || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="p-1">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Personal Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{employee.gender || "N/A"}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">
                                                {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aadhar Number</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1 tracking-widest">{employee.aadhar_no || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="p-1">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Contact Details
                                    </h4>
                                    <div className="grid gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mobile</label>
                                                <p className="text-sm font-bold text-slate-900">{employee.mobile_no || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email</label>
                                                <p className="text-sm font-bold text-slate-900 break-all">{employee.email || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Location</label>
                                                <p className="text-sm font-bold text-slate-900 leading-relaxed">{employee.address || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Information */}
                                <div className="p-1">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Bank Information
                                    </h4>
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bank Name</label>
                                            <p className="text-sm font-bold text-slate-900">{employee.bank_name || "N/A"}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Account Number</label>
                                                <p className="text-sm font-bold text-slate-900 tracking-wider">{employee.bank_account_number || "N/A"}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">IFSC Code</label>
                                                <p className="text-sm font-bold text-slate-900 tracking-wider">{employee.bank_ifsc_code || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Detail */}
                                <div className="p-1">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Pay & Joining
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Joined On</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">
                                                {new Date(employee.date_of_joining).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Monthly Net</label>
                                            <p className="text-lg font-black text-green-600 mt-0.5">
                                                ₹{formatCurrency(employee.salary)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Record Audit */}
                                {(employee.created_at || employee.updated_at || employee.created_by) && (
                                    <div className="p-1">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                            Audit Information
                                        </h4>
                                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                                {employee.created_at && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Created On</label>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {new Date(employee.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                        </p>
                                                    </div>
                                                )}
                                                {employee.created_by && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Created By</label>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {employee.created_by_name || "Admin"}
                                                        </p>
                                                    </div>
                                                )}
                                                {employee.updated_at && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Modified</label>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {new Date(employee.updated_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                        </p>
                                                    </div>
                                                )}
                                                {employee.updated_by && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Modified By</label>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {employee.updated_by_name || "Admin"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Status Management (Inline) */}
                                {canUpdateStatus && currentStatus && (
                                    <div className="p-1">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            Update Status
                                        </h4>
                                        <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                                            <div className="flex items-center justify-between gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Status</label>
                                                    <Select value={newStatus || currentStatus} onValueChange={onStatusChange}>
                                                        <SelectTrigger className="w-48 bg-white border-primary/20 font-bold focus:ring-primary/20 transition-all">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="font-semibold">
                                                            {statusOptions.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Currently</p>
                                                    <Badge className={cn("shadow-none", getStatusColor(currentStatus))}>
                                                        {currentStatus}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="h-16 w-16 rounded-full bg-slate-100 animate-pulse mb-4" />
                            <p className="text-slate-400 font-medium italic">Loading employee profile...</p>
                        </div>
                    )}
                </div>

                <SheetFooter className="px-6 py-5 border-t bg-slate-50/80 backdrop-blur-sm sticky bottom-0 z-10 gap-3 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="font-bold border-2 hover:bg-slate-100 transition-colors px-8"
                        onClick={() => onOpenChange(false)}
                        disabled={isUpdating}
                    >
                        Close
                    </Button>
                    {canUpdateStatus && (
                        <Button
                            type="button"
                            className="font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-10 transition-all active:scale-95"
                            onClick={handleSave}
                            disabled={isUpdating || newStatus === currentStatus}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader.Button className="mr-2 h-4 w-4" />
                                    Updating...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default React.memo(EmployeeDetailSheet);
