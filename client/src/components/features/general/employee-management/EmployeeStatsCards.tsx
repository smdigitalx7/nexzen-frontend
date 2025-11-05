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
import { StatsCard, DashboardGrid } from '@/components/shared';
import { EmployeeDashboardStats } from '@/lib/types/general/employees';

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
      // trend: {
      //   value: stats.total_employees > 0 ? Math.round((stats.active_employees / stats.total_employees) * 100) : 0,
      //   label: "of total employees",
      //   isPositive: true,
      // },
    },
    {
      title: "Teaching Staff",
      value: stats.teaching_staff,
      icon: GraduationCap,
      color: "purple" as const,
      description: "Teachers and faculty",
      variant: "gradient" as const,
      size: "sm" as const,
    },
    {
      title: "Non-Teaching Staff",
      value: stats.non_teaching_staff,
      icon: Briefcase,
      color: "indigo" as const,
      description: "Administrative staff",
      variant: "gradient" as const,
      size: "sm" as const,
    },
    {
      title: "Office Staff",
      value: stats.office_staff,
      icon: Building2,
      color: "orange" as const,
      description: "Office personnel",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Drivers",
      value: stats.drivers,
      icon: Car,
      color: "cyan" as const,
      description: "Transport drivers",
      variant: "default" as const,
      size: "sm" as const,
    },
    // {
    //   title: "This Month",
    //   value: stats.employees_joined_this_month,
    //   icon: Calendar,
    //   color: "emerald" as const,
    //   description: "New employees joined",
    //   variant: "bordered" as const,
    //   size: "md" as const,
    //   trend: {
    //     value: stats.employees_joined_this_year > 0 ? 
    //       Math.round((stats.employees_joined_this_month / stats.employees_joined_this_year) * 100) : 0,
    //     label: "of yearly total",
    //     isPositive: true,
    //   },
    // },
    // {
    //   title: "This Year",
    //   value: stats.employees_joined_this_year,
    //   icon: TrendingUp,
    //   color: "teal" as const,
    //   description: "Total joined this year",
    //   variant: "bordered" as const,
    //   size: "md" as const,
    // },
    // {
    //   title: "Total Salary Expense",
    //   value: `₹${(stats.total_salary_expense / 100000).toFixed(1)}L`,
    //   icon: IndianRupeeIcon,
    //   color: "rose" as const,
    //   description: "Monthly salary budget",
    //   variant: "elevated" as const,
    //   size: "lg" as const,
    //   trend: {
    //     value: stats.total_employees > 0 ? Math.round(stats.total_salary_expense / stats.total_employees) : 0,
    //     label: "avg per employee",
    //     isPositive: false,
    //   },
    // },
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
