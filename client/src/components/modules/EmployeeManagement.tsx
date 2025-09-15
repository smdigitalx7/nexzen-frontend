import { useState } from "react";
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

// Mock employee data - TODO: remove mock functionality
const mockEmployees = [
  {
    employee_id: "1",
    employee_name: "Dr. Rajesh Kumar",
    employee_code: "EMP001",
    employee_type: "teaching",
    designation: "Principal",
    qualification: "M.Ed, Ph.D",
    experience_years: 15,
    mobile_no: "+91-9876543220",
    email: "rajesh@nexzen.edu",
    salary: "75000",
    status: "ACTIVE",
    date_of_joining: "2020-06-01",
  },
  {
    employee_id: "2",
    employee_name: "Mrs. Priya Sharma",
    employee_code: "EMP002",
    employee_type: "teaching",
    designation: "Mathematics Teacher",
    qualification: "M.Sc Mathematics, B.Ed",
    experience_years: 8,
    mobile_no: "+91-9876543221",
    email: "priya@nexzen.edu",
    salary: "45000",
    status: "ACTIVE",
    date_of_joining: "2021-03-15",
  },
  {
    employee_id: "3",
    employee_name: "Mr. Arun Patel",
    employee_code: "EMP003",
    employee_type: "non_teaching",
    designation: "Administrator",
    qualification: "MBA",
    experience_years: 12,
    mobile_no: "+91-9876543222",
    email: "arun@nexzen.edu",
    salary: "55000",
    status: "ACTIVE",
    date_of_joining: "2020-08-20",
  },
  {
    employee_id: "4",
    employee_name: "Ms. Kavitha Nair",
    employee_code: "EMP004",
    employee_type: "teaching",
    designation: "English Teacher",
    qualification: "M.A English, B.Ed",
    experience_years: 6,
    mobile_no: "+91-9876543223",
    email: "kavitha@nexzen.edu",
    salary: "40000",
    status: "ON_LEAVE",
    date_of_joining: "2022-01-10",
  },
];

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");

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

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(parseInt(amount));
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "employee_code",
      header: "Employee Code",
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
        <div className="flex items-center gap-2">
          <Progress
            value={(row.original.experience_years / 20) * 100}
            className="w-16 h-2"
          />
          <span className="text-sm">{row.original.experience_years}y</span>
        </div>
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
          >
            <Edit className="h-4 w-4" />
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
      value: formatCurrency(
        (
          employees.reduce((acc, e) => acc + parseInt(e.salary), 0) /
          employees.length
        ).toString()
      ),
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
        </div>
        <Button className="hover-elevate" data-testid="button-add-employee">
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
      <EnhancedDataTable
        data={employees}
        columns={columns}
        title="Employees"
        searchKey="employee_name"
        exportable={true}
        selectable={true}
      />

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
                    {selectedEmployee.employee_code} •{" "}
                    {selectedEmployee.designation}
                  </div>
                </div>
                <Badge className={getStatusColor(selectedEmployee.status)}>
                  {selectedEmployee.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Type:</strong> {selectedEmployee.employee_type}
                </div>
                <div>
                  <strong>Experience:</strong>{" "}
                  {selectedEmployee.experience_years} years
                </div>
                <div>
                  <strong>Mobile:</strong> {selectedEmployee.mobile_no}
                </div>
                <div>
                  <strong>Email:</strong> {selectedEmployee.email}
                </div>
                <div>
                  <strong>Joined:</strong> {selectedEmployee.date_of_joining}
                </div>
                <div>
                  <strong>Salary:</strong>{" "}
                  {formatCurrency(selectedEmployee.salary)}
                </div>
              </div>

              {/* Employment History (mock) */}
              <div className="space-y-2">
                <div className="font-medium">Employment History</div>
                <div className="text-sm bg-muted/50 rounded p-3">
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Promoted to {selectedEmployee.designation} (2023)</li>
                    <li>Annual increment applied (2024)</li>
                    <li>
                      Joined institution ({selectedEmployee.date_of_joining})
                    </li>
                  </ul>
                </div>
              </div>

              {/* Status Change */}
              <div className="space-y-2">
                <div className="font-medium">Status</div>
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
                    onClick={() => {
                      setEmployees((prev) =>
                        prev.map((e) =>
                          e.employee_id === selectedEmployee.employee_id
                            ? { ...e, status: newStatus }
                            : e
                        )
                      );
                      setShowDetail(false);
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default EmployeeManagement;
