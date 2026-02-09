import React from 'react';
import { cn } from '@/common/utils';
import { Loader } from '@/common/components/ui/ProfessionalLoader';

interface DashboardContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  loading?: boolean;
  loadingMessage?: string;
  className?: string;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  title: _title,
  description: _description,
  loading = false,
  loadingMessage = "Loading dashboard...",
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("relative flex-1 min-h-0", className)}>
        <Loader.Container message={loadingMessage} />
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
