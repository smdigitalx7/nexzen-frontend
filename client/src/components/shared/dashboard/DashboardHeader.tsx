import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
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
    disabled?: boolean;
  }[];
  className?: string;
  loading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
  loading = false,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {loading ? (
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              ) : (
                title
              )}
            </h1>
            {badge && !loading && (
              <Badge variant={badge.variant || "default"}>
                {badge.text}
              </Badge>
            )}
          </div>
          {description && !loading && (
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
          )}
          {loading && (
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          )}
        </div>

        {actions && actions.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="h-9"
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      
      {!loading && (description || actions) && <Separator />}
    </div>
  );
};
export default DashboardHeader;

