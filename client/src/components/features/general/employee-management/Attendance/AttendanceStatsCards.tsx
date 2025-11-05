import React from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  UserX, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StatsCard, type StatsCardConfig } from '@/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/components/shared/dashboard/DashboardGrid';
import { AttendanceDashboardStats } from '@/lib/types/general/employee-attendance';

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
    // {
    //   title: "Total Records",
    //   value: stats.total_attendance_records,
    //   icon: Users,
    //   color: "blue" as const,
    //   description: "All attendance records",
    //   variant: "elevated" as const,
    //   size: "md" as const,
    // },
    {
      title: "Current Month",
      value: stats.current_month_records,
      icon: Calendar,
      color: "green" as const,
      description: "This month's records",
      variant: "elevated" as const,
      size: "sm" as const,
      // trend: {
      //   value: stats.total_attendance_records > 0 ? 
      //     Math.round((stats.current_month_records / stats.total_attendance_records) * 100) : 0,
      //   label: "of total records",
      //   isPositive: true,
      // },
    },
    {
      title: "Average Attendance",
      value: `${stats.average_attendance_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: (stats.average_attendance_rate >= 90 ? "green" : stats.average_attendance_rate >= 80 ? "yellow" : "red") as "green" | "yellow" | "red",
      description: "Overall attendance rate",
      variant: "gradient" as const,
      size: "sm" as const,
      progressValue: stats.average_attendance_rate,
    },
    {
      title: "Days Absent",
      value: stats.total_days_absent,
      icon: UserX,
      color: "red" as const,
      description: "Total absent days",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    // {
    //   title: "Paid Leaves",
    //   value: stats.total_paid_leaves,
    //   icon: UserCheck,
    //   color: "purple" as const,
    //   description: "Authorized leaves",
    //   variant: "default" as const,
    //   size: "md" as const,
    // },
    // {
    //   title: "Unpaid Leaves",
    //   value: stats.total_unpaid_leaves,
    //   icon: AlertTriangle,
    //   color: "orange" as const,
    //   description: "Unauthorized leaves",
    //   variant: "default" as const,
    //   size: "md" as const,
    // },
    {
      title: "Late Arrivals",
      value: stats.total_late_arrivals,
      icon: Clock,
      color: "yellow" as const,
      description: "Tardiness incidents",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Early Departures",
      value: stats.total_early_departures,
      icon: Clock,
      color: "amber" as const,
      description: "Early leave incidents",
      variant: "bordered" as const,
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
      // trend: {
      //   value: stats.total_attendance_records > 0 ? 
      //     Math.round((stats.employees_with_perfect_attendance / stats.total_attendance_records) * 100) : 0,
      //   label: "of total records",
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
          {...(stat as StatsCardConfig)}
          loading={loading}
        />
      ))}
    </DashboardGrid>
  );
};

export default AttendanceStatsCards;
