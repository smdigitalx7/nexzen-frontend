import React, { Suspense } from "react";
import { ContentSkeleton } from "./ContentSkeleton";
import { cn } from "@/common/utils";

interface RouteSuspenseProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps route content (Outlet) in Suspense with ContentSkeleton fallback.
 * Loaded content gets a 300ms fade-in.
 */
export function RouteSuspense({ children, className }: RouteSuspenseProps) {
  return (
    <Suspense 
      fallback={
        <div className="relative flex-1 flex flex-col min-h-0 h-full w-full">
          {/* Top Progress Bar for "Professional ERP" feel */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/20 overflow-hidden z-[60]">
            <div className="h-full bg-primary animate-pulse w-1/3" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }} />
          </div>
          <ContentSkeleton className={className} />
        </div>
      }
    >
      <div className={cn("flex-1 flex flex-col min-h-0 animate-in fade-in-0 duration-300", className)}>
        {children}
      </div>
    </Suspense>
  );
}

export default RouteSuspense;
