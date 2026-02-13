import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Car,
  TrendingUp, 
  Calendar,
} from 'lucide-react';
import { StatsCard } from '@/common/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/common/components/shared/dashboard/DashboardGrid';
import { EmployeeDashboardStats } from '@/features/general/types/employees';

interface EmployeeStatsCardsProps {
  stats: EmployeeDashboardStats;
  loading?: boolean;
  className?: string;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Employees",
      value: stats.total_employees,
      icon: Users,
      color: "blue" as const,
      description: "All employees in institute",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Active Employees",
      value: stats.active_employees,
      icon: UserCheck,
      color: "green" as const,
      description: "Currently active",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Teaching Staff",
      value: stats.teaching_staff,
      icon: GraduationCap,
      color: "purple" as const,
      description: "Teachers and faculty",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Non-Teaching Staff",
      value: stats.non_teaching_staff,
      icon: Briefcase,
      color: "indigo" as const,
      description: "Administrative staff",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Office Staff",
      value: stats.office_staff,
      icon: Building2,
      color: "orange" as const,
      description: "Office personnel",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Drivers",
      value: stats.drivers,
      icon: Car,
      color: "cyan" as const,
      description: "Transport drivers",
      variant: "elevated" as const,
      size: "sm" as const,
    }
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

export default EmployeeStatsCards;
