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
  Percent,
  GraduationCap
} from 'lucide-react';
import { StatsCard, DashboardGrid } from '@/components/shared';
import { CollegeReservationDashboardStats } from '@/lib/types/college/reservations';
import { formatCurrency } from '@/lib/utils';

interface CollegeReservationStatsCardsProps {
  stats: CollegeReservationDashboardStats;
  loading?: boolean;
  className?: string;
}

export const CollegeReservationStatsCards: React.FC<CollegeReservationStatsCardsProps> = ({
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
      size: "lg" as const,
    },
    {
      title: "Pending Reservations",
      value: stats.pending_reservations,
      icon: Clock,
      color: "yellow" as const,
      description: "Awaiting confirmation",
      variant: "bordered" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_reservations > 0 ? 
          Math.round((stats.pending_reservations / stats.total_reservations) * 100) : 0,
        label: "of total reservations",
        isPositive: false,
      },
    },
    {
      title: "Confirmed Reservations",
      value: stats.confirmed_reservations,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully confirmed",
      variant: "gradient" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_reservations > 0 ? 
          Math.round((stats.confirmed_reservations / stats.total_reservations) * 100) : 0,
        label: "confirmation rate",
        isPositive: true,
      },
    },
    {
      title: "Cancelled Reservations",
      value: stats.cancelled_reservations,
      icon: XCircle,
      color: "red" as const,
      description: "Cancelled requests",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Male Students",
      value: stats.male_students,
      icon: UserCheck,
      color: "purple" as const,
      description: "Male reservations",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Female Students",
      value: stats.female_students,
      icon: UserX,
      color: "pink" as const,
      description: "Female reservations",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Reservation Fees",
      value: formatCurrency(stats.total_reservation_fees),
      icon: DollarSign,
      color: "indigo" as const,
      description: "Total reservation fees",
      variant: "bordered" as const,
      size: "lg" as const,
    },
    {
      title: "Tuition Fees",
      value: formatCurrency(stats.total_tuition_fees),
      icon: BookOpen,
      color: "emerald" as const,
      description: "Total tuition fees",
      variant: "bordered" as const,
      size: "lg" as const,
    },
    {
      title: "Transport Fees",
      value: formatCurrency(stats.total_transport_fees),
      icon: Car,
      color: "orange" as const,
      description: "Total transport fees",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Tuition Concessions",
      value: formatCurrency(stats.total_tuition_concessions),
      icon: Percent,
      color: "teal" as const,
      description: "Total tuition concessions",
      variant: "elevated" as const,
      size: "md" as const,
    },
    {
      title: "Transport Concessions",
      value: formatCurrency(stats.total_transport_concessions),
      icon: Percent,
      color: "cyan" as const,
      description: "Total transport concessions",
      variant: "elevated" as const,
      size: "md" as const,
    },
    {
      title: "This Month",
      value: stats.reservations_this_month,
      icon: Calendar,
      color: "rose" as const,
      description: "Reservations this month",
      variant: "elevated" as const,
      size: "lg" as const,
      trend: {
        value: stats.reservations_this_year > 0 ? 
          Math.round((stats.reservations_this_month / stats.reservations_this_year) * 100) : 0,
        label: "of yearly total",
        isPositive: true,
      },
    },
    {
      title: "This Year",
      value: stats.reservations_this_year,
      icon: GraduationCap,
      color: "violet" as const,
      description: "Total reservations this year",
      variant: "gradient" as const,
      size: "lg" as const,
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

export default CollegeReservationStatsCards;
