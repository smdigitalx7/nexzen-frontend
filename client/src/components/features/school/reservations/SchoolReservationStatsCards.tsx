import React from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  UserCheck,
  UserX,
  BookOpen,
  Car,
  Percent
} from 'lucide-react';
import { StatsCard, DashboardGrid } from '@/components/shared';
import { SchoolReservationDashboardStats } from '@/lib/types/school/reservations';
import { formatCurrency } from '@/lib/utils';

interface SchoolReservationStatsCardsProps {
  stats: SchoolReservationDashboardStats;
  loading?: boolean;
  className?: string;
}

export const SchoolReservationStatsCards: React.FC<SchoolReservationStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Reservations",
      value: stats.total_reservations,
      icon: Users,
      color: "blue" as const,
      description: "All reservation requests",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Pending Reservations",
      value: stats.pending_reservations,
      icon: Clock,
      color: "yellow" as const,
      description: "Awaiting confirmation",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Confirmed Reservations",
      value: stats.confirmed_reservations,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully confirmed",
      variant: "gradient" as const,
      size: "sm" as const,
    },
    {
      title: "Cancelled Reservations",
      value: stats.cancelled_reservations,
      icon: XCircle,
      color: "red" as const,
      description: "Cancelled requests",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Male Students",
      value: stats.male_students,
      icon: UserCheck,
      color: "purple" as const,
      description: "Male reservations",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Female Students",
      value: stats.female_students,
      icon: UserX,
      color: "pink" as const,
      description: "Female reservations",
      variant: "default" as const,
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

export default SchoolReservationStatsCards;
