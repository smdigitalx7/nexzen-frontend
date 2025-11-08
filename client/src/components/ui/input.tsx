import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      success = false,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      required = false,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const getVariantStyles = () => {
      if (error) {
        return "border-destructive focus:border-destructive focus:ring-0 focus:outline-none";
      }
      if (success) {
        return "border-success-500 focus:border-success-500 focus:ring-0 focus:outline-none";
      }
      return "border-input focus:border-gray-400 focus:ring-0 focus:outline-none";
    };

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive",
              success && "text-success-600"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              "flex h-9 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors duration-200 focus:shadow-none",
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle) && "pr-10",
              type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              getVariantStyles(),
              className
            )}
            aria-invalid={!!error}
            aria-describedby={cn(errorId, helperId)}
            aria-required={required}
            onWheel={(e) => {
              if (type === "number") {
                e.currentTarget.blur();
              }
            }}
            {...props}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {showPasswordToggle && isPassword && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}

            {rightIcon && !isPassword && (
              <div className="text-muted-foreground" aria-hidden="true">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {(error || helperText) && (
          <div className="space-y-1">
            {error && (
              <p
                id={errorId}
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="text-sm text-muted-foreground">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
