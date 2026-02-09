import React from "react";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/common/utils";

/**
 * Page-like skeleton shown while route content is loading.
 * Creative layout with wave animation, matching present modules (header + card grid).
 */
export function ContentSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Page header - matches module headers */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-1/4 rounded-lg" animation="wave" />
        <Skeleton className="h-4 w-2/5 rounded-md" animation="wave" />
      </div>
      {/* Card grid - same structure as dashboard/overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
