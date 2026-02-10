import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import {
  Search,
  Eye,
} from "lucide-react";
import { DataTable } from "@/common/components/shared/DataTable";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { useCollegeAdmissions } from "@/features/college/hooks";
import { toast } from "@/common/hooks/use-toast";
import {
  exportAdmissionsToExcel,
} from "@/common/utils/export/admissionsExport";
import type { CollegeAdmissionListItem } from "@/features/college/types/admissions";
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

const AdmissionsList = () => {
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
    setCurrentPage(1);
  }, [debouncedSearch]);

  const navigate = useNavigate();

  const { data: admissionsResp, isLoading } = useCollegeAdmissions({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
  });
  const admissions = useMemo(() => admissionsResp?.data ?? [], [admissionsResp?.data]);

  // Memoized handlers
  const handleViewDetails = useCallback(
    (admission: CollegeAdmissionListItem) => {
      navigate(`/college/admissions/${admission.student_id}`);
    },
    [navigate]
  );

  const handleExportAll = useCallback(async () => {
    try {
      await exportAdmissionsToExcel(admissions as any, "College_Admissions");
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

  // Payment and receipt handling are now managed in the dedicated admission details page.

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions: ActionConfig<CollegeAdmissionListItem>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row) => handleViewDetails(row),
      showLabel: true,
    },
  ], [handleViewDetails]);

  // Column definitions
  const columns: ColumnDef<CollegeAdmissionListItem>[] = useMemo(() => [
    {
      accessorKey: "admission_no",
      header: "Admission No",
      cell: ({ row }) => (
        <span className="font-medium text-blue-600 truncate block max-w-[120px]">
          {row.getValue("admission_no") || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => <span className="font-semibold">{row.getValue("student_name")}</span>,
    },
    {
      accessorKey: "group_course",
      header: "Group/Course",
      cell: ({ row }) => {
        const admission = row.original;
        const groupName = admission.group_name ? String(admission.group_name).trim() : null;
        const courseName = admission.course_name ? String(admission.course_name).trim() : null;
        
        let groupCourse = "-";
        if (groupName && courseName) {
          groupCourse = `${groupName} - ${courseName}`;
        } else if (groupName) {
          groupCourse = groupName;
        } else if (courseName) {
          groupCourse = courseName;
        }
        
        return (
          <div className="max-w-[200px] truncate">
            <Badge variant="outline" className="bg-slate-50">{groupCourse}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "admission_date",
      header: "Admission Date",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("admission_date") || "N/A"}</span>,
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
        <span className="text-sm font-mono font-medium">
          ₹{(row.getValue("payable_tuition_fee") || 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "payable_transport_fee",
      header: "Transport Fee",
      cell: ({ row }) => (
        <span className="text-sm font-mono font-medium text-orange-600">
          ₹{(row.getValue("payable_transport_fee") || 0).toLocaleString()}
        </span>
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
        pagination="server"
        totalCount={admissionsResp?.total_count || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[25, 50, 100]}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        showSearch={false}
        searchPlaceholder="Search by admission no or student name..."
        toolbarLeftContent={
          <div className="w-full sm:flex-1 min-w-0">
            <Input
              placeholder="Search by admission no or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full"
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        }
        actions={actions}
        export={{
          enabled: true,
          filename: "college_admissions",
          onExport: handleExportAll,
        }}
      />

    </div>
  );
};


export default AdmissionsList;
