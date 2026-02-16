import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/common/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/common/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { ConfirmDialog } from "@/common/components/shared/ConfirmDialog";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  Download,
  RefreshCw,
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
} from "@/features/general/hooks/useAuditLogs";
import { useUsersWithRolesAndBranches } from "@/features/general/hooks/useUsers";
import { DatePicker } from "@/common/components/ui/date-picker";
import { useToast } from "@/common/hooks/use-toast";
import { useExcelExport } from "@/common/utils/export/useExcelExport";
import { getExportFilename } from "@/common/utils/export/excel-export-utils";
import { ExportProgressDialog } from "@/common/components/shared/ExportProgressDialog";
import { ProductionErrorBoundary } from "@/common/components/shared/ProductionErrorBoundary";
import { DataTable } from "@/common/components/shared/DataTable";
import {
  createTextColumn,
  createDateColumn,
  createStatusColumn,
  StatusColors
} from "@/common/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActivitySummary } from "@/features/general/types/audit-logs";
import type { UserWithRolesAndBranches } from "@/features/general/types/users";


// Summary Tab Component
function SummaryTab() {
  const [hoursBack, setHoursBack] = useState<number>(24);
  const [limit, setLimit] = useState<number>(100);
  const [userId, setUserId] = useState<number | null>(null);

  const { data: rawUsersData, isLoading: usersLoading } = useUsersWithRolesAndBranches();
  
  const usersWithRoles = useMemo(() => {
    if (!rawUsersData) return [];
    if (Array.isArray(rawUsersData)) return rawUsersData;
    if (rawUsersData.data && Array.isArray(rawUsersData.data)) return rawUsersData.data;
    return [];
  }, [rawUsersData]);

  const { exportToExcel, isExporting, exportProgress } = useExcelExport();

  // Filter to only show users with ADMIN, ACCOUNTANT, or ACADEMIC roles
  const allowedRoles = ["ADMIN", "ACCOUNTANT", "ACADEMIC"];
  const users = usersWithRoles.filter((user: UserWithRolesAndBranches) =>
    user.roles && user.roles.length > 0 &&
    user.roles.some((role: any) => allowedRoles.includes(role.role_name))
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

  const columns = useMemo((): ColumnDef<ActivitySummary>[] => [
    createTextColumn<ActivitySummary>("user_full_name", { header: "User", fallback: "N/A" }),
    createTextColumn<ActivitySummary>("branch_name", { header: "Branch", fallback: "N/A" }),
    createTextColumn<ActivitySummary>("activity_description", { header: "Activity" }),
    createStatusColumn<ActivitySummary>("category", (status) => {
      switch (status) {
        case "CREATE": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "UPDATE": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "DELETE": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        case "VIEW": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        default: return "bg-gray-100 text-gray-800";
      }
    }, () => null, { header: "Category" }),
    createTextColumn<ActivitySummary>("count_or_amount", { header: "Count/Amount" }),
    createTextColumn<ActivitySummary>("time_ago", { header: "Time Ago" }),
    createDateColumn<ActivitySummary>("changed_at", { header: "Changed At" }),
    createTextColumn<ActivitySummary>("changed_date", { header: "Date" }),
  ], []);

  const exportCSV = async () => {
    // ✅ OPTIMIZED: Use Web Worker for export to prevent UI blocking
    const headers = [
      "User",
      "Branch",
      "Activity",
      "Category",
      "Count/Amount",
      "Time Ago",
      "Changed At",
      "Changed Date",
    ];

    const rows = activitySummaries.map((r) => [
      r.user_full_name || "N/A",
      r.branch_name || "N/A",
      r.activity_description,
      r.category,
      r.count_or_amount,
      r.time_ago,
      r.changed_at,
      r.changed_date,
    ]);

    await exportToExcel({
      headers,
      rows,
      sheetName: "Activity Summary",
      fileName: getExportFilename("activity_summary", "xlsx"),
    });
  };

  // Legacy export function (kept for fallback, but not used)
  const exportCSVLegacy = async () => {
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
      a.download = getExportFilename("activity_summary", "xlsx");
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
      a.download = getExportFilename("activity_summary", "csv");
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
              <label htmlFor="summary-hours-back" className="text-sm font-medium mb-2 block">
                Hours Back
              </label>
              <Select
                value={hoursBack.toString()}
                onValueChange={(value) => setHoursBack(Number(value))}
              >
                <SelectTrigger id="summary-hours-back">
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
              <label htmlFor="summary-limit" className="text-sm font-medium mb-2 block">Limit</label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger id="summary-limit">
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
              <label htmlFor="summary-user" className="text-sm font-medium mb-2 block">
                User (Optional)
              </label>
              <Select
                value={userId?.toString() || "all"}
                onValueChange={(value) =>
                  setUserId(value === "all" ? null : Number(value))
                }
              >
                <SelectTrigger id="summary-user">
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
                className="gap-2"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader.Button size="xs" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={activitySummaries}
        columns={columns as any}
        title="Activity Summaries"
        loading={isLoading}
        searchKey="activity_description"
        export={{ enabled: true, filename: "activity_summary" }}
        showSearch={true}
        emptyMessage="No activity summaries found"
      />
    </div>
  );
}

// Logs Tab Component
function LogsTab() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [limit, setLimit] = useState<number>(25);
  const [offset, setOffset] = useState<number>(0);
  const [selectedAuditIds, setSelectedAuditIds] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const { toast } = useToast();
  const { exportToExcel, isExporting, exportProgress } = useExcelExport();

  const {
    data: readableLogsData,
    isLoading,
    error,
    refetch,
  } = useReadableLogs({
    start_date: startDate || null,
    end_date: endDate || null,
    limit,
    offset,
  });

  // Ensure readableLogs is always an array and extract pagination info
  const { logs, totalCount, currentPageProps } = useMemo(() => {
    const raw: any = readableLogsData;
    if (!raw) return { logs: [], totalCount: 0, currentPageProps: 1 };

    // Handle Case 1: Standardized AuditLogPaginatedResponse { data: [...], total_count: ... }
    if (raw.data && Array.isArray(raw.data)) {
      return {
        logs: raw.data,
        totalCount: raw.total_count || 0,
        currentPageProps: Math.floor(offset / limit) + 1
      };
    }

    // Handle Case 2: Direct array (legacy fallback)
    if (Array.isArray(raw)) {
      return {
        logs: raw,
        totalCount: raw.length,
        currentPageProps: 1
      };
    }

    return { logs: [], totalCount: 0, currentPageProps: 1 };
  }, [readableLogsData, offset, limit]);

  const columns = useMemo((): ColumnDef<any>[] => [
    createTextColumn("audit_id", { header: "Audit ID", className: "font-mono text-xs" }),
    createStatusColumn("operation_type", (status) => {
      switch (status) {
        case "INSERT": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "UPDATE": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "DELETE": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        case "SELECT": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        default: return "bg-gray-100 text-gray-800";
      }
    }, () => null, { header: "Operation" }),
    createTextColumn("branch_name", { header: "Branch", fallback: "N/A" }),
    createTextColumn("description", { header: "Description", className: "max-w-md truncate" }),
  ], []);

  const actions = useMemo(() => [
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: (row: any) => {
        setSelectedAuditIds([row.audit_id]);
        setShowDeleteDialog(true);
      }
    }
  ], []);

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
    try {
      if (selectedAuditIds.length > 0) {
        // Specific records delete
        await deleteLogsByIdsMutation.mutateAsync({
          audit_ids: selectedAuditIds,
          confirm_deletion: true,
        });

        // ✅ Only export Excel after successful deletion
        const selectedLogs = logs.filter((log: any) =>
          selectedAuditIds.includes(log.audit_id)
        );
        if (selectedLogs.length > 0) {
          await exportCSV(selectedLogs);
        }

        // Reset offset if current page might be empty after deletion
        if (offset > 0 && logs.length <= selectedAuditIds.length) {
          setOffset(0);
        }
      } else if (startDate && endDate) {
        // Range delete
        // Check if dates are within last 7 days (re-validation for safety)
        const start = new Date(startDate);
        const min = new Date(minDate);
        if (start >= min) {
          toast({
            title: "Invalid Date Range",
            description: "Cannot delete logs from the last 7 days.",
            variant: "destructive",
          });
          return; // Exit if validation fails
        }

        await deleteLogsMutation.mutateAsync({
          start_date: startDate,
          end_date: endDate,
          confirm_deletion: true,
        });
      }

      setSelectedAuditIds([]);
      setShowDeleteDialog(false);

      // Force refresh
      setRefreshKey((prev) => prev + 1);
      setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error("Delete failed:", error);
      // Error message is shown by mutation hook's onError
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

  const handlePageChange = (page: number) => {
    setOffset((page - 1) * limit);
    setSelectedAuditIds([]);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setOffset(0);
    setSelectedAuditIds([]);
  };

  const exportCSV = async (logsToExport?: any[]) => {
    // ✅ OPTIMIZED: Use Web Worker for export to prevent UI blocking
    const headers = [
      "Audit ID",
      "Operation Type",
      "Branch Name",
      "Description",
    ];

    const dataToExport = logsToExport || logs;
    const rows = dataToExport.map((log: any) => [
      log.audit_id,
      log.operation_type,
      log.branch_name || "N/A",
      log.description,
    ]);

    await exportToExcel({
      headers,
      rows,
      sheetName: "Audit Logs",
      fileName: getExportFilename("audit_logs", "xlsx"),
    });
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
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setLimit(25);
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
                  <Loader.Button size="xs" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => exportCSV()}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader.Button size="xs" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
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

      <DataTable
        data={logs}
        columns={columns as any}
        title="Audit Logs"
        loading={isLoading}
        searchKey="description"
        export={{ enabled: true, filename: "audit_logs" }}
        showSearch={true}
        selectable={true}
        onSelectionChange={(rows) => setSelectedAuditIds(rows.map((r: any) => r.audit_id))}
        pagination="server"
        currentPage={currentPageProps}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        pageSize={limit}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100, 250]}
        toolbarRightContent={
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleDeleteClick}
            disabled={selectedAuditIds.length === 0 && (!startDate || !endDate)}
          >
            <Trash2 className="h-4 w-4" />
            {selectedAuditIds.length > 0 ? `Delete (${selectedAuditIds.length})` : "Delete by Range"}
          </Button>
        }
      />

      {/* Export Progress Dialog */}
      <ExportProgressDialog
        open={isExporting}
        progress={exportProgress?.progress || 0}
        status={exportProgress?.status || 'processing'}
        message={exportProgress?.message}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Audit Logs"
        description={
          selectedAuditIds.length > 0
            ? `Are you sure you want to delete ${selectedAuditIds.length} selected audit log(s)? This action cannot be undone.`
            : `Are you sure you want to delete audit logs from ${startDate} to ${endDate}? This action cannot be undone.`
        }
        confirmText="Confirm Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteLogsMutation.isPending || deleteLogsByIdsMutation.isPending}
      />
    </div>
  );
}

// Main Component
export default function AuditLog() {
  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error('AuditLog Error Boundary caught error:', error, errorInfo);
      }}
      showDetails={false}
      enableRetry={true}
    >
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
    </ProductionErrorBoundary>
  );
}
