import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface StudentFeeBalance {
  id: number;
  student_id: string;
  student_name: string;
  class_name: string;
  academic_year: string;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  admission_paid: boolean;
  books_paid: boolean;
  term_1_paid: boolean;
  term_2_paid: boolean;
  term_3_paid: boolean;
  transport_paid: boolean;
  last_payment_date: string;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
}

interface StudentFeeBalancesTableProps {
  studentBalances: StudentFeeBalance[];
  onViewStudent: (student: StudentFeeBalance) => void;
  onExportCSV: () => void;
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
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'OUTSTANDING':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const StudentFeeBalancesTable = ({
  studentBalances,
  onViewStudent,
  onExportCSV,
}: StudentFeeBalancesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredBalances = studentBalances.filter((student) => {
    const searchMatch = searchTerm === "" || 
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const classMatch = selectedClass === "all" || student.class_name === selectedClass;
    const statusMatch = selectedStatus === "all" || student.status === selectedStatus;
    
    return searchMatch && classMatch && statusMatch;
  });

  const uniqueClasses = Array.from(new Set(studentBalances.map(s => s.class_name)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Fee Balances</h2>
          <p className="text-muted-foreground">
            Track individual student fee payments and outstanding amounts
          </p>
        </div>
        <Button onClick={onExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {uniqueClasses.map((className) => (
              <SelectItem key={className} value={className}>
                {className}
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
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="OUTSTANDING">Outstanding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Total Fee</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBalances.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-mono text-sm">
                  {student.student_id}
                </TableCell>
                <TableCell className="font-medium">
                  {student.student_name}
                </TableCell>
                <TableCell>{student.class_name}</TableCell>
                <TableCell>{formatCurrency(student.total_fee)}</TableCell>
                <TableCell className="text-green-600">
                  {formatCurrency(student.paid_amount)}
                </TableCell>
                <TableCell className="text-red-600 font-bold">
                  {formatCurrency(student.outstanding_amount)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(student.last_payment_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewStudent(student)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(
              filteredBalances.reduce((sum, s) => sum + s.paid_amount, 0)
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Collected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(
              filteredBalances.reduce((sum, s) => sum + s.outstanding_amount, 0)
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Outstanding</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {filteredBalances.length}
          </div>
          <div className="text-sm text-muted-foreground">Students</div>
        </div>
      </div>
    </motion.div>
  );
};
