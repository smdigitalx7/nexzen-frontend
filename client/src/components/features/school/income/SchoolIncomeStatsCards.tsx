import React from "react";
import {
  DollarSign,
  TrendingUp,
  CalendarDays,
  FileText,
  GraduationCap,
  Bus,
  BookOpen,
  CreditCard,
  Wallet,
  Users,
  BarChart3,
} from "lucide-react";
import { StatsCard, DashboardGrid } from "@/components/shared";
import { SchoolIncomeDashboardStats } from "@/lib/types/school/income";
import { formatCurrency } from "@/lib/utils";

interface SchoolIncomeStatsCardsProps {
  stats: SchoolIncomeDashboardStats;
  loading?: boolean;
  className?: string;
}

export const SchoolIncomeStatsCards: React.FC<SchoolIncomeStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Income Records",
      value: stats.total_income_records,
      icon: FileText,
      color: "blue" as const,
      description: "All income transactions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Income Amount",
      value: formatCurrency(stats.total_income_amount),
      icon: DollarSign,
      color: "green" as const,
      description: "Total revenue collected",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Tuition Fee Income",
      value: formatCurrency(stats.tuition_fee_income),
      icon: GraduationCap,
      color: "purple" as const,
      description: "From tuition fees",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Transport Fee Income",
      value: formatCurrency(stats.transport_fee_income),
      icon: Bus,
      color: "orange" as const,
      description: "From transport fees",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Book Fee Income",
      value: formatCurrency(stats.book_fee_income),
      icon: BookOpen,
      color: "indigo" as const,
      description: "From book fees",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Reservation Fee Income",
      value: formatCurrency(stats.reservation_fee_income),
      icon: CreditCard,
      color: "teal" as const,
      description: "From reservation fees",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Other Income",
      value: formatCurrency(stats.other_income),
      icon: Wallet,
      color: "emerald" as const,
      description: "Miscellaneous income",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Income This Month",
      value: formatCurrency(stats.income_this_month),
      icon: CalendarDays,
      color: "cyan" as const,
      description: "Current month's income",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Income This Year",
      value: formatCurrency(stats.income_this_year),
      icon: BarChart3,
      color: "violet" as const,
      description: "Current year's income",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Records This Month",
      value: stats.income_records_this_month,
      icon: Users,
      color: "rose" as const,
      description: "Transactions this month",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Records This Year",
      value: stats.income_records_this_year,
      icon: TrendingUp,
      color: "yellow" as const,
      description: "Transactions this year",
      variant: "elevated" as const,
      size: "sm" as const,
    },
  ];

  return (
    <div className={className}>
      {/* Stats Cards */}
      <DashboardGrid columns={6} gap="md">
        {statsCards.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} loading={loading} />
        ))}
      </DashboardGrid>
    </div>
  );
};

export default SchoolIncomeStatsCards;
