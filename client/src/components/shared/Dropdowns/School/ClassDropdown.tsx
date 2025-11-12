"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-dropdowns";
import type { ClassOption } from "@/lib/types/school/dropdowns";

export interface SchoolClassDropdownProps {
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
 * SchoolClassDropdown - Reusable dropdown for selecting school classes
 * 
 * Features:
 * - Fetches classes from school API
 * - Loading and error states
 * - Consistent styling
 */
export function SchoolClassDropdown({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select class",
  className,
  emptyValue = false,
  emptyValueLabel = "No class",
  id,
}: SchoolClassDropdownProps) {
  const { data, isLoading, error, refetch } = useSchoolClasses();

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

