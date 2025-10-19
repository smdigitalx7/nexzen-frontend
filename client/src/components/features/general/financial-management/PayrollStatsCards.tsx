import React from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Users,
  Wallet,
  Calculator
} from 'lucide-react';
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
      size: "lg" as const,
    },
    {
      title: "Pending Payrolls",
      value: stats.pending_payrolls,
      icon: Clock,
      color: "yellow" as const,
      description: "Awaiting processing",
      variant: "bordered" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_payroll_records > 0 ? 
          Math.round((stats.pending_payrolls / stats.total_payroll_records) * 100) : 0,
        label: "of total records",
        isPositive: false,
      },
    },
    {
      title: "Paid Payrolls",
      value: stats.paid_payrolls,
      icon: CheckCircle,
      color: "green" as const,
      description: "Successfully paid",
      variant: "gradient" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_payroll_records > 0 ? 
          Math.round((stats.paid_payrolls / stats.total_payroll_records) * 100) : 0,
        label: "completion rate",
        isPositive: true,
      },
    },
    {
      title: "Hold Payrolls",
      value: stats.hold_payrolls,
      icon: AlertTriangle,
      color: "red" as const,
      description: "On hold",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Current Month",
      value: stats.current_month_payrolls,
      icon: Calendar,
      color: "purple" as const,
      description: "This month's payrolls",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Total Gross Pay",
      value: formatCurrency(stats.total_gross_pay),
      icon: DollarSign,
      color: "indigo" as const,
      description: "Before deductions",
      variant: "bordered" as const,
      size: "lg" as const,
    },
    {
      title: "Total Net Pay",
      value: formatCurrency(stats.total_net_pay),
      icon: Wallet,
      color: "emerald" as const,
      description: "After deductions",
      variant: "bordered" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_gross_pay > 0 ? 
          Math.round(((stats.total_gross_pay - stats.total_net_pay) / stats.total_gross_pay) * 100) : 0,
        label: "deduction rate",
        isPositive: false,
      },
    },
    {
      title: "Total Deductions",
      value: formatCurrency(stats.total_deductions),
      icon: TrendingUp,
      color: "orange" as const,
      description: "All deductions",
      variant: "default" as const,
      size: "md" as const,
    },
    {
      title: "Total Paid",
      value: formatCurrency(stats.total_paid_amount),
      icon: CreditCard,
      color: "teal" as const,
      description: "Amount disbursed",
      variant: "elevated" as const,
      size: "lg" as const,
      trend: {
        value: stats.total_net_pay > 0 ? 
          Math.round((stats.total_paid_amount / stats.total_net_pay) * 100) : 0,
        label: "payment rate",
        isPositive: true,
      },
    },
    {
      title: "Pending Payment",
      value: formatCurrency(stats.pending_payment_amount),
      icon: AlertTriangle,
      color: "rose" as const,
      description: "Awaiting payment",
      variant: "elevated" as const,
      size: "lg" as const,
    },
    {
      title: "Average Salary",
      value: formatCurrency(stats.average_salary),
      icon: Calculator,
      color: "cyan" as const,
      description: "Per employee",
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

export default PayrollStatsCards;
