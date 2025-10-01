import { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye, Plus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface EmployeeRead {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  email?: string | null;
  phone?: string;
  designation: string;
  department?: string;
  date_of_joining: string;
  salary: number;
  status: string;
  branch_id?: number;
  created_at: string;
  updated_at?: string | null;
}

interface EmployeeTableProps {
  employees: EmployeeRead[];
  isLoading: boolean;
  onAddEmployee: () => void;
  onEditEmployee: (employee: EmployeeRead) => void;
  onDeleteEmployee: (employee: EmployeeRead) => void;
  onViewEmployee: (employee: EmployeeRead) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'INACTIVE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'TERMINATED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const EmployeeTable = ({
  employees,
  isLoading,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployee,
  onUpdateStatus,
}: EmployeeTableProps) => {
  console.log('🔍 EmployeeTable: Received props:', {
    employeesCount: employees?.length || 0,
    isLoading,
    employees: employees?.slice(0, 2) // Show first 2 employees for debugging
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRead | null>(null);

  const filteredEmployees = employees.filter((employee) => {
    const searchMatch = searchTerm === "" || 
      employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const departmentMatch = selectedDepartment === "all" || employee.department === selectedDepartment;
    const statusMatch = selectedStatus === "all" || employee.status === selectedStatus;
    
    return searchMatch && departmentMatch && statusMatch;
  });

  // Debug: Check for duplicate keys
  const employeeIds = filteredEmployees.map(emp => emp.employee_id);
  const uniqueIds = new Set(employeeIds);
  if (employeeIds.length !== uniqueIds.size) {
    console.warn('⚠️ Duplicate employee IDs detected:', {
      total: employeeIds.length,
      unique: uniqueIds.size,
      duplicates: employeeIds.filter((id, index) => employeeIds.indexOf(id) !== index)
    });
  }

  const uniqueDepartments = Array.from(new Set(employees.map(emp => emp.department)));

  const handleDeleteClick = (employee: EmployeeRead) => {
    setEmployeeToDelete(employee);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      onDeleteEmployee(employeeToDelete);
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading employees...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employees</h2>
          <p className="text-muted-foreground">
            Manage employee information and status
          </p>
        </div>
        <Button onClick={onAddEmployee}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {uniqueDepartments.map((department, index) => (
              <SelectItem key={department || `dept-${index}`} value={department || 'N/A'}>
                {department || 'N/A'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="TERMINATED">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee, index) => (
              <TableRow key={employee.employee_id || `employee-${index}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {employee.employee_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.employee_name}</div>
                      <div className="text-sm text-muted-foreground">{employee.email || 'N/A'}</div>
                      {employee.phone && (
                        <div className="text-xs text-muted-foreground">{employee.phone}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {employee.employee_code}
                </TableCell>
                <TableCell>{employee.department || 'N/A'}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{formatCurrency(employee.salary)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewEmployee(employee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditEmployee(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateStatus(employee.employee_id, employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    >
                      {employee.status === 'ACTIVE' ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {filteredEmployees.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Employees</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredEmployees.filter(emp => emp.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredEmployees.filter(emp => emp.status === 'INACTIVE').length}
          </div>
          <div className="text-sm text-muted-foreground">Inactive</div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {employeeToDelete?.employee_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
