"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useSchoolClasses } from "@/features/school/hooks/use-school-dropdowns";
import type { ClassOption } from "@/features/school/types/dropdowns";

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
 * - ✅ OPTIMIZATION: On-demand fetching - only fetches when dropdown is opened
 * - Loading and error states with loader in dropdown
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
  // ✅ OPTIMIZATION: Start with enabled: false - fetch only when dropdown opens
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data, isLoading, error, refetch } = useSchoolClasses({ enabled: shouldFetch });

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  const handleChange = React.useCallback(
    (newValue: number | string | null) => {
      onChange?.(newValue === null ? null : Number(newValue));
    },
    [onChange]
  );

  // ✅ OPTIMIZATION: Trigger fetch when dropdown opens
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open && !shouldFetch) {
        setShouldFetch(true);
      }
    },
    [shouldFetch]
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
      onOpenChange={handleOpenChange}
    />
  );
}

