import React from "react";
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
  GraduationCap,
} from "lucide-react";
import { StatsCard, DashboardGrid } from "@/components/shared";
import { CollegeReservationDashboardStats } from "@/lib/types/college/reservations";
import { formatCurrency } from "@/lib/utils";

interface CollegeReservationStatsCardsProps {
  stats: CollegeReservationDashboardStats;
  loading?: boolean;
  className?: string;
}

export const CollegeReservationStatsCards: React.FC<
  CollegeReservationStatsCardsProps
> = ({ stats, loading = false, className }) => {
  const statsCards = [
    {
      title: "Total Reservations",
      value: stats.total_reservations,
      icon: Users,
      color: "blue" as const,
      variant: "elevated" as const,
      size: "md" as const,
    },
    {
      title: "Pending Reservations",
      value: stats.pending_reservations,
      icon: Clock,
      color: "yellow" as const,
      variant: "bordered" as const,
      size: "md" as const,
    },
    {
      title: "Confirmed Reservations",
      value: stats.confirmed_reservations,
      icon: CheckCircle,
      color: "green" as const,
      variant: "gradient" as const,
      size: "md" as const,
    },
    {
      title: "Cancelled Reservations",
      value: stats.cancelled_reservations,
      icon: XCircle,
      color: "red" as const,
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Male Students",
      value: stats.male_students,
      icon: UserCheck,
      color: "purple" as const,
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Female Students",
      value: stats.female_students,
      icon: UserX,
      color: "pink" as const,
      variant: "default" as const,
      size: "md" as const,
    },
  ];

  return (
    <DashboardGrid columns={6} gap="md" className={className}>
      {statsCards.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} loading={loading} />
      ))}
    </DashboardGrid>
  );
};

export default CollegeReservationStatsCards;
