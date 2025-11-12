import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { StatsCard } from '@/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/components/shared/dashboard/DashboardGrid';
import { LeaveDashboardStats } from '@/lib/types/general/employee-leave';

interface LeaveStatsCardsProps {
  stats: LeaveDashboardStats;
  loading?: boolean;
  className?: string;
}

export const LeaveStatsCards: React.FC<LeaveStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Requests",
      value: stats.total_leave_requests,
      icon: FileText,
      color: "blue" as const,
      description: "All leave requests",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Pending Requests",
      value: stats.pending_requests,
      icon: Clock,
      color: "yellow" as const,
      description: "Awaiting approval",
      variant: "bordered" as const,
      size: "sm" as const,
      // trend: {
      //   value: stats.total_leave_requests > 0 ? 
      //     Math.round((stats.pending_requests / stats.total_leave_requests) * 100) : 0,
      //   label: "of total requests",
      //   isPositive: false,
      // },
    },
    {
      title: "Approved Requests",
      value: stats.approved_requests,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully approved",
      variant: "gradient" as const,
      size: "sm" as const,
      // trend: {
      //   value: stats.total_leave_requests > 0 ? 
      //     Math.round((stats.approved_requests / stats.total_leave_requests) * 100) : 0,
      //   label: "approval rate",
      //   isPositive: true,
      // },
    },
    {
      title: "Rejected Requests",
      value: stats.rejected_requests,
      icon: XCircle,
      color: "red" as const,
      description: "Not approved",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "This Month",
      value: stats.leaves_this_month,
      icon: TrendingUp,
      color: "emerald" as const,
      description: "Leaves this month",
      variant: "elevated" as const,
      size: "sm" as const,
      // trend: {
      //   value: stats.leaves_this_year > 0 ? 
      //     Math.round((stats.leaves_this_month / stats.leaves_this_year) * 100) : 0,
      //   label: "of yearly total",
      //   isPositive: true,
      // },
    },
    {
      title: "This Year",
      value: stats.leaves_this_year,
      icon: AlertTriangle,
      color: "teal" as const,
      description: "Total leaves this year",
      variant: "bordered" as const,
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

export default LeaveStatsCards;
