import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Eye, Search as SearchIcon } from "lucide-react";
import { useSchoolAdmissions } from "@/features/school/hooks";
import { toast } from "@/common/hooks/use-toast";
import { exportAdmissionsToExcel } from "@/common/utils/export/admissionsExport";
import type { SchoolAdmissionListItem } from "@/features/school/types/admissions";
import { DataTable } from "@/common/components/shared";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { useNavigate } from "react-router-dom";

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const getStatusBadgeVariant = (status: string) => {
    if (status === "PAID") return "secondary";
    if (status === "PENDING") return "default";
    return "destructive";
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

const AdmissionsListComponent = () => {
  const navigate = useNavigate();
  // Server-side pagination (minimum page size 25)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // Reset to page 1 on search
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data: admissionsResp, isLoading } = useSchoolAdmissions({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
  });

  // ✅ FIX: Handle multiple response formats:
  // 1. Direct array: [{...}, {...}]
  // 2. Object with 'admissions' property: {admissions: [...], total_pages: ...}
  // 3. Object with 'data' property: {data: [...], total_pages: ...}
  const admissions = useMemo(() => {
    if (!admissionsResp) return [];
    if (Array.isArray(admissionsResp)) return admissionsResp;
    return admissionsResp.data || admissionsResp.admissions || [];
  }, [admissionsResp]);
  
  // ✅ FIX: Extract pagination metadata - handle both direct array and paginated object
  const paginationMeta = useMemo(() => {
    if (!admissionsResp) return { total_pages: 1, total_count: 0, current_page: 1, page_size: pageSize };
    
    if (Array.isArray(admissionsResp)) {
      return {
        total_pages: Math.ceil(admissionsResp.length / pageSize) || 1,
        total_count: admissionsResp.length,
        current_page: currentPage,
        page_size: pageSize,
      };
    }

    return {
      total_pages: admissionsResp.total_pages ?? 1,
      total_count: admissionsResp.total_count ?? admissions.length,
      current_page: admissionsResp.current_page ?? currentPage,
      page_size: admissionsResp.page_size ?? pageSize,
    };
  }, [admissionsResp, admissions.length, currentPage, pageSize]);

  // Memoized handlers
  const handleViewDetails = useCallback((admission: SchoolAdmissionListItem) => {
    navigate(`/school/admissions/${admission.student_id}`);
  }, [navigate]);

  const handleExportAll = useCallback(async () => {
    try {
      await exportAdmissionsToExcel(admissions, "School_Admissions");
      toast({
        title: "Export Successful",
        description: `Exported ${admissions.length} admissions to Excel`,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: error?.message || "Failed to export admissions to Excel",
        variant: "destructive",
      });
    }
  }, [admissions]);

  // Action configurations for DataTable V2
  const actions: ActionConfig<SchoolAdmissionListItem>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row) => handleViewDetails(row),
      showLabel: true,
    }
  ], [handleViewDetails]);

  // Column definitions for the enhanced table
  const columns: ColumnDef<SchoolAdmissionListItem>[] = useMemo(() => [
    {
      accessorKey: "admission_no",
      header: "Admission No",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("admission_no")}</span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => <span>{row.getValue("student_name")}</span>,
    },
    {
      accessorKey: "class_name",
      header: "Class",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("class_name")}</Badge>
      ),
    },
    {
      accessorKey: "admission_date",
      header: "Admission Date",
      cell: ({ row }) => <span>{row.getValue("admission_date")}</span>,
    },
    {
      accessorKey: "admission_fee_paid",
      header: "Admission Fee",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("admission_fee_paid")} />
      ),
    },
    {
      accessorKey: "payable_tuition_fee",
      header: "Tuition Fee",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.getValue("payable_tuition_fee")}</span>
      ),
    },
    {
      accessorKey: "payable_transport_fee",
      header: "Transport Fee",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.getValue("payable_transport_fee")}</span>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <DataTable
        data={admissions}
        columns={columns}
        title="Student Admissions"
        loading={isLoading}
        showSearch={false}
        searchPlaceholder="Search by admission no or student name..."
        toolbarLeftContent={
          <div className="w-full sm:flex-1 min-w-0">
            <Input
              placeholder="Search by admission no or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full"
              leftIcon={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        }
        export={{ enabled: true, onExport: handleExportAll }}
        actions={actions}
        actionsHeader="Actions"
        pagination="server"
        currentPage={paginationMeta.current_page}
        totalCount={paginationMeta.total_count}
        pageSize={paginationMeta.page_size}
        pageSizeOptions={[25, 50, 100]}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setCurrentPage(1);
        }}
        className="w-full"
      />
    </div>
  );
};

export default AdmissionsListComponent;
