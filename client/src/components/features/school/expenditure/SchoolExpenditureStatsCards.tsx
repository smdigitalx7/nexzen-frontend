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
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { StatsCard, DashboardGrid } from "@/components/shared";
import { SchoolExpenditureDashboardStats } from "@/lib/types/school/expenditure";
import { formatCurrency } from "@/lib/utils";

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
      value: stats.total_expenditure_records,
      icon: FileText,
      color: "blue" as const,
      description: "All expenditure transactions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Expenditure Amount",
      value: formatCurrency(stats.total_expenditure_amount),
      icon: IndianRupeeIcon,
      color: "red" as const,
      description: "Total expenses incurred",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Paid Expenditures",
      value: stats.paid_expenditures,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully paid bills",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Unpaid Expenditures",
      value: stats.unpaid_expenditures,
      icon: Clock,
      color: "orange" as const,
      description: "Pending payments",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Paid Amount",
      value: formatCurrency(stats.total_paid_amount),
      icon: CreditCard,
      color: "emerald" as const,
      description: "Amount already paid",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Unpaid Amount",
      value: formatCurrency(stats.total_unpaid_amount),
      icon: AlertTriangle,
      color: "rose" as const,
      description: "Outstanding payments",
      variant: "elevated" as const,
      size: "sm" as const,
      // trend: {
      //   value:
      //     stats.total_expenditure_amount > 0
      //       ? Math.round(
      //           (stats.total_unpaid_amount / stats.total_expenditure_amount) *
      //             100
      //         )
      //       : 0,
      //   label: "outstanding rate",
      //   isPositive: false,
      // },
    },
    {
      title: "Expenditure This Month",
      value: formatCurrency(stats.expenditure_this_month),
      icon: CalendarDays,
      color: "cyan" as const,
      description: "Current month's expenses",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Expenditure This Year",
      value: formatCurrency(stats.expenditure_this_year),
      icon: BarChart3,
      color: "violet" as const,
      description: "Current year's expenses",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Records This Month",
      value: stats.expenditure_records_this_month,
      icon: Receipt,
      color: "yellow" as const,
      description: "Transactions this month",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Records This Year",
      value: stats.expenditure_records_this_year,
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
