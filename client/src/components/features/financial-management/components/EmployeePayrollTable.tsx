import { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Eye, Download, Search, Filter } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PayrollRead } from "@/lib/types/payrolls";

interface EmployeePayrollTableProps {
  payrolls: PayrollRead[];
  isLoading: boolean;
  onEditPayroll: (payroll: PayrollRead) => void;
  onViewPayslip: (payroll: PayrollRead) => void;
  onUpdateStatus: (id: number, status: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const EmployeePayrollTable = ({
  payrolls,
  isLoading,
  onEditPayroll,
  onViewPayslip,
  onUpdateStatus,
  formatCurrency,
  getStatusColor,
  getStatusText,
}: EmployeePayrollTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = 
      payroll.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.employee_id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || payroll.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Payrolls</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayrolls.map((payroll) => (
                  <TableRow key={payroll.payroll_id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{payroll.employee_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {payroll.employee_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payroll.payroll_month}/{payroll.payroll_year}
                    </TableCell>
                    <TableCell>{formatCurrency(payroll.gross_pay)}</TableCell>
                    <TableCell>
                      {formatCurrency((payroll.lop || 0) + (payroll.advance_deduction || 0) + (payroll.other_deductions || 0))}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payroll.net_salary)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(payroll.status)} text-white border-0`}
                      >
                        {getStatusText(payroll.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewPayslip(payroll)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPayroll(payroll)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateStatus(payroll.payroll_id, "PAID")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
