import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Edit,
  Eye,
  UserCheck,
  Calendar,
  DollarSign,
  Award,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { EnhancedDataTable } from "@/components/EnhancedDataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeesByBranch, useEmployeesByInstitute, useDeleteEmployee, useUpdateEmployeeStatus, useCreateEmployee, useUpdateEmployee } from "@/lib/hooks/useEmployees";
import { useEmployeeAttendance, useEmployeeAttendanceByBranch, useCreateEmployeeAttendance, useUpdateEmployeeAttendance, useDeleteEmployeeAttendance } from "@/lib/hooks/useEmployeeAttendance";
import { useEmployeeLeaves, useEmployeeLeavesByBranch, useCreateEmployeeLeave, useUpdateEmployeeLeave, useDeleteEmployeeLeave, useApproveEmployeeLeave, useRejectEmployeeLeave } from "@/lib/hooks/useEmployeeLeave";
import { useAdvancesAll, useAdvancesByBranch, useCreateAdvance, useUpdateAdvance, useUpdateAdvanceStatus, useUpdateAdvanceAmountPaid } from "@/lib/hooks/useAdvances";
import { EmployeeRead, EmployeeCreate, EmployeeUpdate } from "@/lib/types/employees";
import { EmployeeAttendanceRead, EmployeeAttendanceCreate, EmployeeAttendanceUpdate } from "@/lib/types/employee-attendance";
import { EmployeeLeaveRead, EmployeeLeaveCreate, EmployeeLeaveUpdate, EmployeeLeaveReject } from "@/lib/types/employee-leave";
import { AdvanceRead, AdvanceCreate, AdvanceUpdate } from "@/lib/types/advances";

const EmployeeManagement = () => {
  const [viewMode] = useState<"branch" | "institute">("branch");
  const [activeTab, setActiveTab] = useState("employees");
  
  const { data: branchEmployees = [], isLoading: branchLoading, error: branchError } = useEmployeesByBranch();
  const { data: instituteEmployees = [], isLoading: instituteLoading, error: instituteError } = useEmployeesByInstitute();
  
  // Attendance data
  const { data: branchAttendanceResponse, isLoading: branchAttendanceLoading } = useEmployeeAttendanceByBranch();
  const { data: instituteAttendanceResponse, isLoading: instituteAttendanceLoading } = useEmployeeAttendance();
  const branchAttendance = branchAttendanceResponse?.data || [];
  const instituteAttendance = instituteAttendanceResponse?.data || [];
  
  // Leave data
  const { data: branchLeavesResponse, isLoading: branchLeavesLoading } = useEmployeeLeavesByBranch();
  const { data: instituteLeavesResponse, isLoading: instituteLeavesLoading } = useEmployeeLeaves();
  const branchLeaves = branchLeavesResponse?.data || [];
  const instituteLeaves = instituteLeavesResponse?.data || [];
  
  // Advances data
  const { data: branchAdvancesResponse, isLoading: branchAdvancesLoading } = useAdvancesByBranch();
  const { data: instituteAdvancesResponse, isLoading: instituteAdvancesLoading } = useAdvancesAll();
  const branchAdvances = branchAdvancesResponse?.data || [];
  const instituteAdvances = instituteAdvancesResponse?.data || [];
  
  // Use the selected view mode
  const employees = viewMode === "branch" ? branchEmployees : instituteEmployees;
  const isLoading = viewMode === "branch" ? branchLoading : instituteLoading;
  const error = viewMode === "branch" ? branchError : instituteError;
  
  const attendance = viewMode === "branch" ? branchAttendance : instituteAttendance;
  const attendanceLoading = viewMode === "branch" ? branchAttendanceLoading : instituteAttendanceLoading;
  
  const leaves = viewMode === "branch" ? branchLeaves : instituteLeaves;
  const leavesLoading = viewMode === "branch" ? branchLeavesLoading : instituteLeavesLoading;
  
  const advances: AdvanceRead[] = viewMode === "branch" ? branchAdvances : instituteAdvances;
  const advancesLoading = viewMode === "branch" ? branchAdvancesLoading : instituteAdvancesLoading;
  
  const deleteEmployeeMutation = useDeleteEmployee();
  const updateStatusMutation = useUpdateEmployeeStatus();
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  
  // Attendance mutations
  const createAttendanceMutation = useCreateEmployeeAttendance();
  const updateAttendanceMutation = useUpdateEmployeeAttendance();
  const deleteAttendanceMutation = useDeleteEmployeeAttendance();
  
  // Leave mutations
  const createLeaveMutation = useCreateEmployeeLeave();
  const updateLeaveMutation = useUpdateEmployeeLeave();
  const deleteLeaveMutation = useDeleteEmployeeLeave();
  const approveLeaveMutation = useApproveEmployeeLeave();
  const rejectLeaveMutation = useRejectEmployeeLeave();
  
  // Advances mutations
  const createAdvanceMutation = useCreateAdvance();
  const updateAdvanceMutation = useUpdateAdvance();
  const updateAdvanceStatusMutation = useUpdateAdvanceStatus();
  const updateAdvanceAmountPaidMutation = useUpdateAdvanceAmountPaid();

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRead | null>(null);
  
  // Attendance states
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<EmployeeAttendanceRead | null>(null);
  const [showAttendanceDeleteDialog, setShowAttendanceDeleteDialog] = useState(false);
  const [attendanceFormData, setAttendanceFormData] = useState<EmployeeAttendanceCreate>({
    employee_id: 0,
    attendance_month: new Date().toISOString().slice(0, 7) + "-01", // First day of current month
    total_working_days: 22,
    days_present: 0,
    days_absent: 0,
    paid_leaves: 0,
    unpaid_leaves: 0,
    late_arrivals: 0, // Required field with default 0
    early_departures: 0, // Required field with default 0
  });
  
  // Leave states
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [isEditingLeave, setIsEditingLeave] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState<number | null>(null);
  const [leaveToDelete, setLeaveToDelete] = useState<EmployeeLeaveRead | null>(null);
  const [showLeaveDeleteDialog, setShowLeaveDeleteDialog] = useState(false);
  const [leaveToApprove, setLeaveToApprove] = useState<EmployeeLeaveRead | null>(null);
  const [showLeaveApproveDialog, setShowLeaveApproveDialog] = useState(false);
  const [leaveToReject, setLeaveToReject] = useState<EmployeeLeaveRead | null>(null);
  const [showLeaveRejectDialog, setShowLeaveRejectDialog] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState<EmployeeLeaveCreate>({
    employee_id: 0,
    leave_type: "sick",
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    reason: "",
    total_days: 1,
    applied_date: new Date().toISOString().split('T')[0],
  });
  
  // Advances states
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [isEditingAdvance, setIsEditingAdvance] = useState(false);
  const [editingAdvanceId, setEditingAdvanceId] = useState<number | null>(null);
  const [advanceToDelete, setAdvanceToDelete] = useState<AdvanceRead | null>(null);
  const [showAdvanceDeleteDialog, setShowAdvanceDeleteDialog] = useState(false);
  const [advanceToUpdateStatus, setAdvanceToUpdateStatus] = useState<AdvanceRead | null>(null);
  const [showAdvanceStatusDialog, setShowAdvanceStatusDialog] = useState(false);
  const [advanceToUpdateAmount, setAdvanceToUpdateAmount] = useState<AdvanceRead | null>(null);
  const [showAdvanceAmountDialog, setShowAdvanceAmountDialog] = useState(false);
  const [advanceFormData, setAdvanceFormData] = useState<AdvanceCreate>({
    branch_id: 0,
    employee_id: 0,
    amount: 0,
  });
  const [rejectReason, setRejectReason] = useState("");
  
  // Add/Edit Employee Form States
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeCreate>({
    employee_name: "",
    employee_type: "teaching",
    employee_code: "",
    aadhar_no: "",
    mobile_no: "",
    email: "",
    address: "",
    date_of_joining: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    designation: "",
    qualification: "",
    experience_years: 0,
    status: "ACTIVE",
    salary: 0,
  });

  const getEmployeeTypeColor = (type: string) => {
    switch (type) {
      case "teaching":
        return "bg-blue-100 text-blue-800";
      case "non_teaching":
        return "bg-green-100 text-green-800";
      case "administrative":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "ON_LEAVE":
        return "bg-yellow-100 text-yellow-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleDeleteEmployee = (employee: EmployeeRead) => {
    setEmployeeToDelete(employee);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployeeMutation.mutate(employeeToDelete.employee_id);
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    }
  };

  const handleStatusUpdate = () => {
    if (selectedEmployee && newStatus !== selectedEmployee.status) {
      updateStatusMutation.mutate({
        id: selectedEmployee.employee_id,
        status: newStatus,
      });
      setShowDetail(false);
    }
  };

  const handleAddEmployee = () => {
    setIsEditing(false);
    setFormData({
      employee_name: "",
      employee_type: "teaching",
      employee_code: "",
      aadhar_no: "",
      mobile_no: "",
      email: "",
      address: "",
      date_of_joining: new Date().toISOString().split('T')[0],
      designation: "",
      qualification: "",
      experience_years: 0,
      status: "ACTIVE",
      salary: 0,
    });
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee: EmployeeRead) => {
    setIsEditing(true);
    setFormData({
      employee_name: employee.employee_name,
      employee_type: employee.employee_type,
      employee_code: employee.employee_code,
      aadhar_no: employee.aadhar_no || "",
      mobile_no: employee.mobile_no || "",
      email: employee.email || "",
      address: employee.address || "",
      date_of_joining: employee.date_of_joining,
      designation: employee.designation,
      qualification: employee.qualification || "",
      experience_years: employee.experience_years || 0,
      status: employee.status,
      salary: employee.salary,
    });
    setShowEmployeeForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedEmployee) {
      // Update existing employee
      const updateData: EmployeeUpdate = {
        employee_name: formData.employee_name,
        employee_type: formData.employee_type,
        employee_code: formData.employee_code,
        aadhar_no: formData.aadhar_no || null,
        mobile_no: formData.mobile_no || null,
        email: formData.email || null,
        address: formData.address || null,
        date_of_joining: formData.date_of_joining,
        designation: formData.designation,
        qualification: formData.qualification || null,
        experience_years: formData.experience_years || null,
        status: formData.status,
        salary: formData.salary,
      };
      
      updateEmployeeMutation.mutate({
        id: selectedEmployee.employee_id,
        payload: updateData,
      });
    } else {
      // Create new employee
      createEmployeeMutation.mutate(formData);
    }
    
    setShowEmployeeForm(false);
  };

  const handleFormChange = (field: keyof EmployeeCreate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Attendance handlers
  const handleAddAttendance = () => {
    setIsEditingAttendance(false);
    setAttendanceFormData({
      employee_id: 0,
      attendance_month: new Date().toISOString().slice(0, 7) + "-01",
      total_working_days: 22,
      days_present: 0,
      days_absent: 0,
      paid_leaves: 0,
      unpaid_leaves: 0,
      late_arrivals: 0, // Required field with default 0
      early_departures: 0, // Required field with default 0
    });
    setShowAttendanceForm(true);
  };

  const handleEditAttendance = (attendance: EmployeeAttendanceRead) => {
    setIsEditingAttendance(true);
    setAttendanceFormData({
      employee_id: attendance.employee_id,
      attendance_month: attendance.attendance_month,
      total_working_days: attendance.total_working_days,
      days_present: attendance.days_present,
      days_absent: attendance.days_absent,
      paid_leaves: attendance.paid_leaves,
      unpaid_leaves: attendance.unpaid_leaves,
      late_arrivals: attendance.late_arrivals,
      early_departures: attendance.early_departures,
    });
    setShowAttendanceForm(true);
  };

  const handleDeleteAttendance = (attendance: EmployeeAttendanceRead) => {
    setAttendanceToDelete(attendance);
    setShowAttendanceDeleteDialog(true);
  };

  const handleAttendanceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditingAttendance && attendanceToDelete) {
      updateAttendanceMutation.mutate({
        id: attendanceToDelete.attendance_id,
        data: {
          total_working_days: attendanceFormData.total_working_days,
          days_present: attendanceFormData.days_present,
          days_absent: attendanceFormData.days_absent,
          paid_leaves: attendanceFormData.paid_leaves,
          unpaid_leaves: attendanceFormData.unpaid_leaves,
          late_arrivals: attendanceFormData.late_arrivals,
          early_departures: attendanceFormData.early_departures,
        }
      });
    } else {
      createAttendanceMutation.mutate(attendanceFormData);
    }
    
    setShowAttendanceForm(false);
    setIsEditingAttendance(false);
  };

  const handleAttendanceFormChange = (field: keyof EmployeeAttendanceCreate, value: string | number) => {
    setAttendanceFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Leave handlers
  const handleAddLeave = () => {
    setIsEditingLeave(false);
    setLeaveFormData({
      employee_id: 0,
      leave_type: "sick",
      from_date: new Date().toISOString().split('T')[0],
      to_date: new Date().toISOString().split('T')[0],
      reason: "",
      total_days: 1,
      applied_date: new Date().toISOString().split('T')[0],
    });
    setShowLeaveForm(true);
  };

  const handleEditLeave = (leave: EmployeeLeaveRead) => {
    setIsEditingLeave(true);
    setEditingLeaveId(leave.leave_id);
    setLeaveFormData({
      employee_id: leave.employee_id,
      leave_type: leave.leave_type,
      from_date: leave.from_date,
      to_date: leave.to_date,
      reason: leave.reason,
      total_days: leave.total_days,
      applied_date: leave.applied_date,
    });
    setShowLeaveForm(true);
  };

  const handleDeleteLeave = (leave: EmployeeLeaveRead) => {
    setLeaveToDelete(leave);
    setShowLeaveDeleteDialog(true);
  };

  const handleApproveLeave = (leave: EmployeeLeaveRead) => {
    setLeaveToApprove(leave);
    setShowLeaveApproveDialog(true);
  };

  const handleRejectLeave = (leave: EmployeeLeaveRead) => {
    setLeaveToReject(leave);
    setRejectReason("");
    setShowLeaveRejectDialog(true);
  };

  const handleLeaveFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditingLeave && editingLeaveId) {
      updateLeaveMutation.mutate({
        id: editingLeaveId,
        data: {
          leave_type: leaveFormData.leave_type,
          from_date: leaveFormData.from_date,
          to_date: leaveFormData.to_date,
          reason: leaveFormData.reason,
          total_days: leaveFormData.total_days,
          applied_date: leaveFormData.applied_date,
        }
      });
    } else {
      createLeaveMutation.mutate(leaveFormData);
    }
    
    setShowLeaveForm(false);
    setIsEditingLeave(false);
    setEditingLeaveId(null);
  };

  const handleLeaveFormChange = (field: keyof EmployeeLeaveCreate, value: string | number) => {
    setLeaveFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Advance handlers
  const handleAddAdvance = () => {
    setIsEditingAdvance(false);
    setAdvanceFormData({
      branch_id: 0,
      employee_id: 0,
      amount: 0,
    });
    setShowAdvanceForm(true);
  };

  const handleEditAdvance = (advance: AdvanceRead) => {
    setIsEditingAdvance(true);
    setEditingAdvanceId(advance.advance_id);
    setAdvanceFormData({
      branch_id: advance.branch_id,
      employee_id: advance.employee_id,
      amount: advance.amount,
    });
    setShowAdvanceForm(true);
  };

  const handleDeleteAdvance = (advance: AdvanceRead) => {
    setAdvanceToDelete(advance);
    setShowAdvanceDeleteDialog(true);
  };

  const handleUpdateAdvanceStatus = (advance: AdvanceRead, status: string) => {
    setAdvanceToUpdateStatus(advance);
    setShowAdvanceStatusDialog(true);
  };

  const handleUpdateAdvanceAmount = (advance: AdvanceRead) => {
    setAdvanceToUpdateAmount(advance);
    setShowAdvanceAmountDialog(true);
  };

  const handleAdvanceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditingAdvance && editingAdvanceId) {
      updateAdvanceMutation.mutate({
        id: editingAdvanceId,
        payload: advanceFormData,
      });
    } else {
      createAdvanceMutation.mutate(advanceFormData);
    }
    
    setShowAdvanceForm(false);
    setIsEditingAdvance(false);
    setEditingAdvanceId(null);
  };

  const handleAdvanceFormChange = (field: keyof AdvanceCreate, value: string | number) => {
    setAdvanceFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateLeaveDays = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  const columns: ColumnDef<EmployeeRead>[] = [
    {
      accessorKey: "employee_code",
      header: "Employee Code",
      cell: ({ row }) => row.original.employee_code || "-",
    },
    {
      accessorKey: "employee_name",
      header: "Employee Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {row.original.employee_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span title={row.original.employee_name}>
            {truncateText(row.original.employee_name)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <span title={row.original.designation}>
          {truncateText(row.original.designation, 15)}
        </span>
      ),
    },
    {
      accessorKey: "employee_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge className={getEmployeeTypeColor(row.original.employee_type)}>
          {row.original.employee_type.replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "experience_years",
      header: "Experience",
      cell: ({ row }) => (
        row.original.experience_years ? (
          <div className="flex items-center gap-2">
            <Progress
              value={(row.original.experience_years / 20) * 100}
              className="w-16 h-2"
            />
            <span className="text-sm">{row.original.experience_years}y</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      accessorKey: "salary",
      header: "Salary",
      cell: ({ row }) => formatCurrency(row.original.salary),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover-elevate"
            onClick={() => {
              setSelectedEmployee(row.original);
              setNewStatus(row.original.status);
              setShowDetail(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover-elevate"
            onClick={() => handleEditEmployee(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover-elevate text-red-600 hover:text-red-700"
            onClick={() => handleDeleteEmployee(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const statsCards = [
    {
      title: "Total Employees",
      value: employees.length.toString(),
      icon: UserCheck,
      color: "text-blue-600",
    },
    {
      title: "Teaching Staff",
      value: employees
        .filter((e) => e.employee_type === "teaching")
        .length.toString(),
      icon: Award,
      color: "text-green-600",
    },
    {
      title: "Average Salary",
      value: employees.length > 0
        ? formatCurrency(employees.reduce((acc, e) => acc + e.salary, 0) / employees.length)
        : "-",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "On Leave",
      value: employees.filter((e) => e.status === "ON_LEAVE").length.toString(),
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff records, attendance, and payroll information
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-sm text-muted-foreground">
              Showing {employees.length} employees
              {viewMode === "branch" && branchEmployees.length === 0 && instituteEmployees.length > 0 && (
                <span className="text-orange-600 ml-1">
                  (No branch assignments - showing all institute employees)
                </span>
              )}
              <div className="text-xs mt-1">
                Branch: {branchEmployees.length} | Institute: {instituteEmployees.length}
                {employees.length > 10 && (
                  <span className="text-blue-600 ml-2">
                    (Pagination available below)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button 
          className="hover-elevate" 
          data-testid="button-add-employee"
          onClick={activeTab === "employees" ? handleAddEmployee : activeTab === "attendance" ? handleAddAttendance : activeTab === "leaves" ? handleAddLeave : handleAddAdvance}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "employees" ? "Add Employee" : activeTab === "attendance" ? "Add Attendance" : activeTab === "leaves" ? "Add Leave" : "Add Advance"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Employees Table */}
      {error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Failed to load employees: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EnhancedDataTable
          data={employees}
          columns={columns}
          title={isLoading ? "Employees (Loading...)" : "Employees"}
          searchKey="employee_name"
          exportable={true}
        />
      )}

      {/* Detail Drawer/Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">
                    {selectedEmployee.employee_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedEmployee.employee_code || "EMP"} •{" "}
                    {selectedEmployee.designation || "-"}
                  </div>
                </div>
                <Badge className={getStatusColor(selectedEmployee.status)}>
                  {selectedEmployee.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Employee Code:</strong> {selectedEmployee.employee_code}
                </div>
                <div>
                  <strong>Type:</strong> {selectedEmployee.employee_type}
                </div>
                <div>
                  <strong>Experience:</strong>{" "}
                  {selectedEmployee.experience_years ?? "-"} years
                </div>
                <div>
                  <strong>Qualification:</strong> {selectedEmployee.qualification || "-"}
                </div>
                <div>
                  <strong>Mobile:</strong> {selectedEmployee.mobile_no || "-"}
                </div>
                <div>
                  <strong>Email:</strong> {selectedEmployee.email || "-"}
                </div>
                <div>
                  <strong>Joined:</strong> {new Date(selectedEmployee.date_of_joining).toLocaleDateString()}
                </div>
                <div>
                  <strong>Salary:</strong> {formatCurrency(selectedEmployee.salary)}
                </div>
                <div className="col-span-2">
                  <strong>Address:</strong> {selectedEmployee.address || "-"}
                </div>
              </div>

              {/* Employment History */}
              <div className="space-y-2">
                <div className="font-medium">Employment History</div>
                <div className="text-sm bg-muted/50 rounded p-3">
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Joined as {selectedEmployee.designation} on {new Date(selectedEmployee.date_of_joining).toLocaleDateString()}</li>
                    <li>Created on {new Date(selectedEmployee.created_at).toLocaleDateString()}</li>
                    {selectedEmployee.updated_at && (
                      <li>Last updated on {new Date(selectedEmployee.updated_at).toLocaleDateString()}</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Status Change */}
              <div className="space-y-2">
                <div className="font-medium">Update Status</div>
                <div className="flex items-center gap-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="ON_LEAVE">ON_LEAVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={updateStatusMutation.isPending || newStatus === selectedEmployee.status}
                  >
                    {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDetail(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{employeeToDelete?.employee_name}</strong>? 
              This action cannot be undone and will permanently remove the employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteEmployeeMutation.isPending}
            >
              {deleteEmployeeMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Employee Form Dialog */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_name">Employee Name *</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => handleFormChange("employee_name", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee_code">Employee Code *</Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) => handleFormChange("employee_code", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_type">Employee Type *</Label>
                <Select
                  value={formData.employee_type}
                  onValueChange={(value) => handleFormChange("employee_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="non_teaching">Non-Teaching</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleFormChange("designation", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile_no">Mobile Number</Label>
                <Input
                  id="mobile_no"
                  value={formData.mobile_no || ""}
                  onChange={(e) => handleFormChange("mobile_no", e.target.value)}
                  type="tel"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email || ""}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadhar_no">Aadhar Number</Label>
                <Input
                  id="aadhar_no"
                  value={formData.aadhar_no || ""}
                  onChange={(e) => handleFormChange("aadhar_no", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_of_joining">Date of Joining *</Label>
                <Input
                  id="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={(e) => handleFormChange("date_of_joining", e.target.value)}
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification || ""}
                  onChange={(e) => handleFormChange("qualification", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  value={formData.experience_years || 0}
                  onChange={(e) => handleFormChange("experience_years", parseInt(e.target.value) || 0)}
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary *</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleFormChange("salary", parseFloat(e.target.value) || 0)}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleFormChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleFormChange("address", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmployeeForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending || updateEmployeeMutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Employee"
                  : "Add Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          {/* Attendance Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {attendance.length}
                </div>
                <p className="text-xs text-muted-foreground">Attendance records</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {attendance.length > 0 
                    ? Math.round(attendance.reduce((acc, a) => acc + (a.days_present / a.total_working_days * 100), 0) / attendance.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Average attendance rate</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Absences</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {attendance.reduce((acc, a) => acc + a.days_absent, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total absent days</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {attendance.reduce((acc, a) => acc + a.late_arrivals, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total late arrivals</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Attendance Records</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage employee attendance for each month
              </p>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading attendance records...</div>
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found. Click "Add Attendance" to create the first record.
                </div>
              ) : (
                <div className="space-y-4">
                  {attendance.map((record) => {
                    const employee = employees.find(e => e.employee_id === record.employee_id);
                    const attendanceRate = (record.days_present / record.total_working_days) * 100;
                    
                    return (
                      <div key={record.attendance_id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{employee?.employee_name || `Employee ${record.employee_id}`}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.attendance_month).toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={attendanceRate >= 90 ? "default" : attendanceRate >= 75 ? "secondary" : "destructive"}>
                              {attendanceRate.toFixed(1)}% Attendance
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAttendance(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttendance(record)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Working Days:</span>
                            <span className="ml-2 font-medium">{record.total_working_days}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Present:</span>
                            <span className="ml-2 font-medium text-green-600">{record.days_present}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Absent:</span>
                            <span className="ml-2 font-medium text-red-600">{record.days_absent}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Paid Leaves:</span>
                            <span className="ml-2 font-medium text-blue-600">{record.paid_leaves}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Unpaid Leaves:</span>
                            <span className="ml-2 font-medium">{record.unpaid_leaves}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Late Arrivals:</span>
                            <span className="ml-2 font-medium text-orange-600">{record.late_arrivals}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Early Departures:</span>
                            <span className="ml-2 font-medium text-yellow-600">{record.early_departures}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leaves" className="space-y-4">
          {/* Leave Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {leaves.length}
                </div>
                <p className="text-xs text-muted-foreground">Leave requests</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {leaves.filter(l => l.leave_status === "PENDING").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {leaves.filter(l => l.leave_status === "APPROVED").length}
                </div>
                <p className="text-xs text-muted-foreground">Approved requests</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {leaves.filter(l => l.leave_status === "REJECTED").length}
                </div>
                <p className="text-xs text-muted-foreground">Rejected requests</p>
              </CardContent>
            </Card>
          </div>

          {/* Leave Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Leave Requests</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage employee leave requests and approvals
              </p>
            </CardHeader>
            <CardContent>
              {leavesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading leave requests...</div>
                </div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leave requests found. Click "Add Leave" to create the first request.
                </div>
              ) : (
                <div className="space-y-4">
                  {leaves.map((leave) => {
                    const employee = employees.find(e => e.employee_id === leave.employee_id);
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "PENDING": return "bg-yellow-100 text-yellow-800";
                        case "APPROVED": return "bg-green-100 text-green-800";
                        case "REJECTED": return "bg-red-100 text-red-800";
                        default: return "bg-gray-100 text-gray-800";
                      }
                    };
                    
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
                            <Badge className={getStatusColor(leave.leave_status)}>
                              {leave.leave_status}
                            </Badge>
                            {leave.leave_status === "PENDING" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveLeave(leave)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectLeave(leave)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLeave(leave)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLeave(leave)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advances Tab */}
        <TabsContent value="advances" className="space-y-4">
          {/* Advances Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Advances</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {advances.length}
                </div>
                <p className="text-xs text-muted-foreground">Advance requests</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {advances.filter(a => a.status === "PENDING").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {advances.filter(a => a.status === "APPROVED").length}
                </div>
                <p className="text-xs text-muted-foreground">Approved requests</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ₹{advances.reduce((sum, a) => sum + a.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total advance amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Advances Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Advances</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage employee advance requests and approvals
              </p>
            </CardHeader>
            <CardContent>
              {advancesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading advances...</div>
                </div>
              ) : advances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No advances found. Click "Add Advance" to create the first advance.
                </div>
              ) : (
                <div className="space-y-4">
                  {advances.map((advance) => {
                    const employee = employees.find(e => e.employee_id === advance.employee_id);
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "PENDING": return "bg-yellow-100 text-yellow-800";
                        case "APPROVED": return "bg-green-100 text-green-800";
                        case "REJECTED": return "bg-red-100 text-red-800";
                        default: return "bg-gray-100 text-gray-800";
                      }
                    };
                    
                    return (
                      <div key={advance.advance_id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{employee?.employee_name || `Employee ${advance.employee_id}`}</h3>
                            <p className="text-sm text-muted-foreground">
                              Advance ID: {advance.advance_id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(advance.status)}>
                              {advance.status}
                            </Badge>
                            {advance.status === "PENDING" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateAdvanceStatus(advance, "APPROVED")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAdvance(advance)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAdvance(advance)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-medium">₹{advance.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Granted:</span>
                            <span className="ml-2 font-medium">{new Date(advance.granted_at).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Branch ID:</span>
                            <span className="ml-2 font-medium">{advance.branch_id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Form Dialog */}
      <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingAttendance ? "Edit Attendance Record" : "Add Attendance Record"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAttendanceFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_id">Employee *</Label>
                <Select
                  value={attendanceFormData.employee_id.toString()}
                  onValueChange={(value) => handleAttendanceFormChange("employee_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                        {employee.employee_name} ({employee.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="attendance_month">Month *</Label>
                <Input
                  id="attendance_month"
                  type="month"
                  value={attendanceFormData.attendance_month.slice(0, 7)}
                  onChange={(e) => handleAttendanceFormChange("attendance_month", e.target.value + "-01")}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_working_days">Total Working Days *</Label>
                <Input
                  id="total_working_days"
                  type="number"
                  value={attendanceFormData.total_working_days}
                  onChange={(e) => handleAttendanceFormChange("total_working_days", parseInt(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="days_present">Days Present *</Label>
                <Input
                  id="days_present"
                  type="number"
                  value={attendanceFormData.days_present}
                  onChange={(e) => handleAttendanceFormChange("days_present", parseInt(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paid_leaves">Paid Leaves</Label>
                <Input
                  id="paid_leaves"
                  type="number"
                  value={attendanceFormData.paid_leaves}
                  onChange={(e) => handleAttendanceFormChange("paid_leaves", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="unpaid_leaves">Unpaid Leaves</Label>
                <Input
                  id="unpaid_leaves"
                  type="number"
                  value={attendanceFormData.unpaid_leaves}
                  onChange={(e) => handleAttendanceFormChange("unpaid_leaves", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="late_arrivals">Late Arrivals</Label>
                <Input
                  id="late_arrivals"
                  type="number"
                  value={attendanceFormData.late_arrivals}
                  onChange={(e) => handleAttendanceFormChange("late_arrivals", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="early_departures">Early Departures</Label>
                <Input
                  id="early_departures"
                  type="number"
                  value={attendanceFormData.early_departures}
                  onChange={(e) => handleAttendanceFormChange("early_departures", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
              >
                {createAttendanceMutation.isPending || updateAttendanceMutation.isPending
                  ? "Saving..."
                  : isEditingAttendance
                  ? "Update Attendance"
                  : "Add Attendance"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendance Delete Confirmation Dialog */}
      <AlertDialog open={showAttendanceDeleteDialog} onOpenChange={setShowAttendanceDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (attendanceToDelete) {
                  deleteAttendanceMutation.mutate(attendanceToDelete.attendance_id);
                  setShowAttendanceDeleteDialog(false);
                  setAttendanceToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Form Dialog */}
      <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingLeave ? "Edit Leave Request" : "Add Leave Request"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeaveFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leave_employee_id">Employee *</Label>
                <Select
                  value={leaveFormData.employee_id.toString()}
                  onValueChange={(value) => handleLeaveFormChange("employee_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                        {employee.employee_name} ({employee.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="leave_type">Leave Type *</Label>
                <Select
                  value={leaveFormData.leave_type}
                  onValueChange={(value) => handleLeaveFormChange("leave_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="paternity">Paternity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_date">From Date *</Label>
                <Input
                  id="from_date"
                  type="date"
                  value={leaveFormData.from_date}
                  onChange={(e) => {
                    handleLeaveFormChange("from_date", e.target.value);
                    // Auto-calculate total days
                    if (leaveFormData.to_date) {
                      const days = calculateLeaveDays(e.target.value, leaveFormData.to_date);
                      handleLeaveFormChange("total_days", days);
                    }
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="to_date">To Date *</Label>
                <Input
                  id="to_date"
                  type="date"
                  value={leaveFormData.to_date}
                  onChange={(e) => {
                    handleLeaveFormChange("to_date", e.target.value);
                    // Auto-calculate total days
                    if (leaveFormData.from_date) {
                      const days = calculateLeaveDays(leaveFormData.from_date, e.target.value);
                      handleLeaveFormChange("total_days", days);
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_days">Total Days *</Label>
                <Input
                  id="total_days"
                  type="number"
                  value={leaveFormData.total_days}
                  onChange={(e) => handleLeaveFormChange("total_days", parseFloat(e.target.value) || 0)}
                  min="0.5"
                  step="0.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="applied_date">Applied Date *</Label>
                <Input
                  id="applied_date"
                  type="date"
                  value={leaveFormData.applied_date}
                  onChange={(e) => handleLeaveFormChange("applied_date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={leaveFormData.reason}
                onChange={(e) => handleLeaveFormChange("reason", e.target.value)}
                placeholder="Please provide a reason for the leave request..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLeaveForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLeaveMutation.isPending || updateLeaveMutation.isPending}
              >
                {createLeaveMutation.isPending || updateLeaveMutation.isPending
                  ? "Saving..."
                  : isEditingLeave
                  ? "Update Leave"
                  : "Add Leave"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leave Delete Confirmation Dialog */}
      <AlertDialog open={showLeaveDeleteDialog} onOpenChange={setShowLeaveDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this leave request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (leaveToDelete) {
                  deleteLeaveMutation.mutate(leaveToDelete.leave_id);
                  setShowLeaveDeleteDialog(false);
                  setLeaveToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Approve Confirmation Dialog */}
      <AlertDialog open={showLeaveApproveDialog} onOpenChange={setShowLeaveApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this leave request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (leaveToApprove) {
                  approveLeaveMutation.mutate(leaveToApprove.leave_id);
                  setShowLeaveApproveDialog(false);
                  setLeaveToApprove(null);
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Reject Dialog */}
      <AlertDialog open={showLeaveRejectDialog} onOpenChange={setShowLeaveRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this leave request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject_reason">Rejection Reason *</Label>
              <Textarea
                id="reject_reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (leaveToReject && rejectReason.trim()) {
                  rejectLeaveMutation.mutate({
                    id: leaveToReject.leave_id,
                    data: { rejection_reason: rejectReason.trim() }
                  });
                  setShowLeaveRejectDialog(false);
                  setLeaveToReject(null);
                  setRejectReason("");
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectReason.trim()}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advance Form Dialog */}
      <Dialog open={showAdvanceForm} onOpenChange={setShowAdvanceForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingAdvance ? "Edit Advance" : "Add Advance"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdvanceFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch_id">Branch ID</Label>
                <Input
                  id="branch_id"
                  type="number"
                  value={advanceFormData.branch_id}
                  onChange={(e) => handleAdvanceFormChange("branch_id", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="employee_id">Employee</Label>
                <Select
                  value={advanceFormData.employee_id.toString()}
                  onValueChange={(value) => handleAdvanceFormChange("employee_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                        {employee.employee_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={advanceFormData.amount}
                onChange={(e) => handleAdvanceFormChange("amount", parseFloat(e.target.value) || 0)}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvanceForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAdvanceMutation.isPending || updateAdvanceMutation.isPending}
              >
                {createAdvanceMutation.isPending || updateAdvanceMutation.isPending
                  ? "Saving..."
                  : isEditingAdvance
                  ? "Update Advance"
                  : "Add Advance"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Advance Delete Dialog */}
      <AlertDialog open={showAdvanceDeleteDialog} onOpenChange={setShowAdvanceDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this advance? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (advanceToDelete) {
                  // Note: There's no delete mutation in the current hooks, so we'll just close the dialog
                  // You might want to add a delete mutation to the advances hooks
                  setShowAdvanceDeleteDialog(false);
                  setAdvanceToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advance Status Update Dialog */}
      <AlertDialog open={showAdvanceStatusDialog} onOpenChange={setShowAdvanceStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Advance Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the status of this advance?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (advanceToUpdateStatus) {
                  updateAdvanceStatusMutation.mutate({
                    id: advanceToUpdateStatus.advance_id,
                    status: "APPROVED"
                  });
                  setShowAdvanceStatusDialog(false);
                  setAdvanceToUpdateStatus(null);
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advance Amount Update Dialog */}
      <AlertDialog open={showAdvanceAmountDialog} onOpenChange={setShowAdvanceAmountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Amount Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Update the amount paid for this advance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount_paid">Amount Paid (₹)</Label>
              <Input
                id="amount_paid"
                type="number"
                placeholder="Enter amount paid"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (advanceToUpdateAmount) {
                  const amountInput = document.getElementById("amount_paid") as HTMLInputElement;
                  const amountPaid = parseFloat(amountInput?.value || "0");
                  updateAdvanceAmountPaidMutation.mutate({
                    id: advanceToUpdateAmount.advance_id,
                    amount_paid: amountPaid
                  });
                  setShowAdvanceAmountDialog(false);
                  setAdvanceToUpdateAmount(null);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Amount
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default EmployeeManagement;
