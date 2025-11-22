import React from 'react';
import { cn } from '@/common/utils';

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
  responsive?: boolean;
}

const gapVariants = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const columnVariants = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  7: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7",
  8: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8",
  9: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9",
  10: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10",
  11: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-11",
  12: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12",
};

const responsiveColumnVariants = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  7: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7",
  8: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
  9: "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9",
  10: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10",
  11: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11",
  12: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12",
};

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 4,
  gap = "md",
  className,
  responsive = true,
}) => {
  const gridColumns = responsive 
    ? responsiveColumnVariants[columns] 
    : columnVariants[columns];
  
  const gridGap = gapVariants[gap];

  return (
    <div 
      className={cn(
        "grid w-full",
        gridColumns,
        gridGap,
        className
      )}
    >
      {children}
    </div>
  );
};

export default DashboardGrid;
