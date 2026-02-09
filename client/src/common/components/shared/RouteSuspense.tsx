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
    <Suspense fallback={<ContentSkeleton className={className} />}>
      <div className={cn("flex-1 flex flex-col min-h-0 animate-in fade-in-0 duration-300", className)}>
        {children}
      </div>
    </Suspense>
  );
}

export default RouteSuspense;
