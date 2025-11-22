import React from 'react';
import { cn } from '@/common/utils';
import { Skeleton } from '@/common/components/ui/skeleton';

interface DashboardContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  title,
  description,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("space-y-6 p-6", className)}>
        {title && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            {description && <Skeleton className="h-4 w-96" />}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {children}
    </div>
  );
};

export default DashboardContainer;
