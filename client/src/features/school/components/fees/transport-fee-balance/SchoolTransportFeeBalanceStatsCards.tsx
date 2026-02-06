import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Percent,
  Calculator,
  Users,
  Truck,
} from 'lucide-react';
import { IndianRupeeIcon } from '@/common/components/shared/IndianRupeeIcon';
import { StatsCard, type StatsCardConfig } from '@/common/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/common/components/shared/dashboard/DashboardGrid';
import { SchoolTransportFeeBalanceDashboardStats } from '@/features/school/types/transport-fee-balances';
import { formatCurrency } from '@/common/utils';

interface SchoolTransportFeeBalanceStatsCardsProps {
  stats: SchoolTransportFeeBalanceDashboardStats;
  loading?: boolean;
  className?: string;
}

export const SchoolTransportFeeBalanceStatsCards: React.FC<SchoolTransportFeeBalanceStatsCardsProps> = ({
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
      description: "All transport fee balance records",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Actual Fee",
      value: formatCurrency(stats.total_actual_fee),
      icon: IndianRupeeIcon,
      color: "green" as const,
      description: "Before concessions",
      variant: "gradient" as const,
      size: "sm" as const,
    },
    {
      title: "Total Concession",
      value: formatCurrency(stats.total_concession),
      icon: Percent,
      color: "emerald" as const,
      description: "Total concessions given",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Total Net Fee",
      value: formatCurrency(stats.total_net_fee),
      icon: Calculator,
      color: "indigo" as const,
      description: "After concessions",
      variant: "bordered" as const,
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
      title: "Term 1 Pending",
      value: stats.term1_pending_count,
      icon: Clock,
      color: "orange" as const,
      description: "Term 1 pending",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Term 1 Paid",
      value: stats.term1_paid_count,
      icon: CheckCircle,
      color: "green" as const,
      description: "Term 1 completed",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Term 2 Pending",
      value: stats.term2_pending_count,
      icon: Clock,
      color: "orange" as const,
      description: "Term 2 pending",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Payment Completion",
      value: `${stats.average_payment_completion.toFixed(1)}%`,
      icon: TrendingUp,
      color: (stats.average_payment_completion >= 80 ? "green" : stats.average_payment_completion >= 60 ? "yellow" : "red"),
      description: "Average completion rate",
      variant: "gradient" as const,
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

export default SchoolTransportFeeBalanceStatsCards;

