"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useCollegeTests } from "@/lib/hooks/college/use-college-dropdowns";
import type { TestOption } from "@/lib/types/college/dropdowns";

export interface CollegeTestDropdownProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: boolean;
  emptyValueLabel?: string;
}

/**
 * CollegeTestDropdown - Reusable dropdown for selecting college tests
 * 
 * Features:
 * - Fetches tests from college API
 * - Shows test date if available
 * - Loading and error states
 */
export function CollegeTestDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select test",
  className,
  emptyValue = false,
  emptyValueLabel = "No test",
}: CollegeTestDropdownProps) {
  const { data, isLoading, error, refetch } = useCollegeTests();

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  const renderOption = React.useCallback((option: TestOption) => {
    if (option.test_date) {
      return (
        <div className="flex flex-col">
          <span>{option.test_name}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(option.test_date).toLocaleDateString()}
          </span>
        </div>
      );
    }
    return option.test_name;
  }, []);

  return (
    <BaseDropdown<TestOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={className}
      getValue={(option) => option.test_id}
      getLabel={(option) => option.test_name}
      renderOption={renderOption}
      noOptionsText="No tests available"
      loadingText="Loading tests..."
      errorText="Failed to load tests"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
    />
  );
}

