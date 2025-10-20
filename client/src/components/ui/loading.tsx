import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Database, FileText, Settings } from "lucide-react";
import { Skeleton } from "./skeleton";

// Loading component variants
export type LoadingVariant = "spinner" | "skeleton" | "progress";
export type LoadingSize = "sm" | "md" | "lg";
export type LoadingContext = "data" | "page" | "form" | "general";

interface BaseLoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  context?: LoadingContext;
  className?: string;
  message?: string;
  showMessage?: boolean;
  fullScreen?: boolean;
  overlay?: boolean;
  progress?: number;
  showPercentage?: boolean;
  showIcon?: boolean;
  animated?: boolean;
}

// Size configurations
const sizeConfig = {
  sm: { icon: "h-4 w-4", text: "text-sm", container: "p-3", spacing: "gap-2" },
  md: {
    icon: "h-6 w-6",
    text: "text-base",
    container: "p-4",
    spacing: "gap-3",
  },
  lg: { icon: "w-8 h-8", text: "text-lg", container: "p-6", spacing: "gap-4" },
};

// Context-based configurations
const contextConfig = {
  data: { icon: Database, message: "Loading data...", color: "text-primary" },
  page: { icon: FileText, message: "Loading page...", color: "text-primary" },
  form: { icon: Settings, message: "Processing...", color: "text-primary" },
  general: { icon: Loader2, message: "Loading...", color: "text-primary" },
};

// Simple Spinner Component
const SpinnerLoader: React.FC<{
  size: LoadingSize;
  className?: string;
  color?: string;
}> = ({ size, className, color = "text-primary" }) => {
  const { icon } = sizeConfig[size];

  return (
    <div
      className={cn(
        "border-2 border-primary/30 border-t-primary rounded-full animate-spin",
        icon,
        className
      )}
    ></div>
  );
};

// Progress Loader with percentage
const ProgressLoader: React.FC<{
  size: LoadingSize;
  progress?: number;
  showPercentage?: boolean;
  className?: string;
}> = ({ size, progress = 0, showPercentage = false, className }) => {
  const { icon } = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className={cn("relative rounded-full bg-muted", icon)}>
        <div
          className="absolute inset-0 rounded-full bg-primary"
          style={{
            clipPath: `circle(${Math.min(progress, 100)}% at 50% 50%)`,
          }}
        />
      </div>
      {showPercentage && (
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

// Main Loading Component
export const Loading: React.FC<BaseLoadingProps> = ({
  size = "md",
  variant = "spinner",
  context = "general",
  className,
  message,
  showMessage = true,
  fullScreen = false,
  overlay = false,
  progress,
  showPercentage = false,
  showIcon = true,
  animated = true,
}) => {
  const { text, container, spacing } = sizeConfig[size];
  const contextInfo = contextConfig[context];
  const displayMessage = message || contextInfo.message;
  const contextColor = contextInfo.color;

  const renderLoader = () => {
    const commonProps = { size, className: "mx-auto" };

    switch (variant) {
      case "spinner":
        return <SpinnerLoader {...commonProps} color={contextColor} />;
      case "skeleton":
        return <Skeleton className={cn("w-full h-4", className)} />;
      case "progress":
        return (
          <ProgressLoader
            size={size}
            progress={progress}
            showPercentage={showPercentage}
          />
        );
      default:
        return <SpinnerLoader {...commonProps} color={contextColor} />;
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center",
        container,
        spacing,
        className
      )}
    >
      {showIcon && renderLoader()}
      {showMessage && displayMessage && (
        <p className={cn(text, "font-medium text-muted-foreground")}>
          {displayMessage}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/50">
        {content}
      </div>
    );
  }

  return content;
};

// Simple Circle Loading for Page Center
export const PageLoading: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50">
    <div className="flex flex-col items-center space-y-3">
      {/* Simple circle spinner */}
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>

      {/* Message */}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export const DataLoading: React.FC<{
  message?: string;
  skeleton?: boolean;
}> = ({ message = "Loading data...", skeleton = false }) => {
  if (skeleton) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
};

export const ButtonLoading: React.FC<{
  size?: "sm" | "md" | "lg";
}> = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "border-2 border-current border-t-transparent rounded-full animate-spin",
        sizeClasses[size]
      )}
    ></div>
  );
};

export const FormLoading: React.FC<{
  message?: string;
}> = ({ message = "Processing form..." }) => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  </div>
);

export const UploadLoading: React.FC<{
  message?: string;
  progress?: number;
}> = ({ message = "Uploading...", progress }) => (
  <div className="flex flex-col items-center space-y-2">
    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    <span className="text-sm text-muted-foreground">{message}</span>
    {progress !== undefined && (
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    )}
  </div>
);

export const SearchLoading: React.FC<{
  message?: string;
}> = ({ message = "Searching..." }) => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  </div>
);

export const CardSkeleton: React.FC<{
  lines?: number;
}> = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-4 bg-muted rounded animate-pulse",
          i === lines - 1 ? "w-1/2" : "w-full"
        )}
      />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            className={cn(
              "h-4 bg-muted rounded animate-pulse flex-1",
              colIndex === columns - 1 ? "w-1/3" : ""
            )}
          />
        ))}
      </div>
    ))}
  </div>
);

// Loading states for different contexts
export const LoadingStates = {
  Page: PageLoading,
  Data: DataLoading,
  Button: ButtonLoading,
  Form: FormLoading,
  Upload: UploadLoading,
  Search: SearchLoading,
  Card: CardSkeleton,
  Table: TableSkeleton,
};

// Simple Circle Spinner - Most commonly used
export const CircleSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}> = ({ size = "md", message, className }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-2",
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div
        className={cn(
          "border-primary/30 border-t-primary rounded-full animate-spin",
          sizeClasses[size]
        )}
      ></div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export default Loading;
