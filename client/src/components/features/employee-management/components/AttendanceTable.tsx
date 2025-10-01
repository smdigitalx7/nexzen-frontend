import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  date: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  employee_name?: string;
}

interface AttendanceTableProps {
  attendance: EmployeeAttendanceRead[];
  isLoading: boolean;
  onAddAttendance: () => void;
  onEditAttendance: (attendance: EmployeeAttendanceRead) => void;
  onDeleteAttendance: (id: number) => void;
  onViewAttendance: (attendance: EmployeeAttendanceRead) => void;
}

export const AttendanceTable = ({
  attendance,
  isLoading,
  onAddAttendance,
  onEditAttendance,
  onDeleteAttendance,
  onViewAttendance,
}: AttendanceTableProps) => {
  console.log('🔍 AttendanceTable: Received props:', {
    attendanceCount: attendance?.length || 0,
    isLoading,
    attendance: attendance?.slice(0, 2) // Show first 2 records for debugging
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [attendanceToDelete, setAttendanceToDelete] = useState<EmployeeAttendanceRead | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "LATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HALF_DAY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const searchMatch = searchTerm === "" || 
      (record.employee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = selectedStatus === "all" || record.status === selectedStatus;
    const dateMatch = selectedDate === "" || record.date === selectedDate;
    
    return searchMatch && statusMatch && dateMatch;
  });

  const uniqueStatuses = Array.from(new Set(attendance.map(record => record.status)));

  const handleDeleteClick = (attendance: EmployeeAttendanceRead) => {
    setAttendanceToDelete(attendance);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (attendanceToDelete) {
      onDeleteAttendance(attendanceToDelete.attendance_id);
      setShowDeleteDialog(false);
      setAttendanceToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading attendance records...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attendance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddAttendance} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Attendance
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Records ({filteredAttendance.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance.map((record) => (
                    <TableRow key={record.attendance_id}>
                      <TableCell className="font-medium">
                        {record.employee_name || `Employee ${record.employee_id}`}
                      </TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.notes || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewAttendance(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditAttendance(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(record)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
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
    </div>
  );
};
