import React from 'react';
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
  BarChart3
} from 'lucide-react';
import { StatsCard, DashboardGrid } from '@/components/shared';
import { CollegeIncomeDashboardStats } from '@/lib/types/college/income';
import { formatCurrency } from '@/lib/utils';

interface CollegeIncomeStatsCardsProps {
  stats: CollegeIncomeDashboardStats;
  loading?: boolean;
  className?: string;
}

export const CollegeIncomeStatsCards: React.FC<CollegeIncomeStatsCardsProps> = ({
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
      size: "lg" as const,
    },
    {
      title: "Total Income Amount",
      value: formatCurrency(stats.total_income_amount),
      icon: DollarSign,
      color: "green" as const,
      description: "Total revenue collected",
      variant: "gradient" as const,
      size: "lg" as const,
    },
    {
      title: "Tuition Fee Income",
      value: formatCurrency(stats.tuition_fee_income),
      icon: GraduationCap,
      color: "purple" as const,
      description: "From tuition fees",
      variant: "bordered" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_income_amount > 0 ? 
          Math.round((stats.tuition_fee_income / stats.total_income_amount) * 100) : 0,
        label: "of total income",
        isPositive: true,
      },
    },
    {
      title: "Transport Fee Income",
      value: formatCurrency(stats.transport_fee_income),
      icon: Bus,
      color: "orange" as const,
      description: "From transport fees",
      variant: "bordered" as const,
      size: "md" as const,
      trend: {
        value: stats.total_income_amount > 0 ? 
          Math.round((stats.transport_fee_income / stats.total_income_amount) * 100) : 0,
        label: "of total income",
        isPositive: true,
      },
    },
    {
      title: "Book Fee Income",
      value: formatCurrency(stats.book_fee_income),
      icon: BookOpen,
      color: "indigo" as const,
      description: "From book fees",
      variant: "default" as const,
      size: "md" as const,
      trend: {
        value: stats.total_income_amount > 0 ? 
          Math.round((stats.book_fee_income / stats.total_income_amount) * 100) : 0,
        label: "of total income",
        isPositive: true,
      },
    },
    {
      title: "Reservation Fee Income",
      value: formatCurrency(stats.reservation_fee_income),
      icon: CreditCard,
      color: "teal" as const,
      description: "From reservation fees",
      variant: "default" as const,
      size: "md" as const,
      trend: {
        value: stats.total_income_amount > 0 ? 
          Math.round((stats.reservation_fee_income / stats.total_income_amount) * 100) : 0,
        label: "of total income",
        isPositive: true,
      },
    },
    {
      title: "Other Income",
      value: formatCurrency(stats.other_income),
      icon: Wallet,
      color: "emerald" as const,
      description: "Miscellaneous income",
      variant: "elevated" as const,
      size: "md" as const,
      trend: {
        value: stats.total_income_amount > 0 ? 
          Math.round((stats.other_income / stats.total_income_amount) * 100) : 0,
        label: "of total income",
        isPositive: true,
      },
    },
    {
      title: "Income This Month",
      value: formatCurrency(stats.income_this_month),
      icon: CalendarDays,
      color: "cyan" as const,
      description: "Current month's income",
      variant: "elevated" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_income_amount > 0 ? 
          Math.round((stats.income_this_month / stats.total_income_amount) * 100) : 0,
        label: "of total income",
        isPositive: true,
      },
    },
    {
      title: "Income This Year",
      value: formatCurrency(stats.income_this_year),
      icon: BarChart3,
      color: "violet" as const,
      description: "Current year's income",
      variant: "gradient" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_income_amount > 0 ? 
          Math.round((stats.income_this_year / stats.total_income_amount) * 100) : 0,
        label: "of total income",
        isPositive: true,
      },
    },
    {
      title: "Records This Month",
      value: stats.income_records_this_month,
      icon: Users,
      color: "rose" as const,
      description: "Transactions this month",
      variant: "bordered" as const,
      size: "md" as const,
      trend: {
        value: stats.total_income_records > 0 ? 
          Math.round((stats.income_records_this_month / stats.total_income_records) * 100) : 0,
        label: "of total records",
        isPositive: true,
      },
    },
    {
      title: "Records This Year",
      value: stats.income_records_this_year,
      icon: TrendingUp,
      color: "yellow" as const,
      description: "Transactions this year",
      variant: "bordered" as const,
      size: "md" as const,
      trend: {
        value: stats.total_income_records > 0 ? 
          Math.round((stats.income_records_this_year / stats.total_income_records) * 100) : 0,
        label: "of total records",
        isPositive: true,
      },
    },
  ];

  return (
    <DashboardGrid 
      columns={6} 
      gap="md" 
      className={className}
    >
      {statsCards.map((stat, index) => (
        <StatsCard
          key={stat.title}
          {...stat}
          loading={loading}
        />
      ))}
    </DashboardGrid>
  );
};

export default CollegeIncomeStatsCards;
