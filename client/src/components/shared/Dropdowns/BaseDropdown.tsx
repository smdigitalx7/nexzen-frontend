"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseDropdownProps<T> {
  value?: number | string | null;
  onChange?: (value: number | string | null) => void;
  options: T[];
  isLoading?: boolean;
  error?: Error | null;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  getValue: (option: T) => number | string;
  getLabel: (option: T) => string;
  renderOption?: (option: T) => React.ReactNode;
  noOptionsText?: string;
  loadingText?: string;
  errorText?: string;
  onRetry?: () => void;
  emptyValue?: boolean;
  emptyValueLabel?: string;
}

/**
 * BaseDropdown - A professional, reusable dropdown component
 * 
 * Features:
 * - Loading states with spinner
 * - Error states with retry option
 * - Empty states with custom messages
 * - Consistent styling
 * - Type-safe with generics
 * - Accessible
 */
export function BaseDropdown<T>({
  value,
  onChange,
  options,
  isLoading = false,
  error = null,
  disabled = false,
  required = false,
  placeholder = "Select an option",
  className,
  id,
  getValue,
  getLabel,
  renderOption,
  noOptionsText = "No options available",
  loadingText = "Loading...",
  errorText,
  onRetry,
  emptyValue = false,
  emptyValueLabel = "None",
}: BaseDropdownProps<T>) {
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (newValue === "__empty__") {
        onChange?.(null);
        return;
      }
      onChange?.(newValue);
    },
    [onChange]
  );

  const stringValue = React.useMemo(() => {
    if (value === null || value === undefined) {
      return emptyValue ? "__empty__" : "";
    }
    return value.toString();
  }, [value, emptyValue]);

  const isDisabled = disabled || isLoading;

  return (
    <Select
      value={stringValue}
      onValueChange={handleValueChange}
      disabled={isDisabled}
      required={required}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "w-full",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "dropdown-error" : undefined}
      >
        <SelectValue placeholder={isLoading && !value ? loadingText : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{loadingText}</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <AlertCircle className="h-5 w-5 text-destructive mb-2" />
            <p className="text-sm text-destructive text-center mb-2">
              {errorText || error.message || "Failed to load options"}
            </p>
            {onRetry && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRetry();
                }}
                className="text-xs text-primary hover:underline mt-1"
              >
                Retry
              </button>
            )}
          </div>
        ) : options.length === 0 ? (
          <div className="flex items-center justify-center py-6 px-4">
            <p className="text-sm text-muted-foreground text-center">
              {noOptionsText}
            </p>
          </div>
        ) : (
          <>
            {emptyValue && (
              <SelectItem 
                value="__empty__" 
                className="text-muted-foreground"
              >
                {emptyValueLabel}
              </SelectItem>
            )}
            {options.map((option) => {
              const optionValue = getValue(option);
              const optionLabel = getLabel(option);
              return (
                <SelectItem
                  key={optionValue.toString()}
                  value={optionValue.toString()}
                >
                  {renderOption ? renderOption(option) : optionLabel}
                </SelectItem>
              );
            })}
          </>
        )}
      </SelectContent>
      {error && (
        <p
          id="dropdown-error"
          className="text-xs text-destructive mt-1.5 px-1"
          role="alert"
        >
          {errorText || error.message || "An error occurred"}
        </p>
      )}
    </Select>
  );
}

