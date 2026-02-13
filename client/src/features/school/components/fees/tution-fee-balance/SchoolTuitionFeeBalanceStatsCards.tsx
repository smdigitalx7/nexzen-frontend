import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Percent,
  Calculator,
  Users,
  CreditCard,
} from 'lucide-react';
import { IndianRupeeIcon } from '@/common/components/shared/IndianRupeeIcon';
import { StatsCard, type StatsCardConfig } from '@/common/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/common/components/shared/dashboard/DashboardGrid';
import { SchoolTuitionFeeBalanceDashboardStats } from '@/features/school/types/tuition-fee-balances';
import { formatCurrency } from '@/common/utils';

interface SchoolTuitionFeeBalanceStatsCardsProps {
  stats: SchoolTuitionFeeBalanceDashboardStats;
  loading?: boolean;
  className?: string;
}

export const SchoolTuitionFeeBalanceStatsCards: React.FC<SchoolTuitionFeeBalanceStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Balances",
      value: stats.total_balances,
      icon: Users,
      color: "blue" as const,
      description: "All fee balance records",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Actual Fee",
      value: formatCurrency(stats.total_actual_fee),
      icon: IndianRupeeIcon,
      color: "green" as const,
      description: "Before concessions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Concession",
      value: formatCurrency(stats.total_concession),
      icon: Percent,
      color: "emerald" as const,
      description: "Total concessions given",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Net Fee",
      value: formatCurrency(stats.total_net_fee),
      icon: Calculator,
      color: "indigo" as const,
      description: "After concessions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Paid",
      value: formatCurrency(stats.total_paid),
      icon: CheckCircle,
      color: "teal" as const,
      description: "Amount collected",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Outstanding",
      value: formatCurrency(stats.total_outstanding),
      icon: AlertTriangle,
      color: "red" as const,
      description: "Pending payments",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Book Fee Total",
      value: formatCurrency(stats.total_book_fee),
      icon: BookOpen,
      color: "purple" as const,
      description: "Total book fees",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Book Fee Paid",
      value: formatCurrency(stats.total_book_paid),
      icon: CreditCard,
      color: "cyan" as const,
      description: "Book fees collected",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Book Pending",
      value: stats.book_pending_count,
      icon: Clock,
      color: "yellow" as const,
      description: "Pending book payments",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Payment Completion",
      value: `${stats.average_payment_completion.toFixed(1)}%`,
      icon: TrendingUp,
      color: (stats.average_payment_completion >= 80 ? "green" : stats.average_payment_completion >= 60 ? "yellow" : "red"),
      description: "Average completion rate",
      variant: "elevated" as const,
      size: "sm" as const,
    },
  ];

  return (
    <DashboardGrid 
      columns={5} 
      gap="md" 
      className={className}
    >
      {statsCards.map((stat) => (
        <StatsCard
          key={stat.title}
          {...(stat as StatsCardConfig)}
          loading={loading}
        />
      ))}
    </DashboardGrid>
  );
};

export default SchoolTuitionFeeBalanceStatsCards;

