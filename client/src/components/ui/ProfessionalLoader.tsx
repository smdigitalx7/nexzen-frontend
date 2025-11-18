import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./skeleton";

/**
 * Professional Unified Loader Component
 * Use this component for all loading states throughout the application
 */

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";
export type LoaderVariant = "spinner" | "skeleton" | "dots" | "pulse";

interface ProfessionalLoaderProps {
  /** Size of the loader */
  size?: LoaderSize;
  /** Variant of the loader */
  variant?: LoaderVariant;
  /** Custom message to display */
  message?: string;
  /** Show message text */
  showMessage?: boolean;
  /** Full screen overlay */
  fullScreen?: boolean;
  /** Overlay mode (absolute positioned) */
  overlay?: boolean;
  /** Custom className */
  className?: string;
  /** Inline mode (no centering) */
  inline?: boolean;
}

const sizeConfig = {
  xs: { spinner: "w-3 h-3 border", text: "text-xs", gap: "gap-1" },
  sm: { spinner: "w-4 h-4 border-2", text: "text-sm", gap: "gap-2" },
  md: { spinner: "w-6 h-6 border-2", text: "text-base", gap: "gap-3" },
  lg: { spinner: "w-8 h-8 border-2", text: "text-lg", gap: "gap-4" },
  xl: { spinner: "w-10 h-10 border-[3px]", text: "text-xl", gap: "gap-5" },
};

/**
 * Professional Spinner Component
 */
const ProfessionalSpinner: React.FC<{
  size: LoaderSize;
  className?: string;
}> = ({ size, className }) => {
  const { spinner } = sizeConfig[size];

  return (
    <div
      className={cn(
        "border-primary/20 border-t-primary rounded-full animate-spin",
        spinner,
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Professional Dots Loader
 */
const ProfessionalDots: React.FC<{
  size: LoaderSize;
  className?: string;
}> = ({ size, className }) => {
  const dotSize = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
    xl: "w-3 h-3",
  }[size];

  return (
    <div className={cn("flex items-center gap-1.5", className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-pulse",
            dotSize
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Professional Pulse Loader
 */
const ProfessionalPulse: React.FC<{
  size: LoaderSize;
  className?: string;
}> = ({ size, className }) => {
  const pulseSize = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  }[size];

  return (
    <div
      className={cn(
        "bg-primary/20 rounded-full animate-pulse",
        pulseSize,
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Main Professional Loader Component
 */
export const ProfessionalLoader: React.FC<ProfessionalLoaderProps> = ({
  size = "md",
  variant = "spinner",
  message,
  showMessage = false,
  fullScreen = false,
  overlay = false,
  className,
  inline = false,
}) => {
  const { text, gap } = sizeConfig[size];

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return <ProfessionalSpinner size={size} />;
      case "dots":
        return <ProfessionalDots size={size} />;
      case "pulse":
        return <ProfessionalPulse size={size} />;
      case "skeleton":
        return <Skeleton className="w-full h-4" />;
      default:
        return <ProfessionalSpinner size={size} />;
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center justify-center",
        !inline && "flex-col",
        gap,
        className
      )}
    >
      {renderLoader()}
      {showMessage && message && (
        <p className={cn(text, "font-medium text-muted-foreground")}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Pre-configured loader components for common use cases
 */
export const Loader = {
  /** Page loader - Full screen */
  Page: ({ message = "Loading..." }: { message?: string }) => (
    <ProfessionalLoader
      fullScreen
      size="lg"
      variant="spinner"
      message={message}
      showMessage
    />
  ),

  /** Data loader - Centered with message */
  Data: ({ message = "Loading data...", skeleton = false }: { message?: string; skeleton?: boolean }) => (
    <div className="flex items-center justify-center py-8">
      <ProfessionalLoader
        size="md"
        variant={skeleton ? "skeleton" : "spinner"}
        message={message}
        showMessage={!skeleton}
      />
    </div>
  ),

  /** Button loader - Small inline spinner */
  Button: ({ size = "sm" }: { size?: LoaderSize }) => (
    <ProfessionalLoader size={size} variant="spinner" inline />
  ),

  /** Table skeleton loader */
  Table: ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4 flex-1 rounded",
                colIndex === columns - 1 && "w-1/3"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  ),

  /** Card skeleton loader */
  Card: ({ lines = 3 }: { lines?: number }) => (
    <div className="space-y-3 p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 rounded", i === lines - 1 ? "w-1/2" : "w-full")}
        />
      ))}
    </div>
  ),

  /** Form loader */
  Form: ({ message = "Processing..." }: { message?: string }) => (
    <div className="flex items-center justify-center py-4">
      <ProfessionalLoader size="sm" variant="spinner" message={message} showMessage />
    </div>
  ),

  /** Inline loader */
  Inline: ({ size = "sm", message }: { size?: LoaderSize; message?: string }) => (
    <ProfessionalLoader size={size} variant="spinner" message={message} showMessage={!!message} inline />
  ),
};

export default ProfessionalLoader;

