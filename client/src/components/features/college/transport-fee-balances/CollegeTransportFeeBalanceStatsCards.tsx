import React from 'react';
import { 
  DollarSign, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Percent,
  Calculator,
  Users,
  CreditCard,
  Wallet
} from 'lucide-react';
import { StatsCard, DashboardGrid } from '@/components/shared';
import { CollegeTransportFeeBalanceDashboardStats } from '@/lib/types/college/transport-fee-balances';
import { formatCurrency } from '@/lib/utils';

interface CollegeTransportFeeBalanceStatsCardsProps {
  stats: CollegeTransportFeeBalanceDashboardStats;
  loading?: boolean;
  className?: string;
}

export const CollegeTransportFeeBalanceStatsCards: React.FC<CollegeTransportFeeBalanceStatsCardsProps> = ({
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
      size: "lg" as const,
    },
    {
      title: "Total Actual Fee",
      value: formatCurrency(stats.total_actual_fee),
      icon: DollarSign,
      color: "green" as const,
      description: "Before concessions",
      variant: "gradient" as const,
      size: "lg" as const,
    },
    {
      title: "Total Concession",
      value: formatCurrency(stats.total_concession),
      icon: Percent,
      color: "emerald" as const,
      description: "Total concessions given",
      variant: "bordered" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_actual_fee > 0 ? 
          Math.round((stats.total_concession / stats.total_actual_fee) * 100) : 0,
        label: "concession rate",
        isPositive: false,
      },
    },
    {
      title: "Total Net Fee",
      value: formatCurrency(stats.total_net_fee),
      icon: Calculator,
      color: "indigo" as const,
      description: "After concessions",
      variant: "bordered" as const,
      size: "lg" as const,
    },
    {
      title: "Total Paid",
      value: formatCurrency(stats.total_paid),
      icon: CheckCircle,
      color: "teal" as const,
      description: "Amount collected",
      variant: "elevated" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_net_fee > 0 ? 
          Math.round((stats.total_paid / stats.total_net_fee) * 100) : 0,
        label: "collection rate",
        isPositive: true,
      },
    },
    {
      title: "Total Outstanding",
      value: formatCurrency(stats.total_outstanding),
      icon: AlertTriangle,
      color: "red" as const,
      description: "Pending payments",
      variant: "elevated" as const,
      size: "lg" as const,
    },
    {
      title: "Term 1 Pending",
      value: stats.term1_pending_count,
      icon: Clock,
      color: "yellow" as const,
      description: "Term 1 pending payments",
      variant: "bordered" as const,
      size: "md" as const,
    },
    {
      title: "Term 1 Paid",
      value: stats.term1_paid_count,
      icon: CheckCircle,
      color: "green" as const,
      description: "Term 1 completed",
      variant: "bordered" as const,
      size: "md" as const,
    },
    {
      title: "Term 1 Partial",
      value: stats.term1_partial_count,
      icon: CreditCard,
      color: "orange" as const,
      description: "Term 1 partial payments",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Term 2 Pending",
      value: stats.term2_pending_count,
      icon: Clock,
      color: "yellow" as const,
      description: "Term 2 pending payments",
      variant: "bordered" as const,
      size: "md" as const,
    },
    {
      title: "Term 2 Paid",
      value: stats.term2_paid_count,
      icon: CheckCircle,
      color: "green" as const,
      description: "Term 2 completed",
      variant: "bordered" as const,
      size: "md" as const,
    },
    {
      title: "Term 2 Partial",
      value: stats.term2_partial_count,
      icon: CreditCard,
      color: "orange" as const,
      description: "Term 2 partial payments",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Payment Completion",
      value: `${stats.average_payment_completion.toFixed(1)}%`,
      icon: TrendingUp,
      color: (stats.average_payment_completion >= 80 ? "green" : stats.average_payment_completion >= 60 ? "yellow" : "red") as "green" | "yellow" | "red",
      description: "Average completion rate",
      variant: "gradient" as const,
      size: "lg" as const,
      showProgress: true,
      progressValue: stats.average_payment_completion,
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

export default CollegeTransportFeeBalanceStatsCards;
