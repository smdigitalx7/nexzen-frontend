import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Download,
  RefreshCw,
  Loader2,
  Trash2,
  ChevronLeft,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  useActivitySummary,
  useReadableLogs,
  useDeleteLogs,
  useDeleteLogsByIds,
} from "@/lib/hooks/general/useAuditLogs";
import { useUsersWithRolesAndBranches } from "@/lib/hooks/general/useUsers";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";

// Summary Tab Component
function SummaryTab() {
  const [hoursBack, setHoursBack] = useState<number>(24);
  const [limit, setLimit] = useState<number>(100);
  const [userId, setUserId] = useState<number | null>(null);

  const { data: usersWithRoles = [], isLoading: usersLoading } = useUsersWithRolesAndBranches();
  
  // Filter to only show users with ADMIN, ACCOUNTANT, or ACADEMIC roles
  const allowedRoles = ["ADMIN", "ACCOUNTANT", "ACADEMIC"];
  const users = usersWithRoles.filter(user => 
    user.roles && user.roles.length > 0 && 
    user.roles.some(role => allowedRoles.includes(role.role_name))
  );
  const {
    data: activitySummaries = [],
    isLoading,
    error,
    refetch,
  } = useActivitySummary({
    hours_back: hoursBack,
    limit: limit,
    user_id: userId || undefined,
  });

  const exportCSV = async () => {
    try {
      // Try to use ExcelJS for better Excel formatting
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Velocity ERP";
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet("Activity Summary");

      // Header row with styling
      const headerRow = worksheet.addRow([
        "User",
        "Branch",
        "Activity",
        "Category",
        "Count/Amount",
        "Time Ago",
        "Changed At",
        "Changed Date",
      ]);
      headerRow.font = { bold: true, size: 12 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2C3E50" },
      };
      headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;

      // Data rows
      activitySummaries.forEach((r) => {
        const row = worksheet.addRow([
          r.user_full_name || "N/A",
          r.branch_name || "N/A",
          r.activity_description,
          r.category,
          r.count_or_amount,
          r.time_ago,
          r.changed_at,
          r.changed_date,
        ]);
        row.alignment = { vertical: "middle" };
      });

      // Set column widths
      worksheet.getColumn(1).width = 20; // User
      worksheet.getColumn(2).width = 20; // Branch
      worksheet.getColumn(3).width = 40; // Activity
      worksheet.getColumn(4).width = 15; // Category
      worksheet.getColumn(5).width = 15; // Count/Amount
      worksheet.getColumn(6).width = 15; // Time Ago
      worksheet.getColumn(7).width = 20; // Changed At
      worksheet.getColumn(8).width = 15; // Changed Date

      // Add borders to all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_summary_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback to CSV if ExcelJS is not available
      console.warn("ExcelJS not available, falling back to CSV", error);
      const rows = [
        [
          "User",
          "Branch",
          "Activity",
          "Category",
          "Count/Amount",
          "Time Ago",
          "Changed At",
          "Changed Date",
        ],
        ...activitySummaries.map((r) => [
          r.user_full_name || "N/A",
          r.branch_name || "N/A",
          r.activity_description,
          r.category,
          r.count_or_amount,
          r.time_ago,
          r.changed_at,
          r.changed_date,
        ]),
      ];
      const csv = rows
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_summary_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CREATE:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      VIEW: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category.toUpperCase()] || "bg-muted text-muted-foreground";
  };

  const getHoursBackLabel = (hours: number): string => {
    const hourLabels: Record<number, string> = {
      1: "1 hour",
      6: "6 hours",
      12: "12 hours",
      24: "24 hours",
      48: "48 hours",
      168: "1 week",
      720: "30 days",
    };
    return hourLabels[hours] || `${hours} hours`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Hours Back
              </label>
              <Select
                value={hoursBack.toString()}
                onValueChange={(value) => setHoursBack(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last Hour</SelectItem>
                  <SelectItem value="6">Last 6 Hours</SelectItem>
                  <SelectItem value="12">Last 12 Hours</SelectItem>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="48">Last 48 Hours</SelectItem>
                  <SelectItem value="168">Last Week</SelectItem>
                  <SelectItem value="720">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Limit</label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 records</SelectItem>
                  <SelectItem value="25">25 records</SelectItem>
                  <SelectItem value="50">50 records</SelectItem>
                  <SelectItem value="75">75 records</SelectItem>
                  <SelectItem value="100">100 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                User (Optional)
              </label>
              <Select
                value={userId?.toString() || "all"}
                onValueChange={(value) =>
                  setUserId(value === "all" ? null : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {usersLoading ? (
                    <SelectItem value="loading" disabled>Loading users...</SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()}>
                        {user.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setUserId(null);
                  setHoursBack(24);
                  setLimit(100);
                }}
              >
                Reset Filters
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" className="gap-2" onClick={exportCSV}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Summaries</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : error
                ? "Error loading activity summaries"
                : `${activitySummaries.length} records`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load activity summaries</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : activitySummaries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>
                No activity summaries found for {getHoursBackLabel(hoursBack)}
                {userId ? ` for user ID ${userId}` : ""}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Count/Amount</TableHead>
                    <TableHead>Time Ago</TableHead>
                    <TableHead>Changed At</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitySummaries.map((activity, index) => (
                    <TableRow
                      key={`${activity.user_id}-${activity.changed_at}-${index}`}
                    >
                      <TableCell className="font-medium">
                        {activity.user_full_name || "N/A"}
                      </TableCell>
                      <TableCell>{activity.branch_name || "N/A"}</TableCell>
                      <TableCell>{activity.activity_description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getCategoryColor(activity.category)}
                        >
                          {activity.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.count_or_amount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {activity.time_ago}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(activity.changed_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {activity.changed_date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Logs Tab Component
function LogsTab() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);
  const [offset, setOffset] = useState<number>(0);
  const [selectedAuditIds, setSelectedAuditIds] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { toast } = useToast();

  const {
    data: readableLogs = [],
    isLoading,
    error,
    refetch,
  } = useReadableLogs({
    start_date: startDate || null,
    end_date: endDate || null,
    limit,
    offset,
  });

  const deleteLogsMutation = useDeleteLogs();
  const deleteLogsByIdsMutation = useDeleteLogsByIds();

  // Calculate minimum date (7 days ago)
  const minDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  }, []);

  const handleDeleteClick = () => {
    // If audit IDs are selected, show confirmation dialog
    if (selectedAuditIds.length > 0) {
      setShowDeleteDialog(true);
      return;
    }

    // Otherwise, validate date range
    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates, or select audit logs to delete.",
        variant: "destructive",
      });
      return;
    }

    // Check if dates are within last 7 days
    const start = new Date(startDate);
    const min = new Date(minDate);
    if (start >= min) {
      toast({
        title: "Invalid Date Range",
        description: "Cannot delete logs from the last 7 days.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    // If audit IDs are selected, export selected logs first, then delete
    if (selectedAuditIds.length > 0) {
      // Export selected logs before deletion
      const selectedLogs = readableLogs.filter((log) =>
        selectedAuditIds.includes(log.audit_id)
      );
      if (selectedLogs.length > 0) {
        await exportCSV(selectedLogs);
      }

      try {
        await deleteLogsByIdsMutation.mutateAsync({
          audit_ids: selectedAuditIds,
          confirm_deletion: true,
        });
        setShowDeleteDialog(false);
        setSelectedAuditIds([]);
        refetch();
      } catch (error) {
        // Error handled by mutation hook
      }
      return;
    }

    // Otherwise, use date range deletion - export all visible logs first
    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates, or select audit logs to delete.",
        variant: "destructive",
      });
      return;
    }

    // Check if dates are within last 7 days
    const start = new Date(startDate);
    const min = new Date(minDate);
    if (start >= min) {
      toast({
        title: "Invalid Date Range",
        description: "Cannot delete logs from the last 7 days.",
        variant: "destructive",
      });
      return;
    }

    // Export all visible logs before deletion
    if (readableLogs.length > 0) {
      await exportCSV(readableLogs);
    }

    try {
      await deleteLogsMutation.mutateAsync({
        start_date: startDate,
        end_date: endDate,
        confirm_deletion: true,
      });
      setShowDeleteDialog(false);
      setSelectedAuditIds([]);
      refetch();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const getOperationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INSERT:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      SELECT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[type.toUpperCase()] || "bg-muted text-muted-foreground";
  };

  const toggleAuditIdSelection = (auditId: number) => {
    setSelectedAuditIds((prev) =>
      prev.includes(auditId)
        ? prev.filter((id) => id !== auditId)
        : [...prev, auditId]
    );
  };

  // Pagination calculations
  const currentPage = Math.floor(offset / limit) + 1;
  const hasMorePages = readableLogs.length === limit;
  const hasPreviousPage = offset > 0;

  const handleNextPage = () => {
    if (hasMorePages) {
      setOffset(offset + limit);
      setSelectedAuditIds([]); // Clear selection when changing pages
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setOffset(Math.max(0, offset - limit));
      setSelectedAuditIds([]); // Clear selection when changing pages
    }
  };

  const exportCSV = async (logsToExport?: typeof readableLogs) => {
    const logs = logsToExport || readableLogs;
    
    try {
      // Try to use ExcelJS for better Excel formatting
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Velocity ERP";
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet("Audit Logs");

      // Header row with styling
      const headerRow = worksheet.addRow([
        "Audit ID",
        "Operation Type",
        "Branch Name",
        "Description",
      ]);
      headerRow.font = { bold: true, size: 12 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2C3E50" },
      };
      headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 25;

      // Data rows
      logs.forEach((log) => {
        const row = worksheet.addRow([
          log.audit_id,
          log.operation_type,
          log.branch_name,
          log.description,
        ]);
        row.alignment = { vertical: "middle" };
      });

      // Set column widths
      worksheet.getColumn(1).width = 12; // Audit ID
      worksheet.getColumn(2).width = 18; // Operation Type
      worksheet.getColumn(3).width = 20; // Branch Name
      worksheet.getColumn(4).width = 80; // Description

      // Add borders to all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      a.download = `audit_logs_${timestamp}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback to CSV if ExcelJS is not available
      console.warn("ExcelJS not available, falling back to CSV", error);
      const rows = [
        ["Audit ID", "Operation Type", "Branch", "Description"],
        ...logs.map((log) => [
          log.audit_id,
          log.operation_type,
          log.branch_name,
          log.description,
        ]),
      ];
      const csv = rows
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      a.download = `audit_logs_${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <DatePicker
                id="start_date"
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <DatePicker
                id="end_date"
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
              />
            </div>
            <div>
              <Label htmlFor="limit">Limit</Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setOffset(0);
                }}
              >
                <SelectTrigger id="limit">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 records</SelectItem>
                  <SelectItem value="25">25 records</SelectItem>
                  <SelectItem value="50">50 records</SelectItem>
                  <SelectItem value="75">75 records</SelectItem>
                  <SelectItem value="100">100 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setLimit(100);
                  setOffset(0);
                  setSelectedAuditIds([]);
                }}
              >
                Reset
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="gap-2" onClick={() => exportCSV()}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          {selectedAuditIds.length === 0 && (!startDate || !endDate) && (
            <div className="mt-4">
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Please select audit logs using checkboxes, or select both <strong>Start Date</strong> and <strong>End Date</strong> to delete logs.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {selectedAuditIds.length > 0 && (
            <div className="mt-4">
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>{selectedAuditIds.length}</strong> audit log(s) selected. Click "Preview & Delete" to proceed.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading..."
                  : error
                    ? "Error loading audit logs"
                    : `Showing ${readableLogs.length} record${readableLogs.length !== 1 ? "s" : ""} (Page ${currentPage})`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleDeleteClick}
                        disabled={
                          (selectedAuditIds.length === 0 && (!startDate || !endDate)) ||
                          deleteLogsMutation.isPending ||
                          deleteLogsByIdsMutation.isPending ||
                          isLoading
                        }
                      >
                        {(deleteLogsMutation.isPending || deleteLogsByIdsMutation.isPending) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {selectedAuditIds.length === 0 && (!startDate || !endDate) && (
                    <TooltipContent>
                      <p>Please select audit logs or select both Start Date and End Date to delete logs</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load audit logs</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : readableLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Audit ID</TableHead>
                    <TableHead>Operation Type</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readableLogs.map((log) => (
                    <TableRow key={log.audit_id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedAuditIds.includes(log.audit_id)}
                          onChange={() => toggleAuditIdSelection(log.audit_id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.audit_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getOperationTypeColor(log.operation_type)}
                        >
                          {log.operation_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.branch_name}</TableCell>
                      <TableCell className="max-w-md">
                        {log.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {/* Pagination */}
        {!isLoading && !error && readableLogs.length > 0 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1} to {offset + readableLogs.length} of
                records
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousPage || isLoading}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm font-medium">
                        Page {currentPage}
                      </span>
                    </div>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!hasMorePages || isLoading}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Confirm Deletion"
        description={
          <>
            {selectedAuditIds.length > 0 ? (
              <>
                Are you sure you want to delete <strong>{selectedAuditIds.length}</strong> selected audit
                log(s)? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete audit logs from <strong>{startDate}</strong> to <strong>{endDate}</strong>?
                This action cannot be undone.
              </>
            )}
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteLogsMutation.isPending || deleteLogsByIdsMutation.isPending}
        loadingText="Deleting..."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

// Main Component
export default function AuditLog() {
  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            View and manage audit log entries
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-6">
          <SummaryTab />
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
