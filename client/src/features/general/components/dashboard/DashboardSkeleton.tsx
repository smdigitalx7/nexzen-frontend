import React from "react";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/common/utils";

/**
 * Dashboard-specific skeleton that mirrors the admin dashboard layout.
 * Uses shimmer (wave) animation and matches present modules (overview cards, financial, academic, chart).
 */
export function DashboardSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Overview section - 4 stat cards like DashboardOverview */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="relative px-6 py-6">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-7 w-48 rounded-md" animation="wave" />
            <Skeleton className="h-4 w-64 rounded-md" animation="wave" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/80 p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton
                    className="h-10 w-10 rounded-lg"
                    animation="wave"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20 rounded" animation="wave" />
                    <Skeleton className="h-8 w-16 rounded" animation="wave" />
                  </div>
                </div>
                <Skeleton className="h-3 w-24 rounded" animation="wave" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial section - 8+4 grid like FinancialSummary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-muted/30">
            <Skeleton className="h-5 w-40 rounded" animation="wave" />
            <Skeleton className="h-3 w-48 mt-2 rounded" animation="wave" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6 rounded" animation="wave" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded" animation="wave" />
                    <Skeleton className="h-7 w-24 rounded" animation="wave" />
                  </div>
                </div>
                <Skeleton className="h-5 w-5 rounded" animation="wave" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-muted/30">
            <Skeleton className="h-5 w-32 rounded" animation="wave" />
            <Skeleton className="h-3 w-36 mt-2 rounded" animation="wave" />
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded" animation="wave" />
              <div className="space-y-2 pl-2 border-l-2 border-muted">
                <Skeleton className="h-4 w-full rounded" animation="wave" />
                <Skeleton className="h-4 w-3/4 rounded" animation="wave" />
              </div>
            </div>
            <div className="pt-4 border-t space-y-3">
              <Skeleton className="h-4 w-20 rounded" animation="wave" />
              <div className="space-y-2 pl-2 border-l-2 border-muted">
                <Skeleton className="h-4 w-full rounded" animation="wave" />
                <Skeleton className="h-4 w-2/3 rounded" animation="wave" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic + Enrollment row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b bg-muted/30 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" animation="wave" />
              <Skeleton className="h-5 w-36 rounded" animation="wave" />
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/10"
                >
                  <Skeleton className="h-4 w-20 rounded" animation="wave" />
                  <Skeleton className="h-6 w-12 rounded" animation="wave" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Audit log + Chart row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-muted/30">
            <Skeleton className="h-5 w-28 rounded" animation="wave" />
            <Skeleton className="h-3 w-40 mt-2 rounded" animation="wave" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" animation="wave" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full rounded" animation="wave" />
                  <Skeleton className="h-3 w-1/2 rounded" animation="wave" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-muted/30">
            <Skeleton className="h-5 w-32 rounded" animation="wave" />
            <Skeleton className="h-3 w-48 mt-2 rounded" animation="wave" />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end h-44 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={`bar-${i}`}
                  className="flex-1 rounded-t"
                  animation="wave"
                  height={Math.floor(80 + Math.random() * 60)}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={`label-${i}`} className="h-3 w-8 rounded" animation="wave" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
