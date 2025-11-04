import { LucideIcon, Users, UserCheck, TrendingDown, GraduationCap, BookOpen, CheckCircle } from 'lucide-react';
import { IndianRupeeIcon } from '@/components/shared/IndianRupeeIcon';
import { StatsCardConfig } from '@/components/shared';

/**
 * Utility functions for creating common stat card configurations
 */

export const createStatCard = (
  title: string,
  value: string | number,
  icon: LucideIcon,
  options: Partial<StatsCardConfig> = {}
): StatsCardConfig => ({
  title,
  value,
  icon,
  color: 'blue',
  size: 'md',
  variant: 'default',
  ...options,
});

export const createTrendingStat = (
  title: string,
  value: string | number,
  icon: LucideIcon,
  trendValue: number,
  trendLabel: string,
  options: Partial<StatsCardConfig> = {}
): StatsCardConfig => ({
  title,
  value,
  icon,
  color: trendValue >= 0 ? 'green' : 'red',
  size: 'md',
  variant: 'elevated',
  trend: {
    value: Math.abs(trendValue),
    label: trendLabel,
    isPositive: trendValue >= 0,
  },
  ...options,
});

export const createProgressStat = (
  title: string,
  value: string | number,
  icon: LucideIcon,
  progressValue: number,
  description?: string,
  options: Partial<StatsCardConfig> = {}
): StatsCardConfig => ({
  title,
  value,
  icon,
  color: progressValue >= 80 ? 'green' : progressValue >= 60 ? 'yellow' : 'red',
  size: 'md',
  variant: 'gradient',
  description,
  showProgress: true,
  progressValue,
  ...options,
});

export const createFinancialStat = (
  title: string,
  value: string | number,
  icon: LucideIcon,
  isPositive: boolean,
  options: Partial<StatsCardConfig> = {}
): StatsCardConfig => ({
  title,
  value,
  icon,
  color: isPositive ? 'green' : 'red',
  size: 'lg',
  variant: 'elevated',
  ...options,
});

export const createStatusStat = (
  title: string,
  value: string | number,
  icon: LucideIcon,
  status: 'success' | 'warning' | 'error' | 'info',
  options: Partial<StatsCardConfig> = {}
): StatsCardConfig => {
  const colorMap = {
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
  } as const;

  return {
    title,
    value,
    icon,
    color: colorMap[status],
    size: 'md',
    variant: 'bordered',
    ...options,
  };
};

/**
 * Common stat card presets for different data types
 */
export const statPresets = {
  // User management
  totalUsers: (count: number) => createStatCard('Total Users', count, Users, { color: 'blue' }),
  activeUsers: (count: number, total: number) => createTrendingStat(
    'Active Users', 
    count, 
    UserCheck, 
    total > 0 ? (count / total) * 100 : 0,
    'of total users'
  ),
  
  // Financial
  totalRevenue: (amount: number) => createFinancialStat('Total Revenue', amount, IndianRupeeIcon, amount >= 0),
  totalExpenses: (amount: number) => createFinancialStat('Total Expenses', amount, TrendingDown, false),
  
  // Academic
  totalStudents: (count: number) => createStatCard('Total Students', count, GraduationCap, { color: 'purple' }),
  totalClasses: (count: number) => createStatCard('Total Classes', count, BookOpen, { color: 'indigo' }),
  
  // Attendance
  attendanceRate: (rate: number) => createProgressStat(
    'Attendance Rate', 
    `${rate.toFixed(1)}%`, 
    UserCheck, 
    rate,
    'Overall attendance'
  ),
  
  // System status
  systemHealth: (status: 'success' | 'warning' | 'error' | 'info') => 
    createStatusStat('System Status', 'Healthy', CheckCircle, status),
};

/**
 * Helper to create multiple stat cards from an array of data
 */
export const createStatsFromArray = <T>(
  data: T[],
  configs: Array<{
    key: keyof T;
    title: string;
    icon: LucideIcon;
    color?: StatsCardConfig['color'];
    formatter?: (value: any) => string | number;
  }>
): StatsCardConfig[] => {
  return configs.map(config => {
    const rawValue = data[0]?.[config.key];
    const value = config.formatter ? config.formatter(rawValue) : (rawValue as string | number) || 0;
    
    return {
      title: config.title,
      value: typeof value === 'string' || typeof value === 'number' ? value : String(value),
      icon: config.icon,
      color: config.color || 'blue',
      size: 'md' as const,
      variant: 'default' as const,
    };
  });
};
