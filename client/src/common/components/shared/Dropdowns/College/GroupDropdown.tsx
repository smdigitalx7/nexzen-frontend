"use client";

import * as React from "react";
import { BaseDropdown } from "../BaseDropdown";
import { useCollegeGroups } from "@/features/college/hooks/use-college-dropdowns";
import type { GroupOption } from "@/features/college/types/dropdowns";

export interface CollegeGroupDropdownProps {
  classId?: number;
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
 * CollegeGroupDropdown - Reusable dropdown for selecting college groups
 * 
 * Features:
 * - Optionally depends on classId
 * - Auto-clears when classId changes
 * - Loading and error states
 */
export function CollegeGroupDropdown({
  classId,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select group",
  className,
  emptyValue = false,
  emptyValueLabel = "No group",
  id,
}: CollegeGroupDropdownProps) {
  // ✅ OPTIMIZATION: Start with enabled: false - fetch only when dropdown opens
  const [shouldFetch, setShouldFetch] = React.useState(false);
  const { data, isLoading, error, refetch } = useCollegeGroups(classId, { enabled: shouldFetch });

  const options = React.useMemo(() => {
    return data?.items || [];
  }, [data]);

  // Auto-clear value when classId changes (if classId is required)
  React.useEffect(() => {
    if (classId !== undefined && classId <= 0 && value !== null) {
      onChange?.(null);
    }
  }, [classId, value, onChange]);

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

  // Only disable if explicitly disabled or if classId is explicitly set to 0 or negative
  // Allow dropdown to work when classId is undefined (shows all groups)
  const isDisabled = disabled || (classId !== undefined && classId <= 0);

  return (
    <BaseDropdown<GroupOption>
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={isLoading}
      error={error}
      disabled={isDisabled}
      required={required}
      placeholder={
        classId !== undefined && classId <= 0
          ? "Select class first"
          : isLoading
          ? "Loading groups..."
          : placeholder
      }
      className={className}
      id={id}
      getValue={(option) => option.group_id}
      getLabel={(option) => option.group_name}
      noOptionsText="No groups available"
      loadingText="Loading groups..."
      errorText="Failed to load groups"
      onRetry={() => refetch()}
      emptyValue={emptyValue}
      emptyValueLabel={emptyValueLabel}
      onOpenChange={handleOpenChange}
    />
  );
}

