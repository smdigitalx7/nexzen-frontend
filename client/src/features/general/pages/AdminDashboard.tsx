
import { useMemo } from "react";
import {
  UserCheck,
  IndianRupee,
  Bus,
  Receipt,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useAuthStore } from "@/core/auth/authStore";
import { DashboardContainer } from "@/common/components/shared/dashboard/DashboardContainer";
import { DashboardHeader } from "@/common/components/shared/dashboard/DashboardHeader";
import { DashboardError } from "@/common/components/shared/dashboard/DashboardError";

// Hooks
import { useAdminDashboardData } from "@/features/general/hooks/useAdminDashboardData";

// Components
import { DashboardOverview } from "@/features/general/components/dashboard/DashboardOverview";
import { FinancialSummary } from "@/features/general/components/dashboard/FinancialSummary";
import { AcademicSummary } from "@/features/general/components/dashboard/AcademicSummary";
import { EnrollmentStats } from "@/features/general/components/dashboard/EnrollmentStats";
import { AuditLogSummary } from "@/features/general/components/dashboard/AuditLogSummary";
import { useNavigate } from "react-router-dom";
import { IncomeChart } from "@/features/general/components/dashboard/IncomeChart";

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { dashboardData, loading, error, auditLogSummary } =
    useAdminDashboardData();
  const navigate = useNavigate();

  const auditLogSummaryForUi = useMemo(() => {
    const raw: any[] = Array.isArray(auditLogSummary) ? (auditLogSummary as any[]) : [];
    return raw.map((a) => ({
      ...a,
      user_id: a?.user_id == null ? "" : String(a.user_id),
    }));
  }, [auditLogSummary]);

  const incomeByCategoryForUi = useMemo(() => {
    const raw: any[] =
      (dashboardData as any)?.data?.charts?.income_by_category && Array.isArray((dashboardData as any).data.charts.income_by_category)
        ? (dashboardData as any).data.charts.income_by_category
        : [];
    return raw.map((p) => ({
      category: p?.category ?? "Unknown",
      amount: String(p?.amount ?? "0"),
    }));
  }, [dashboardData]);

  const quickLinks = [
    {
      title: "Employee Management",
      href: "/employees",
      icon: UserCheck,
      color: "text-emerald-600",
    },
    {
      title: "Payroll",
      href: "/payroll",
      icon: IndianRupee,
      color: "text-purple-600",
    },
    {
      title: "Transport",
      href: "/transport",
      icon: Bus,
      color: "text-cyan-600",
    },
    {
      title: "User Management",
      href: "/users",
      icon: UserCheck,
      color: "text-indigo-600",
    },
    {
      title: "Audit Log",
      href: "/audit-log",
      icon: Receipt,
      color: "text-sky-600",
    },
  ];

  const quickLinksDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <MoreHorizontal className="h-4 w-4 mr-2" />
          Quick Links
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Admin Modules</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <DropdownMenuItem
              key={link.title}
              onClick={() => navigate(link.href)}
              className="cursor-pointer"
            >
              <Icon className={`h-4 w-4 mr-2 ${link.color}`} />
              <span>{link.title}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <DashboardContainer loading={loading}>
        <DashboardHeader
          title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
          description="Here's what's happening today."
          showBranchBadge={true}
          rightContent={quickLinksDropdown}
        />
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer loading={false}>
        <DashboardHeader
          title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
          description="Here's what's happening today."
          showBranchBadge={true}
          rightContent={quickLinksDropdown}
        />
        <DashboardError error={error} />
      </DashboardContainer>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardContainer loading={false}>
        <DashboardHeader
          title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
          description="Here's what's happening today."
          showBranchBadge={true}
          rightContent={quickLinksDropdown}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            No dashboard data available
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer loading={false}>
      <DashboardHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}!`}
        description="Here's what's happening today."
        showBranchBadge={true}
        rightContent={quickLinksDropdown}
      />

      <DashboardError error={error} />

      <div className="space-y-6">
        <DashboardOverview data={dashboardData.data.overview} />
        <FinancialSummary data={dashboardData.data.financial} />
        <AcademicSummary data={dashboardData.data} />
        <EnrollmentStats data={dashboardData.data} />
        <AuditLogSummary data={auditLogSummaryForUi as any} />
        <IncomeChart data={incomeByCategoryForUi as any} />
      </div>
    </DashboardContainer>
  );
};

export default AdminDashboard;
