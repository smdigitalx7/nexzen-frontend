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
import { useEmployeesByBranch, useEmployeesByInstitute, useDeleteEmployee, useUpdateEmployeeStatus, useCreateEmployee, useUpdateEmployee } from "@/lib/hooks/useEmployees";
import { EmployeeRead, EmployeeCreate, EmployeeUpdate } from "@/lib/types/employees";

const EmployeeManagement = () => {
  const [viewMode, setViewMode] = useState<"branch" | "institute">("branch");
  
  const { data: branchEmployees = [], isLoading: branchLoading, error: branchError } = useEmployeesByBranch();
  const { data: instituteEmployees = [], isLoading: instituteLoading, error: instituteError } = useEmployeesByInstitute();
  
  // Use the selected view mode
  const employees = viewMode === "branch" ? branchEmployees : instituteEmployees;
  const isLoading = viewMode === "branch" ? branchLoading : instituteLoading;
  const error = viewMode === "branch" ? branchError : instituteError;
  const deleteEmployeeMutation = useDeleteEmployee();
  const updateStatusMutation = useUpdateEmployeeStatus();
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRead | null>(null);
  
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
            <div className="flex items-center gap-2">
              <Label htmlFor="view-mode" className="text-sm">View:</Label>
              <Select value={viewMode} onValueChange={(value: "branch" | "institute") => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branch">Branch Only</SelectItem>
                  <SelectItem value="institute">All Institute</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          onClick={handleAddEmployee}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

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
    </motion.div>
  );
};

export default EmployeeManagement;
