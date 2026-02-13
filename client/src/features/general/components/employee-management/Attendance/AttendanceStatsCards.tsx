import React from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  UserX, 
  UserCheck, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StatsCard, type StatsCardConfig } from '@/common/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/common/components/shared/dashboard/DashboardGrid';
import { AttendanceDashboardStats } from '@/features/general/types/employee-attendance';

interface AttendanceStatsCardsProps {
  stats: AttendanceDashboardStats;
  loading?: boolean;
  className?: string;
}

export const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Current Month",
      value: stats.current_month_records,
      icon: Calendar,
      color: "green" as const,
      description: "This month's records",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Average Attendance",
      value: `${stats.average_attendance_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: (stats.average_attendance_rate >= 90 ? "green" : stats.average_attendance_rate >= 80 ? "yellow" : "red"),
      description: "Overall attendance rate",
      variant: "elevated" as const,
      size: "sm" as const,
      progressValue: stats.average_attendance_rate,
    },
    {
      title: "Days Absent",
      value: stats.total_days_absent,
      icon: UserX,
      color: "red" as const,
      description: "Total absent days",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Perfect Attendance",
      value: stats.employees_with_perfect_attendance,
      icon: CheckCircle,
      color: "emerald" as const,
      description: "Zero absence employees",
      variant: "elevated" as const,
      size: "sm" as const,
    },
  ];

  return (
    <DashboardGrid 
      columns={4} 
      gap="md" 
      className={className}
    >
      {statsCards.map((stat, index) => (
        <StatsCard
          key={stat.title}
          {...(stat as StatsCardConfig)}
          loading={loading}
        />
      ))}
    </DashboardGrid>
  );
};

export default AttendanceStatsCards;
