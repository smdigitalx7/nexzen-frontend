import React from "react";
import {
  TrendingUp,
  CalendarDays,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  BarChart3,
  Receipt,
} from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { StatsCard } from "@/common/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/common/components/shared/dashboard/DashboardGrid";
import { SchoolExpenditureDashboardStats } from "@/features/school/types/expenditure";
import { formatCurrency } from "@/common/utils";

interface SchoolExpenditureStatsCardsProps {
  stats: SchoolExpenditureDashboardStats;
  loading?: boolean;
  className?: string;
}

export const SchoolExpenditureStatsCards: React.FC<
  SchoolExpenditureStatsCardsProps
> = ({ stats, loading = false, className }) => {
  const statsCards = [
    {
      title: "Total Expenditure Records",
      value: stats?.total_expenditure_records || 0,
      icon: FileText,
      color: "blue" as const,
      description: "All expenditure transactions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Expenditure Amount",
      value: formatCurrency(stats?.total_expenditure_amount || 0),
      icon: IndianRupeeIcon,
      color: "red" as const,
      description: "Total expenses incurred",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Paid Expenditures",
      value: stats?.paid_expenditures || 0,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully paid bills",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Unpaid Expenditures",
      value: stats?.unpaid_expenditures || 0,
      icon: Clock,
      color: "orange" as const,
      description: "Pending payments",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Paid Amount",
      value: formatCurrency(stats?.total_paid_amount || 0),
      icon: CreditCard,
      color: "emerald" as const,
      description: "Amount already paid",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Unpaid Amount",
      value: formatCurrency(stats?.total_unpaid_amount || 0),
      icon: AlertTriangle,
      color: "rose" as const,
      description: "Outstanding payments",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Expenditure This Month",
      value: formatCurrency(stats?.expenditure_this_month || 0),
      icon: CalendarDays,
      color: "cyan" as const,
      description: "Current month's expenses",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Expenditure This Year",
      value: formatCurrency(stats?.expenditure_this_year || 0),
      icon: BarChart3,
      color: "violet" as const,
      description: "Current year's expenses",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Records This Month",
      value: stats?.expenditure_records_this_month || 0,
      icon: Receipt,
      color: "yellow" as const,
      description: "Transactions this month",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Records This Year",
      value: stats?.expenditure_records_this_year || 0,
      icon: TrendingUp,
      color: "indigo" as const,
      description: "Transactions this year",
      variant: "elevated" as const,
      size: "sm" as const,
    },
  ];

  return (
    <DashboardGrid columns={5} gap="md" className={className}>
      {statsCards.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} loading={loading} />
      ))}
    </DashboardGrid>
  );
};

export default SchoolExpenditureStatsCards;
