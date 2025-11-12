import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp
} from 'lucide-react';
import { StatsCard } from '@/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/components/shared/dashboard/DashboardGrid';
import { IndianRupeeIcon } from '@/components/shared/IndianRupeeIcon';
import { AdvanceDashboardStats } from '@/lib/types/general/advances';
import { formatCurrency } from '@/lib/utils';

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
      value: stats.total_advances,
      icon: IndianRupeeIcon,
      color: "blue" as const,
      description: "All advance requests",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Pending Advances",
      value: stats.pending_advances,
      icon: Clock,
      color: "yellow" as const,
      description: "Awaiting approval",
      variant: "bordered" as const,
      size: "sm" as const,
      // trend: {
      //   value: stats.total_advances > 0 ? 
      //     Math.round((stats.pending_advances / stats.total_advances) * 100) : 0,
      //   label: "of total advances",
      //   isPositive: false,
      // },
    },
    {
      title: "Approved Advances",
      value: stats.approved_advances,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully approved",
      variant: "gradient" as const,
      size: "sm" as const,
      // trend: {
      //   value: stats.total_advances > 0 ? 
      //     Math.round((stats.approved_advances / stats.total_advances) * 100) : 0,
      //   label: "approval rate",
      //   isPositive: true,
      // },
    },
    {
      title: "Rejected Advances",
      value: stats.rejected_advances,
      icon: XCircle,
      color: "red" as const,
      description: "Not approved",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Total Amount",
      value: formatCurrency(stats.total_advance_amount),
      icon: IndianRupeeIcon,
      color: "indigo" as const,
      description: "All advance amounts",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Total Repaid",
      value: formatCurrency(stats.total_repaid_amount),
      icon: TrendingUp,
      color: "teal" as const,
      description: "Amount repaid",
      variant: "bordered" as const,
      size: "sm" as const,
      // trend: {
      //   value: stats.total_advance_amount > 0 ? 
      //     Math.round((stats.total_repaid_amount / stats.total_advance_amount) * 100) : 0,
      //   label: "repayment rate",
      //   isPositive: true,
      // },
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
