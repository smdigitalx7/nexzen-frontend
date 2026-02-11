import React from "react";
import {
  CreditCard,
  TrendingUp,
  Wallet,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { StatsCard } from "@/common/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/common/components/shared/dashboard/DashboardGrid";
import { PayrollDashboardStats } from "@/features/general/types/payrolls";
import { formatCurrency } from "@/common/utils";

interface PayrollStatsCardsProps {
  stats: PayrollDashboardStats;
  loading?: boolean;
  className?: string;
}

export const PayrollStatsCards: React.FC<PayrollStatsCardsProps> = ({
  stats,
  loading = false,
  className,
}) => {
  const statsCards = [
    {
      title: "Total Gross Pay",
      value: formatCurrency(stats.total_gross_pay),
      icon: IndianRupeeIcon,
      color: "indigo" as const,
      description: "Before deductions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Net Pay",
      value: formatCurrency(stats.total_net_pay),
      icon: Wallet,
      color: "emerald" as const,
      description: "After deductions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Deductions",
      value: formatCurrency(stats.total_deductions),
      icon: TrendingUp,
      color: "orange" as const,
      description: "All deductions",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Paid",
      value: formatCurrency(stats.total_paid_amount),
      icon: CreditCard,
      color: "teal" as const,
      description: "Amount disbursed",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Pending Payment",
      value: formatCurrency(stats.pending_payment_amount),
      icon: AlertTriangle,
      color: "rose" as const,
      description: "Awaiting payment",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Average Salary",
      value: formatCurrency(stats.average_salary),
      icon: Calculator,
      color: "cyan" as const,
      description: "Per employee",
      variant: "elevated" as const,
      size: "sm" as const,
    },
  ];

  return (
    <DashboardGrid columns={3} gap="md" className={className}>
      {statsCards.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} loading={loading} />
      ))}
    </DashboardGrid>
  );
};

export default PayrollStatsCards;
