import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp, 
  Users,
  Wallet,
  Calculator
} from 'lucide-react';
import { IndianRupeeIcon } from '@/components/shared/IndianRupeeIcon';
import { StatsCard, DashboardGrid } from '@/components/shared';
import { PayrollDashboardStats } from '@/lib/types/general/payrolls';
import { formatCurrency } from '@/lib/utils';

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
      title: "Total Records",
      value: stats.total_payroll_records,
      icon: Users,
      color: "blue" as const,
      description: "All payroll records",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Pending Payrolls",
      value: stats.pending_payrolls,
      icon: Clock,
      color: "yellow" as const,
      description: "Awaiting processing",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Paid Payrolls",
      value: stats.paid_payrolls,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully paid",
      variant: "gradient" as const,
      size: "sm" as const,
    },
    {
      title: "Hold Payrolls",
      value: stats.hold_payrolls,
      icon: AlertTriangle,
      color: "red" as const,
      description: "On hold",
      variant: "default" as const,
      size: "sm" as const,
    },
    {
      title: "Total Gross Pay",
      value: formatCurrency(stats.total_gross_pay),
      icon: IndianRupeeIcon,
      color: "indigo" as const,
      description: "Before deductions",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Total Net Pay",
      value: formatCurrency(stats.total_net_pay),
      icon: Wallet,
      color: "emerald" as const,
      description: "After deductions",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Total Deductions",
      value: formatCurrency(stats.total_deductions),
      icon: TrendingUp,
      color: "orange" as const,
      description: "All deductions",
      variant: "default" as const,
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
      variant: "gradient" as const,
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

export default PayrollStatsCards;
