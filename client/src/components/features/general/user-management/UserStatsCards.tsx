import React from 'react';
import { Users, UserCheck, UserX, Shield, TrendingUp, Calendar } from 'lucide-react';
import { StatsCard, DashboardGrid } from '@/components/shared';
import { UserDashboardStats } from '@/lib/types/general/users';

interface UserStatsCardsProps {
  stats: UserDashboardStats;
  loading?: boolean;
  className?: string;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "blue" as const,
      description: "All users in institute",
      variant: "elevated" as const,
      size: "md" as const,
    },
    {
      title: "Active Users",
      value: stats.active_users,
      icon: UserCheck,
      color: "green" as const,
      description: "Currently active",
      variant: "elevated" as const,
      size: "md" as const,
      // trend: {
      //   value: stats.total_users > 0 ? Math.round((stats.active_users / stats.total_users) * 100) : 0,
      //   label: "of total users",
      //   isPositive: true,
      // },
    },
    {
      title: "Inactive Users",
      value: stats.inactive_users,
      icon: UserX,
      color: "red" as const,
      description: "Currently inactive",
      variant: "elevated" as const,
      size: "md" as const,
    },
    {
      title: "Regular Users",
      value: stats.regular_users,
      icon: Users,
      color: "indigo" as const,
      description: "Standard users",
      variant: "elevated" as const,
      size: "md" as const,
    },
    {
      title: "This Month",
      value: stats.users_created_this_month,
      icon: Calendar,
      color: "orange" as const,
      description: "New users created",
      variant: "gradient" as const,
      size: "md" as const,
      // trend: {
      //   value: stats.users_created_this_year > 0 ? 
      //     Math.round((stats.users_created_this_month / stats.users_created_this_year) * 100) : 0,
      //   label: "of yearly total",
      //   isPositive: true,
      // },
    },
    {
      title: "This Year",
      value: stats.users_created_this_year,
      icon: TrendingUp,
      color: "emerald" as const,
      description: "Total created this year",
      variant: "gradient" as const,
      size: "md" as const,
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

export default UserStatsCards;
