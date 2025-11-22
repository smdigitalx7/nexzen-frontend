import React from "react";
import { DashboardContainer } from "@/common/components/shared/dashboard/DashboardContainer";
import { StatsCard } from "@/common/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/common/components/shared/dashboard/DashboardGrid";
import { DashboardHeader } from "@/common/components/shared/dashboard/DashboardHeader";
import { DashboardFilters } from "@/common/components/shared/dashboard/DashboardFilters";
import { DashboardCharts } from "@/common/components/shared/dashboard/DashboardCharts";
import { DashboardQuickActions } from "@/common/components/shared/dashboard/DashboardQuickActions";
import { DashboardRecentActivity } from "@/common/components/shared/dashboard/DashboardRecentActivity";
import { LucideIcon } from "lucide-react";

// Types for dashboard configuration
export interface StatsCardConfig {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "indigo" | "orange" | "gray";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export interface QuickActionConfig {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  disabled?: boolean;
  description?: string;
}

export interface ActivityItemConfig {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type: "user" | "system" | "action" | "alert";
  user?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  status?: "success" | "warning" | "error" | "info";
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  title: string;
  type: "bar" | "pie" | "line" | "area";
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  dataKey: string;
  height?: number;
  className?: string;
}

export interface DashboardConfig {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  actions?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  }[];
  statsCards: StatsCardConfig[];
  quickActions?: QuickActionConfig[];
  recentActivity?: ActivityItemConfig[];
  charts?: ChartConfig[];
  filters?: {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    dateRange?: {
      from?: Date;
      to?: Date;
      onDateChange?: (from: Date | undefined, to: Date | undefined) => void;
    };
    selectFilters?: {
      key: string;
      label: string;
      value: string;
      options: { value: string; label: string }[];
      onValueChange: (value: string) => void;
    }[];
    onClearFilters?: () => void;
  };
  loading?: boolean;
  className?: string;
}

// Dashboard factory function
export const createModuleDashboard = (config: DashboardConfig) => {
  return (props?: Partial<DashboardConfig>) => {
    const finalConfig = { ...config, ...props };
    
    return (
      <DashboardContainer
        title={finalConfig.title}
        description={finalConfig.description}
        loading={finalConfig.loading}
        className={finalConfig.className}
      >
        {/* Header */}
        <DashboardHeader
          title={finalConfig.title}
          description={finalConfig.description}
          badge={finalConfig.badge}
          actions={finalConfig.actions}
        />

        {/* Filters */}
        {finalConfig.filters && (
          <DashboardFilters
            searchValue={finalConfig.filters.searchValue}
            onSearchChange={finalConfig.filters.onSearchChange}
            searchPlaceholder={finalConfig.filters.searchPlaceholder}
            dateRange={finalConfig.filters.dateRange}
            selectFilters={finalConfig.filters.selectFilters}
            onClearFilters={finalConfig.filters.onClearFilters}
          />
        )}

        {/* Stats Cards */}
        <DashboardGrid columns={finalConfig.statsCards.length > 4 ? 6 : 4}>
          {finalConfig.statsCards.map((card, index) => (
            <StatsCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              description={card.description}
              trend={card.trend}
              color={card.color}
              size={card.size}
              onClick={card.onClick}
            />
          ))}
        </DashboardGrid>

        {/* Quick Actions */}
        {finalConfig.quickActions && finalConfig.quickActions.length > 0 && (
          <DashboardQuickActions
            title="Quick Actions"
            actions={finalConfig.quickActions}
          />
        )}

        {/* Charts */}
        {finalConfig.charts && finalConfig.charts.length > 0 && (
          <DashboardCharts charts={finalConfig.charts} />
        )}

        {/* Recent Activity */}
        {finalConfig.recentActivity && finalConfig.recentActivity.length > 0 && (
          <DashboardRecentActivity
            title="Recent Activity"
            activities={finalConfig.recentActivity}
            maxItems={5}
          />
        )}
      </DashboardContainer>
    );
  };
};

// Utility functions for common dashboard patterns
export const createStatsCard = (config: StatsCardConfig) => config;

export const createQuickAction = (config: QuickActionConfig) => config;

export const createActivityItem = (config: ActivityItemConfig) => config;

export const createChart = (config: ChartConfig) => config;
