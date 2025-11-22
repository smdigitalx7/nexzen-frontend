import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { cn } from '@/common/utils';

interface QuickActionConfig {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  disabled?: boolean;
  description?: string;
}

interface DashboardQuickActionsProps {
  title?: string;
  actions: QuickActionConfig[];
  className?: string;
  loading?: boolean;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  title = "Quick Actions",
  actions,
  className,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || "outline"}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-200",
                  action.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  {action.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
