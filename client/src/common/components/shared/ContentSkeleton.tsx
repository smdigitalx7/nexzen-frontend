import React from "react";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/common/utils";

interface ContentSkeletonProps {
  className?: string;
  variant?: "grid" | "table";
}

/**
 * ERP-grade skeleton loader.
 * Specialized for dashboard grids or data tables to match module architecture.
 */
export function ContentSkeleton({ className, variant = "grid" }: ContentSkeletonProps) {
  if (variant === "table") {
    return (
      <div className={cn("space-y-6 p-6", className)}>
        <div className="space-y-2">
          <Skeleton className="h-9 w-1/4 rounded-lg" animation="wave" />
          <Skeleton className="h-4 w-2/5 rounded-md" animation="wave" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/80 shadow-sm overflow-hidden">
          <div className="h-12 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-4">
            <Skeleton className="h-4 w-4 rounded" animation="wave" />
            <Skeleton className="h-4 w-1/6 rounded" animation="wave" />
            <Skeleton className="h-4 w-1/4 rounded" animation="wave" />
            <Skeleton className="h-4 w-1/6 rounded" animation="wave" />
          </div>
          <div className="divide-y divide-border/30">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 flex items-center px-4 gap-4">
                <Skeleton className="h-4 w-4 rounded" animation="wave" />
                <Skeleton className="h-4 w-1/5 rounded" animation="wave" />
                <Skeleton className="h-4 w-1/3 rounded" animation="wave" />
                <Skeleton className="h-4 w-1/4 rounded" animation="wave" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-9 w-1/4 rounded-lg" animation="wave" />
        <Skeleton className="h-4 w-2/5 rounded-md" animation="wave" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/80 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" animation="wave" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4 rounded" animation="wave" />
                <Skeleton className="h-7 w-1/2 rounded" animation="wave" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded" animation="wave" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentSkeleton;
