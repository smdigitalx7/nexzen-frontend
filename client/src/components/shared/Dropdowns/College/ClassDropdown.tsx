"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useCollegeClasses } from "@/lib/hooks/college/use-college-dropdowns";
import type { ClassOption } from "@/lib/types/college/dropdowns";

export interface CollegeClassDropdownProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  emptyValue?: boolean;
  emptyValueLabel?: string;
  id?: string;
}

/**
 * CollegeClassDropdown - Reusable dropdown for selecting college classes
 * 
 * Features:
 * - Fetches classes from college API
 * - Loading and error states
 * - Consistent styling
 */
export function CollegeClassDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select class",
  className,
  emptyValue = false,
  emptyValueLabel = "No class",
  id,
}: CollegeClassDropdownProps) {
  const { data, isLoading, error, refetch } = useCollegeClasses();

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  return (
    <BaseDropdown<ClassOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={className}
      id={id}
      getValue={(option) => option.class_id}
      getLabel={(option) => option.class_name}
      noOptionsText="No classes available"
      loadingText="Loading classes..."
      errorText="Failed to load classes"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
    />
  );
}

