import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface StatsCardConfig {
  title: string;
  value: string | number;
  icon: LucideIcon | React.ComponentType | React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?:
    | "blue"
    | "green"
    | "yellow"
    | "red"
    | "purple"
    | "indigo"
    | "orange"
    | "gray"
    | "emerald"
    | "rose"
    | "amber"
    | "cyan"
    | "violet"
    | "pink"
    | "lime"
    | "teal"
    | "sky";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "gradient" | "minimal" | "elevated" | "bordered";
  showProgress?: boolean;
  progressValue?: number;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

const colorVariants = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/20",
    icon: "text-green-600 dark:text-green-400",
    value: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    gradient: "from-green-500 to-green-600",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    icon: "text-yellow-600 dark:text-yellow-400",
    value: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
    gradient: "from-yellow-500 to-yellow-600",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/20",
    icon: "text-red-600 dark:text-red-400",
    value: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    gradient: "from-red-500 to-red-600",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/20",
    icon: "text-purple-600 dark:text-purple-400",
    value: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-purple-600",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    icon: "text-indigo-600 dark:text-indigo-400",
    value: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
    gradient: "from-indigo-500 to-indigo-600",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    icon: "text-orange-600 dark:text-orange-400",
    value: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    gradient: "from-orange-500 to-orange-600",
  },
  gray: {
    bg: "bg-gray-50 dark:bg-gray-950/20",
    icon: "text-gray-600 dark:text-gray-400",
    value: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-800",
    gradient: "from-gray-500 to-gray-600",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    gradient: "from-emerald-500 to-emerald-600",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    icon: "text-rose-600 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    gradient: "from-rose-500 to-rose-600",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    icon: "text-amber-600 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    gradient: "from-amber-500 to-amber-600",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    icon: "text-cyan-600 dark:text-cyan-400",
    value: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    gradient: "from-cyan-500 to-cyan-600",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    icon: "text-violet-600 dark:text-violet-400",
    value: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
    gradient: "from-violet-500 to-violet-600",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/20",
    icon: "text-pink-600 dark:text-pink-400",
    value: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
    gradient: "from-pink-500 to-pink-600",
  },
  lime: {
    bg: "bg-lime-50 dark:bg-lime-950/20",
    icon: "text-lime-600 dark:text-lime-400",
    value: "text-lime-700 dark:text-lime-300",
    border: "border-lime-200 dark:border-lime-800",
    gradient: "from-lime-500 to-lime-600",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950/20",
    icon: "text-teal-600 dark:text-teal-400",
    value: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
    gradient: "from-teal-500 to-teal-600",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/20",
    icon: "text-sky-600 dark:text-sky-400",
    value: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
    gradient: "from-sky-500 to-sky-600",
  },
};

const sizeVariants = {
  sm: {
    card: "p-4",
    icon: "h-4 w-4",
    value: "text-2xl",
    title: "text-xs",
    description: "text-xs",
  },
  md: {
    card: "p-3",
    icon: "h-5 w-5",
    value: "text-4xl",
    title: "text-sm",
    description: "text-xs",
  },
  lg: {
    card: "p-4",
    icon: "h-6 w-6",
    value: "text-5xl",
    title: "text-base",
    description: "text-sm",
  },
  xl: {
    card: "p-5",
    icon: "h-8 w-8",
    value: "text-6xl",
    title: "text-lg",
    description: "text-base",
  },
};

const variantStyles = {
  default:
    "bg-card border shadow-sm hover:shadow-md transition-all duration-200",
  gradient:
    "bg-gradient-to-br from-card to-card/50 border shadow-lg hover:shadow-xl transition-all duration-300",
  minimal:
    "bg-transparent border-0 shadow-none hover:bg-muted/50 transition-all duration-200",
  elevated:
    "bg-card border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
  bordered:
    "bg-card border-2 shadow-sm hover:shadow-md transition-all duration-200",
};

export const StatsCard: React.FC<StatsCardConfig> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue",
  size = "md",
  variant = "default",
  showProgress = false,
  progressValue = 0,
  onClick,
  className,
  loading = false,
}) => {
  const colors = colorVariants[color];
  const sizes = sizeVariants[size];
  const variantStyle = variantStyles[variant];

  const cardContent = (
    <Card
      className={cn(
        "relative overflow-hidden group cursor-pointer transition-all duration-200",
        variantStyle,
        colors.border,
        onClick && "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      {/* Gradient overlay for gradient variant */}
      {variant === "gradient" && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-5",
            `from-${color}-500 to-${color}-600`
          )}
        />
      )}

      {/* Animated background for elevated variant */}
      {variant === "elevated" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-2",
          sizes.card
        )}
      >
        <CardTitle
          className={cn("font-medium text-muted-foreground", sizes.title)}
        >
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-xl transition-all duration-200 group-hover:scale-110 flex items-center justify-center",
            colors.bg,
            variant === "elevated" && "group-hover:shadow-lg"
          )}
        >
          {(() => {
            // Handle React elements
            if (React.isValidElement(Icon)) {
              return (
                <span className={cn(colors.icon, sizes.icon, "flex items-center justify-center")}>
                  {Icon}
                </span>
              );
            }
            
            // Handle null/undefined
            if (Icon == null) {
              return null;
            }
            
            // Handle React components (including forwardRef components from lucide-react)
            // forwardRef components are objects with $$typeof: Symbol(react.forward_ref)
            // They can still be used with React.createElement
            if (
              typeof Icon === "function" ||
              (typeof Icon === "object" && Icon !== null && ("render" in Icon || "$$typeof" in Icon))
            ) {
              try {
                return React.createElement(Icon as React.ComponentType<any>, {
                  className: cn(colors.icon, sizes.icon),
                });
              } catch (error) {
                console.warn("Failed to render icon component:", error);
                return null;
              }
            }
            
            // Fallback for other types (shouldn't happen with proper usage)
            return null;
          })()}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-1", sizes.card)}>
        {loading ? (
          <div className="space-y-2">
            <div
              className={cn("h-8 bg-muted animate-pulse rounded", sizes.value)}
            />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className={cn("font-bold", colors.value, sizes.value)}>
                {value}
              </div>
              {description && (
                <p className={cn("text-muted-foreground", sizes.description)}>
                  {description}
                </p>
              )}
            </div>

            {/* Progress bar */}
            {showProgress && (
              <div className="space-y-2">
                <Progress
                  value={progressValue}
                  className="h-2"
                  // @ts-ignore - Custom color prop
                  color={color}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {progressValue}%
                </div>
              </div>
            )}

            {/* Trend indicator */}
            {trend && (
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive
                      ? "text-green-600 border-green-200 bg-green-50"
                      : "text-red-600 border-red-200 bg-red-50"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Hover effect for interactive cards */}
      {onClick && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {cardContent}
    </motion.div>
  );
};

export default StatsCard;
