import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp
} from 'lucide-react';
import { StatsCard } from '@/common/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/common/components/shared/dashboard/DashboardGrid';
import { IndianRupeeIcon } from '@/common/components/shared/IndianRupeeIcon';
import { AdvanceDashboardStats } from '@/features/general/types/advances';
import { formatCurrency } from '@/common/utils';

interface AdvanceStatsCardsProps {
  stats: AdvanceDashboardStats;
  loading?: boolean;
  className?: string;
}

export const AdvanceStatsCards: React.FC<AdvanceStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Advances",
      value: stats.total_advances ?? 0,
      icon: IndianRupeeIcon,
      color: "blue" as const,
      description: "All advance requests",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Pending Advances",
      value: stats.requested_advances ?? 0,
      icon: Clock,
      color: "yellow" as const,
      description: "Awaiting approval",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Approved Advances",
      value: stats.approved_advances ?? 0,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully approved",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Repaid Advances",
      value: stats.repaid_advances ?? 0,
      icon: CheckCircle,
      color: "emerald" as const,
      description: "Fully repaid",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Amount",
      value: formatCurrency(stats.total_advance_amount ?? 0),
      icon: IndianRupeeIcon,
      color: "indigo" as const,
      description: "All advance amounts",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Repaid",
      value: formatCurrency(stats.total_repaid_amount ?? 0),
      icon: TrendingUp,
      color: "teal" as const,
      description: "Amount repaid",
      variant: "elevated" as const,
      size: "sm" as const,
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

export default AdvanceStatsCards;
